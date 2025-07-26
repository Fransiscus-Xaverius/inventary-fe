import { useCallback } from "react";

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * Provide a reusable onChange handler for file inputs that integrates with
 * react-hook-form. Mirrors the behaviour of the legacy useHandleFileChange.
 */
export default function useFileUpload({ setError, setValue, watchedImages }) {
  return useCallback(
    (event, index) => {
      const file = event.target.files?.[0];

      if (file && file.size > MAX_FILE_SIZE) {
        setError("gambar", { message: "File size cannot exceed 20MB." });
        const filtered = watchedImages.filter((_, i) => i !== index);
        setValue("gambar", filtered);
        return;
      }

      if (file) {
        // Valid file → replace at index
        const updated = [...watchedImages];
        updated[index] = file;
        setValue("gambar", updated, { shouldValidate: true });
        // Clear any previous error
        setError("gambar", { message: null });
      } else {
        // No file selected → remove index
        const filtered = watchedImages.filter((_, i) => i !== index);
        setValue("gambar", filtered, { shouldValidate: true });
      }
    },
    [setError, setValue, watchedImages]
  );
}
