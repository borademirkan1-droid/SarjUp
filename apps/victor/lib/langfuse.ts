import { Langfuse } from "langfuse";

let _lf: Langfuse | null = null;

export function getLangfuse(): Langfuse | null {
  const pk = process.env.LANGFUSE_PUBLIC_KEY;
  const sk = process.env.LANGFUSE_SECRET_KEY;
  if (!pk || !sk) return null; // İkisi de olmadan trace yapma

  if (!_lf) {
    _lf = new Langfuse({
      publicKey: pk,
      secretKey: sk,
      baseUrl:   process.env.LANGFUSE_BASEURL ?? "https://cloud.langfuse.com",
      flushAt:   1,
      flushInterval: 0,
    });
  }
  return _lf;
}
