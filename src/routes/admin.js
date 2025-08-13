
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { overview, listUsers, listAllChats } from '../controllers/admin.controller.js';

const r = Router();
r.use(auth('admin'));
r.get('/overview', overview);
r.get('/users', listUsers);
r.get('/chats', listAllChats);

export default r;
