# Cuentas, compras y Mi Biblioteca — puesta en marcha

Flujo: **paga → «¡Felicidades!» con confeti → crea su cuenta con el mismo correo → onboarding (país, universidad,
convocatoria, WhatsApp) → Mi Cuenta con XP, Mi Biblioteca (lector protegido), Banco de preguntas y Clases.**
Las compras se guardan por **correo**, así que quien paga sin cuenta ve todo apenas la crea con ese correo.

Todo el código está listo; faltan estos pasos (son de tu cuenta, ~15 min):

## 1. Supabase — HECHO (2026-11-04)
Las tablas viven en el proyecto de la app EUNACOM (**Examenes-Eunacom**, `zmqwpkettikjutgzquri`) solo por falta de
espacio en el plan gratis. **Las cuentas son propias y separadas**: tabla `aee_users` (contraseñas con scrypt, sesiones
en `aee_tokens`), sin Supabase Auth y sin relación con los usuarios de la app EUNACOM. Todo lleva prefijo `aee_`, y
solo el servidor del sitio (service role) lo lee; nada de la app EUNACOM se toca.
Volver a correr el esquema: `npx supabase db query --remote=zmqwpkettikjutgzquri --yes -f supabase/schema.sql`
Correos: **Amazon SES** (la misma cuenta y dominio eunacomapp.cl de la app EUNACOM; `SES_SMTP_*` en `.env.local`,
remitente `AEE_MAIL_FROM`). Plantillas en `api/_emails.js`; verlas en local: http://localhost:5195/api/email-preview
- Al confirmarse cualquier pago (PayPal, Mercado Pago, transferencia), el comprador recibe «¡Gracias por tu compra!» con lo
  que compró, lo que abre cada cosa y el botón **Activar mi cuenta** (crea la cuenta sin un segundo correo de
  confirmación) o **Ir a Mi Biblioteca** si ya tiene cuenta. Ojo: una transferencia marcada a mano por SQL NO envía el
  correo (falta la pantalla de admin).
- Google / Apple: el código está listo (`api/_oauth.js`); los botones aparecen solos al poner las claves:
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google Cloud → Credenciales → ID de cliente OAuth «Aplicación web»,
  URI de redirección `<SITE_URL>/api/google-callback`) y `APPLE_SERVICE_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`,
  `APPLE_PRIVATE_KEY` (Apple Developer, «Sign in with Apple», retorno `<SITE_URL>/api/apple-callback`).

## 2. Bucket privado para los libros (Cloudflare R2)
1. R2 → Create bucket → `aee-libros`. **Sin dominio público.**
2. R2 → Manage API tokens → token «Object Read & Write» solo para `aee-libros`.
3. Subir los libros: `PYTHONPATH=~/fotos_tools/pylib ~/.venvs/manim/bin/python scripts/upload-books.py --env .env.local` (~1,1 GB).

## 3. Variables (en `.env.local` y en Vercel → Settings → Environment Variables)
```
SUPABASE_URL=                 # https://zmqwpkettikjutgzquri.supabase.co
SES_SMTP_USER= / SES_SMTP_PASS= / SES_SMTP_HOST=   # Amazon SES, los mismos de EUNACOM
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=           # «Continuar con Google» (opcional)
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
with o as (update aee_orders set status = 'paid', paid_at = now() where id::text like 'XXXXXXXX%' returning *)
insert into aee_purchases (email, sku, provider, provider_ref, buyer_name)
select o.email, unnest(o.skus), o.provider, o.id::text, o.buyer_name from o;
```
(Pendiente: Mercado Pago automático — falta su access token; y una pantalla de admin para esto.)

## Probar compras sin pagar
- `node scripts/dry-test-purchases.mjs`: cada producto × cada forma de pago (transferencia, PayPal, Mercado Pago vuelta y
  webhook, simulados) y revisa qué abre: p. ej. «Clases · Cardiología» abre solo las clases de Cardiología en el Aula.
- En local sin Supabase (`npm run dev`), «Mi cuenta» entra solo con el correo (modo prueba). Una transferencia de prueba se
  marca pagada con `POST /api/checkout {action:'dev-mark-paid', orderId}` (solo funciona en local).

## Pendiente de seguridad
- Los videos del Aula están en el bucket **público** `eunacomvideos` y `public/aula/catalog.json` lista sus URLs: hoy
  cualquiera puede verlos sin pagar. Siguiente paso: moverlos a un bucket privado y servirlos con links firmados
  solo a quien tenga `clases-<especialidad>`.
- En el proyecto Vercel «eunacom», `VITE_SUPABASE_SERVICE_ROLE_KEY` lleva prefijo `VITE_`. Hoy el código no lo usa
  (no llega al navegador), pero conviene renombrarlo a `SUPABASE_SERVICE_ROLE_KEY`.
