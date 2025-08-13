
import Conversation from '../models/Conversation.js';
import { askOpenAI } from '../utils/ai.js';

export async function listConversations(req, res) {
  const items = await Conversation.find({ userId: req.user._id }).sort({ updatedAt: -1 }).select('_id title createdAt updatedAt');
  res.json({ items });
}

export async function getConversation(req, res) {
  const doc = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
}

export async function newMessage(req, res) {
  const { content, conversationId } = req.body;
  if (!content) return res.status(400).json({ message: 'content required' });
  let convo;
  if (conversationId) {
    convo = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
  }
  if (!convo) {
    convo = await Conversation.create({ userId: req.user._id, title: content.slice(0, 40), messages: [] });
  }
  convo.messages.push({ role: 'user', content });
  const reply = await askOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    messages: [
      { role: 'system', content: 'You are a helpful customer support assistant. Keep answers concise and actionable.' },
      ...convo.messages.map(m => ({ role: m.role, content: m.content }))
    ]
  });
  convo.messages.push({ role: 'assistant', content: reply });
  await convo.save();
  res.json({ conversationId: convo._id, reply });
}
