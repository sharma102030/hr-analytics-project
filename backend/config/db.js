const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  try {
    if (!uri) {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      process.env.MONGO_URI = memoryUri;
      await mongoose.connect(memoryUri);
      console.log('MongoDB connected to in-memory server:', mongoose.connection.host);
      return;
    }

    await mongoose.connect(uri);
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
