import crypto from "crypto";

export function verifyIyzicoSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(signature, "hex")
  );
}

export function verifyMetaSignature(
  payload: string,
  signature: string,
  appSecret: string
): boolean {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", appSecret).update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
