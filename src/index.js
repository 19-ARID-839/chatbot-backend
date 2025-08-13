
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';

const app = express();

// trust proxy so secure cookies work behind Railway
app.set('trust proxy', 1);

/* ===================== CORS (robust) ===================== */
const allowed = new Set(
  (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

// Primary CORS middleware (handles dynamic Origin + credentials)
const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  const isAllowed = !origin || allowed.has(origin) || /\.vercel\.app$/.test(origin);

  callback(null, {
    origin: isAllowed, // true for allowed origins; not "*"
    credentials: true,
    methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  });
};

// Apply CORS before everything else
app.use(cors(corsOptionsDelegate));

// Fallback: explicitly set headers + short-circuit OPTIONS (some hosts/middlewares are picky)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = !origin || allowed.has(origin) || (/\.vercel\.app$/.test(origin));
  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
/* ======================================================== */

/* ---------------- middlewares (after CORS) --------------- */
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* --------- rate limit API only, skip preflight ----------- */
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  skip: (req) => req.method === 'OPTIONS'
});
app.use('/api', limiter);

/* ---------------------- routes --------------------------- */
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

/* ------------------- startup / DB ------------------------ */
const PORT = process.env.PORT || 8080;
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URI;

if (!mongoUri) {
  console.error('❌ Missing Mongo connection string (MONGODB_URI/DATABASE_URL/MONGO_URI).');
  process.exit(1);
}

connectDB(mongoUri)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`));
  })
  .catch(err => {
    console.error('DB error', err);
    process.exit(1);
  });

/* Optional 404/error handlers
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});
*/
