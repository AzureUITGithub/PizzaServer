const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const pizzaRoutes = require('./routes/pizzaRoutes');
const drinkRoutes = require('./routes/drinkRoutes');
const saladRoutes = require('./routes/saladRoutes');
const sideRoutes = require('./routes/sideRoutes');
const toppingRoutes = require('./routes/toppingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối tới MongoDB Atlas'))
  .catch(err => console.error('Không thể kết nối tới MongoDB', err));

// Routes
app.use('/api/pizza', pizzaRoutes);
app.use('/api/drink', drinkRoutes);
app.use('/api/salad', saladRoutes);
app.use('/api/side', sideRoutes);
app.use('/api/topping', toppingRoutes);
app.use('/api/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is Running on port " + (process.env.PORT || 3000));
});