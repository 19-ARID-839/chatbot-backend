
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New chat' },
  messages: [MessageSchema]
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);
