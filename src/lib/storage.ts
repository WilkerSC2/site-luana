import { supabase } from './supabase';
import { getSupabasePublicVariantUrl } from './supabaseImage';

function replaceExtensionWithSuffix(path: string, suffix: string) {
  const lastDot = path.lastIndexOf('.');
  const base = lastDot === -1 ? path : path.slice(0, lastDot);
  return `${base}-${suffix}.webp`;
}

type DecodedImage = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  close?: () => void;
};

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, width, height) => ctx.drawImage(bitmap, 0, 0, width, height),
      close: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image decode failed'));
      el.src = objectUrl;
    });

    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      draw: (ctx, width, height) => ctx.drawImage(img, 0, 0, width, height),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function createWebpVariantFromDecoded(decoded: DecodedImage, maxSize: number, quality: number): Promise<Blob> {
  const srcWidth = decoded.width;
  const srcHeight = decoded.height;
  const longEdge = Math.max(srcWidth, srcHeight);

  const scale = Math.min(1, maxSize / longEdge);
  const targetWidth = Math.max(1, Math.floor(srcWidth * scale));
  const targetHeight = Math.max(1, Math.floor(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  decoded.draw(ctx, targetWidth, targetHeight);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      'image/webp',
      quality,
    );
  });

  return blob;
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  const baseName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const webpPath = `${baseName}.webp`;

  // Preferred path: convert uploads to WebP before sending to storage.
  try {
    const decoded = await decodeImage(file);
    try {
      const [mainBlob, thumbBlob, displayBlob] = await Promise.all([
        createWebpVariantFromDecoded(decoded, 2400, 0.86),
        createWebpVariantFromDecoded(decoded, 900, 0.72),
        createWebpVariantFromDecoded(decoded, 1800, 0.82),
      ]);

      const { data, error } = await supabase.storage.from('portfolio-images').upload(webpPath, mainBlob, {
        cacheControl: '31536000',
        contentType: 'image/webp',
        upsert: false,
      });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Best-effort thumbnail + display variants (for performance).
      await Promise.allSettled([
        supabase.storage.from('portfolio-images').upload(replaceExtensionWithSuffix(webpPath, 'thumb'), thumbBlob, {
          cacheControl: '31536000',
          contentType: 'image/webp',
          upsert: true,
        }),
        supabase.storage.from('portfolio-images').upload(replaceExtensionWithSuffix(webpPath, 'display'), displayBlob, {
          cacheControl: '31536000',
          contentType: 'image/webp',
          upsert: true,
        }),
      ]);

      const {
        data: { publicUrl },
      } = supabase.storage.from('portfolio-images').getPublicUrl(data.path);

      return publicUrl;
    } finally {
      decoded.close?.();
    }
  } catch {
    // Fallback path: upload original as-is (keeps the app working even if WebP encoding fails).
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${baseName}.${fileExt}`;

    const { data, error } = await supabase.storage.from('portfolio-images').upload(fileName, file, {
      cacheControl: '31536000',
      contentType: file.type || undefined,
      upsert: false,
    });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Best-effort variants.
    try {
      const decoded = await decodeImage(file);
      try {
        const [thumbBlob, displayBlob] = await Promise.all([
          createWebpVariantFromDecoded(decoded, 900, 0.72),
          createWebpVariantFromDecoded(decoded, 1800, 0.82),
        ]);

        await Promise.allSettled([
          supabase.storage.from('portfolio-images').upload(replaceExtensionWithSuffix(fileName, 'thumb'), thumbBlob, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: true,
          }),
          supabase.storage.from('portfolio-images').upload(replaceExtensionWithSuffix(fileName, 'display'), displayBlob, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: true,
          }),
        ]);
      } finally {
        decoded.close?.();
      }
    } catch {
      // ignore
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('portfolio-images').getPublicUrl(data.path);

    return publicUrl;
  }
}

export async function ensureImageVariants(publicUrl: string): Promise<{ thumb: boolean; display: boolean }> {
  const urlParts = publicUrl.split('/portfolio-images/');
  if (urlParts.length < 2) return { thumb: false, display: false };

  const filePath = urlParts[1];
  const thumbPath = replaceExtensionWithSuffix(filePath, 'thumb');
  const displayPath = replaceExtensionWithSuffix(filePath, 'display');

  const thumbUrl = getSupabasePublicVariantUrl(publicUrl, 'thumb');
  const displayUrl = getSupabasePublicVariantUrl(publicUrl, 'display');

  const thumbExists = thumbUrl ? await urlExists(thumbUrl) : false;
  const displayExists = displayUrl ? await urlExists(displayUrl) : false;

  if (thumbExists && displayExists) return { thumb: true, display: true };

  const res = await fetch(publicUrl);
  if (!res.ok) return { thumb: thumbExists, display: displayExists };

  const blob = await res.blob();
  const file = new File([blob], 'image', { type: blob.type || 'image/jpeg' });

  try {
    const decoded = await decodeImage(file);
    try {
      if (!thumbExists) {
        const thumbBlob = await createWebpVariantFromDecoded(decoded, 900, 0.72);
        await supabase.storage.from('portfolio-images').upload(thumbPath, thumbBlob, {
          cacheControl: '31536000',
          contentType: 'image/webp',
          upsert: true,
        });
      }

      if (!displayExists) {
        const displayBlob = await createWebpVariantFromDecoded(decoded, 1800, 0.82);
        await supabase.storage.from('portfolio-images').upload(displayPath, displayBlob, {
          cacheControl: '31536000',
          contentType: 'image/webp',
          upsert: true,
        });
      }
    } finally {
      decoded.close?.();
    }
  } catch {
    // ignore
  }

  return { thumb: true, display: true };
}

export async function deleteImage(url: string): Promise<void> {
  const urlParts = url.split('/portfolio-images/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];
  const thumbPath = replaceExtensionWithSuffix(filePath, 'thumb');
  const displayPath = replaceExtensionWithSuffix(filePath, 'display');

  const { error } = await supabase.storage
    .from('portfolio-images')
    .remove([filePath, thumbPath, displayPath]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}
