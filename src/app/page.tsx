"use client";

import { useState, useEffect } from "react"; // Added useEffect
import ImageDropzone from "@/components/ImageDropzone";
import ThumbnailOptions from "@/components/ThumbnailOptions";
import ThumbnailPreview from "@/components/ThumbnailPreview";
import { ThumbnailSettings } from "@/types";

export default function Home() {
  const [images, setImages] = useState<File[] | null>(null); // Changed from image: File | null
  const [imageUrls, setImageUrls] = useState<string[] | null>(null); // Changed from imageUrl: string | null
  const [settings, setSettings] = useState<ThumbnailSettings>({
    width: 300,
    height: 200,
    quality: 0.8,
    format: "jpeg",
  });
  const [processedImageUrls, setProcessedImageUrls] = useState<(string | null)[]>([]); // Changed from string | null to (string | null)[]

  // Handle image drop/selection for multiple files
  const handleImagesSelect = (files: File[]) => { // Renamed and updated parameter
    setImages(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
    setProcessedImageUrls(new Array(files.length).fill(null)); // Reset processed images for the new set
  };

  // Handle settings change
  const handleSettingsChange = (newSettings: Partial<ThumbnailSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
    if (images) {
      setProcessedImageUrls(new Array(images.length).fill(null)); // Reset processed images when settings change
    }
  };

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      if (imageUrls) {
        imageUrls.forEach(url => URL.revokeObjectURL(url));
      }
      // Note: Processed image URLs are data URLs, no need to revoke
    };
  }, [imageUrls]);


  return (
    <main className="min-h-screen p-6 md:p-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Thumbnail Creator</h1>
        <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
          Create perfectly sized thumbnails by uploading images, setting dimensions, and downloading the results as a ZIP.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ImageDropzone onImagesSelect={handleImagesSelect} /> {/* Changed prop name */}
            
            {imageUrls && imageUrls.length > 0 && (
              <ThumbnailOptions 
                settings={settings} 
                onSettingsChange={handleSettingsChange}
                imageFiles={images} // Changed from imageFile
                onAllProcessed={setProcessedImageUrls} // Changed from onProcessed
              />
            )}
          </div>
          
          {imageUrls && imageUrls.length > 0 && (
            <ThumbnailPreview 
              originalImageUrls={imageUrls} // Changed from originalImageUrl
              processedImageUrls={processedImageUrls} // Changed from processedImageUrl
              settings={settings}
            />
          )}
        </div>
      </div>
    </main>
  );
}
