import React, { useState, useMemo } from "react";
import { Typography, TextField, InputAdornment, Box, Tooltip, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

import useApiRequest from "../../hooks/useApiRequest";
import useProductPagination from "../../hooks/useProductPagination";
import useProductSearch from "../../hooks/useProductSearch";
import useProductSorting from "../../hooks/useProductSorting";
import { useNotification } from "../../hooks/useNotification";

import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import DataGridComponent from "../../components/ui/DataGrid";
import ViewMessageModal from "./ViewMessageModal";

import { formatDate } from "../../utils/formatters";

export default function MasterNewsletter() {
  const [searchInputValue, setSearchInputValue] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });
  const [viewModal, setViewModal] = useState({ open: false, message: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const { paginationModel, handlePaginationModelChange, offsetParam, limitParam } = useProductPagination();
  const { searchParam, handleSearchChange } = useProductSearch();
  const { sortModel, handleSortModelChange, buildSortQueryString } = useProductSorting();

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
    setDeleteDialog({ open: false, item: null });
  };

  const openViewModal = (message) => {
    setViewModal({ open: true, message });
  };

  const closeViewModal = () => {
    setViewModal({ open: false, message: "" });
  };

  const searchUrl = useMemo(() => {
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam ? `q=${encodeURIComponent(searchParam)}` : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;
    let url = `/api/admin/newsletters?${baseParams}`;
    if (searchQuery) {
      url += `&${searchQuery}`;
    }
    url += sortParams;
    return url;
  }, [searchParam, offsetParam, limitParam, buildSortQueryString]);

  const { response, isLoading, error, refetch } = useApiRequest({
    url: searchUrl,
    queryKey: ["newsletters", searchParam, offsetParam, limitParam, sortModel],
  });

  const { mutate: deleteNewsletter, isLoading: isDeleteLoading } = useApiRequest({
    url: deleteDialog.item ? `/api/admin/newsletters/${deleteDialog.item.id}` : "",
    method: "DELETE",
  });

  const columns = useMemo(
    () => [
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
            <Tooltip title="View Message">
              <IconButton onClick={() => openViewModal(params.row.message)} size="small" color="default">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Entry">
              <IconButton onClick={() => openDeleteDialog(params.row)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      { field: "id", headerName: "ID", width: 90 },
      { field: "email", headerName: "Email", flex: 1 },
      { field: "whatsapp", headerName: "WhatsApp", flex: 1 },
      {
        field: "message",
        headerName: "Message",
        flex: 2,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
            {params.value.length > 100 ? `${params.value.substring(0, 100)}...` : params.value}
          </Typography>
        ),
      },
      {
        field: "created_at",
        headerName: "Subscribed At",
        width: 200,
        valueGetter: (value) => formatDate(value, true),
      },
    ],
    []
  );

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;
    setIsDeleting(true);
    deleteNewsletter(null, {
      onSuccess: () => {
        showSuccess(`Entry from "${deleteDialog.item.email}" deleted successfully`);
        refetch();
        closeDeleteDialog();
      },
      onError: (err) => {
        showError(`Failed to delete entry: ${err.response?.data?.error || err.message}`);
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  };

  const rows = useMemo(() => response?.data?.newsletters || [], [response]);
  const rowCount = useMemo(
    () => (response?.data?.total_page || 0) * paginationModel.pageSize,
    [response, paginationModel.pageSize]
  );

  if (error) {
    return (
      <Box className="flex h-screen w-screen items-center justify-center">
        <Typography variant="h6" color="error">
          Error loading newsletter entries
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex h-full flex-grow flex-col overflow-auto p-6">
      <Box className="mb-4 flex">
        <Typography variant="h1" gutterBottom fontWeight={600} sx={{ fontSize: "2rem" }}>
          Newsletter
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", my: 1, px: 1 }}>
        <TextField
          className="w-full max-w-md"
          label="Search Newsletter"
          variant="outlined"
          size="small"
          defaultValue={searchParam}
          onChange={(e) => setSearchInputValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Search by email, whatsapp, or message..."
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

      <DeleteConfirmationModal
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Newsletter Entry"
        message="Are you sure you want to delete this entry?"
        itemName={`Entry from ${deleteDialog.item?.email}`}
        isLoading={isDeleting || isDeleteLoading}
      />

      <ViewMessageModal open={viewModal.open} onClose={closeViewModal} message={viewModal.message} />
    </Box>
  );
}
