const JWT_SECRET = process.env.JWT_SECRET || "a-super-secret-key-hitzak-123456789";

async function getCryptoKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload: any) {
  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  // base64url encode payload to be safe in cookies
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return payloadB64 + "." + signatureHex;
}

export async function verifyToken(token: string) {
  try {
    const [payloadB64, signatureHex] = token.split(".");
    if (!payloadB64 || !signatureHex) return null;
    
    // base64url decode payload
    let base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const payload = JSON.parse(atob(base64));
    
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(payload));
    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
    return isValid ? payload : null;
  } catch {
    return null;
  }
}
