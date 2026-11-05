// Apple sends people back here after "Continuar con Apple" (see api/_oauth.js).
import { oauthCallback } from './_oauth.js';
export default (req, res) => oauthCallback(req, res, 'apple');
