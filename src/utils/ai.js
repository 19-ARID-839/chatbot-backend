
import OpenAI from 'openai';

export async function askOpenAI({ apiKey, messages, model = 'gpt-4o-mini', temperature = 0.3 }) {
  if (!apiKey) throw new Error('OpenAI API key missing');
  const openai = new OpenAI({ apiKey });
  const res = await openai.chat.completions.create({
    model,
    temperature,
    messages
  });
  const content = res.choices?.[0]?.message?.content || '';
  return content;
}
