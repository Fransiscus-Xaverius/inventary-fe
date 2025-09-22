import React, { useEffect } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useApiRequest from "../../hooks/useApiRequest";
import { useNotification } from "../../hooks/useNotification";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

// Validation schema with Joi
const tipeSchema = Joi.object({
  value: Joi.string().required().messages({
    "string.empty": "Name tidak boleh kosong",
    "any.required": "Name harus diisi",
  }),
});

export default function AddEditTipeModal({ open, onClose, tipeId, onSuccess }) {
  const isEditing = !!tipeId;
  const { showSuccess, showError } = useNotification();

  // Use react-hook-form with joi validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(tipeSchema),
    defaultValues: {
      value: "",
    },
  });

  // Fetch tipe data if editing
  const { response: tipeResponse, isLoading: isLoadingTipe } = useApiRequest({
    url: isEditing ? `/api/admin/tipes/${tipeId}` : null,
    queryKey: ["tipe", tipeId],
    enabled: isEditing && open,
  });

  // Prepare create/update mutation
  const { mutate: saveTipe, isLoading: isSaving } = useApiRequest({
    url: isEditing ? `/api/admin/tipes/${tipeId}` : `/api/admin/tipes`,
    method: isEditing ? "PUT" : "POST",
  });

  // Set form data when editing and data is loaded
  useEffect(() => {
    if (isEditing && tipeResponse) {
      reset({
        value: tipeResponse?.data?.value || "",
      });
    }
  }, [isEditing, tipeResponse, reset]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isEditing) {
      // Reset form for new tipe
      reset({
        value: "",
      });
    }
  }, [open, isEditing, reset]);

  const onSubmit = (data) => {
    saveTipe(data, {
      onSuccess: (responseData) => {
        showSuccess(`Tipe ${isEditing ? "updated" : "created"} successfully`);
        if (onSuccess) onSuccess(responseData);
        onClose();
      },
      onError: (error) => {
        console.error("Error saving tipe:", error);
        showError(
          `Failed to ${isEditing ? "update" : "create"} tipe: ${error.response?.data?.message || error.message}`
        );
      },
    });
  };

  const isSubmitDisabled = isSaving || isLoadingTipe;

  return (
    <Dialog open={open} onClose={!isSubmitDisabled ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Tipe" : "Add New Tipe"}
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
          {isLoadingTipe ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1, pb: 1 }}>
              {/* Tipe Name Field */}
              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    margin="normal"
                    label="Name"
                    error={!!errors.value}
                    helperText={errors.value?.message}
                    disabled={isSubmitDisabled}
                    required
                  />
                )}
              />

              {isEditing && tipeResponse?.data?.tanggal_update && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                  Last Updated: {new Date(tipeResponse?.data?.tanggal_update).toLocaleString()}
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
