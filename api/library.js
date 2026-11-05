// GET /api/library                      → { skus, items }        what the signed-in user owns
// GET /api/library?item=<sku>&file=0    → { url, label }         10-minute link to that book (owners only)
// GET /api/library?item=<sku>&mode=movil → { url }                the same manual as reflowable text (libros/movil/…json,
//                                                                  built by books/scripts/build_movil.cjs; manuals only)
// The admin account (ADMIN_EMAILS) can read every book, to check them.
// Books live in a PRIVATE R2 bucket (R2_BOOKS_BUCKET) under libros/<path inside books/dist>.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CATALOG, db, userFrom, ownedItems, bad } from './_lib.js';

const ADMINS = (process.env.ADMIN_EMAILS || 'dr.felipeyanez@gmail.com').toLowerCase().split(/[,\s]+/).filter(Boolean);
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
  if (ADMINS.includes(String(user.email).toLowerCase())) for (const k of Object.keys(CATALOG.files)) items.add(k);

  const item = req.query?.item ?? new URL(req.url, 'http://x').searchParams.get('item');
  if (!item) return res.json({ skus, items: [...items] });

  if (!items.has(item)) return bad(res, 403, 'No tienes este libro');
  const fileIdx = Number(req.query?.file ?? new URL(req.url, 'http://x').searchParams.get('file') ?? 0);
  const f = CATALOG.files[item]?.[fileIdx];
  if (!f) return bad(res, 404, 'Libro no disponible');
  const movil = (req.query?.mode ?? new URL(req.url, 'http://x').searchParams.get('mode')) === 'movil';
  if (movil && !/^01_Tomos\/.+\.pdf$/.test(f.file)) return bad(res, 404, 'Este libro aún no tiene modo celular');
  const key = movil ? `movil/${f.file.replace(/\.pdf$/, '.json')}` : f.file;
  // vite dev: el archivo sale del disco (books/dist), sin pasar por R2
  if (process.env.AEE_DEV_DB === '1' && process.env.BOOKS_DIST_DIR) return res.json({ url: `/__libros_dev/${encodeURI(key)}`, label: f.label, download: !!f.download });
  if (!r2()) return bad(res, 503, 'Lector no configurado');
  const url = await getSignedUrl(r2(), new GetObjectCommand({ Bucket: process.env.R2_BOOKS_BUCKET, Key: `libros/${key}` }), { expiresIn: 600 });
  res.json({ url, label: f.label, download: !!f.download });
}
