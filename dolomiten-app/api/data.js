import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const KEY = 'dolomiten/shared-data.json';

  if (req.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: KEY, token });
      if (blobs.length === 0) return res.status(200).json({});
      const resp = await fetch(blobs[0].url);
      const data = await resp.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) body += chunk;
      const data = JSON.parse(body);
      await put(KEY, JSON.stringify(data), {
        access: 'public',
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
