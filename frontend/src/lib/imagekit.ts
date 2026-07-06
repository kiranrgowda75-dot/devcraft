/**
 * ImageKit configuration helper.
 * Reads public credentials from env vars (safe to expose in the browser).
 */
export const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
export const IMAGEKIT_PUBLIC_KEY   = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
