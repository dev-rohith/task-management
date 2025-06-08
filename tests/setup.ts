import mongoose from 'mongoose';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/task-management-test';

beforeAll(async () => {
  try {
    await mongoose.connect(TEST_DB_URI);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Clean up test database
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    console.log('Test database cleaned up');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

afterEach(async () => {
  // Clean up collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

// Helper function to ensure database is ready
export const ensureTestDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(TEST_DB_URI);
  }
};