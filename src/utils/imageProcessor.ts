import { ThumbnailSettings, ImageDimensions } from "@/types";
import JSZip from 'jszip';

/**
 * Process an image to create a thumbnail with the specified settings
 * This function will:
 * 1. Determine the source rectangle in the original image that matches the target aspect ratio, centered.
 * 2. Draw and scale this source rectangle onto the canvas to the exact target dimensions.
 * This effectively scales the image to cover the target area and then crops from the center.
 */
export async function createThumbnail(
  imageFile: File,
  settings: ThumbnailSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      // Clean up the object URL after the image loads
      URL.revokeObjectURL(url);
      
      // Create a canvas for the final thumbnail
      const canvas = document.createElement("canvas");
      canvas.width = settings.width;
      canvas.height = settings.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      // Calculate the source rectangle (sX, sY, sWidth, sHeight) from the original image
      // This rectangle will be centered and match the target aspect ratio.
      let sX: number, sY: number, sWidth: number, sHeight: number;

      const originalRatio = img.width / img.height;
      const targetRatio = settings.width / settings.height;

      if (originalRatio > targetRatio) {
        // Original image is wider than the target aspect ratio (need to crop sides)
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sX = (img.width - sWidth) / 2;
        sY = 0;
      } else {
        // Original image is taller than or equal to the target aspect ratio (need to crop top/bottom)
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sY = (img.height - sHeight) / 2;
        sX = 0;
      }
      
      // Draw the selected part of the original image onto the canvas,
      // scaling it to fit the canvas dimensions (settings.width, settings.height).
      ctx.drawImage(
        img,
        sX, sY,           // Top-left X,Y of source rectangle in original image
        sWidth, sHeight,  // Dimensions of source rectangle in original image
        0, 0,             // Top-left X,Y of destination rectangle on canvas
        settings.width, settings.height // Dimensions of destination rectangle on canvas
      );
      
      // Convert canvas to data URL with specified format and quality
      const mimeType = `image/${settings.format}`;
      const dataUrl = canvas.toDataURL(mimeType, settings.quality);
      
      resolve(dataUrl);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    
    img.src = url;
  });
}

/**
 * Calculate dimensions that maintain aspect ratio while fitting within target dimensions
 */
export function calculateScaledDimensions(
  original: ImageDimensions,
  target: ImageDimensions
): ImageDimensions {
  const originalRatio = original.width / original.height;
  const targetRatio = target.width / target.height;
  
  let width: number;
  let height: number;
  
  // Scale to fill the target area completely (some parts may be cropped)
  if (originalRatio > targetRatio) {
    // Original is wider than target: scale to match height
    height = target.height;
    width = height * originalRatio;
  } else {
    // Original is taller than target: scale to match width
    width = target.width;
    height = width / originalRatio;
  }
  
  return { width, height };
}

/**
 * Convert a data URL to a Blob for downloading
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Create a download link for the processed image
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const blob = dataUrlToBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create a download link for a Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create a ZIP file containing multiple images
 * @param images An array of objects, each with a name and dataUrl for the image
 * @returns A Promise that resolves with the ZIP file as a Blob
 */
export async function createZip(images: { name: string; dataUrl: string }[]): Promise<Blob> {
  const zip = new JSZip();
  images.forEach(image => {
    // Extract base64 data from dataUrl (e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...")
    const base64Data = image.dataUrl.split(',')[1];
    if (base64Data) {
      zip.file(image.name, base64Data, { base64: true });
    }
  });
  return zip.generateAsync({ type: "blob" });
}