const value = (process.env.VITE_API_URL ?? '').trim();
if (value === '/api') {
  console.log('API relative /api : un proxy de même origine est requis en production.');
} else {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
        ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(url.hostname) ||
        !url.pathname.replace(/\/$/, '').endsWith('/api')) throw new Error('invalid');
    console.log('URL API distante HTTPS syntaxiquement valide (accessibilité à vérifier après déploiement).');
  } catch {
    console.error('VITE_API_URL doit être /api (proxy configuré) ou une URL HTTPS publique se terminant par /api, sans identifiant ni secret.');
    process.exitCode = 1;
  }
}
