/**
 * Utilitaire de compression et d'optimisation d'images pour le navigateur
 * Réduit la taille des photos (ex: 5-10 Mo -> 120-220 Ko) tout en conservant
 * une netteté remarquable pour les bannières et panneaux publicitaires défilants.
 * Évite de saturer les quotas Firestore (limite de 1 Mo par document) et le cache local.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export interface CompressedImageResult {
  name: string;
  url: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    format = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image, retourner une erreur
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
    }

    // Si c'est déjà du SVG ou GIF animé, ne pas le compresser sur canvas
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier image.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Impossible de charger l\'image pour le traitement.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcul du redimensionnement proportionnel
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback sur le dataUrl original
          return resolve(readerEvent.target?.result as string);
        }

        // Lissage de haute qualité
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Essayer WebP, sinon basculer vers JPEG si non supporté
        try {
          const dataUrl = canvas.toDataURL(format, quality);
          if (dataUrl && dataUrl.startsWith('data:image/webp')) {
            resolve(dataUrl);
            return;
          }
        } catch {}

        // Fallback JPEG
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegDataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Traitement par lot de plusieurs images simultanées avec suivi de progression
 */
export async function compressMultipleImages(
  files: FileList | File[],
  options?: CompressionOptions,
  onProgress?: (processed: number, total: number, currentName: string) => void
): Promise<CompressedImageResult[]> {
  const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
  const results: CompressedImageResult[] = [];
  const total = fileArray.length;

  for (let i = 0; i < total; i++) {
    const file = fileArray[i];
    if (onProgress) {
      onProgress(i + 1, total, file.name);
    }

    try {
      const originalSizeKb = Math.round(file.size / 1024);
      const url = await compressImage(file, options);
      // Approximation de taille base64
      const compressedSizeKb = Math.round((url.length * 3) / 4 / 1024);

      results.push({
        name: file.name.replace(/\.[^/.]+$/, ''), // Nom sans extension
        url,
        originalSizeKb,
        compressedSizeKb
      });
    } catch (err) {
      console.warn(`Erreur compression sur ${file.name}:`, err);
    }
  }

  return results;
}
