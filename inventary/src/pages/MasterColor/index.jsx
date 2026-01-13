import React, { useState, useEffect, useMemo } from "react";
import { Typography, TextField, InputAdornment, Box, Tooltip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQueryClient } from "@tanstack/react-query";

import useApiRequest from "../../hooks/useApiRequest";
import useProductPagination from "../../hooks/useProductPagination";
import useProductSearch from "../../hooks/useProductSearch";
import useProductSorting from "../../hooks/useProductSorting";
import { useNotification } from "../../hooks/useNotification";

import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import DataGridComponent from "../../components/ui/DataGrid";
import AutoColoredChip from "../../components/ui/AutoColoredChip";

import AddEditColorModal from "./AddEditColorModal";

import { formatDate } from "../../utils/formatters";

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
            <Tooltip title="Edit Color">
              <IconButton
                onClick={handleEdit}
                onMouseDown={(e) => e.stopPropagation()}
                size="small"
                color="primary"
                sx={{
                  backgroundColor: "rgba(25, 118, 210, 0.12)",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.25)",
                  },
                  pointerEvents: "auto",
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Color">
              <IconButton
                onClick={handleDeleteClick}
                onMouseDown={(e) => e.stopPropagation()}
                size="small"
                color="error"
                sx={{
                  backgroundColor: "rgba(211, 47, 47, 0.12)",
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.25)",
                  },
                  pointerEvents: "auto",
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      };

      return <ActionButtons />;
    },
  },
  { field: "id", headerName: "ID", width: 90 },
  { field: "nama", headerName: "Color Name", flex: 1 },
  {
    field: "hex",
    headerName: "Hex Code",
    flex: 1,
    renderCell: (params) => <AutoColoredChip value={params.value} />,
  },
  {
    field: "tanggal_update",
    headerName: "Terakhir Di-update",
    width: 200,
    valueGetter: (value) => formatDate(value, true),
  },
];

export default function MasterColor() {
  const queryClient = useQueryClient();
  const [searchInputValue, setSearchInputValue] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

  // State for the add/edit color modal
  const [colorModal, setColorModal] = useState({
    open: false,
    colorId: null,
  });

  const { paginationModel, handlePaginationModelChange, offsetParam, limitParam } = useProductPagination();

  const { searchParam, handleSearchChange } = useProductSearch();

  const { sortModel, handleSortModelChange, buildSortQueryString } = useProductSorting();

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
  const handleEditColor = (colorId) => {
    setColorModal({
      open: true,
      colorId,
    });
  };

  // Function to open add modal
  const handleAddColor = () => {
    setColorModal({
      open: true,
      colorId: null,
    });
  };

  // Function to close modal
  const handleCloseColorModal = () => {
    setColorModal({
      open: false,
      colorId: null,
    });
  };

  const searchUrl = useMemo(() => {
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam ? `q=${encodeURIComponent(searchParam)}` : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

    let url = `/api/admin/colors?${baseParams}`;

    if (searchQuery) {
      url += `&${searchQuery}`;
    }

    url += sortParams;

    return url;
  }, [searchParam, offsetParam, limitParam, buildSortQueryString]);

  const {
    response: colorResponse,
    isLoading,
    error,
    refetch,
  } = useApiRequest({
    url: searchUrl,
    queryKey: ["colors", searchParam, offsetParam, limitParam, sortModel],
  });

  const { mutate: deleteColor, isLoading: isDeleteLoading } = useApiRequest({
    url: deleteDialog.item ? `/api/admin/colors/${deleteDialog.item.id}` : "",
    method: "DELETE",
  });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    setIsDeleting(true);
    deleteColor(null, {
      onSuccess: () => {
        showSuccess(`Color "${deleteDialog.item.nama}" deleted successfully`);
        queryClient.invalidateQueries({ queryKey: ["colors"], exact: false });
        refetch(); // Refresh the data after deletion
        closeDeleteDialog();
      },
      onError: (error) => {
        console.error("Error deleting color:", error);
        showError(`Failed to delete color: ${error.response?.data?.error || error.message}`);
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  // Handle color save success
  const handleColorSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["colors"], exact: false });
    refetch(); // Refresh the colors data
  };

  const rows = useMemo(() => {
    const data = colorResponse?.data;
    const colors = data?.colors || [];
    return colors.map((color) => ({
      ...color,
      onDelete: openDeleteDialog,
      onEdit: handleEditColor,
    }));
  }, [colorResponse]);

  const rowCount = useMemo(
    () => (colorResponse?.data?.total_page || 0) * paginationModel.pageSize,
    [colorResponse, paginationModel.pageSize]
  );

  if (error) {
    return (
      <Box className="flex h-screen w-screen items-center justify-center">
        <Typography variant="h6" color="error">
          Error loading colors
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex h-full flex-grow flex-col overflow-auto p-6">
      <Box className="mb-4 flex">
        <Typography variant="h1" gutterBottom fontWeight={600} sx={{ fontSize: "2rem" }}>
          Master Colors
        </Typography>
      </Box>

      <Box className="mb-4">
        <button
          className="rounded bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
          onClick={handleAddColor}
        >
          Add Color
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
          className="mt-4 w-full max-w-md"
          label="Search Colors"
          variant="outlined"
          fullWidth
          size="small"
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Search by any field..."
        />
      </Box>

      <Box className="w-full overflow-auto">
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
        title="Delete Color"
        message="Are you sure you want to delete this color?"
        itemName={deleteDialog.item?.nama}
        isLoading={isDeleting || isDeleteLoading}
      />

      {/* Add/Edit color modal */}
      <AddEditColorModal
        open={colorModal.open}
        onClose={handleCloseColorModal}
        colorId={colorModal.colorId}
        onSuccess={handleColorSaveSuccess}
      />
    </Box>
  );
}
