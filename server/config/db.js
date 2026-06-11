const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jas1', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB runtime error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(async () => {
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jas1');
        console.log('MongoDB reconnected');
      } catch (err) {
        console.error(`MongoDB reconnection failed: ${err.message}`);
      }
    }, 5000);
  });
};

module.exports = connectDB;
