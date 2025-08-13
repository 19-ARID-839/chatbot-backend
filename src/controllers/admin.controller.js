
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

export async function overview(req, res) {
  const [users, chats] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments()
  ]);
  const agg = await Conversation.aggregate([ { $unwind: '$messages' }, { $count: 'count' } ]);
  res.json({
    users,
    chats,
    messages: agg[0]?.count || 0
  });
}

export async function listUsers(req, res) {
  const items = await User.find().select('_id name email role plan createdAt');
  res.json({ items });
}

export async function listAllChats(req, res) {
  const items = await Conversation.find().select('_id userId title createdAt updatedAt');
  res.json({ items });
}
