import { Controller } from "react-hook-form";

/**
 * File input for product images with preview.
 * Handles both main image and additional images with appropriate previews.
 */
export default function ImageInput({
  control,
  name,
  label,
  isEdit = false,
  multiple = false,
  onFileChange,
  watchedImages = [],
  watchedImageUrls = [],
  errors = {},
}) {
  const getImagePreview = (index = 0) => {
    if (!isEdit && watchedImages?.[index]) {
      return URL.createObjectURL(watchedImages[index]);
    }
    if (isEdit && watchedImageUrls?.[index]) {
      return `${import.meta.env.VITE_BACKEND_URL}${watchedImageUrls[index]}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            accept="image/*"
            type="file"
            id={name}
            multiple={multiple}
            onChange={(e) => {
              if (multiple) {
                // Additional images handler
                const newFiles = Array.from(e.target.files).slice(0, 5);
                const allFiles = [watchedImages?.[0], ...newFiles].filter(Boolean);
                field.onChange(allFiles);
              } else {
                // Single image handler
                onFileChange?.(e, 0, field);
              }
            }}
            className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      />

      {/* Preview for single image */}
      {!multiple && getImagePreview(0) && (
        <div className="mt-2">
          <img src={getImagePreview(0)} alt="Main preview" className="h-32 w-32 object-cover" />
        </div>
      )}

      {/* Preview for multiple images */}
      {multiple && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(!isEdit ? watchedImages?.slice(1) : watchedImageUrls?.slice(1))?.map((image, index) => {
            const src = !isEdit ? URL.createObjectURL(image) : `${import.meta.env.VITE_BACKEND_URL}${image}`;

            return <img key={index} src={src} alt={`Preview ${index}`} className="h-32 w-32 object-cover" />;
          })}
        </div>
      )}

      {/* Error message */}
      {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
    </div>
  );
}
