const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectToMongo = require('./db');
const { loadEnv, getAppConfig } = require('./config');

async function start() {
  const config = await loadEnv();

  connectToMongo();

  const app = express();

  app.use(helmet());

  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.clientUrls.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    optionsSuccessStatus: 204,
  }));

  app.use(cookieParser());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Too many requests, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many auth attempts, please try again later.' },
  });

  app.use('/api/', generalLimiter);
  app.use('/api/auth/userlogin', authLimiter);
  app.use('/api/auth/createuser', authLimiter);

  app.get('/health', (req, res) =>
    res.json({ status: 'ok', env: config.nodeEnv, timestamp: new Date().toISOString() })
  );

  app.get('/api/config/public', (req, res) => {
    res.json({
      apiUrl: config.apiUrl || null,
      clientUrl: config.clientUrls[0] || null,
    });
  });

  app.use('/api/auth', require('./routes/userAut'));
  app.use('/api/notes', require('./routes/notes'));
  app.use('/api/workspaces', require('./routes/workspace'));
  app.use('/api/pages', require('./routes/pages'));

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  });

  app.listen(config.port, () => {
    const host = config.apiUrl || `http://localhost:${config.port}`;
    console.log(`🚀 iNotes API server running at ${host} [${config.nodeEnv}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
