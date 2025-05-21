"use client";

import { useState } from "react";
import { ThumbnailSettings } from "@/types";
import { createThumbnail, createZip, downloadBlob } from "@/utils/imageProcessor"; // Added createZip, downloadBlob

interface ThumbnailOptionsProps {
  settings: ThumbnailSettings;
  onSettingsChange: (settings: Partial<ThumbnailSettings>) => void;
  imageFiles: File[] | null; // Changed from imageFile: File | null
  onAllProcessed: (imageUrls: (string | null)[]) => void; // Changed from onProcessed
}

export default function ThumbnailOptions({
  settings,
  onSettingsChange,
  imageFiles, // Changed from imageFile
  onAllProcessed, // Changed from onProcessed
}: ThumbnailOptionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "width" || name === "height" || name === "quality") {
      const numValue = parseFloat(value);
      onSettingsChange({ [name]: numValue });
    } else {
      onSettingsChange({ [name]: value });
    }
  };

  const processAllImages = async (): Promise<(string | null)[]> => {
    if (!imageFiles || imageFiles.length === 0) return [];
    
    const promises = imageFiles.map(file => 
      createThumbnail(file, settings).catch(err => {
        console.error("Error processing image:", file.name, err);
        return null; // Return null for failed images
      })
    );
    return Promise.all(promises);
  };

  const handleCreateThumbnails = async () => { // Renamed from handleCreateThumbnail
    if (!imageFiles || imageFiles.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const thumbnailUrls = await processAllImages();
      onAllProcessed(thumbnailUrls);
    } catch (err) {
      setError("Failed to process one or more images. Check console for details.");
      console.error(err);
      // Even if some fail, onAllProcessed would have been called with nulls for failed ones
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!imageFiles || imageFiles.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const thumbnailDataUrls = await processAllImages();
      const successfulThumbnails = thumbnailDataUrls
        .map((dataUrl, index) => {
          const originalFileName = imageFiles[index].name;
          const lastDotIndex = originalFileName.lastIndexOf('.');
          const nameWithoutExtension = lastDotIndex === -1 ? originalFileName : originalFileName.substring(0, lastDotIndex);
          
          return {
            name: `${nameWithoutExtension}_thumbnail.${settings.format}`,
            dataUrl
          };
        })
        .filter(item => item.dataUrl !== null) as { name: string; dataUrl: string }[];

      if (successfulThumbnails.length === 0) {
        setError("No thumbnails could be generated for download.");
        setIsProcessing(false);
        return;
      }

      const zipBlob = await createZip(successfulThumbnails);
      downloadBlob(zipBlob, `thumbnails-${settings.width}x${settings.height}.zip`);
      
      // Optionally, update the preview if not already done
      onAllProcessed(thumbnailDataUrls);

    } catch (err) {
      setError("Failed to create or download ZIP. Check console for details.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Thumbnail Settings</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="width" className="block text-sm font-medium mb-1">
            Width (px)
          </label>
          <input
            type="number"
            id="width"
            name="width"
            value={settings.width}
            onChange={handleInputChange}
            min="50"
            max="2000"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label htmlFor="height" className="block text-sm font-medium mb-1">
            Height (px)
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={settings.height}
            onChange={handleInputChange}
            min="50"
            max="2000"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="quality" className="block text-sm font-medium mb-1">
            Quality ({Math.round(settings.quality * 100)}%)
          </label>
          <input
            type="range"
            id="quality"
            name="quality"
            value={settings.quality}
            onChange={handleInputChange}
            min="0.1"
            max="1"
            step="0.1"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="format" className="block text-sm font-medium mb-1">
            Format
          </label>
          <select
            id="format"
            name="format"
            value={settings.format}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4 text-sm">{error}</div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={handleCreateThumbnails} // Renamed
          disabled={isProcessing || !imageFiles || imageFiles.length === 0}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Processing..." : "Preview All Thumbnails"}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isProcessing || !imageFiles || imageFiles.length === 0}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Zipping..." : "Download All as ZIP"}
        </button>
      </div>
    </div>
  );
}