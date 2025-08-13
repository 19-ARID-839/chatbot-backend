
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { connectDB } from '../src/config/db.js';

async function run() {
  await connectDB(process.env.MONGODB_URI);
  await User.deleteMany({});
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin', plan:'pro' });
  const user = await User.create({ name: 'Demo User', email: 'user@example.com', password: 'user123', role: 'user', plan:'free' });
  console.log('Seeded:', { admin: { email: admin.email, pass: 'admin123' }, user: { email: user.email, pass: 'user123' } });
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
