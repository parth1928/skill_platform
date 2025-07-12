const { MongoClient, ObjectId } = require('mongodb');

async function seedDatabase() {
  const uri = 'mongodb://127.0.0.1:27017/skill_platform';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('skill_platform');
    const users = db.collection('users');

    // Clear existing users
    await users.deleteMany({});

    // Create test users
    const testUsers = [
      {
        _id: new ObjectId(),
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "$2a$10$YourHashedPasswordHere", // This should be properly hashed in production
        location: "San Francisco, CA",
        profilePic: "/placeholder.svg",
        skillsOffered: ["JavaScript", "React", "Node.js"],
        skillsWanted: ["Python", "Machine Learning", "Data Science"],
        availability: "Evenings",
        visibility: "Public",
        rating: 4.8,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Bob Smith",
        email: "bob@example.com",
        password: "$2a$10$YourHashedPasswordHere", // This should be properly hashed in production
        location: "New York, NY",
        profilePic: "/placeholder.svg",
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
        password: "$2a$10$YourHashedPasswordHere", // This should be properly hashed in production
        location: "Austin, TX",
        profilePic: "/placeholder.svg",
        skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
        skillsWanted: ["Frontend Development", "CSS", "JavaScript"],
        availability: "Mornings",
        visibility: "Public",
        rating: 4.9,
        createdAt: new Date()
      }
    ];

    const result = await users.insertMany(testUsers);
    console.log(`${result.insertedCount} test users added to the database`);

    // Print the IDs of the created users for reference
    console.log('Created users with IDs:');
    testUsers.forEach(user => {
      console.log(`${user.name}: ${user._id}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
