import { useState, useRef } from "react";
import { Controller } from "react-hook-form";
import { MAX_FILE_SIZE } from "../helpers";

/**
 * Additional images input component (gambar[1] to gambar[9])
 * Shows progressive image selection buttons up to 9 additional images
 */
export default function AdditionalImagesInput({
  control,
  setValue,
  setError,
  watchedImages = [],
  watchedImageUrls = [],
  isEdit = false,
  errors = {},
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRefs = useRef([]);

  // Get additional images (excluding main image at index 0)
  const additionalImages = watchedImages?.slice(1) || [];
  const additionalImageUrls = watchedImageUrls?.slice(1) || [];

  // Count only the actual additional images that exist (not empty slots)
  const actualAdditionalImageCount = isEdit
    ? additionalImageUrls.filter((url) => url && url.trim() !== "").length
    : additionalImages.filter((img) => img instanceof File).length;

  const getImagePreview = (index) => {
    const imageIndex = index; // index for additional images array

    if (!isEdit && additionalImages[imageIndex]) {
      return URL.createObjectURL(additionalImages[imageIndex]);
    }
    if (isEdit && additionalImageUrls[imageIndex]) {
      return `${import.meta.env.VITE_BACKEND_URL}${additionalImageUrls[imageIndex]}`;
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

  const handleFileSelection = (file, index) => {
    if (!handleFileValidation(file)) return;

    const currentImages = watchedImages || [];
    const updated = [...currentImages];
    const actualIndex = index + 1; // Additional images start at index 1 (index 0 is main image)
    updated[actualIndex] = file;
    setValue("gambar", updated, { shouldValidate: true });
    setError("gambar", { message: null });
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setDragOverIndex(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0], index);
    }
  };

  const handleFileInputChange = (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file, index);
    }
  };

  const handleRemoveImage = (index) => {
    const currentImages = watchedImages || [];
    const updated = [...currentImages];
    const actualIndex = index + 1; // Additional images start at index 1 (index 0 is main image)
    updated[actualIndex] = undefined; // Remove the image at this index
    // Filter out undefined values to clean up the array, but preserve main image at index 0
    const filtered = updated.filter((img, i) => i === 0 || img !== undefined);
    setValue("gambar", filtered, { shouldValidate: true });

    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  const handleChangeImage = (index) => {
    fileInputRefs.current[index]?.click();
  };

  // Determine how many slots to show
  // Always show exactly: (number of actual additional images) + 1 empty slot
  // Minimum 1 slot, maximum 9 slots
  const maxSlots = 9; // Maximum additional images
  const slotsToShow = Math.min(actualAdditionalImageCount + 1, maxSlots);

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-sm font-medium text-gray-700">Additional Images (up to 9)</label>

      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: slotsToShow }, (_, index) => {
          const hasImage = getImagePreview(index);

          return (
            <Controller
              key={index}
              name="gambar"
              control={control}
              render={() => (
                <div className="relative">
                  <input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, index)}
                    className="hidden"
                  />

                  {!hasImage ? (
                    // Empty slot - show add button
                    <div
                      onClick={() => fileInputRefs.current[index]?.click()}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-gray-100 ${dragOverIndex === index ? "border-indigo-500 bg-indigo-50" : ""} `}
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
                        src={getImagePreview(index)}
                        alt={`Additional image ${index + 1}`}
                        className="h-32 w-32 rounded-lg object-cover shadow-md"
                      />

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
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

                      {/* Change button */}
                      <button
                        type="button"
                        onClick={() => handleChangeImage(index)}
                        className="absolute bottom-1 left-1 rounded bg-black bg-opacity-70 px-1 py-0.5 text-xs text-white hover:bg-opacity-80"
                      >
                        Change
                      </button>
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

      {/* Error message */}
      {errors.gambar && <p className="mt-1 text-sm text-red-600">{errors.gambar.message}</p>}
    </div>
  );
}
