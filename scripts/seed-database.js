const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillplatform';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('skill_platform');
    const users = db.collection('users');

    // Clear existing users
    await users.deleteMany({});

    // Create test users
    // Hash the password for all users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const testUsers = [
      {
        _id: new ObjectId(),
        name: "Alice Johnson",
        email: "alice@example.com",
        password: hashedPassword,
        location: "San Francisco, CA",
        profilePic: "/placeholder-user.jpg",
        skillsOffered: ["JavaScript", "React", "Node.js"],
        skillsWanted: ["Python", "Machine Learning", "Data Science"],
        availability: "Evenings",
        visibility: "Public",
        rating: 4.8,
        feedback: [
          {
            from: "Bob Smith",
            message: "Great teacher, very patient and knowledgeable!",
            stars: 5
          },
          {
            from: "Carol Davis",
            message: "Excellent React tutorials, highly recommended.",
            stars: 4
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Bob Smith",
        email: "bob@example.com",
        password: hashedPassword,
        location: "New York, NY",
        profilePic: "/placeholder-user.jpg",
        skillsOffered: ["Python", "Django", "PostgreSQL"],
        skillsWanted: ["React", "TypeScript", "AWS"],
        availability: "Weekends",
        visibility: "Public",
        rating: 4.6,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Carol Davis",
        email: "carol@example.com",
        password: hashedPassword,
        location: "Austin, TX",
        profilePic: "/placeholder-user.jpg",
        skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
        skillsWanted: ["Frontend Development", "CSS", "JavaScript"],
        availability: "Mornings",
        visibility: "Public",
        rating: 4.9,
        createdAt: new Date()
      }
    ];

    // Insert users
    const result = await users.insertMany(testUsers);
    console.log(`${result.insertedCount} test users added to the database`);

    // Verify the users were created by fetching them back
    console.log('\nVerifying created users:');
    const createdUsers = await users.find({}).toArray();
    createdUsers.forEach(user => {
      console.log(`User: ${user.name}`);
      console.log(`ID: ${user._id}`);
      console.log(`Email: ${user.email}`);
      console.log('Skills Offered:', user.skillsOffered);
      console.log('Skills Wanted:', user.skillsWanted);
      console.log('---');
    });

    console.log(`\nTotal users in database: ${createdUsers.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
