// auth/tokenBridge.ts
export type GetTokenFn = (opts?: {
  template?: string;
}) => Promise<string | null | undefined>;

let _getToken: GetTokenFn | null = null;

export function setGetToken(fn: GetTokenFn) {
  _getToken = fn;
}

export async function fetchToken(opts?: { template?: string }) {
  if (!_getToken) return null;
  try {
    return (await _getToken(opts)) ?? null;
  } catch {
    return null;
  }
}
