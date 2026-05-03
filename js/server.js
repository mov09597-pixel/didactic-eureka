const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// --- 1. الإعدادات الأساسية (Middlewares) ---
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 
app.use('/assets/images', express.static('public/assets/images'));

// --- 2. الاتصال بقاعدة البيانات (MongoDB) ---
mongoose.connect('mongodb://localhost:27017/titan_db')
    .then(() => console.log('✅ Connected to MongoDB (Titan DB)'))
    .catch(err => console.error('❌ Database connection error:', err));

// --- 3. تعريف نماذج البيانات (Models) ---

// نموذج المنتجات (Products)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: String,
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

// نموذج الطلبات (Orders)
const orderSchema = new mongoose.Schema({
    customerName: String,
    phoneNumber: String,
    address: String,
    items: Array,
    totalPrice: Number,
    status: { type: String, default: 'Pending' }, 
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- 4. إعدادات رفع الصور (Multer) ---
const storage = multer.diskStorage({
    destination: './public/assets/images/',
    filename: (req, file, cb) => {
        cb(null, 'titan-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5000000 }, 
});

// --- 5. حماية الآدمن (Admin Middleware) ---
const ADMIN_TOKEN = "911"; // الباسورد الخاص بك

const authenticateAdmin = (req, res, next) => {
    const token = req.headers['admin-token'];
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized: Wrong Admin Token" });
    }
};

// --- 6. الـ API Routes (المنتجات) ---

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
        if (!req.file) return res.status(400).json({ message: "Please upload an image" });
        
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

// --- 7. الـ API Routes (الطلبات) ---

// استقبال طلب جديد من العميل
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order({
            customerName: req.body.customerName,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            items: req.body.items,
            totalPrice: req.body.totalPrice
        });
        await newOrder.save();
        res.status(201).json({ message: "تم استلام طلبك بنجاح، سنتواصل معك قريباً!" });
    } catch (err) {
        res.status(400).json({ message: "خطأ في تسجيل الطلب: " + err.message });
    }
});

// جلب كل الطلبات (للآدمن لمشاهدتها في الـ Dashboard)
app.get('/api/orders', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 8. تشغيل السيرفر ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 TITAN SERVER READY
    -------------------------------
    🔗 Main URL: http://localhost:${PORT}
    📸 Images: http://localhost:${PORT}/assets/images
    🔑 Admin Token: ${ADMIN_TOKEN}
    -------------------------------
    `);
});
