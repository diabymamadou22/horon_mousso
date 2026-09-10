/**
 * Media Upload & Optimization Utility for Horon Mousso
 * - Directly integrates with Firebase Cloud Storage (crucial-spider-zhh41.firebasestorage.app)
 * - Compresses high-res camera photos down to lightweight WebP/JPEG (~60-120KB)
 * - Automatic video thumbnail extraction
 * - Resilient 3-tier fallback architecture:
 *     1. Primary: Google Cloud Firebase Storage (permanent cloud CDN)
 *     2. Secondary: Express Local Server /uploads/
 *     3. Offline: Optimized HTML5 Data URL
 */

import { firebaseStorage, storageRef, uploadBytes, getDownloadURL } from '../lib/firebase';

export interface UploadResult {
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  size?: number;
  filename?: string;
  storageProvider?: 'firebase' | 'server' | 'inline';
}

/**
 * Converts a Base64 data URL into a binary Blob for direct cloud storage upload
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads a file or binary blob directly to Google Firebase Storage
 */
export async function uploadToFirebaseStorage(
  blobOrFile: Blob | File,
  filename: string,
  folder = 'uploads',
  mimeType?: string
): Promise<string> {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage instance not initialized');
  }

  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniquePath = `${folder}/${Date.now()}_${cleanName}`;
  const fileRef = storageRef(firebaseStorage, uniquePath);

  const metadata = mimeType ? { contentType: mimeType } : undefined;
  const snapshot = await uploadBytes(fileRef, blobOrFile, metadata);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Compresses an image file in the browser using HTML5 Canvas
 */
export async function compressImage(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        return reject(new Error('Format image invalide'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Impossible de décoder l’image'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(result); // Fallback to raw if canvas unavailable
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try JPEG first (best compression/quality ratio)
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an image thumbnail from a local video file
 */
export async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      const fileUrl = URL.createObjectURL(file);
      video.src = fileUrl;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0.5;

      const cleanUp = () => {
        URL.revokeObjectURL(fileUrl);
        video.remove();
      };

      video.onloadeddata = () => {
        video.currentTime = Math.min(0.5, video.duration / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(640, video.videoWidth || 640);
          canvas.height = Math.min(360, video.videoHeight || 360);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbUrl = canvas.toDataURL('image/jpeg', 0.8);
            cleanUp();
            return resolve(thumbUrl);
          }
        } catch {
          // ignore error
        }
        cleanUp();
        resolve('');
      };

      video.onerror = () => {
        cleanUp();
        resolve('');
      };

      // Safety timeout in case video loading hangs
      setTimeout(() => {
        cleanUp();
        resolve('');
      }, 4000);
    } catch {
      resolve('');
    }
  });
}

/**
 * Uploads an image or video file:
 * 1. Optimizes and compresses if it's an image; generates thumbnail if video.
 * 2. Attempts direct upload to Firebase Cloud Storage.
 * 3. Falls back to Express Server /api/upload if Firebase Storage is unavailable or restricted.
 * 4. Falls back to compressed data URL if server is offline.
 */
export async function uploadMediaFile(
  file: File,
  onProgress?: (status: string) => void,
  folder = 'media'
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  const type: 'image' | 'video' = isVideo ? 'video' : 'image';

  let dataPayload: string;
  let videoThumbnail = '';

  if (isVideo) {
    onProgress?.('Génération de l’aperçu vidéo...');
    videoThumbnail = await generateVideoThumbnail(file);

    onProgress?.('Lecture de la vidéo...');
    dataPayload = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur de lecture de la vidéo'));
      reader.readAsDataURL(file);
    });
  } else {
    onProgress?.('Optimisation de la photo...');
    dataPayload = await compressImage(file, 1280, 1280, 0.82);
  }

  // TIER 1: Firebase Cloud Storage Upload
  if (firebaseStorage) {
    try {
      onProgress?.('Téléversement vers Firebase Storage...');
      if (type === 'image') {
        const blob = dataUrlToBlob(dataPayload);
        const downloadUrl = await uploadToFirebaseStorage(blob, file.name, folder, 'image/jpeg');
        onProgress?.('Enregistré sur Firebase Storage !');
        return {
          url: downloadUrl,
          type: 'image',
          thumbnailUrl: downloadUrl,
          size: blob.size,
          filename: file.name,
          storageProvider: 'firebase'
        };
      } else {
        // Video upload
        const downloadUrl = await uploadToFirebaseStorage(file, file.name, folder, file.type || 'video/mp4');
        let thumbUrl: string | undefined = undefined;
        if (videoThumbnail) {
          try {
            const thumbBlob = dataUrlToBlob(videoThumbnail);
            thumbUrl = await uploadToFirebaseStorage(thumbBlob, `thumb_${file.name}.jpg`, `${folder}/thumbnails`, 'image/jpeg');
          } catch {
            thumbUrl = videoThumbnail;
          }
        }
        onProgress?.('Vidéo enregistrée sur Firebase Storage !');
        return {
          url: downloadUrl,
          type: 'video',
          thumbnailUrl: thumbUrl || videoThumbnail || undefined,
          size: file.size,
          filename: file.name,
          storageProvider: 'firebase'
        };
      }
    } catch (storageErr) {
      console.info('Firebase Storage non disponible ou restreint, utilisation du serveur sécurisé:', storageErr);
    }
  }

  // TIER 2: Local Server /api/upload Endpoint
  onProgress?.('Sauvegarde sur le serveur...');
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: dataPayload,
        filename: file.name,
        type
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.url) {
        onProgress?.('Fichier enregistré avec succès !');
        return {
          url: json.url,
          type,
          thumbnailUrl: videoThumbnail || (type === 'image' ? json.url : undefined),
          size: json.size,
          filename: json.filename,
          storageProvider: 'server'
        };
      }
    }
  } catch (err) {
    console.warn('API /api/upload non disponible, bascule sur le cache local direct:', err);
  }

  // TIER 3: Fallback Data URL
  onProgress?.('Enregistré localement');
  return {
    url: dataPayload,
    type,
    thumbnailUrl: videoThumbnail || (type === 'image' ? dataPayload : undefined),
    size: file.size,
    filename: file.name,
    storageProvider: 'inline'
  };
}
