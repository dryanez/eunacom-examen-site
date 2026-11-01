import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/account';

// Sign up / sign in. After sign-up Supabase emails a confirmation link that lands on #bienvenida (onboarding).
export default function AuthCard({ initialMode = 'signup', email: presetEmail = '', title, subtitle }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);   // { ok, text }

  if (!supabase) return <div className="ac-card"><p className="ac-note">Las cuentas se activan muy pronto. Tu compra quedó registrada con tu correo.</p></div>;

  // Supabase puts its tokens in the URL hash, so the next page goes in ?next= (see AccountProvider).
  const redirect = `${window.location.origin}/?next=bienvenida`;
  const submit = async e => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: redirect } });
        if (error) throw error;
        if (!data.session) setMsg({ ok: true, text: `Te enviamos un correo a ${email}. Ábrelo y confirma tu cuenta para ver tus libros.` });
        else window.location.hash = '#bienvenida';
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.hash = '#mi-cuenta';
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/?next=mi-cuenta` });
        if (error) throw error;
        setMsg({ ok: true, text: `Te enviamos un link a ${email} para crear una contraseña nueva.` });
      }
    } catch (err) {
      const t = String(err.message || '');
      setMsg({ ok: false, text: /registered|already/i.test(t) ? 'Ese correo ya tiene cuenta. Inicia sesión.' : /Invalid login/i.test(t) ? 'Correo o contraseña incorrectos.' : /Email not confirmed/i.test(t) ? 'Confirma tu correo primero (revisa tu bandeja).' : 'No se pudo completar. Inténtalo de nuevo.' });
    } finally { setBusy(false); }
  };

  return (
    <form className="ac-card" onSubmit={submit}>
      {title && <h3>{title}</h3>}
      {subtitle && <p className="ac-sub">{subtitle}</p>}
      <div className="ac-tabs">
        <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Crear cuenta</button>
        <button type="button" className={mode === 'signin' ? 'on' : ''} onClick={() => setMode('signin')}>Ya tengo cuenta</button>
      </div>
      {mode === 'signup' && <label className="ac-in"><User size={16} /><input placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>}
      <label className="ac-in"><Mail size={16} /><input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
      {mode !== 'reset' && <label className="ac-in"><Lock size={16} /><input type="password" placeholder={mode === 'signup' ? 'Crea una contraseña (mín. 8)' : 'Contraseña'} minLength={mode === 'signup' ? 8 : undefined} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>}
      {presetEmail && mode === 'signup' && <p className="ac-note"><CheckCircle2 size={14} /> Usa el mismo correo de tu compra para que aparezca en tu biblioteca.</p>}
      <button className="st-add" disabled={busy}>{busy ? 'Un momento…' : mode === 'signup' ? 'Crear mi cuenta' : mode === 'signin' ? 'Entrar' : 'Enviar link'} <ArrowRight size={18} /></button>
      {mode === 'signin' && <button type="button" className="ac-link" onClick={() => setMode('reset')}>¿Olvidaste tu contraseña?</button>}
      {msg && <p className={msg.ok ? 'ac-ok' : 'ac-err'}>{msg.text}</p>}
    </form>
  );
}
