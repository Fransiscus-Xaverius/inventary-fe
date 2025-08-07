import React, { useState, useEffect, useRef } from "react";
import { Typography, Box, Button, CircularProgress, Paper } from "@mui/material";

import useApiRequest from "../../hooks/useApiRequest";
import { useNotification } from "../../hooks/useNotification";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function MasterPanduanUkuran() {
  const { showSuccess, showError } = useNotification();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false });

  const { mutate: uploadImage, isLoading: isUploading } = useApiRequest({
    url: `/api/admin/panduan-ukuran`,
    method: "POST",
  });

  const { mutate: deleteImage, isLoading: isDeleting } = useApiRequest({
    url: `/api/admin/panduan-ukuran`,
    method: "DELETE",
  });

  const checkImageExists = () => {
    const url = `http://localhost:8080/uploads/panduan/1.png?t=${new Date().getTime()}`;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImagePreview(url);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImagePreview(null);
      setIsLoading(false);
    };
  };

  useEffect(() => {
    checkImageExists();
  }, []);

  const handleFileValidation = (file) => {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size cannot exceed 20MB.");
      return false;
    }
    if (!file.type.startsWith("image/")) {
      setFileError("Please select a valid image file.");
      return false;
    }
    setFileError(null);
    return true;
  };

  const handleFileSelection = (file) => {
    if (!handleFileValidation(file)) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
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

  const openDeleteDialog = () => {
    setDeleteDialog({ open: true });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false });
  };

  const handleRemoveImage = () => {
    deleteImage(null, {
      onSuccess: () => {
        showSuccess("Sizing guide deleted successfully");
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        checkImageExists();
        closeDeleteDialog();
      },
      onError: (error) => {
        showError(`Failed to delete sizing guide: ${error.response?.data?.error || error.message}`);
        closeDeleteDialog();
      },
    });
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      showError("Please select an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    uploadImage(formData, {
      onSuccess: () => {
        showSuccess(`Sizing guide uploaded successfully`);
        checkImageExists();
      },
      onError: (error) => {
        console.error("Error uploading image:", error);
        showError(`Failed to upload image: ${error.response?.data?.error || error.message}`);
      },
    });
  };

  const hasImage = !!imagePreview;

  return (
    <Box className="flex h-full flex-grow flex-col overflow-auto p-6">
      <Box className="mb-4 flex">
        <Typography variant="h1" gutterBottom fontWeight={600} sx={{ fontSize: "2rem" }}>
          Master Panduan Ukuran
        </Typography>
      </Box>

      <Paper sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <Typography variant="h6">Current Sizing Guide</Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box sx={{ pt: 1, pb: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!hasImage ? (
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
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Sizing guide preview"
                  className="h-auto max-h-[60vh] w-auto rounded-lg object-contain shadow-md"
                />
                <button
                  type="button"
                  onClick={openDeleteDialog}
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
                <button
                  type="button"
                  onClick={handleChangeImage}
                  className="absolute bottom-2 left-2 rounded bg-black bg-opacity-70 px-2 py-1 text-xs text-white hover:bg-opacity-80"
                >
                  Change
                </button>
              </div>
            )}
            {fileError && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {fileError}
              </Typography>
            )}
          </Box>
        )}
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isUploading || !selectedFile}
          startIcon={(isUploading || isDeleting) && <CircularProgress size={20} color="inherit" />}
        >
          {isUploading ? "Uploading..." : "Upload Sizing Guide"}
        </Button>
      </Paper>
      <DeleteConfirmationModal
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleRemoveImage}
        title="Delete Sizing Guide"
        message="Are you sure you want to delete the sizing guide image? This action cannot be undone."
        itemName="Sizing Guide Image"
        isLoading={isDeleting}
      />
    </Box>
  );
}
