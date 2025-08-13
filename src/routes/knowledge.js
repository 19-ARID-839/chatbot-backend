
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listDocs, uploadDoc, deleteDoc, upload } from '../controllers/kb.controller.js';

const r = Router();
r.use(auth('admin'));
r.get('/', listDocs);
r.post('/upload', upload.single('file'), uploadDoc);
r.delete('/:id', deleteDoc);

export default r;
