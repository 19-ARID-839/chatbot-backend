import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser'; // if you set cookies on login
import { connectDB } from './config/db.js';
import routes from './routes/index.js';

const app = express();

/**
 * If you ever set cookies with `secure: true` (recommended in prod),
 * trust the Railway proxy so cookies are not dropped.
 */
app.set('trust proxy', 1);

/* ===================== CORS (place BEFORE routes) ===================== */
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

/**
 * Build per-request CORS options so the preflight OPTIONS
 * gets correct headers for your origin.
 * Also allow *.vercel.app previews.
 */
const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  const isAllowed =
    !origin ||
    allowedOrigins.has(origin) ||
    /\.vercel\.app$/.test(origin);

  callback(null, {
    origin: isAllowed, // must be true for allowed origins (not "*")
    credentials: true, // allow cookies/credentials if you use them
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
};

app.use(cors(corsOptionsDelegate));
// Ensure preflight (OPTIONS) returns CORS headers
app.options('*', cors(corsOptionsDelegate));
/* ===================================================================== */

/* --------------------- Standard middlewares --------------------- */
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // harmless if you don't use cookies

/* ---------------------- Rate limit API only --------------------- */
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use('/api', limiter);

/* --------------------------- Routes ----------------------------- */
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

/* --------------------- Startup / DB connect --------------------- */
const PORT = process.env.PORT || 8080;

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  process.env.MONGO_URI;

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

/* -------------------- Optional 404/Errors ----------------------- */
// app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
// app.use((err, _req, res, _next) => {
//   console.error(err);
//   res.status(500).json({ error: 'Internal Server Error' });
// });
