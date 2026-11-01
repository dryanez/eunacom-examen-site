// GET /api/library                      → { skus, items }        what the signed-in user owns
// GET /api/library?item=<sku>&file=0    → { url, label }         10-minute link to that book (owners only)
// Books live in a PRIVATE R2 bucket (R2_BOOKS_BUCKET) under libros/<path inside books/dist>.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CATALOG, db, userFrom, ownedItems, bad } from './_lib.js';

let s3;
function r2() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !process.env.R2_BOOKS_BUCKET) return null;
  s3 ||= new S3Client({ region: 'auto', endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }, forcePathStyle: true });
  return s3;
}

export default async function handler(req, res) {
  if (!db()) return bad(res, 503, 'Biblioteca no configurada');
  const user = await userFrom(req);
  if (!user?.email) return bad(res, 401, 'Inicia sesión');
  const { skus, items } = await ownedItems(user.email);

  const item = req.query?.item ?? new URL(req.url, 'http://x').searchParams.get('item');
  if (!item) return res.json({ skus, items: [...items] });

  if (!items.has(item)) return bad(res, 403, 'No tienes este libro');
  const fileIdx = Number(req.query?.file ?? new URL(req.url, 'http://x').searchParams.get('file') ?? 0);
  const f = CATALOG.files[item]?.[fileIdx];
  if (!f) return bad(res, 404, 'Libro no disponible');
  if (!r2()) return bad(res, 503, 'Lector no configurado');
  const url = await getSignedUrl(r2(), new GetObjectCommand({ Bucket: process.env.R2_BOOKS_BUCKET, Key: `libros/${f.file}` }), { expiresIn: 600 });
  res.json({ url, label: f.label, download: !!f.download });
}
