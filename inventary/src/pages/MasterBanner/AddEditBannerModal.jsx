import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useApiRequest from "../../hooks/useApiRequest";
import { useNotification } from "../../contexts/NotificationContext";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

// Validation schema with Joi
const bannerSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title tidak boleh kosong",
    "any.required": "Title harus diisi",
  }),
  description: Joi.string().allow("").optional(),
  cta_text: Joi.string().allow("").optional(),
  cta_link: Joi.string().uri().allow("").optional().messages({
    "string.uri": "CTA Link harus berupa URL yang valid",
  }),
  // image_url is now handled by file input, so it's optional for updates
  // For creation, we'll rely on the file input being present
  image_url: Joi.string().allow("").optional(),
  order_index: Joi.number().integer().min(1).required().messages({
    "number.base": "Urutan harus berupa angka",
    "number.integer": "Urutan harus berupa bilangan bulat",
    "number.min": "Urutan tidak boleh kurang dari 1",
    "any.required": "Urutan harus diisi",
  }),
  is_active: Joi.boolean().required(),
});

export default function AddEditBannerModal({ open, onClose, bannerId, onSuccess }) {
  const isEditing = !!bannerId;
  const { showSuccess, showError } = useNotification();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: joiResolver(bannerSchema),
    defaultValues: {
      title: "",
      description: "",
      cta_text: "",
      cta_link: "",
      image_url: "", // This will store the URL from backend, not the file
      order_index: 1,
      is_active: true,
    },
  });

  // Fetch banner data if editing
  const { response: bannerResponse, isLoading: isLoadingBanner } = useApiRequest({
    url: isEditing ? `/api/admin/banners/${bannerId}` : null,
    queryKey: ["banner", bannerId],
    enabled: isEditing && open,
  });

  // Prepare create/update mutation
  const { mutate: saveBanner, isLoading: isSaving } = useApiRequest({
    url: isEditing ? `/api/admin/banners/${bannerId}` : `/api/admin/banners`,
    method: isEditing ? "PUT" : "POST",
  });

  // Set form data when editing and data is loaded
  useEffect(() => {
    if (isEditing && bannerResponse) {
      const data = bannerResponse?.data;
      reset({
        title: data?.title || "",
        description: data?.description || "",
        cta_text: data?.cta_text || "",
        cta_link: data?.cta_link || "",
        image_url: data?.image_url || "", // Set existing image URL
        order_index: data?.order_index || 0,
        is_active: data?.is_active !== undefined ? data.is_active : true,
      });
      setImagePreview(data?.image_url ? `http://localhost:8080${data.image_url}` : null); // Set preview for existing image
    }
  }, [isEditing, bannerResponse, reset]);

  // Reset form and preview when modal opens/closes
  useEffect(() => {
    if (!isEditing) {
      reset({
        title: "",
        description: "",
        cta_text: "",
        cta_link: "",
        image_url: "",
        order_index: 1,
        is_active: true,
      });
      setSelectedFile(null);
      setImagePreview(null);
    }
  }, [open, isEditing, reset]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setValue("image_url", file.name); // Set a dummy value for validation if needed
    } else {
      setSelectedFile(null);
      setImagePreview(null);
      setValue("image_url", "");
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("cta_text", data.cta_text);
    formData.append("cta_link", data.cta_link);
    formData.append("order_index", data.order_index);
    formData.append("is_active", data.is_active);

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (isEditing && bannerResponse?.data?.image_url) {
      // If editing and no new file selected, but there was an existing image, send its URL
      formData.append("image_url", bannerResponse.data.image_url);
    }

    saveBanner(formData, {
      onSuccess: (responseData) => {
        showSuccess(`Banner ${isEditing ? "updated" : "created"} successfully`);
        if (onSuccess) onSuccess(responseData);
        onClose();
      },
      onError: (error) => {
        console.error("Error saving banner:", error);
        showError(
          `Failed to ${isEditing ? "update" : "create"} banner: ${error.response?.data?.error || error.message}`
        );
      },
    });
  };

  const isSubmitDisabled = isSaving || isLoadingBanner;

  return (
    <Dialog open={open} onClose={!isSubmitDisabled ? onClose : undefined} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Banner" : "Add New Banner"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isSubmitDisabled}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {isLoadingBanner ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1, pb: 1 }}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Judul"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={isSubmitDisabled}
                    required
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Deskripsi"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isSubmitDisabled}
                    multiline
                    rows={3}
                  />
                )}
              />
              <Controller
                name="cta_text"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="CTA Text (Button)"
                    error={!!errors.cta_text}
                    helperText={errors.cta_text?.message}
                    disabled={isSubmitDisabled}
                  />
                )}
              />
              <Controller
                name="cta_link"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="CTA Link (URL)"
                    error={!!errors.cta_link}
                    helperText={errors.cta_link?.message}
                    disabled={isSubmitDisabled}
                  />
                )}
              />
              {/* Image Upload Field */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isSubmitDisabled}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" disabled={isSubmitDisabled}>
                    Upload Gambar
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" sx={{ ml: 2, display: "inline" }}>
                    {selectedFile.name}
                  </Typography>
                )}
                {errors.image_url && (
                  <Typography color="error" variant="body2">
                    {errors.image_url?.message}
                  </Typography>
                )}
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: "200px",
                      }}
                    />
                  </Box>
                )}
              </Box>
              <Controller
                name="order_index"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    inputProps={{ min: 1 }}
                    fullWidth
                    margin="normal"
                    label="Urutan ke"
                    error={!!errors.order_index}
                    helperText={errors.order_index?.message}
                    disabled={isSubmitDisabled}
                    required
                  />
                )}
              />
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} disabled={isSubmitDisabled} color="primary" />}
                    label={field.value ? "Aktif" : "Tidak Aktif"}
                    sx={{ mt: 2 }}
                  />
                )}
              />

              {isEditing && bannerResponse?.data?.updated_at && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                  Terakhir Di-update: {new Date(bannerResponse?.data?.updated_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitDisabled}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitDisabled}
            startIcon={isSubmitDisabled && <CircularProgress size={20} color="inherit" />}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
