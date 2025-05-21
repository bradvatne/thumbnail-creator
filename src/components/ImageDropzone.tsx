"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageDropzoneProps {
  onImagesSelect: (files: File[]) => void; // Changed from onImageSelect and File to File[]
}

export default function ImageDropzone({ onImagesSelect }: ImageDropzoneProps) { // Changed prop name
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Filter for image files, though 'accept' prop should handle this
        const imageFiles = acceptedFiles.filter(file => file.type.startsWith("image/"));
        if (imageFiles.length > 0) {
          onImagesSelect(imageFiles); // Pass all accepted image files
        }
      }
    },
    [onImagesSelect] // Changed from onImageSelect
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true, // Allow multiple files
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div>
          <p className="text-lg font-medium">
            Drag & drop images here, or click to select
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supports JPG, PNG, GIF, WEBP. Multiple files allowed.
          </p>
        </div>
      </div>
    </div>
  );
}