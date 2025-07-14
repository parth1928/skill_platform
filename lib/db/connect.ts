import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface CachedConnection {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: 'skillplatform'
    };

    try {
      console.log('Attempting to connect to MongoDB...', { uri: MONGODB_URI!.replace(/:\/\/[^@]*@/, '://*****@') });
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log('Successfully connected to MongoDB');
        return mongoose.connection;
      });
    } catch (error) {
      console.error('Error during MongoDB connection setup:', error);
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Error establishing MongoDB connection:', error);
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
