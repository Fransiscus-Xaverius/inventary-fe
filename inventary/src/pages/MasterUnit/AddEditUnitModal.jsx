import { useEffect } from "react";
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
const unitSchema = Joi.object({
  value: Joi.string().required().messages({
    "string.empty": "Name tidak boleh kosong",
    "any.required": "Name harus diisi",
  }),
});

export default function AddEditUnitModal({ open, onClose, unitId, onSuccess }) {
  const isEditing = !!unitId;
  const { showSuccess, showError } = useNotification();

  // Use react-hook-form with joi validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(unitSchema),
    defaultValues: {
      value: "",
    },
  });

  // Fetch unit data if editing
  const { response: unitResponse, isLoading: isLoadingUnit } = useApiRequest({
    url: isEditing ? `/api/admin/units/${unitId}` : null,
    queryKey: ["unit", unitId],
    enabled: isEditing && open,
  });

  // Prepare create/update mutation
  const { mutate: saveUnit, isLoading: isSaving } = useApiRequest({
    url: isEditing ? `/api/admin/units/${unitId}` : `/api/admin/units`,
    method: isEditing ? "PUT" : "POST",
  });

  // Set form data when editing and data is loaded
  useEffect(() => {
    if (isEditing && unitResponse) {
      reset({
        value: unitResponse?.data?.value || "",
      });
    }
  }, [isEditing, unitResponse, reset]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isEditing) {
      // Reset form for new unit
      reset({
        value: "",
      });
    }
  }, [open, isEditing, reset]);

  const onSubmit = (data) => {
    saveUnit(data, {
      onSuccess: (responseData) => {
        showSuccess(`Unit ${isEditing ? "updated" : "created"} successfully`);
        if (onSuccess) onSuccess(responseData);
        onClose();
      },
      onError: (error) => {
        console.error("Error saving unit:", error);
        showError(
          `Failed to ${isEditing ? "update" : "create"} unit: ${error.response?.data?.message || error.message}`
        );
      },
    });
  };

  const isSubmitDisabled = isSaving || isLoadingUnit;

  return (
    <Dialog open={open} onClose={!isSubmitDisabled ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? "Edit Unit" : "Add New Unit"}
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
          {isLoadingUnit ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1, pb: 1 }}>
              {/* Unit Name Field */}
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

              {isEditing && unitResponse?.data?.tanggal_update && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                  Last Updated: {new Date(unitResponse?.data?.tanggal_update).toLocaleString()}
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
