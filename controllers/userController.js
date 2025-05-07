const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { username, password, email, address, date_of_birth, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            address,
            date_of_birth,
            role,
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error in createUser:', error);
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

// User logout (client-side token invalidation)
exports.logout = (req, res) => {
    res.json({ message: 'Logged out successfully' });
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
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour
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

        const resetUrl = `${process.env.FRONTEND_URL}/api/user/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        };
        console.log('Mail options prepared:', mailOptions);

        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', user.email);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        res.status(500).json({ error: error.message || 'Failed to process forget password request' });
    }
};

// Show reset password form
exports.showResetForm = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).send('Invalid or expired reset token');
        }
        // Serve a simple HTML form
        res.send(`
            <h2>Reset Password</h2>
            <form action="/api/user/reset-password" method="POST">
                <input type="hidden" name="token" value="${token}">
                <label for="newPassword">New Password:</label>
                <input type="password" id="newPassword" name="newPassword" required><br><br>
                <button type="submit">Submit</button>
            </form>
        `);
    } catch (error) {
        console.error('Error in showResetForm:', error);
        res.status(500).send('Something went wrong');
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
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