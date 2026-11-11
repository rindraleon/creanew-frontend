// Vérification non destructive après déploiement; pas de compte ni commande de test.
const raw = process.env.FRONTEND_URL;
const apiValue = process.env.VITE_API_URL;
if (!raw || !apiValue) throw new Error('FRONTEND_URL et VITE_API_URL sont requis.');
const frontend = new URL(raw);
if ((frontend.protocol !== 'https:' && process.env.ALLOW_HTTP_SMOKE !== 'true') || frontend.username || frontend.password || frontend.search || frontend.hash || frontend.pathname !== '/') {
  throw new Error('FRONTEND_URL doit être une origine HTTPS sans identifiant.');
}
for (const path of ['/', '/connexion', '/contact']) {
  const response = await fetch(new URL(path, frontend), { signal: AbortSignal.timeout(10_000), redirect: 'follow' });
  const html = await response.text();
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html') || !html.includes('id="root"')) {
    throw new Error(`Route frontend ${path} indisponible ou fallback SPA incorrect.`);
  }
}
const api = apiValue === '/api' ? new URL('/api', frontend) : new URL(apiValue);
if ((api.protocol !== 'https:' && process.env.ALLOW_HTTP_SMOKE !== 'true') || api.username || api.password || api.search || api.hash) {
  throw new Error('VITE_API_URL doit être /api ou une URL HTTPS publique.');
}
const url = new URL(`${api.pathname.replace(/\/$/, '')}/auth/oauth/providers`, api.origin);
const response = await fetch(url, { headers: { Origin: frontend.origin }, signal: AbortSignal.timeout(10_000), redirect: 'error' });
if (!response.ok) throw new Error(`API inaccessible depuis la configuration frontend : HTTP ${response.status}`);
if (api.origin !== frontend.origin && (response.headers.get('access-control-allow-origin') !== frontend.origin || response.headers.get('access-control-allow-credentials') !== 'true')) {
  throw new Error('CORS incompatible avec les requêtes authentifiées du frontend.');
}
const providers = await response.json();
if (typeof providers.google !== 'boolean' || typeof providers.facebook !== 'boolean') throw new Error('Endpoint auth inattendu.');
console.log('Routes publiques, URL API et CORS/proxy : OK.');
