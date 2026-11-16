import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { requireStorage } from './config';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Unsupported file format. Upload JPG, PNG, WebP, SVG, or ICO.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image exceeds 5 MB limit. Please choose a smaller file.';
  }
  return null;
}

async function compressImageToWebP(file: File, maxWidth = 1600): Promise<{ blob: Blob; ext: string }> {
  if (
    file.type === 'image/svg+xml' ||
    file.type === 'image/x-icon' ||
    file.type === 'image/vnd.microsoft.icon'
  ) {
    return { blob: file, ext: file.name.split('.').pop() || 'png' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ blob: file, ext: 'jpg' });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, ext: 'webp' });
          } else {
            resolve({ blob: file, ext: 'jpg' });
          }
        },
        'image/webp',
        0.86
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, ext: 'jpg' });
    };
    img.src = objectUrl;
  });
}

export async function uploadImage(
  file: File,
  folder: 'products' | 'banners' | 'ads' | 'branding',
  optimize = true
): Promise<string> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const storage = requireStorage();
  const { blob, ext } = optimize
    ? await compressImageToWebP(file)
    : { blob: file, ext: file.name.split('.').pop() || 'png' };

  const safeBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
  const filePath = `${folder}/${Date.now()}-${safeBase}.${ext}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, blob, {
    contentType: optimize && ext === 'webp' ? 'image/webp' : file.type,
    cacheControl: 'public, max-age=31536000',
  });

  return getDownloadURL(storageRef);
}

export async function deleteStorageFileByUrl(url: string): Promise<void> {
  if (!url || !url.includes('firebasestorage')) return;
  try {
    const storage = requireStorage();
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Ignore already-deleted or external URLs
  }
}
