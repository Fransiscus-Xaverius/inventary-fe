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
import AutoColoredChip from "../../components/ui/AutoColoredChip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import { useNotification } from "../../contexts/NotificationContext";

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
      const navigate = useNavigate();

      const handleEdit = () => {
        navigate(`/addEdit-color/${params.row.id}`);
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
          <Tooltip title="Edit Product">
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
                pointerEvents: 'auto'
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Product">
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
                pointerEvents: 'auto'
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
  const [searchInputValue, setSearchInputValue] = useState("");
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();

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

  const searchUrl = useMemo(() => {
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam
      ? `q=${encodeURIComponent(searchParam)}`
      : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

    let url = `/api/colors?${baseParams}`;

    if (searchQuery) {
      url += `&${searchQuery}`;
    }

    url += sortParams;

    return url;
  }, [searchParam, offsetParam, limitParam, buildSortQueryString]);

  const { data, isLoading, error, refetch } = useApiRequest({
    url: searchUrl,
    queryKey: ["colors", searchParam, offsetParam, limitParam, sortModel],
  });

  const { mutate: deleteColor, isLoading: isDeleteLoading } = useApiRequest({
    url: deleteDialog.item ? `/api/colors/${deleteDialog.item.id}` : '',
    method: "DELETE",
  });

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return;

    setIsDeleting(true);
    deleteColor(null, {
      onSuccess: () => {
        showSuccess(`Color "${deleteDialog.item.nama}" deleted successfully`);
        refetch(); // Refresh the data after deletion
        closeDeleteDialog();
      },
      onError: (error) => {
        console.error("Error deleting color:", error);
        showError(`Failed to delete color: ${error.response?.data?.message || error.message}`);
      },
      onSettled: () => {
        setIsDeleting(false);
      }
    });
  };

  const rows = useMemo(() => {
    const colors = data?.colors || [];
    return colors.map((color) => ({
      ...color,
      onDelete: openDeleteDialog,
    }));
  }, [data]);

  const rowCount = useMemo(
    () => (data?.total_page || 0) * paginationModel.pageSize,
    [data, paginationModel.pageSize]
  );

  if (error) {
    return (
      <Box className="flex justify-center items-center h-screen w-screen">
        <Typography variant="h6" color="error">
          Error loading colors
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
            Master Colors
          </Typography>
        </Box>

        <Box className="mb-4">
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
            onClick={() => navigate("/addEdit-color")}
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
            className="w-full max-w-md mt-4"
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

        <DeleteConfirmationModal
          open={deleteDialog.open}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
          title="Delete Color"
          message="Are you sure you want to delete this color?"
          itemName={deleteDialog.item?.nama}
          isLoading={isDeleting || isDeleteLoading}
        />
      </Box>
    </Box>
  );
}
