import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  isLoading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          disabled={isLoading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
          <DialogContentText component="div">
            <Typography variant="body1" fontWeight={500}>
              {message}
            </Typography>
            {itemName && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: "rgba(0,0,0,0.04)",
                  borderRadius: 1,
                  fontStyle: "italic",
                }}
              >
                {`"${itemName}"`}
              </Typography>
            )}
          </DialogContentText>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{
            color: "text.secondary",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          autoFocus
          disabled={isLoading}
          sx={{
            px: 3,
            "&:hover": { bgcolor: "error.dark" },
          }}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
