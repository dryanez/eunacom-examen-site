# Cuentas, compras y Mi Biblioteca — puesta en marcha

Flujo: **paga → «¡Felicidades!» con confeti → crea su cuenta con el mismo correo → onboarding (país, universidad,
convocatoria, WhatsApp) → Mi Cuenta con XP, Mi Biblioteca (lector protegido), Banco de preguntas y Clases.**
Las compras se guardan por **correo**, así que quien paga sin cuenta ve todo apenas la crea con ese correo.

Todo el código está listo; faltan estos pasos (son de tu cuenta, ~15 min):

## 1. Supabase (proyecto nuevo, separado de Mi EUNACOM)
1. supabase.com → New project → nombre `aee-examen`, región São Paulo.
2. SQL Editor → pega `supabase/schema.sql` → Run.
3. Authentication → Providers → Email: **«Confirm email» activado** (obligatorio: las compras se emparejan por correo).
4. Authentication → URL Configuration: Site URL = el dominio del sitio; Redirect URLs = `http://localhost:5195/**` y `https://<dominio>/**`.
5. (Recomendado) Authentication → SMTP: usar Resend como en EUNACOM, para que los correos lleguen de `@eunacomapp.cl`.

## 2. Bucket privado para los libros (Cloudflare R2)
1. R2 → Create bucket → `aee-libros`. **Sin dominio público.**
2. R2 → Manage API tokens → token «Object Read & Write» solo para `aee-libros`.
3. Subir los libros: `PYTHONPATH=~/fotos_tools/pylib ~/.venvs/manim/bin/python scripts/upload-books.py --env .env.local` (~1,1 GB).

## 3. Variables (en `.env.local` y en Vercel → Settings → Environment Variables)
```
VITE_SUPABASE_URL=            # Supabase → Project Settings → API
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=                 # el mismo URL
SUPABASE_SERVICE_ROLE_KEY=    # solo servidor; NUNCA con prefijo VITE_
PAYPAL_CLIENT_ID=             # los de EUNACOM (proyecto «eunacom» en vercel-keys.env)
PAYPAL_CLIENT_SECRET=
VITE_PAYPAL_CLIENT_ID=        # el mismo client id (es público)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=             # token del paso 2
R2_SECRET_ACCESS_KEY=
R2_BOOKS_BUCKET=aee-libros
MP_ACCESS_TOKEN=              # Mercado Pago → Tus integraciones → Credenciales de producción (el mismo de EUNACOM)
SITE_URL=https://eunacom-examen.cl   # para las URLs de vuelta y el webhook de Mercado Pago
```
Después de cambiar precios o productos: `node scripts/export-server-catalog.mjs` (los cobros salen de `api/_catalog.json`).

## 4. Pagos por WhatsApp (Mercado Pago, Webpay, transferencia)
Quedan como orden «pending» en la tabla `orders`. Cuando confirmes el pago, márcala pagada en el SQL Editor:
```sql
with o as (update orders set status = 'paid', paid_at = now() where id::text like 'XXXXXXXX%' returning *)
insert into purchases (email, sku, provider, provider_ref, buyer_name)
select o.email, unnest(o.skus), o.provider, o.id::text, o.buyer_name from o;
```
(Pendiente: Mercado Pago automático — falta su access token; y una pantalla de admin para esto.)

## Pendiente de seguridad
- Los videos del Aula están en el bucket **público** `eunacomvideos` y `public/aula/catalog.json` lista sus URLs: hoy
  cualquiera puede verlos sin pagar. Siguiente paso: moverlos a un bucket privado y servirlos con links firmados
  solo a quien tenga `clases-<especialidad>`.
- En el proyecto Vercel «eunacom», `VITE_SUPABASE_SERVICE_ROLE_KEY` lleva prefijo `VITE_`. Hoy el código no lo usa
  (no llega al navegador), pero conviene renombrarlo a `SUPABASE_SERVICE_ROLE_KEY`.
