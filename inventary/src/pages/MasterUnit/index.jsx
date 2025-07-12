import React, { useState, useEffect, useMemo } from "react";
import {
	Typography,
	TextField,
	InputAdornment,
	Box,
	Tooltip,
	IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useApiRequest from "../../hooks/useApiRequest";
import useProductPagination from "../../hooks/useProductPagination";
import useProductSearch from "../../hooks/useProductSearch";
import useProductSorting from "../../hooks/useProductSorting";
import SidebarDashboard from "../../components/SidebarDashboard";
import { useNavigate } from "react-router-dom";
import DataGridComponent from "../../components/ui/DataGrid";
import { formatDate } from "../../utils/formatters";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import { useNotification } from "../../contexts/NotificationContext";
import AddEditUnitModal from "./AddEditUnitModal";

const columns = [
	{
		field: "actions",
		headerName: "Actions",
		width: 120,
		sortable: false,
		filterable: false,
		disableColumnMenu: true,
		renderCell: (params) => {
			const ActionButtons = () => {
				const handleEdit = () => {
					params.row.onEdit(params.row.id);
				};

				const handleDeleteClick = () => {
					params.row.onDelete(params.row);
				};

				return (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							gap: 1,
						}}
					>
						<Tooltip title='Edit Unit'>
							<IconButton
								onClick={handleEdit}
								onMouseDown={(e) => e.stopPropagation()}
								size='small'
								color='primary'
								sx={{
									backgroundColor: "rgba(25, 118, 210, 0.12)",
									"&:hover": {
										backgroundColor: "rgba(25, 118, 210, 0.25)",
									},
									pointerEvents: "auto",
								}}
							>
								<EditIcon fontSize='small' />
							</IconButton>
						</Tooltip>
						<Tooltip title='Delete Unit'>
							<IconButton
								onClick={handleDeleteClick}
								onMouseDown={(e) => e.stopPropagation()}
								size='small'
								color='error'
								sx={{
									backgroundColor: "rgba(211, 47, 47, 0.12)",
									"&:hover": {
										backgroundColor: "rgba(211, 47, 47, 0.25)",
									},
									pointerEvents: "auto",
								}}
							>
								<DeleteIcon fontSize='small' />
							</IconButton>
						</Tooltip>
					</Box>
				);
			};

			return <ActionButtons />;
		},
	},
	{ field: "id", headerName: "ID", width: 90 },
	{ field: "value", headerName: "Name", flex: 1 },
	{
		field: "tanggal_update",
		headerName: "Terakhir Di-update",
		width: 200,
		valueGetter: (value) => formatDate(value, true),
	},
];

export default function MasterUnit() {
	const [searchInputValue, setSearchInputValue] = useState("");
	const navigate = useNavigate();
	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		item: null,
	});
	const [isDeleting, setIsDeleting] = useState(false);
	const { showSuccess, showError } = useNotification();

	// State for the add/edit unit modal
	const [unitModal, setUnitModal] = useState({
		open: false,
		unitId: null,
	});

	const {
		paginationModel,
		handlePaginationModelChange,
		offsetParam,
		limitParam,
	} = useProductPagination();

	const { searchParam, handleSearchChange } = useProductSearch();

	const { sortModel, handleSortModelChange, buildSortQueryString } =
		useProductSorting();

	useEffect(() => {
		setSearchInputValue(searchParam);
	}, [searchParam]);

	const handleSearchKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSearchChange(searchInputValue);
		}
	};

	const openDeleteDialog = (item) => {
		setDeleteDialog({
			open: true,
			item,
		});
	};

	const closeDeleteDialog = () => {
		setDeleteDialog({
			open: false,
			item: null,
		});
	};

	// Function to open edit modal
	const handleEditUnit = (unitId) => {
		setUnitModal({
			open: true,
			unitId,
		});
	};

	// Function to open add modal
	const handleAddUnit = () => {
		setUnitModal({
			open: true,
			unitId: null,
		});
	};

	// Function to close modal
	const handleCloseUnitModal = () => {
		setUnitModal({
			open: false,
			unitId: null,
		});
	};

	const searchUrl = useMemo(() => {
		const sortParams = buildSortQueryString();
		const searchQuery = searchParam
			? `q=${encodeURIComponent(searchParam)}`
			: "";
		const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

		let url = `/api/admin/units?${baseParams}`;

		if (searchQuery) {
			url += `&${searchQuery}`;
		}

		url += sortParams;

		return url;
	}, [searchParam, offsetParam, limitParam, buildSortQueryString]);

	const {
		response: unitResponse,
		isLoading,
		error,
		refetch,
	} = useApiRequest({
		url: searchUrl,
		queryKey: ["units", searchParam, offsetParam, limitParam, sortModel],
	});

	const { mutate: deleteUnit, isLoading: isDeleteLoading } = useApiRequest({
		url: deleteDialog.item ? `/api/admin/units/${deleteDialog.item.id}` : "",
		method: "DELETE",
	});

	const handleDeleteConfirm = async () => {
		if (!deleteDialog.item) return;

		setIsDeleting(true);
		deleteUnit(null, {
			onSuccess: () => {
				showSuccess(`Unit "${deleteDialog.item.value}" deleted successfully`);
				refetch(); // Refresh the data after deletion
				closeDeleteDialog();
			},
			onError: (error) => {
				console.error("Error deleting unit:", error);
				showError(
					`Failed to delete unit: ${
						error.response?.data?.message || error.message
					}`
				);
			},
			onSettled: () => {
				setIsDeleting(false);
			},
		});
	};

	// Handle unit save success
	const handleUnitSaveSuccess = () => {
		refetch(); // Refresh the unit data
	};

	const rows = useMemo(() => {
		const units = unitResponse?.data?.units || [];
		return units.map((unit) => ({
			...unit,
			onDelete: openDeleteDialog,
			onEdit: handleEditUnit,
		}));
	}, [unitResponse]);

	const rowCount = useMemo(
		() => (unitResponse?.data?.total_page || 0) * paginationModel.pageSize,
		[unitResponse, paginationModel.pageSize]
	);

	if (error) {
		return (
			<Box className='flex justify-center items-center h-screen w-screen'>
				<Typography variant='h6' color='error'>
					Error loading units
				</Typography>
			</Box>
		);
	}

	return (
		<Box className='h-screen w-screen flex'>
			<SidebarDashboard />

			<Box className='flex flex-col flex-grow h-full p-4 overflow-hidden'>
				<Box className='flex mb-4'>
					<Typography variant='h4' gutterBottom fontWeight={600}>
						Master Unit
					</Typography>
				</Box>

				<Box className='mb-4'>
					<button
						className='bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition'
						onClick={handleAddUnit}
					>
						Add Unit
					</button>
				</Box>

				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "end",
						gap: 2,
						my: 1,
						px: 1,
					}}
				>
					<TextField
						className='w-full max-w-md mt-4'
						label='Search Units'
						variant='outlined'
						fullWidth
						size='small'
						value={searchInputValue}
						onChange={(e) => setSearchInputValue(e.target.value)}
						onKeyDown={handleSearchKeyDown}
						InputProps={{
							startAdornment: (
								<InputAdornment position='start'>
									<SearchIcon />
								</InputAdornment>
							),
						}}
						placeholder='Search by any field...'
					/>
				</Box>

				<Box className='flex-grow w-full overflow-auto'>
					<DataGridComponent
						rows={rows}
						rowCount={rowCount}
						loading={isLoading}
						columns={columns}
						paginationModel={paginationModel}
						onPaginationModelChange={handlePaginationModelChange}
						sortModel={sortModel}
						onSortModelChange={handleSortModelChange}
					/>
				</Box>

				{/* Delete confirmation modal */}
				<DeleteConfirmationModal
					open={deleteDialog.open}
					onClose={closeDeleteDialog}
					onConfirm={handleDeleteConfirm}
					title='Delete Unit'
					message='Are you sure you want to delete this unit?'
					itemName={deleteDialog.item?.value}
					isLoading={isDeleting || isDeleteLoading}
				/>

				{/* Add/Edit unit modal */}
				<AddEditUnitModal
					open={unitModal.open}
					onClose={handleCloseUnitModal}
					unitId={unitModal.unitId}
					onSuccess={handleUnitSaveSuccess}
				/>
			</Box>
		</Box>
	);
}
