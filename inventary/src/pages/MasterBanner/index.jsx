import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  TextField,
  InputAdornment,
  Box,
  Tooltip,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
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
import { useNotification } from "../../contexts/NotificationContext";
import AddEditBannerModal from "./AddEditBannerModal";

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
            <Tooltip title="Edit Banner">
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
            <Tooltip title="Delete Banner">
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
  {
    field: "is_active",
    headerName: "Aktif",
    width: 100,
    renderCell: (params) => {
      const { showSuccess, showError } = useNotification();
      const { mutate: updateBannerStatus } = useApiRequest({
        url: `/api/banners/${params.row.id}`,
        method: "PUT",
      });

      const handleToggle = (event) => {
        const newStatus = event.target.checked;
        updateBannerStatus(
          { is_active: newStatus },
          {
            onSuccess: () => {
              showSuccess(
                `Banner "${params.row.title}" status updated to ${
                  newStatus ? "active" : "inactive"
                }`
              );
              params.api.invalidateRows([params.id]); // Invalidate row to trigger re-render
              params.api.forceUpdateRows([params.id]);
            },
            onError: (error) => {
              console.error("Error updating banner status:", error);
              showError(
                `Failed to update banner status: ${
                  error.response?.data?.error || error.message
                }`
              );
            },
          }
        );
      };

      return (
        <Switch checked={params.value} onChange={handleToggle} size="small" />
      );
    },
  },
  {
    field: "image_preview",
    headerName: "Gambar",
    width: 150,
    renderCell: (params) => {
      // const hostUrl = process.env.BACKEND_URL;
      const hostUrl = "http://localhost:8080";
      const imageUrl = `${hostUrl}${params.row.image_url}`;
      return (
        <div>
          <img src={imageUrl} alt="Banner" width={100} height={100} />
        </div>
      );
    },
  },
  { field: "order_index", headerName: "Urutan ke", width: 90 },
  { field: "title", headerName: "Judul", width: 200 },
  { field: "description", headerName: "Deskripsi", width: 200 },
  { field: "cta_text", headerName: "CTA Text (Button)", width: 200 },
  { field: "cta_link", headerName: "CTA Link", width: 200 },
  {
    field: "image_url",
    headerName: "URL Gambar",
    width: 200,
    renderCell: (params) => (
      <a href={params.value} target="_blank" rel="noopener noreferrer">
        {params.value}
      </a>
    ),
  },
  {
    field: "created_at",
    headerName: "Tanggal Dibuat",
    width: 180,
    valueGetter: (value) => formatDate(value, true),
  },
  {
    field: "updated_at",
    headerName: "Terakhir Di-update",
    width: 180,
    valueGetter: (value) => formatDate(value, true),
  },
];

export default function MasterBanner() {
  const [searchInputValue, setSearchInputValue] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

  // State for the add/edit banner modal
  const [bannerModal, setBannerModal] = useState({
    open: false,
    bannerId: null,
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

  const [showActiveOnly, setShowActiveOnly] = useState(false);

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
  const handleEditBanner = (bannerId) => {
    setBannerModal({
      open: true,
      bannerId,
    });
  };

  // Function to open add modal
  const handleAddBanner = () => {
    setBannerModal({
      open: true,
      bannerId: null,
    });
  };

  // Function to close modal
  const handleCloseBannerModal = () => {
    setBannerModal({
      open: false,
      bannerId: null,
    });
  };

  const searchUrl = useMemo(() => {
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam
      ? `q=${encodeURIComponent(searchParam)}`
      : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

    let url = `/api/banners?${baseParams}`;

    if (searchQuery) {
      url += `&${searchQuery}`;
    }

    if (showActiveOnly) {
      url += `&is_active=true`;
    }

    url += sortParams;

    return url;
  }, [
    searchParam,
    offsetParam,
    limitParam,
    buildSortQueryString,
    showActiveOnly,
  ]);

  const {
    response: bannerResponse,
    isLoading,
    error,
    refetch,
  } = useApiRequest({
    url: searchUrl,
    queryKey: [
      "banners",
      searchParam,
      offsetParam,
      limitParam,
      sortModel,
      showActiveOnly,
    ],
  });

  const { mutate: deleteBanner, isLoading: isDeleteLoading } = useApiRequest({
    url: deleteDialog.item ? `/api/banners/${deleteDialog.item.id}` : "",
    method: "DELETE",
  });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    setIsDeleting(true);
    deleteBanner(null, {
      onSuccess: () => {
        showSuccess(`Banner "${deleteDialog.item.title}" deleted successfully`);
        refetch(); // Refresh the data after deletion
        closeDeleteDialog();
      },
      onError: (error) => {
        console.error("Error deleting banner:", error);
        showError(
          `Failed to delete banner: ${
            error.response?.data?.error || error.message
          }`
        );
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  // Handle banner save success
  const handleBannerSaveSuccess = () => {
    refetch(); // Refresh the banners data
  };

  const rows = useMemo(() => {
    const banners = bannerResponse?.data?.banners || [];
    return banners.map((banner) => ({
      ...banner,
      onDelete: openDeleteDialog,
      onEdit: handleEditBanner,
    }));
  }, [bannerResponse]);

  const rowCount = useMemo(
    () => (bannerResponse?.data?.total_page || 0) * paginationModel.pageSize,
    [bannerResponse, paginationModel.pageSize]
  );

  if (error) {
    return (
      <Box className="flex justify-center items-center h-screen w-screen">
        <Typography variant="h6" color="error">
          Error loading banners
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="h-screen w-screen flex">
      <SidebarDashboard />

      <Box className="flex flex-col flex-grow h-full p-4 overflow-hidden">
        <Box className="flex mb-4">
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Master Banners
          </Typography>
        </Box>

        <Box className="mb-4 flex justify-between items-center">
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
            onClick={handleAddBanner}
          >
            Add Banner
          </button>
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                name="showActiveOnly"
                color="primary"
              />
            }
            label="Hanya tampilkan yang aktif"
          />
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
            className="w-full max-w-md mt-4"
            label="Search Banners"
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
            placeholder="Search by title, subtitle, description..."
          />
        </Box>

        <Box className="flex-grow w-full overflow-auto">
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
          title="Delete Banner"
          message="Are you sure you want to delete this banner?"
          itemName={deleteDialog.item?.title}
          isLoading={isDeleting || isDeleteLoading}
        />

        {/* Add/Edit banner modal */}
        <AddEditBannerModal
          open={bannerModal.open}
          onClose={handleCloseBannerModal}
          bannerId={bannerModal.bannerId}
          onSuccess={handleBannerSaveSuccess}
        />
      </Box>
    </Box>
  );
}
