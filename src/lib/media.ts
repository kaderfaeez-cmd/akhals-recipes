/** Public URL prefix for uploaded images, served by src/app/media/[name]/route.ts. */
export const MEDIA_PATH = "/media";

// Names the upload route generates: lowercase base, base-36 stamp, width, .webp.
const MEDIA_NAME = /^[a-z0-9-]{1,100}\.webp$/;

export function isMediaName(name: string): boolean {
  return MEDIA_NAME.test(name);
}

export function mediaUrl(name: string): string {
  return `${MEDIA_PATH}/${name}`;
}
