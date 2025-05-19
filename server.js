const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");

const pizzaRoutes = require('./routes/pizzaRoutes');
const drinkRoutes = require('./routes/drinkRoutes');
const saladRoutes = require('./routes/saladRoutes');
const sideRoutes = require('./routes/sideRoutes');
const toppingRoutes = require('./routes/toppingRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const deliveryRoutes = require('./routes/deliveryRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối tới MongoDB Atlas'))
  .catch(err => console.error('Không thể kết nối tới MongoDB', err));

app.use('/api/pizza', pizzaRoutes);
app.use('/api/drink', drinkRoutes);
app.use('/api/salad', saladRoutes);
app.use('/api/side', sideRoutes);
app.use('/api/topping', toppingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/delivery', deliveryRoutes); 
app.use('/api/payment', paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is Running on port " + (process.env.PORT || 3000));
});