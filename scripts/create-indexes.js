import { connectToDatabase } from "@/lib/mongodb"

async function main() {
  const db = await connectToDatabase()
  
  // Create indexes for chats collection
  await db.collection("chats").createIndex({ swapRequestId: 1 })
  await db.collection("chats").createIndex({ participants: 1 })
  await db.collection("chats").createIndex({ lastMessageAt: -1 })

  console.log("Database indexes created successfully!")
}

main().catch(console.error)
