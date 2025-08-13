
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listConversations, getConversation, newMessage } from '../controllers/chat.controller.js';

const r = Router();
r.use(auth());
r.get('/conversations', listConversations);
r.get('/conversations/:id', getConversation);
r.post('/message', newMessage);

export default r;
