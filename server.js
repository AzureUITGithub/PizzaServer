const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require("cors");;
const helmet = require('helmet');
const morgan = require('morgan');


const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
})

const pizzaRoutes = require('./routes/pizzaRoutes');
const drinkRoutes = require('./routes/drinkRoutes');
const saladRoutes = require('./routes/saladRoutes');
const sideRoutes = require('./routes/sideRoutes');
const toppingRoutes = require('./routes/toppingRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const deliveryRoutes = require('./routes/deliveryRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

app.use(
  cors({origin: ['http://localhost:3000', 'http://127.0.0.1:3000']})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
app.use('/api/stats', statsRoutes);

app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 512,
      temperature: 0
    });

    res.send(completion.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi khi gọi API OpenAI");
  }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is Running on port " + (process.env.PORT || 3000));
});