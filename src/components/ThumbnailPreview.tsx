"use client";

import { ThumbnailSettings } from "@/types";

interface ThumbnailPreviewProps {
  originalImageUrls: string[] | null; // Changed from string | null
  processedImageUrls: (string | null)[]; // Changed from string | null
  settings: ThumbnailSettings;
}

export default function ThumbnailPreview({
  originalImageUrls,
  processedImageUrls,
  settings,
}: ThumbnailPreviewProps) {
  if (!originalImageUrls || originalImageUrls.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Previews</h2>
      
      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2"> {/* Added max-height and scroll */}
        {originalImageUrls.map((originalUrl, index) => (
          <div key={index} className="border-b pb-6 mb-6 last:border-b-0 last:mb-0">
            <h3 className="text-lg font-medium mb-2">Image {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-md font-medium mb-1 text-gray-700 dark:text-gray-300">Original</h4>
                <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-video flex items-center justify-center">
                  <img
                    src={originalUrl}
                    alt={`Original ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Thumbnail ({settings.width}x{settings.height})
                </h4>
                {processedImageUrls[index] ? (
                  <div className="relative border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-2 flex flex-col items-center justify-center aspect-video">
                    <img
                      src={processedImageUrls[index]!}
                      alt={`Thumbnail ${index + 1}`}
                      style={{ width: settings.width, height: settings.height }} // Use style for exact dimensions
                      className="max-w-full max-h-full object-contain" // Ensure it fits container if settings are too large for preview box
                    />
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {settings.width}x{settings.height} {settings.format.toUpperCase()} ({Math.round(settings.quality * 100)}%)
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 aspect-video flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {isProcessingPlaceholder(processedImageUrls, originalImageUrls.length) ? "Processing..." : "Preview not generated"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper to determine if we should show "Processing..."
// This is a simple check; more robust state might be needed for per-image processing status
function isProcessingPlaceholder(processedUrls: (string | null)[], totalImages: number): boolean {
  // If processedUrls is empty but there are images, assume processing might be starting or pending
  if (processedUrls.length === 0 && totalImages > 0) return true; 
  // If some are null and array length matches total, assume some are processing
  return processedUrls.length === totalImages && processedUrls.some(url => url === undefined); // Check for undefined if array is pre-filled
}