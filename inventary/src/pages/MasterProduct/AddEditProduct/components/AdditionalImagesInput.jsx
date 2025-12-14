import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import {
  MAX_FILE_SIZE,
  MIN_IMAGE_RESOLUTION,
  ALLOWED_ASPECT_RATIOS,
  ASPECT_RATIO_TOLERANCE,
  validateImageAttributes,
  getImagePreviewUrl,
  removeAdditionalImage,
  addImageToEnd,
  isExistingImageUrl,
  isNewImageFile,
} from "../helpers";

/**
 * Additional images input component (images[1] to images[9])
 * Shows progressive image selection buttons up to 9 additional images
 *
 * Uses unified images array where:
 * - Index 0 is the main image (handled by MainImageInput)
 * - Indices 1-9 are additional images
 * - Each can be a URL string (existing) or File object (new upload)
 *
 * Behavior:
 * - Deleting shifts remaining images backward (no gaps)
 * - New images are only added to the end of the array
 */
export default function AdditionalImagesInput({
  control,
  setValue,
  setError,
  watchedImages = [], // Unified images array
  errors = {},
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRefs = useRef([]);
  const allowedRatioText = ALLOWED_ASPECT_RATIOS.map((ratio) => ratio.label).join(", ");
  const ratioToleranceText = `${Math.round(ASPECT_RATIO_TOLERANCE * 100)}%`;

  // Get additional images (excluding main image at index 0)
  // These are the images from index 1 onwards in the unified array
  const additionalImages = watchedImages?.slice(1) || [];

  // Count actual additional images that exist (URL strings or File objects)
  const actualAdditionalImageCount = additionalImages.filter(
    (img) => isExistingImageUrl(img) || isNewImageFile(img)
  ).length;

  /**
   * Get the preview URL for an additional image at the given display index
   * @param {number} displayIndex - Index within the additional images (0-based, not including main image)
   */
  const getPreviewUrl = (displayIndex) => {
    const image = additionalImages[displayIndex];
    return getImagePreviewUrl(image);
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

  /**
   * Handle adding a new image to the end of the array
   * This is called when clicking on an empty slot
   */
  const handleFileSelection = async (file) => {
    const isValid = await handleFileValidation(file);
    if (!isValid) return;

    // Add the new file to the end of the images array
    const updatedImages = addImageToEnd(watchedImages, file);
    setValue("images", updatedImages, { shouldValidate: true });
    setError("images", { message: null });
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = async (e, displayIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Only allow adding to the empty slot (last position)
      // If dropping on an existing image, ignore it
      const hasImage = getPreviewUrl(displayIndex) !== null;
      if (!hasImage) {
        await handleFileSelection(files[0]);
      }
    }
  };

  const handleFileInputChange = async (e, displayIndex) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only allow adding to the empty slot
      const hasImage = getPreviewUrl(displayIndex) !== null;
      if (!hasImage) {
        await handleFileSelection(file);
      }
    }
  };

  /**
   * Handle removing an additional image
   * The actual array index is displayIndex + 1 (since index 0 is main image)
   * Removing shifts all subsequent images backward
   */
  const handleRemoveImage = (displayIndex) => {
    const actualIndex = displayIndex + 1; // Account for main image at index 0
    const updatedImages = removeAdditionalImage(watchedImages, actualIndex);
    setValue("images", updatedImages, { shouldValidate: true });

    if (fileInputRefs.current[displayIndex]) {
      fileInputRefs.current[displayIndex].value = "";
    }
  };

  // Note: "Change" functionality is removed for additional images
  // Users must delete and re-add in the new position
  // This simplifies the UX and maintains array integrity

  // Determine how many slots to show
  // Always show exactly: (number of actual additional images) + 1 empty slot
  // Minimum 1 slot, maximum 9 slots
  const maxSlots = 9; // Maximum additional images
  const slotsToShow = Math.min(actualAdditionalImageCount + 1, maxSlots);

  return (
    <div className="flex w-fit flex-col">
      <label className="mb-2 text-sm font-medium text-gray-700">Additional Images (up to 9)</label>

      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: slotsToShow }, (_, displayIndex) => {
          const previewUrl = getPreviewUrl(displayIndex);
          const hasImage = previewUrl !== null;
          const isEmptySlot = !hasImage;

          return (
            <Controller
              key={displayIndex}
              name="images"
              control={control}
              render={() => (
                <div className="relative">
                  <input
                    ref={(el) => (fileInputRefs.current[displayIndex] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, displayIndex)}
                    className="hidden"
                  />

                  {isEmptySlot ? (
                    // Empty slot - show add button (only the last slot is empty)
                    <div
                      onClick={() => fileInputRefs.current[displayIndex]?.click()}
                      onDragOver={(e) => handleDragOver(e, displayIndex)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, displayIndex)}
                      className={`flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-gray-100 ${dragOverIndex === displayIndex ? "border-indigo-500 bg-indigo-50" : ""} `}
                    >
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="mt-1 text-xs text-gray-600">Add Image</p>
                    </div>
                  ) : (
                    // Image preview
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt={`Additional image ${displayIndex + 1}`}
                        className="h-32 w-32 rounded-lg object-cover shadow-md"
                      />

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(displayIndex)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                        title="Remove image"
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Position indicator */}
                      <div className="absolute bottom-1 left-1 rounded bg-black bg-opacity-60 px-1.5 py-0.5 text-xs text-white">
                        #{displayIndex + 1}
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          );
        })}
      </div>

      {/* Info text */}
      <p className="mt-2 text-xs text-gray-500">
        You can upload up to 9 additional images. New slots will appear as you add images.
      </p>
      <p className="text-xs text-gray-500">
        Min {MIN_IMAGE_RESOLUTION.width}x{MIN_IMAGE_RESOLUTION.height}, aspect ratios {allowedRatioText} ±
        {ratioToleranceText}
      </p>

      {/* Error message - only show here if not shown in MainImageInput */}
      {errors.images && !errors.images.message?.includes("Main image") && (
        <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
      )}
    </div>
  );
}
