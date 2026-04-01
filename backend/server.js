const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./database/config');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
})();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const routesPath = path.join(__dirname, 'backend', 'routes');
if (fs.existsSync(routesPath)) {
  fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
      const router = require(path.join(routesPath, file));
      app.use('/api', router);
    }
  });
} else {
  console.warn(`Routes directory not found: ${routesPath}`);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});