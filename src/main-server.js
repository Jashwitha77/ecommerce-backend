const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const dns = require('dns');

// Force Node.js to use Google DNS for MongoDB Atlas SRV lookup
dns.setServers(['8.8.8.8', '8.8.4.4']);

const productRoutes = require('./routes/product.routes');
// Load environment variables
dotenv.config();

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors());
app.use('/api/products', productRoutes);
// Routes
const userRoutes = require('./routes/user.routes');

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running successfully' });
});

// Mount Routes
app.use('/api/users', userRoutes);

// Port and DB configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
