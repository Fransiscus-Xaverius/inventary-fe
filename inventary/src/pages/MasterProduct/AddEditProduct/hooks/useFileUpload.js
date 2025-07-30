import { useCallback, useRef, useEffect } from "react";

import { MAX_FILE_SIZE } from "../helpers";

/**
 * Provide a reusable onChange handler for file inputs that integrates with
 * react-hook-form. Mirrors the behaviour of the legacy useHandleFileChange.
 */
export default function useFileUpload({ setError, setValue, watchedImages }) {
  // Use a ref to store the current images value to avoid dependency issues
  const imagesRef = useRef(watchedImages);

  // Update ref when watchedImages changes
  useEffect(() => {
    imagesRef.current = watchedImages;
  }, [watchedImages]);

  return useCallback(
    (event, index) => {
      const file = event.target.files?.[0];
      const currentImages = imagesRef.current || [];

      if (file && file.size > MAX_FILE_SIZE) {
        setError("gambar", { message: "File size cannot exceed 20MB." });
        const filtered = currentImages.filter((_, i) => i !== index);
        setValue("gambar", filtered);
        return;
      }

      if (file) {
        // Valid file → replace at index
        const updated = [...currentImages];
        updated[index] = file;
        setValue("gambar", updated, { shouldValidate: true });
        // Clear any previous error
        setError("gambar", { message: null });
      } else {
        // No file selected → remove index
        const filtered = currentImages.filter((_, i) => i !== index);
        setValue("gambar", filtered, { shouldValidate: true });
      }
    },
    [setError, setValue] // Removed watchedImages from dependencies
  );
}
