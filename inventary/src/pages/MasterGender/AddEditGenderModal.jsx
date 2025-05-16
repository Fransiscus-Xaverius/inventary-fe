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

// Validation schema with Joi
const genderSchema = Joi.object({
	value: Joi.string().required().messages({
		"string.empty": "Name tidak boleh kosong",
		"any.required": "Name harus diisi",
	}),
});

export default function AddEditGenderModal({
	open,
	onClose,
	genderId,
	onSuccess,
}) {
	const isEditing = !!genderId;
	const { showSuccess, showError } = useNotification();

	// Use react-hook-form with joi validation
	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm({
		resolver: joiResolver(genderSchema),
		defaultValues: {
			value: "",
		},
	});

	// Fetch gender data if editing
	const { response: genderResponse, isLoading: isLoadingGender } =
		useApiRequest({
			url: isEditing ? `/api/genders/${genderId}` : null,
			queryKey: ["gender", genderId],
			enabled: isEditing && open,
		});

	// Prepare create/update mutation
	const { mutate: saveGender, isLoading: isSaving } = useApiRequest({
		url: isEditing ? `/api/genders/${genderId}` : `/api/genders`,
		method: isEditing ? "PUT" : "POST",
	});

	// Set form data when editing and data is loaded
	useEffect(() => {
		if (isEditing && genderResponse) {
			reset({
				value: genderResponse?.data?.value || "",
			});
		}
	}, [isEditing, genderResponse, reset]);

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isEditing) {
			// Reset form for new gender
			reset({
				value: "",
			});
		}
	}, [open, isEditing, reset]);

	const onSubmit = (data) => {
		saveGender(data, {
			onSuccess: (responseData) => {
				showSuccess(`Gender ${isEditing ? "updated" : "created"} successfully`);
				if (onSuccess) onSuccess(responseData);
				onClose();
			},
			onError: (error) => {
				console.error("Error saving gender:", error);
				showError(
					`Failed to ${isEditing ? "update" : "create"} gender: ${
						error.response?.data?.message || error.message
					}`
				);
			},
		});
	};

	const isSubmitDisabled = isSaving || isLoadingGender;

	return (
		<Dialog
			open={open}
			onClose={!isSubmitDisabled ? onClose : undefined}
			maxWidth='sm'
			fullWidth
		>
			<DialogTitle>
				{isEditing ? "Edit Gender" : "Add New Gender"}
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
					{isLoadingGender ? (
						<Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
							<CircularProgress />
						</Box>
					) : (
						<Box sx={{ pt: 1, pb: 1 }}>
							{/* Gender Name Field */}
							<Controller
								name='value'
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										margin='normal'
										label='Name'
										error={!!errors.value}
										helperText={errors.value?.message}
										disabled={isSubmitDisabled}
										required
									/>
								)}
							/>

							{isEditing && genderResponse?.data?.tanggal_update && (
								<Typography
									variant='caption'
									color='text.secondary'
									sx={{ display: "block", mt: 2 }}
								>
									Last Updated:{" "}
									{new Date(
										genderResponse?.data?.tanggal_update
									).toLocaleString()}
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
