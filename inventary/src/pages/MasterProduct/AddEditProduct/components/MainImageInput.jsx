import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import {
  MAX_FILE_SIZE,
  MIN_IMAGE_RESOLUTION,
  ALLOWED_ASPECT_RATIOS,
  ASPECT_RATIO_TOLERANCE,
  validateImageAttributes,
  getImagePreviewUrl,
  setImageAtIndex,
  setMainImageToNull,
  isDeletedImageSlot,
} from "../helpers";

/**
 * Main image input component with drag-and-drop functionality
 * Displays as a square with dotted border initially, then shows preview with controls
 *
 * Uses unified images array where:
 * - Index 0 is the main image
 * - Can be a URL string (existing) or File object (new upload) or null (deleted)
 */
export default function MainImageInput({
  control,
  setValue,
  setError,
  watchedImages = [], // Unified images array
  errors = {},
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const mainImage = watchedImages?.[0]; // Can be URL string, File, or null
  const allowedRatioText = ALLOWED_ASPECT_RATIOS.map((ratio) => ratio.label).join(", ");
  const ratioToleranceText = `${Math.round(ASPECT_RATIO_TOLERANCE * 100)}%`;

  /**
   * Get the preview URL for the main image
   * Uses the helper function to handle both URL strings and File objects
   */
  const getPreviewUrl = () => {
    if (isDeletedImageSlot(mainImage)) {
      return null; // Main image was deleted, show empty slot
    }
    return getImagePreviewUrl(mainImage);
  };

  const handleFileValidation = async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("images", { message: "File size cannot exceed 20MB." });
      return false;
    }
    if (!file.type.startsWith("image/")) {
      setError("images", { message: "Please select a valid image file." });
      return false;
    }

    const validationResult = await validateImageAttributes(file);
    if (!validationResult.valid) {
      setError("images", { message: validationResult.error });
      return false;
    }
    return true;
  };

  const handleFileSelection = async (file) => {
    const isValid = await handleFileValidation(file);
    if (!isValid) return;

    // Set the new file at index 0 (main image)
    const updatedImages = setImageAtIndex(watchedImages, 0, file);
    setValue("images", updatedImages, { shouldValidate: true });
    setError("images", { message: null });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelection(file);
    }
  };

  /**
   * Handle removing the main image
   * Sets index 0 to null (user must fill before saving)
   */
  const handleRemoveImage = () => {
    // Set main image to null (keep other images)
    const updatedImages = setMainImageToNull(watchedImages);
    setValue("images", updatedImages, { shouldValidate: true });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const previewUrl = getPreviewUrl();
  const hasImage = previewUrl !== null;

  return (
    <div className="flex w-fit flex-col">
      <label className="mb-2 text-sm font-medium text-gray-700">Main Image *</label>

      <Controller
        name="images"
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
                <div className="text-center text-xs text-gray-400">
                  <p>PNG, JPG up to 20MB</p>
                  <p>
                    Min {MIN_IMAGE_RESOLUTION.width}x{MIN_IMAGE_RESOLUTION.height}, aspect ratios {allowedRatioText} ±
                    {ratioToleranceText}
                  </p>
                </div>
              </div>
            ) : (
              // Image preview state
              <div className="relative">
                <img src={previewUrl} alt="Main product image" className="h-48 w-48 rounded-lg object-cover shadow-md" />

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
      {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>}
    </div>
  );
}
