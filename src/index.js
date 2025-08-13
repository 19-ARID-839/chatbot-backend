
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api', limiter);

app.use('/api', routes);

app.get('/health', (req,res)=>res.json({ ok:true }));

const PORT = process.env.PORT || 8080;
connectDB(process.env.MONGODB_URI).then(()=>{
  app.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`));
}).catch(err => {
  console.error('DB error', err);
  process.exit(1);
});
