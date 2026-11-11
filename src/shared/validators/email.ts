import domains from "./disposable-domains.json";

// Copie informative du snapshot backend. Le serveur reste la référence.
const blockedDomains = new Set<string>(domains);
export const DISPOSABLE_EMAIL_MESSAGE =
  "Les adresses e-mail jetables ou temporaires ne sont pas acceptées.";

export function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  const parts = email.split("@");
  if (
    parts.length !== 2 ||
    /\s/u.test(parts[1]) ||
    [..."/?#:%[]\\"].some((character) => parts[1].includes(character))
  )
    return email;
  try {
    // URL applique IDNA/punycode; pas de lookup DNS ou requête réseau.
    const domain = new URL(`http://${parts[1]}`).hostname;
    return `${parts[0]}@${domain}`;
  } catch {
    return email;
  }
}

export function isDisposableDomain(value: string | null): boolean {
  if (!value) return false;
  let domain = value.trim().toLowerCase();
  try {
    domain = new URL(`http://${domain}`).hostname;
  } catch {
    return false;
  }
  while (domain) {
    if (blockedDomains.has(domain)) return true;
    const dot = domain.indexOf(".");
    if (dot < 0) break;
    domain = domain.slice(dot + 1);
  }
  return false;
}

export function isDisposableEmail(value: string): boolean {
  const parts = normalizeEmail(value).split("@");
  return parts.length === 2 && isDisposableDomain(parts[1]);
}
