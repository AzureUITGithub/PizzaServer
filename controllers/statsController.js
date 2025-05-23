const Delivery = require('../models/delivery');
const Comment = require('../models/comment');
const User = require('../models/user');
const Pizza = require('../models/pizza');
const Topping = require('../models/topping');
const Drink = require('../models/drink');
const Side = require('../models/side');
const Salad = require('../models/salad');
const Payment = require('../models/payment'); // Add Payment model

// Get Average Order Value (AOV)
exports.getAverageOrderValue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    averageOrderValue: { $avg: '$order.total_price' },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    averageOrderValue: { $round: ['$averageOrderValue', 2] },
                    totalOrders: 1
                }
            }
        ];
        const results = await Delivery.aggregate(pipeline);
        res.json(results[0] || { averageOrderValue: 0, totalOrders: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Order Count by Status
exports.getOrderCountByStatus = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            },
            { $sort: { status: 1 } }
        ];
        const results = await Delivery.aggregate(pipeline);
        res.json({ orderCountByStatus: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Top Active Users
exports.getTopActiveUsers = async (req, res) => {
    try {
        const { startDate, endDate, metric = 'orderCount' } = req.query;
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$userId',
                    orderCount: { $sum: 1 },
                    totalSpending: { $sum: '$order.total_price' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    _id: 0,
                    userId: '_id',
                    username: '$userDetails.username',
                    orderCount: 1,
                    totalSpending: { $round: ['$totalSpending', 2] }
                }
            },
            { $sort: metric === 'totalSpending' ? { totalSpending: -1 } : { orderCount: -1 } },
            { $limit: 10 }
        ];
        const results = await Delivery.aggregate(pipeline);
        res.json({ topUsers: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Revenue by Day
exports.getRevenueByDay = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    totalRevenue: { $sum: '$order.total_price' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    orderCount: 1
                }
            },
            { $sort: { date: 1 } }
        ];
        const results = await Delivery.aggregate(pipeline);
        res.json({ dailyRevenue: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Total Revenue (Updated to use Payment collection)
exports.getTotalRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = { status: 'success' }; // Only include successful payments
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $toDouble: '$amount' } } // Convert amount (String) to number
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: { $round: ['$totalRevenue', 2] }
                }
            }
        ];
        const results = await Payment.aggregate(pipeline);
        res.json(results[0] || { totalRevenue: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Top Selling Products
exports.getTopSellingProducts = async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;
        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Aggregate for pizzas (including custom pizzas)
        const pizzaPipeline = [
            { $match: matchStage },
            { $unwind: '$order.pizzas' },
            {
                $project: {
                    productId: {
                        $ifNull: ['$order.pizzas.pizzaId', '$order.pizzas.customPizza.pizzaId']
                    },
                    quantity: '$order.pizzas.quantity'
                }
            },
            {
                $lookup: {
                    from: 'pizzas',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'pizzaDetails'
                }
            },
            { $unwind: '$pizzaDetails' },
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$pizzaDetails.name' },
                    totalQuantity: { $sum: '$quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ];

        // Aggregate for drinks
        const drinkPipeline = [
            { $match: matchStage },
            { $unwind: '$order.drinks' },
            {
                $project: {
                    productId: '$order.drinks.drinkId',
                    quantity: '$order.drinks.quantity'
                }
            },
            {
                $lookup: {
                    from: 'drinks',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'drinkDetails'
                }
            },
            { $unwind: '$drinkDetails' },
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$drinkDetails.name' },
                    totalQuantity: { $sum: '$quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ];

        // Aggregate for sides
        const sidePipeline = [
            { $match: matchStage },
            { $unwind: '$order.sides' },
            {
                $project: {
                    productId: '$order.sides.sideId',
                    quantity: '$order.sides.quantity'
                }
            },
            {
                $lookup: {
                    from: 'sides',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'sideDetails'
                }
            },
            { $unwind: '$sideDetails' },
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$sideDetails.name' },
                    totalQuantity: { $sum: '$quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ];

        // Aggregate for salads
        const saladPipeline = [
            { $match: matchStage },
            { $unwind: '$order.salads' },
            {
                $project: {
                    productId: '$order.salads.saladId',
                    quantity: '$order.salads.quantity'
                }
            },
            {
                $lookup: {
                    from: 'salads',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'saladDetails'
                }
            },
            { $unwind: '$saladDetails' },
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$saladDetails.name' },
                    totalQuantity: { $sum: '$quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ];

        // Run all pipelines and combine results
        const [pizzaResults, drinkResults, sideResults, saladResults] = await Promise.all([
            Delivery.aggregate(pizzaPipeline),
            Delivery.aggregate(drinkPipeline),
            Delivery.aggregate(sidePipeline),
            Delivery.aggregate(saladPipeline)
        ]);

        // Combine and sort results
        const allProducts = [...pizzaResults, ...drinkResults, ...sideResults, ...saladResults]
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, parseInt(limit));

        res.json({ topProducts: allProducts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};