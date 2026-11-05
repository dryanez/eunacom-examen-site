import React, { useEffect, useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAccount } from '../../lib/account';

// Sign up / sign in / reset (the site's own accounts, api/auth.js). After sign-up we email a confirmation link
// (?verify=…) that signs them in and lands on #bienvenida (onboarding). A reset link (?reset=…) opens 'newpass'.
// The purchase email's "Activar mi cuenta" (?activar=…) opens 'activate': the email is already proven, so it's
// just a password (or Google / Apple) and they're in.
const param = k => new URLSearchParams(window.location.search).get(k);

export function SocialButtons({ activar }) {
  const { providers } = useAccount();
  if (!providers.google && !providers.apple) return null;
  const href = p => `/api/auth?oauth=${p}${activar ? `&activar=${encodeURIComponent(activar)}` : ''}`;
  return (
    <div className="ac-social">
      {providers.google && (
        <a className="ac-sso" href={href('google')}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
          Continuar con Google
        </a>
      )}
      {providers.apple && (
        <a className="ac-sso apple" href={href('apple')}>
          <svg width="16" height="18" viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          Continuar con Apple
        </a>
      )}
      <div className="ac-or"><span>o con tu correo</span></div>
    </div>
  );
}

// `activar` can also come as a prop: the thank-you page gets one right after paying (see api/checkout.js, claim).
export default function AuthCard({ initialMode = 'signup', email: presetEmail = '', title, subtitle, activar: activarProp }) {
  const account = useAccount();
  const activar = activarProp || param('activar');
  const [mode, setMode] = useState(() => (param('reset') ? 'newpass' : activar ? 'activate' : initialMode));
  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(() => {   // { ok, text }
    const m = sessionStorage.getItem('aee-auth-msg') || param('auth_error'); sessionStorage.removeItem('aee-auth-msg');
    return m ? { ok: false, text: m } : null;
  });

  // From the purchase email: show whose account this is (or send them to sign in if it already exists).
  useEffect(() => {
    if (mode !== 'activate') return;
    account.activateInfo(activar)
      .then(r => { setEmail(r.email); if (r.hasAccount) { setMode('signin'); setMsg({ ok: true, text: 'Ya tienes cuenta con este correo: entra y ahí está tu compra.' }); } })
      .catch(e => { setMode('signup'); setMsg({ ok: false, text: e.message }); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearLink = () => history.replaceState(null, '', window.location.pathname + window.location.hash);
  const submit = async e => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (mode === 'signup') {
        await account.signUp(email, password, name);
        setMsg({ ok: true, text: `Te enviamos un correo a ${email}. Ábrelo y confirma tu cuenta para ver tus compras.` });
      } else if (mode === 'signin') {
        await account.signIn(email, password);
        clearLink(); window.location.hash = '#mi-cuenta';
      } else if (mode === 'activate') {
        await account.activate(activar, password, name);
        clearLink(); window.location.hash = '#bienvenida';
      } else if (mode === 'newpass') {
        await account.resetPassword(param('reset'), password);
        clearLink(); window.location.hash = '#mi-cuenta';
      } else {
        await account.requestReset(email);
        setMsg({ ok: true, text: `Si ${email} tiene cuenta, te llegará un link para crear una contraseña nueva.` });
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally { setBusy(false); }
  };

  const tabs = mode === 'signup' || mode === 'signin';
  return (
    <form className="ac-card" onSubmit={submit}>
      {mode === 'activate' ? <h3>Activa tu cuenta</h3> : title && <h3>{title}</h3>}
      {mode === 'activate'
        ? <p className="ac-sub">Tu compra está en <b>{email || '…'}</b>. Elige una contraseña{account.providers.google ? ' o entra con Google (con cualquier Gmail: la compra queda en tu cuenta)' : ''} y listo.</p>
        : subtitle && <p className="ac-sub">{subtitle}</p>}
      {mode === 'newpass' && <h3>Crea tu contraseña nueva</h3>}
      {tabs && <div className="ac-tabs">
        <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Crear cuenta</button>
        <button type="button" className={mode === 'signin' ? 'on' : ''} onClick={() => setMode('signin')}>Ya tengo cuenta</button>
      </div>}
      {(tabs || mode === 'activate') && <SocialButtons activar={mode === 'activate' ? activar : null} />}
      {(mode === 'signup' || mode === 'activate') && <label className="ac-in"><User size={16} /><input placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>}
      {(tabs || mode === 'reset') && <label className="ac-in"><Mail size={16} /><input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>}
      {mode !== 'reset' && <label className="ac-in"><Lock size={16} /><input type="password" placeholder={mode === 'signin' ? 'Contraseña' : 'Crea una contraseña (mín. 8)'} minLength={mode === 'signin' ? undefined : 8} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required /></label>}
      {presetEmail && mode === 'signup' && <p className="ac-note"><CheckCircle2 size={14} /> Usa el mismo correo de tu compra para que aparezca en tu biblioteca.</p>}
      <button className="st-add" disabled={busy}>{busy ? 'Un momento…' : { signup: 'Crear mi cuenta', signin: 'Entrar', activate: 'Activar mi cuenta', newpass: 'Guardar y entrar', reset: 'Enviar link' }[mode]} <ArrowRight size={18} /></button>
      {mode === 'signin' && <button type="button" className="ac-link" onClick={() => setMode('reset')}>¿Olvidaste tu contraseña?</button>}
      {msg && <p className={msg.ok ? 'ac-ok' : 'ac-err'}>{msg.text}</p>}
      {(mode === 'signup' || mode === 'activate') && <p className="ac-legal">Al crear tu cuenta aceptas los <a href="/terminos" target="_blank" rel="noopener">términos</a> y la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>.</p>}
    </form>
  );
}
