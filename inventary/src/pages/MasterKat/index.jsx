import React, { useState, useEffect, useMemo } from "react";
import { Typography, TextField, InputAdornment, Box, Tooltip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useApiRequest from "../../hooks/useApiRequest";
import useProductPagination from "../../hooks/useProductPagination";
import useProductSearch from "../../hooks/useProductSearch";
import useProductSorting from "../../hooks/useProductSorting";
import SidebarDashboard from "../../components/SidebarDashboard";
import DataGridComponent from "../../components/ui/DataGrid";
import { formatDate } from "../../utils/formatters";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import { useNotification } from "../../hooks/useNotification";
import AddEditKatModal from "./AddEditKatModal";

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
            <Tooltip title="Edit Kategori">
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
            <Tooltip title="Delete Kategori">
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
  { field: "value", headerName: "Name", flex: 1 },
  {
    field: "tanggal_update",
    headerName: "Terakhir Di-update",
    width: 200,
    valueGetter: (value) => formatDate(value, true),
  },
];

export default function MasterKat() {
  const [searchInputValue, setSearchInputValue] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

  // State for the add/edit kategori modal
  const [katModal, setKatModal] = useState({
    open: false,
    katId: null,
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
  const handleEditKat = (katId) => {
    setKatModal({
      open: true,
      katId,
    });
  };

  // Function to open add modal
  const handleAddKat = () => {
    setKatModal({
      open: true,
      katId: null,
    });
  };

  // Function to close modal
  const handleCloseKatModal = () => {
    setKatModal({
      open: false,
      katId: null,
    });
  };

  const searchUrl = useMemo(() => {
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam ? `q=${encodeURIComponent(searchParam)}` : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

    let url = `/api/admin/kats?${baseParams}`;

    if (searchQuery) {
      url += `&${searchQuery}`;
    }

    url += sortParams;

    return url;
  }, [searchParam, offsetParam, limitParam, buildSortQueryString]);

  const {
    response: katResponse,
    isLoading,
    error,
    refetch,
  } = useApiRequest({
    url: searchUrl,
    queryKey: ["kats", searchParam, offsetParam, limitParam, sortModel],
  });

  const { mutate: deleteKat, isLoading: isDeleteLoading } = useApiRequest({
    url: deleteDialog.item ? `/api/kats/${deleteDialog.item.id}` : "",
    method: "DELETE",
  });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    setIsDeleting(true);
    deleteKat(null, {
      onSuccess: () => {
        showSuccess(`Kategori "${deleteDialog.item.value}" deleted successfully`);
        refetch(); // Refresh the data after deletion
        closeDeleteDialog();
      },
      onError: (error) => {
        console.error("Error deleting kategori:", error);
        showError(`Failed to delete kategori: ${error.response?.data?.message || error.message}`);
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  // Handle kategori save success
  const handleKatSaveSuccess = () => {
    refetch(); // Refresh the kategori data
  };

  const rows = useMemo(() => {
    const kats = katResponse?.data?.kats || [];
    return kats.map((kat) => ({
      ...kat,
      onDelete: openDeleteDialog,
      onEdit: handleEditKat,
    }));
  }, [katResponse]);

  const rowCount = useMemo(
    () => (katResponse?.data?.total_page || 0) * paginationModel.pageSize,
    [katResponse, paginationModel.pageSize]
  );

  if (error) {
    return (
      <Box className="flex h-screen w-screen items-center justify-center">
        <Typography variant="h6" color="error">
          Error loading categories
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex h-screen w-screen">
      <SidebarDashboard />

      <Box className="flex h-full flex-grow flex-col overflow-hidden p-4">
        <Box className="mb-4 flex">
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Master Kategori
          </Typography>
        </Box>

        <Box className="mb-4">
          <button
            className="rounded bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
            onClick={handleAddKat}
          >
            Add Kategori
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
            label="Search Categories"
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

        <Box className="w-full flex-grow overflow-auto">
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
          title="Delete Kategori"
          message="Are you sure you want to delete this kategori?"
          itemName={deleteDialog.item?.value}
          isLoading={isDeleting || isDeleteLoading}
        />

        {/* Add/Edit kategori modal */}
        <AddEditKatModal
          open={katModal.open}
          onClose={handleCloseKatModal}
          katId={katModal.katId}
          onSuccess={handleKatSaveSuccess}
        />
      </Box>
    </Box>
  );
}
