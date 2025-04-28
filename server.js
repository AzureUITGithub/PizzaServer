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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối tới MongoDB Atlas'))
  .catch(err => console.error('Không thể kết nối tới MongoDB', err));

app.use(express.json());

app.use('/api/pizza', pizzaRoutes);
app.use('/api/drink', drinkRoutes);
app.use('/api/salad', saladRoutes);
app.use('/api/side', sideRoutes);
app.use('/api/topping', toppingRoutes);
app.use('/api/user', userRoutes);

app.listen(3000, () => {
    console.log("Server is Running");
});
