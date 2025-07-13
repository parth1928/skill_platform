import { ObjectId } from 'mongodb';

// Chat message type
export interface ChatMessage {
  senderId: ObjectId;
  senderName: string;
  content: string;
  timestamp: Date;
}

// Chat document type
export interface Chat {
  _id?: ObjectId;
  swapRequestId: ObjectId;
  messages: ChatMessage[];
  participants: ObjectId[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB update operators type
export interface MongoDBUpdate {
  $push?: { [key: string]: any };
  $set?: { [key: string]: any };
  $setOnInsert?: { [key: string]: any };
  $pull?: { [key: string]: any };
  $inc?: { [key: string]: number };
}