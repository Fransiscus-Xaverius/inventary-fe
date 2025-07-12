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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useApiRequest from "../../hooks/useApiRequest";
import { useNotification } from "../../contexts/NotificationContext";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

// Validation schema with Joi - same as in AddEditColor
const colorSchema = Joi.object({
	nama: Joi.string().required().messages({
		"string.empty": "Nama warna tidak boleh kosong",
		"any.required": "Nama warna harus diisi",
	}),
	hex: Joi.string()
		.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
		.required()
		.messages({
			"string.pattern.base":
				"Kode hex harus dalam format yang valid (contoh: #FF5733)",
			"string.empty": "Kode hex tidak boleh kosong",
			"any.required": "Kode hex harus diisi",
		}),
});

export default function AddEditColorModal({
	open,
	onClose,
	colorId,
	onSuccess,
}) {
	const isEditing = !!colorId;
	const { showSuccess, showError } = useNotification();

	// Use react-hook-form with joi validation
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm({
		resolver: joiResolver(colorSchema),
		defaultValues: {
			nama: "",
			hex: "#000000",
		},
	});

	// Fetch color data if editing
	const { response: colorResponse, isLoading: isLoadingColor } = useApiRequest({
		url: isEditing ? `/api/admin/colors/${colorId}` : null,
		queryKey: ["color", colorId],
		enabled: isEditing && open,
	});

	// Prepare create/update mutation
	const { mutate: saveColor, isLoading: isSaving } = useApiRequest({
		url: isEditing ? `/api/admin/colors/${colorId}` : `/api/admin/colors`,
		method: isEditing ? "PUT" : "POST",
	});

	// Set form data when editing and data is loaded
	useEffect(() => {
		if (isEditing && colorResponse) {
			reset({
				nama: colorResponse?.data?.nama || "",
				hex: colorResponse?.data?.hex || "#000000",
			});
		}
	}, [isEditing, colorResponse, reset]);

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isEditing) {
			// Reset form for new color
			reset({
				nama: "",
				hex: "#000000",
			});
		}
	}, [open, isEditing, reset]);

	// Handle color picker change
	const handleColorChange = (e) => {
		setValue("hex", e.target.value);
	};

	const onSubmit = (data) => {
		saveColor(data, {
			onSuccess: (responseData) => {
				showSuccess(`Color ${isEditing ? "updated" : "created"} successfully`);
				if (onSuccess) onSuccess(responseData);
				onClose();
			},
			onError: (error) => {
				console.error("Error saving color:", error);
				showError(
					`Failed to ${isEditing ? "update" : "create"} color: ${
						error.response?.data?.error || error.message
					}`
				);
			},
		});
	};

	// Helper function to determine contrasting text color
	const getContrastColor = (hex) => {
		if (!hex) return "#000000";
		hex = hex.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness > 128 ? "#000000" : "#FFFFFF";
	};

	// Get current color value for preview
	const hexCode = watch("hex");
	const colorName = watch("nama");

	const isSubmitDisabled = isSaving || isLoadingColor;

	return (
		<Dialog
			open={open}
			onClose={!isSubmitDisabled ? onClose : undefined}
			maxWidth='sm'
			fullWidth
		>
			<DialogTitle>
				{isEditing ? "Edit Color" : "Add New Color"}
				<IconButton
					aria-label='close'
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
					{isLoadingColor ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
							<CircularProgress />
						</Box>
					) : (
						<Box sx={{ pt: 1, pb: 1 }}>
							{/* Color Name Field */}
							<Controller
								name='nama'
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										margin='normal'
										label='Nama Warna'
										error={!!errors.nama}
										helperText={errors.nama?.message}
										disabled={isSubmitDisabled}
										required
									/>
								)}
							/>

							{/* Hex Color Field with color picker */}
							<Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
								<Controller
									name='hex'
									control={control}
									render={({ field }) => (
										<>
											<TextField
												{...field}
												sx={{ flex: 1 }}
												margin='normal'
												label='Kode Hex'
												error={!!errors.hex}
												helperText={errors.hex?.message}
												disabled={isSubmitDisabled}
												required
												placeholder='#RRGGBB'
											/>
											<Box sx={{ position: "relative", ml: 2, mt: 2 }}>
												<input
													type='color'
													value={field.value}
													onChange={(e) => {
														field.onChange(e.target.value);
														handleColorChange(e);
													}}
													disabled={isSubmitDisabled}
													style={{
														opacity: 0,
														position: "absolute",
														top: 0,
														left: 0,
														width: "100%",
														height: "100%",
														cursor: "pointer",
													}}
												/>
												<Box
													sx={{
														width: 40,
														height: 40,
														border: "1px solid #ccc",
														borderRadius: "4px",
														backgroundColor: field.value || "#000000",
													}}
												/>
											</Box>
										</>
									)}
								/>
							</Box>

							{/* Color Preview */}
							<Box sx={{ mt: 3, mb: 1 }}>
								<Typography variant='subtitle2' sx={{ mb: 1 }}>
									Preview:
								</Typography>
								<Box
									sx={{
										width: "100%",
										height: 80,
										borderRadius: 1,
										border: "1px solid #ccc",
										backgroundColor: hexCode || "#000000",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Typography
										variant='body1'
										sx={{
											fontWeight: "bold",
											color: getContrastColor(hexCode),
										}}
									>
										{colorName || "Sample Text"}
									</Typography>
								</Box>
							</Box>

							{isEditing && (
								<Typography
									variant='caption'
									color='text.secondary'
									sx={{ display: "block", mt: 2 }}
								>
									Last Updated:{" "}
									{colorResponse?.data?.tanggal_update
										? new Date(
												colorResponse?.data?.tanggal_update
										  ).toLocaleString()
										: "N/A"}
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
						type='submit'
						variant='contained'
						color='primary'
						disabled={isSubmitDisabled}
						startIcon={
							isSubmitDisabled && <CircularProgress size={20} color='inherit' />
						}
					>
						{isEditing ? "Update" : "Create"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
