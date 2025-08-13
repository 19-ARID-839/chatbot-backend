
import multer from 'multer';
import fs from 'fs';
import KnowledgeDoc from '../models/KnowledgeDoc.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
export const upload = multer({ storage });

export async function listDocs(req, res) {
  const items = await KnowledgeDoc.find().sort({ createdAt: -1 });
  res.json({ items });
}

export async function uploadDoc(req, res) {
  const file = req.file;
  const doc = await KnowledgeDoc.create({
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    uploadedBy: req.user._id
  });
  res.json({ message: 'Uploaded', doc });
}

export async function deleteDoc(req, res) {
  const doc = await KnowledgeDoc.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  try { fs.unlinkSync(doc.path); } catch {}
  await doc.deleteOne();
  res.json({ message: 'Deleted' });
}
