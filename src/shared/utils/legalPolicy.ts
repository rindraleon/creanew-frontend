export interface PublishedLegalPolicy {
  published: true;
  version: string;
  text: string;
}

export function isPublishedLegalPolicy(value: unknown): value is PublishedLegalPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const policy = value as Record<string, unknown>;
  return (
    policy.published === true &&
    typeof policy.version === "string" &&
    policy.version.trim().length > 0 &&
    policy.version.length <= 80 &&
    typeof policy.text === "string" &&
    policy.text.trim().length >= 20 &&
    policy.text.length <= 100000
  );
}
