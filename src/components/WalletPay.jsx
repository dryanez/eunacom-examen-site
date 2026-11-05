import React, { useEffect, useRef } from 'react';

// Real Apple Pay and Google Pay buttons, through PayPal (same approach as FaMED's WalletButtons).
// Each button shows only where it works (Apple Pay: Safari / iPhone / Mac with a card; Google Pay: Chrome / Android).
// Flow: the sheet gives the buyer's email → paypal-create (order under that email, or the signed-in account's)
//       → PayPal confirms the wallet payment → /?paypal=return&token=… → GraciasPage captures it (same as PayPal).
// Apple Pay also needs the domain registered in PayPal (Apple Pay → domains) and
// public/.well-known/apple-developer-merchantid-domain-association, so it's limited to APPLE_PAY_DOMAINS.
export const APPLE_PAY_DOMAINS = ['eunacom-examen.cl', 'www.eunacom-examen.cl'];
const LABEL = 'Academia Examen EUNACOM';

const loads = new Map();
const loadScript = src => {
  if (!loads.has(src)) {
    loads.set(src, new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = ok;
      s.onerror = () => { s.remove(); loads.delete(src); ko(new Error('script')); };
      document.head.appendChild(s);
    }));
  }
  return loads.get(src);
};

// post: the checkout API caller; body(extra): order body (skus, code, signed-in email);
// onOrder(paypalOrderId, claim): remember it for the thank-you page; onError(text); busy: shared lock with the other buttons.
export default function WalletPay({ post, body, onOrder, onError, disabled }) {
  const appleRef = useRef(null), googleRef = useRef(null), busy = useRef(false);
  const live = useRef({ post, body, onOrder, onError, disabled });
  live.current = { post, body, onOrder, onError, disabled };
  const key = JSON.stringify(body({}));

  useEffect(() => {
    let gone = false, session;
    const appleBox = appleRef.current, googleBox = googleRef.current;
    const L = () => live.current;

    // Creates the order with the email from the sheet (a signed-in buyer keeps their account email).
    const createOrder = async sheetEmail => {
      const base = L().body({ action: 'paypal-create' });
      const r = await L().post({ ...base, email: base.email || String(sheetEmail || '').trim().toLowerCase() });
      if (!r.paypalOrderId) throw new Error('order');
      L().onOrder(r.paypalOrderId, r.claim);
      return r.paypalOrderId;
    };
    const done = id => { window.location.href = `/?paypal=return&token=${encodeURIComponent(id)}`; };

    (async () => {
      const q = await L().post(L().body({ action: 'wallet-quote' }));
      await loadScript(`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(q.clientId)}&currency=USD&intent=capture&components=applepay,googlepay`);
      if (gone || !window.paypal) return;

      // ── Apple Pay ──
      const apple = async () => {
        if (!APPLE_PAY_DOMAINS.includes(window.location.hostname) || !window.paypal.Applepay) return;
        await loadScript('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js');
        const AP = window.ApplePaySession;
        if (gone || !AP?.canMakePayments()) return;
        const wallet = window.paypal.Applepay(); const cfg = await wallet.config();
        if (gone || !cfg.isEligible) return;
        const btn = document.createElement('apple-pay-button');
        btn.setAttribute('buttonstyle', 'black'); btn.setAttribute('type', 'pay'); btn.setAttribute('locale', 'es-CL');
        btn.style.cssText = 'display:block;--apple-pay-button-width:100%;--apple-pay-button-height:52px;--apple-pay-button-border-radius:12px';
        btn.addEventListener('click', () => {
          if (busy.current || L().disabled) return;
          busy.current = true; L().onError('');
          try {
            session = new AP(4, {
              countryCode: cfg.countryCode, currencyCode: 'USD', merchantCapabilities: cfg.merchantCapabilities, supportedNetworks: cfg.supportedNetworks,
              requiredBillingContactFields: ['postalAddress'], requiredShippingContactFields: ['email'],
              total: { label: LABEL, type: 'final', amount: q.usd },
            });
            session.onvalidatemerchant = async e => {
              try { const r = await wallet.validateMerchant({ validationUrl: e.validationURL, displayName: LABEL }); session.completeMerchantValidation(r.merchantSession); }
              catch { session.abort(); busy.current = false; L().onError('Apple Pay no está disponible en este momento. Usa otro medio de pago.'); }
            };
            session.oncancel = () => { busy.current = false; };
            session.onpaymentauthorized = async e => {
              try {
                const id = await createOrder(e.payment.shippingContact?.emailAddress);
                await wallet.confirmOrder({ orderId: id, token: e.payment.token, billingContact: e.payment.billingContact });
                session.completePayment(AP.STATUS_SUCCESS);
                done(id);
              } catch {
                session.completePayment(AP.STATUS_FAILURE); busy.current = false;
                L().onError('El pago con Apple Pay no se completó. No se te cobró nada.');
              }
            };
            session.begin();
          } catch { busy.current = false; L().onError('Apple Pay no está disponible en este dispositivo.'); }
        });
        appleBox.replaceChildren(btn);
      };

      // ── Google Pay ──
      const google = async () => {
        if (!window.paypal.Googlepay) return;
        await loadScript('https://pay.google.com/gp/p/js/pay.js');
        const wallet = window.paypal.Googlepay(); const cfg = await wallet.config();
        if (gone || cfg.isEligible === false || !cfg.allowedPaymentMethods?.length) return;
        if (q.mode === 'live' && !cfg.merchantInfo?.merchantId) return;
        const client = new window.google.payments.api.PaymentsClient({
          environment: q.mode === 'live' ? 'PRODUCTION' : 'TEST',
          paymentDataCallbacks: {
            onPaymentAuthorized: async data => {
              try {
                const id = await createOrder(data.email);
                const r = await wallet.confirmOrder({ orderId: id, paymentMethodData: data.paymentMethodData });
                if (r.status === 'PAYER_ACTION_REQUIRED') await wallet.initiatePayerAction({ orderId: id });
                setTimeout(() => done(id), 0);
                return { transactionState: 'SUCCESS' };
              } catch {
                return { transactionState: 'ERROR', error: { intent: 'PAYMENT_AUTHORIZATION', reason: 'OTHER_ERROR', message: 'No se pudo completar el pago. No se te cobró nada.' } };
              }
            },
          },
        });
        const base = { apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: cfg.allowedPaymentMethods };
        if (gone || !(await client.isReadyToPay(base)).result) return;
        const btn = client.createButton({
          buttonColor: 'black', buttonType: 'pay', buttonSizeMode: 'fill', buttonLocale: 'es', buttonRadius: 12,
          allowedPaymentMethods: cfg.allowedPaymentMethods,
          onClick: () => {
            if (busy.current || L().disabled) return;
            busy.current = true; L().onError('');
            client.loadPaymentData({
              ...base, emailRequired: true, merchantInfo: cfg.merchantInfo, callbackIntents: ['PAYMENT_AUTHORIZATION'],
              transactionInfo: { currencyCode: 'USD', countryCode: cfg.countryCode, totalPriceStatus: 'FINAL', totalPrice: q.usd, totalPriceLabel: 'Total' },
            })
              .catch(e => { if (e?.statusCode !== 'CANCELED') L().onError('Google Pay no se pudo abrir. Usa otro medio de pago.'); })
              .finally(() => { busy.current = false; });
          },
        });
        googleBox.replaceChildren(btn);
      };

      // A wallet that isn't available just doesn't show; the other buttons are always there.
      apple().catch(() => {}); google().catch(() => {});
    })().catch(() => {});

    return () => {
      gone = true; appleBox.replaceChildren(); googleBox.replaceChildren();
      if (session) { try { session.abort(); } catch { /* already done */ } }
      busy.current = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div ref={appleRef} className="ck-wallet" />
      <div ref={googleRef} className="ck-wallet ck-wallet--g" />
    </>
  );
}
