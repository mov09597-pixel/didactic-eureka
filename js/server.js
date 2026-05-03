const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// إعدادات أساسية
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // تأكد أن ملفات الـ HTML في فولدر اسمه public
app.use('/assets/images', express.static('public/assets/images'));

// 1. الاتصال بقاعدة البيانات (MongoDB)
// استبدل الرابط برابط MongoDB Atlas الخاص بك لاحقاً
mongoose.connect('mongodb://localhost:27017/titan_db')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Database connection error:', err));

// 2. تعريف شكل المنتج في قاعدة البيانات (Schema)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: String,
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// 3. إعدادات رفع الصور (Multer)
const storage = multer.diskStorage({
    destination: './public/assets/images/',
    filename: (req, file, cb) => {
        cb(null, 'titan-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, // حد أقصى 5 ميجا للصورة
});

// 4. حماية الآدمن (Middleware)
const ADMIN_TOKEN = "911"; // الباسورد الخاص بك

const authenticateAdmin = (req, res, next) => {
    const token = req.headers['admin-token'];
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized: Wrong Admin Token" });
    }
};

// --- الـ API Routes ---

// جلب كل المنتجات للمتجر
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// إضافة منتج جديد (للآدمن فقط)
app.post('/api/products', authenticateAdmin, upload.single('productImage'), async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            image: '/assets/images/' + req.file.filename,
            category: req.body.category || 'General'
        });
        await newProduct.save();
        res.status(201).json({ message: "Product added successfully!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// حذف منتج (للآدمن فقط)
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// تشغيل السيرفر
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
