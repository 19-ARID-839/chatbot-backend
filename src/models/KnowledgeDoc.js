
import mongoose from 'mongoose';

const KnowledgeDocSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  size: Number,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('KnowledgeDoc', KnowledgeDocSchema);
