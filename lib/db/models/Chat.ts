import mongoose from 'mongoose';

export interface IChat extends mongoose.Document {
  swapRequestId: mongoose.Types.ObjectId;
  messages: {
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    content: string;
    timestamp: Date;
  }[];
  participants: mongoose.Types.ObjectId[];
  lastMessageAt: Date;
}

const chatSchema = new mongoose.Schema<IChat>({
  swapRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true,
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
