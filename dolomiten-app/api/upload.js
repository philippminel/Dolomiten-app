import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const { filename, day } = req.query;
  if (!filename) return res.status(400).json({ error: 'filename required' });

  try {
    const blob = await put(`dolomiten/day${day}/${Date.now()}_${filename}`, req, {
      access: 'public',
      token,
    });
    return res.status(200).json(blob);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
