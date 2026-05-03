const express = require('express');
const app = express();
const mongoose = require('mongoose'); // قاعدة البيانات

app.use(express.json());
app.use(express.static('public')); // فولدر الموقع بتاعك

// اتصال بقاعدة البيانات (MongoDB)
mongoose.connect('mongodb://localhost/titan_db');

// موديل المنتج
const Product = mongoose.model('Product', {
    name: String,
    price: Number,
    image: String,
    category: String
});

// API لجلب المنتجات
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// API لإضافة منتج (من لوحة التحكم)
app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.send({ message: "Product Added!" });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
