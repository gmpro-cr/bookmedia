const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookcircle-india';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('💡 To fix this:');
  console.log('   1. Install MongoDB locally: brew install mongodb-community');
  console.log('   2. Or use MongoDB Atlas: https://cloud.mongodb.com');
  console.log('   3. Create a .env file with MONGODB_URI=your-connection-string');
  console.log('🔄 Server will continue running without database connection...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/events', require('./routes/events'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BookCircle India API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 BookCircle India server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});
