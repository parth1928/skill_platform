const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db('skillplatform');

    // Create indexes
    console.log('Creating indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { visibility: 1 } },
      { key: { skillsOffered: 1 } },
      { key: { skillsWanted: 1 } },
    ]);

    // Swap requests collection indexes
    await db.collection('swapRequests').createIndexes([
      { key: { fromUserId: 1 } },
      { key: { toUserId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
    ]);

    // Create test user if none exists
    const existingUser = await db.collection('users').findOne({});
    if (!existingUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await db.collection('users').insertOne({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        skillsOffered: ['JavaScript', 'React'],
        skillsWanted: ['Python', 'Machine Learning'],
        availability: 'Weekends',
        visibility: 'Public',
        rating: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
  }
}

initDatabase().catch(console.error);
