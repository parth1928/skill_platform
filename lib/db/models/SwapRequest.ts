import mongoose from 'mongoose';

export interface ISwapRequest extends mongoose.Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  fromUserName: string;
  toUserName: string;
  fromUserPic?: string;
  toUserPic?: string;
  offeredSkill: string;
  requestedSkill: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

const swapRequestSchema = new mongoose.Schema<ISwapRequest>({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromUserName: {
    type: String,
    required: true,
  },
  toUserName: {
    type: String,
    required: true,
  },
  fromUserPic: String,
  toUserPic: String,
  offeredSkill: {
    type: String,
    required: true,
  },
  requestedSkill: {
    type: String,
    required: true,
  },
  message: String,
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.SwapRequest || mongoose.model<ISwapRequest>('SwapRequest', swapRequestSchema);
