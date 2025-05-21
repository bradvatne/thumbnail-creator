export interface ThumbnailSettings {
  width: number;
  height: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

export interface ImageDimensions {
  width: number;
  height: number;
}