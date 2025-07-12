import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  profilePic?: string;
  location?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  visibility: 'Public' | 'Private';
  rating?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  profilePic: {
    type: String,
    default: '/placeholder.svg',
  },
  location: String,
  skillsOffered: {
    type: [String],
    default: [],
  },
  skillsWanted: {
    type: [String],
    default: [],
  },
  availability: {
    type: String,
    enum: ['Mornings', 'Evenings', 'Weekends'],
    default: 'Evenings',
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Private',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
