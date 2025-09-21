import { useState, useCallback } from 'react';
import { MAX_FILE_SIZE, ASPECT_RATIO_TOLERANCE, ALLOWED_ASPECT_RATIOS, MIN_RESOLUTION } from './constants';

export function useBannerImage(setValue) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState(null);

  const resetImage = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setFileError(null);
    setValue && setValue('image_url', '');
  }, [setValue]);

  const validateAndSetImage = useCallback((file) => {
    if (!file) {
      resetImage();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size cannot exceed 20MB.');
      resetImage();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const imageAspectRatio = img.width / img.height;
        const isValidAspectRatio = ALLOWED_ASPECT_RATIOS.some(
          (ar) => Math.abs(imageAspectRatio - ar.ratio) <= ASPECT_RATIO_TOLERANCE
        );
        const isValidResolution = img.width >= MIN_RESOLUTION.width || img.height >= MIN_RESOLUTION.height;

        if (!isValidAspectRatio) {
          const allowedLabels = ALLOWED_ASPECT_RATIOS.map((ar) => ar.label).join(', ');
          setFileError(`Invalid aspect ratio. Allowed ratios are around ${allowedLabels}.`);
          resetImage();
          return;
        }

        if (!isValidResolution) {
          setFileError(
            `Image resolution must be at least ${MIN_RESOLUTION.width}px wide or ${MIN_RESOLUTION.height}px high.`
          );
          resetImage();
          return;
        }

        setFileError(null);
        setSelectedFile(file);
        setImagePreview(URL.createObjectURL(file));
        setValue && setValue('image_url', file.name);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [resetImage, setValue]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files && event.target.files[0];
    validateAndSetImage(file);
  }, [validateAndSetImage]);

  return { selectedFile, imagePreview, fileError, handleFileChange, resetImage, setFileError, setImagePreview };
}
