import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { MAX_FILE_SIZE } from "../helpers";

/**
 * Main image input component with drag-and-drop functionality
 * Displays as a square with dotted border initially, then shows preview with controls
 */
export default function MainImageInput({
  control,
  setValue,
  setError,
  watchedImages = [],
  watchedImageUrls = [],
  isEdit = false,
  errors = {},
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const mainImage = watchedImages?.[0];
  const mainImageUrl = watchedImageUrls?.[0];

  const getImagePreview = () => {
    // In edit mode, prioritize new images from gambar over existing images from image_url
    if (isEdit) {
      // If user has uploaded new images, show the new main image
      if (mainImage && mainImage instanceof File) {
        return URL.createObjectURL(mainImage);
      }
      // If no new images but has existing images, show existing main image
      if (mainImageUrl) {
        return `${import.meta.env.VITE_BACKEND_URL}${mainImageUrl}`;
      }
    } else {
      // In add mode, show from gambar array
      if (mainImage && mainImage instanceof File) {
        return URL.createObjectURL(mainImage);
      }
    }
    return null;
  };

  const handleFileValidation = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("gambar", { message: "File size cannot exceed 20MB." });
      return false;
    }
    if (!file.type.startsWith("image/")) {
      setError("gambar", { message: "Please select a valid image file." });
      return false;
    }
    return true;
  };

  const handleFileSelection = (file) => {
    if (!handleFileValidation(file)) return;

    // In edit mode, when user uploads a new image, discard all existing images
    if (isEdit) {
      setValue("image_url", [], { shouldValidate: true }); // Clear existing images
      setValue("gambar", [file], { shouldValidate: true }); // Set only the new main image
    } else {
      // In add mode, update the gambar array normally
      const currentImages = watchedImages || [];
      const updated = [...currentImages];
      updated[0] = file; // Main image is always at index 0
      setValue("gambar", updated, { shouldValidate: true });
    }

    setError("gambar", { message: null });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemoveImage = () => {
    if (isEdit) {
      // In edit mode, if we're showing existing images (from image_url), clear them
      // If we're showing new images (from gambar), clear them too
      setValue("image_url", [], { shouldValidate: true });
      setValue("gambar", [], { shouldValidate: true });
    } else {
      // In add mode, remove from gambar array normally
      const currentImages = watchedImages || [];
      const updated = [...currentImages];
      updated[0] = undefined; // Remove main image at index 0
      // Filter out undefined values to clean up the array
      const filtered = updated.filter((img) => img !== undefined);
      setValue("gambar", filtered, { shouldValidate: true });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const hasImage = getImagePreview();

  return (
    <div className="flex w-fit flex-col">
      <label className="mb-2 text-sm font-medium text-gray-700">Main Image *</label>

      <Controller
        name="gambar"
        control={control}
        render={() => (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!hasImage ? (
              // Empty state - show dotted border square
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex h-48 w-48 cursor-pointer flex-col items-center justify-center gap-y-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-gray-100 ${isDragOver ? "border-indigo-500 bg-indigo-50" : ""} `}
              >
                <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-center text-sm text-gray-600">Click to select or drag image here</p>
                <p className="text-xs text-gray-400">PNG, JPG up to 20MB</p>
              </div>
            ) : (
              // Image preview state
              <div className="relative">
                <img
                  src={getImagePreview()}
                  alt="Main product image"
                  className="h-48 w-48 rounded-lg object-cover shadow-md"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  title="Remove image"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Change image button */}
                <button
                  type="button"
                  onClick={handleChangeImage}
                  className="absolute bottom-2 left-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white hover:bg-opacity-80"
                >
                  Change
                </button>
              </div>
            )}
          </>
        )}
      />

      {/* Error message */}
      {errors.gambar && <p className="mt-1 text-sm text-red-600">{errors.gambar.message}</p>}
    </div>
  );
}
