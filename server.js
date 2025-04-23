const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const pizzaRoutes = require('./routes/pizzaRoutes');
const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối tới MongoDB Atlas'))
  .catch(err => console.error('Không thể kết nối tới MongoDB', err));

app.use(express.json());
app.use('/api/pizza', pizzaRoutes);

app.listen(3000, () => {
    console.log("Server is Running");
});
 