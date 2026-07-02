import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/findyourmatch';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error: Could not connect to local database. Some features (like saving reports) will be disabled, but real-time chat and admin stats will still work.');
    // process.exit(1); Removed so the server stays alive for real-time sockets
  }
};
