const Cart = require('../models/cart');
const Payment = require('../models/payment');
const crypto = require('crypto');
const fetch = require('node-fetch');
const deliveryController = require('./deliveryController'); // Import delivery controller

const partnerCode = "MOMO";
const accessKey = "F8BBA842ECF85";
const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const redirectUrl = "https://momo.vn/return";
const ipnUrl = "https://callback.url/notify";
const requestType = "captureWallet";
const extraData = "";
const momoEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create"; // MoMo test endpoint

exports.initiatePayment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ userId })
            .populate('pizzas.pizzaId')
            .populate('pizzas.customPizza.toppings')
            .populate('drinks.drinkId')
            .populate('sides.sideId')
            .populate('salads.saladId');

        if (!cart || (cart.pizzas.length === 0 && cart.drinks.length === 0 && cart.sides.length === 0 && cart.salads.length === 0)) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = "Pay with MoMo for Pizza Order";
        const amount = cart.total_price.toString();

        // Create raw signature
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        
        // Generate signature
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // MoMo request body
        const requestBody = JSON.stringify({
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType,
            signature,
            lang: 'en'
        });

        // Send request to MoMo
        const response = await fetch(momoEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        const result = await response.json();

        if (result.resultCode !== 0) {
            return res.status(400).json({ error: 'Failed to initiate payment', details: result });
        }

        // Save payment details
        const payment = new Payment({
            userId,
            orderId,
            requestId,
            amount,
            paymentUrl: result.payUrl
        });
        await payment.save();

        res.json({ paymentUrl: result.payUrl, paymentId: payment._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.paymentCallback = async (req, res) => {
    try {
        const { orderId, resultCode } = req.body;

        const payment = await Payment.findOne({ orderId });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Update payment status based on MoMo response
        payment.status = resultCode === 0 ? 'success' : 'failed';
        await payment.save();

        if (resultCode === 0) {
            // Payment successful, trigger delivery using the deliveryController
            req.user = { userId: payment.userId }; // Pass userId to the delivery controller
            const deliveryResponse = await deliveryController.createDelivery(req, res);
            return deliveryResponse; // The response will be handled by createDelivery
        } else {
            res.json({ message: 'Payment failed' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const isAdmin = req.user.role === 'admin';

        // Extract query parameters
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const sort = req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 };
        const search = req.query.search || '';

        // Build query
        let query = {};
        if (!isAdmin) {
            query.userId = userId; // Restrict to user's payments if not admin
        }

        // Add search filter (e.g., search by orderId or requestId)
        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { requestId: { $regex: search, $options: 'i' } },
            ];
        }

        // Convert sort format to MongoDB sort object
        let sortOptions = {};
        if (sort && sort.field && sort.sort) {
            sortOptions[sort.field] = sort.sort === 'asc' ? 1 : -1;
        } else {
            sortOptions = { createdAt: -1 }; // Default sort
        }

        // Fetch payments with pagination and sorting
        const total = await Payment.countDocuments(query);
        const payments = await Payment.find(query)
            .populate('userId', 'email')
            .sort(sortOptions)
            .skip(page * pageSize)
            .limit(pageSize);

        res.json({ payments, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};