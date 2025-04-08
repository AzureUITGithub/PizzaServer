const express = require("express");
const mongoose = require("mongoose");
const app = express();

mongoose.connect("mongodb+srv://hathean2018:azuresky2020@pizzadb.ohh3cts.mongodb.net/?retryWrites=true&w=majority&appName=PizzaDB");

app.listen(3000, () => {
    console.log("Server is Running");
});
