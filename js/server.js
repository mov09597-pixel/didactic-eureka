// كود تجريبي للحماية في server.js
const isAdmin = (req, res, next) => {
    const adminPassword = req.headers['admin-token'];
    if (adminPassword === 'TITAN_SECRET_2026') { // ده باسورد افتراضي
        next();
    } else {
        res.status(403).send('غير مسموح لك بالدخول');
    }
};

// مسار الدخول للوحة التحكم
app.get('/admin-panel', isAdmin, (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});
