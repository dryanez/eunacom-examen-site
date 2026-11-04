import { useEffect, useState } from 'react';
import { resolveCoupon, applyCoupon } from '../../api/_coupons.js';

// The discount code the buyer is using (from ?code= in the link, saved by main.jsx, or typed at checkout).
// Every price on the page reads it, so SHORTS20 shows up everywhere, not only at checkout.
const KEY = 'aee-code';
const EVENT = 'aee-code-change';

export function useCoupon() {
  const [code, setState] = useState(() => sessionStorage.getItem(KEY) || '');
  useEffect(() => {
    const on = () => setState(sessionStorage.getItem(KEY) || '');
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const setCode = value => {
    sessionStorage.setItem(KEY, String(value).trim().toUpperCase());
    window.dispatchEvent(new Event(EVENT));
  };
  const coupon = resolveCoupon(code);
  return { code, setCode, coupon, price: clp => applyCoupon(clp, coupon?.code) };
}
