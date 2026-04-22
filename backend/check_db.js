import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce').then(async () => {
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, sizes: Array }, { strict: false }));
    const allProds = await Product.find({ sizes: { $exists: true, $ne: [] } }).lean();
    console.log("Products with sizes:", JSON.stringify(allProds.map(p => ({ _id: p._id, name: p.name, sizes: p.sizes })), null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
