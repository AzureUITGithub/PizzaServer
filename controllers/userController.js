const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const BlacklistedToken = require('../models/blacklistedToken');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3
aws.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
});

const s3 = new aws.S3();

// Configure Multer to use S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `user-images/${Date.now().toString()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(file.mimetype.toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
    }
}).single('image');

// Get all users (chỉ admin, đã được bảo vệ bởi isAdmin middleware)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const requestingUser = req.user;
        const requestedUserId = req.params.id;

        if (requestingUser.role !== 'admin' && requestingUser.userId !== requestedUserId) {
            return res.status(403).json({ error: 'Access denied. You can only view your own profile.' });
        }

        const user = await User.findById(requestedUserId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new user
exports.createUser = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const { username, password, email, address, date_of_birth, role, phone } = req.body;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const userData = {
                username,
                password: hashedPassword,
                email,
                address,
                date_of_birth,
                role,
                phone,
            };
            if (req.file) {
                userData.image_url = req.file.location;
            }

            const newUser = new User(userData);
            const savedUser = await newUser.save();
            res.status(201).json(savedUser);
        } catch (error) {
            console.error('Error in createUser:', error);
            res.status(500).json({ error: error.message });
        }
    });
};

// Update user
exports.updateUser = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const requestingUser = req.user;
            const requestedUserId = req.params.id;

            if (requestingUser.role !== 'admin' && requestingUser.userId !== requestedUserId) {
                return res.status(403).json({ error: 'Access denied. You can only update your own profile.' });
            }

            const { username, password, email, address, date_of_birth, role, phone } = req.body;
            const updateData = { username, email, address, date_of_birth, role, phone };
            
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }
            if (req.file) {
                updateData.image_url = req.file.location;
            }

            const user = await User.findByIdAndUpdate(
                requestedUserId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error('Error in updateUser:', error);
            res.status(500).json({ error: error.message });
        }
    });
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const requestingUser = req.user;
        const requestedUserId = req.params.id;

        if (requestingUser.role !== 'admin' && requestingUser.userId !== requestedUserId) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own account.' });
        }

        const user = await User.findByIdAndDelete(requestedUserId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ error: error.message });
    }
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: error.message });
    }
};

// User logout
exports.logout = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ error: 'No token provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ error: 'Invalid token.' });
        }

        await BlacklistedToken.create({
            token,
            expiresAt: new Date(decoded.exp * 1000)
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error in logout:', error);
        res.status(500).json({ error: error.message });
    }
};

// Forget password - request reset
exports.forgetPassword = async (req, res) => {
    try {
        console.log('Forget password request received:', req.body);
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = Date.now() + 3600000;
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();
        console.log('Reset token generated and saved for user:', user.email);

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log('Nodemailer transporter created with user:', process.env.EMAIL_USER);

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Code',
            text: `You requested a password reset. Your verification code is: ${resetToken}\n\nUse this code to reset your password. It is valid for 1 hour.\n\nIf you did not request this, please ignore this email.`,
        };
        console.log('Mail options prepared:', mailOptions);

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', user.email);
        res.json({ message: 'Password reset code sent to your email' });
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        res.status(500).json({ error: error.message || 'Failed to process forget password request' });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ error: error.message });
    }
};