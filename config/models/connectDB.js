import mongoose from 'mongoose';

// Cache the connection across hot-reloads (dev) and warm lambda invocations
// (prod) so we never open more than one connection per process.
let cached = globalThis._mongoose;
if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 1 === connected. readyState 2 ("connecting") must NOT be treated as ready,
  // otherwise a concurrent request queries a half-open connection.
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is not configured');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URL, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset so the next request retries instead of reusing a rejected promise.
    cached.promise = null;
    // Throw — never process.exit(); one transient Atlas blip must not kill the
    // whole Next.js server.
    throw error;
  }

  return cached.conn;
};

export default connectDB;
