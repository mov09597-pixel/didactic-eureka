// نموذج إعدادات الموقع
const settingsSchema = new mongoose.Schema({
    siteName: { type: String, default: "TITAN" },
    heroTitle: { type: String, default: "تخطَّ حدودك اليوم" },
    contactPhone: String
});
const Settings = mongoose.model('Settings', settingsSchema);

// API لجلب الإعدادات
app.get('/api/settings', async (req, res) => {
    const s = await Settings.findOne() || await Settings.create({});
    res.json(s);
});

// API لتحديث الإعدادات (محمي بالباسورد)
app.post('/api/settings', authenticateAdmin, async (req, res) => {
    await Settings.findOneAndUpdate({}, req.body, { upsert: true });
    res.json({ message: "تم تحديث إعدادات الموقع بنجاح" });
});
