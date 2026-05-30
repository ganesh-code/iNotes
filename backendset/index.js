require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectToMongo = require('./db');

const port = process.env.PORT || 5500;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

connectToMongo();

// Security headers
app.use(helmet());

// HTTP logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const allowedOrigins = NODE_ENV === 'production'
  ? [CLIENT_URL]
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(cookieParser());

// Body parsing — 20mb to handle base64 cover image uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/userlogin', authLimiter);
app.use('/api/auth/createuser', authLimiter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', require('./routes/userAut'));
app.use('/api/notes', require('./routes/notes'));           // Keep old notes routes for backward compat
app.use('/api/workspaces', require('./routes/workspace'));
app.use('/api/pages', require('./routes/pages'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', ...(NODE_ENV === 'development' && { stack: err.stack }) });
});

app.listen(port, () => {
  console.log(`🚀 iNotes API server running at http://localhost:${port} [${NODE_ENV}]`);
});
