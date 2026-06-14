import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (req.method === 'GET') {
    const { day } = req.query;
    try {
      const result = await list({ prefix: `dolomiten/day${day}/`, token });
      return res.status(200).json(result.blobs);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { url } = req.query;
    try {
      await del(url, { token });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
