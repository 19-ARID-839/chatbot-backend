// src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
import chatRoutes from './chat.js';
import adminRoutes from './admin.js';
import knowledgeRoutes from './knowledge.js'; // if you have it

const router = Router();

// Every route below will live under /api/...
router.use('/auth', authRoutes);         // => /api/auth/*
router.use('/chat', chatRoutes);         // => /api/chat/*
router.use('/admin', adminRoutes);       // => /api/admin/*
router.use('/knowledge', knowledgeRoutes); // optional

export default router;
