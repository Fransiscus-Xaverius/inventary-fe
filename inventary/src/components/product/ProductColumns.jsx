// import React, { useState } from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { CategoryCell, ColorCell, SizeCell } from "../../components/CategoryChip";
import { IconButton, Tooltip, Box, CircularProgress, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import { Link, useNavigate } from "react-router-dom";
import useApiRequest from "../../hooks/useApiRequest";
import { useNotification } from "../../hooks/useNotification";
import { useState } from "react";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";

/**
 * Creates DataGrid column definitions for product table with filter options
 * @param {Object} filterOptions - Filter options fetched from API
 * @param {Function} refetch - Callback function to execute after product deletion
 * @returns {Array} Column definitions for MUI DataGrid
 */
export const createProductColumns = (filterOptions, refetch) => {
  // Helper function to create filter options for each column
  const createFilterOptions = (field) => {
    if (filterOptions?.fields?.[field]?.values) {
      return filterOptions.fields[field].values.map((value) => ({
        value,
        label: value,
      }));
    }
    return [];
  };

  // Enhanced filter operators to support multiple conditions
  const createFilterOperators = (field) => [
    {
      value: "equals",
      label: "equals",
      getApplyFilterFn: (filterItem) => {
        return (params) => {
          return params.value === filterItem.value;
        };
      },
      InputComponent: ({ item, applyValue }) => (
        <select
          value={item.value || ""}
          onChange={(e) => applyValue({ ...item, value: e.target.value })}
          style={{ width: "100%", padding: "8px" }}
        >
          <option value="">All</option>
          {createFilterOptions(field).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      value: "contains",
      label: "contains",
      getApplyFilterFn: (filterItem) => {
        return (params) => {
          if (!params.value) return false;
          return params.value.toLowerCase().includes(filterItem.value.toLowerCase());
        };
      },
    },
    {
      value: "startsWith",
      label: "starts with",
      getApplyFilterFn: (filterItem) => {
        return (params) => {
          if (!params.value) return false;
          return params.value.toLowerCase().startsWith(filterItem.value.toLowerCase());
        };
      },
    },
    {
      value: "endsWith",
      label: "ends with",
      getApplyFilterFn: (filterItem) => {
        return (params) => {
          if (!params.value) return false;
          return params.value.toLowerCase().endsWith(filterItem.value.toLowerCase());
        };
      },
    },
    {
      value: "isEmpty",
      label: "is empty",
      getApplyFilterFn: () => {
        return (params) => {
          return params.value === undefined || params.value === null || params.value === "";
        };
      },
    },
    {
      value: "isNotEmpty",
      label: "is not empty",
      getApplyFilterFn: () => {
        return (params) => {
          return params.value !== undefined && params.value !== null && params.value !== "";
        };
      },
    },
  ];

  return [
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const ActionButtons = () => {
          const navigate = useNavigate();
          const { showSuccess, showError } = useNotification();
          const [deleteDialog, setDeleteDialog] = useState({
            open: false,
            item: null,
          });
          const [isDeleting, setIsDeleting] = useState(false);

          // API mutation for deletion
          const { mutate: deleteProduct, isLoading: isDeleteLoading } = useApiRequest({
            url: deleteDialog.item ? `/api/admin/products/${deleteDialog.item.artikel}` : "",
            method: "DELETE",
          });

          const handleEdit = () => {
            navigate(`/addEdit-product/${params.row.artikel}`);
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

          const handleDeleteClick = () => {
            openDeleteDialog(params.row);
          };

          const handleDeleteConfirm = async () => {
            if (!deleteDialog.item) return;

            setIsDeleting(true);
            deleteProduct(null, {
              onSuccess: () => {
                showSuccess(`Product "${deleteDialog.item.artikel}" deleted successfully`);
                refetch(); // Refresh the data after deletion
                closeDeleteDialog();
              },
              onError: (error) => {
                console.error("Error deleting product:", error);
                showError(`Failed to delete product: ${error.response?.data?.error || error.message}`);
              },
              onSettled: () => {
                setIsDeleting(false);
              },
            });
          };

          if (isDeleting || isDeleteLoading) {
            return <CircularProgress size={20} />;
          }

          return (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                  height: "100%",
                }}
              >
                <Tooltip title="Edit Product">
                  <IconButton
                    onClick={handleEdit}
                    size="small"
                    color="primary"
                    sx={{
                      backgroundColor: "rgba(25, 118, 210, 0.12)",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.25)",
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Product">
                  <IconButton
                    onClick={handleDeleteClick}
                    size="small"
                    color="error"
                    sx={{
                      backgroundColor: "rgba(211, 47, 47, 0.12)",
                      "&:hover": {
                        backgroundColor: "rgba(211, 47, 47, 0.25)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Delete confirmation modal */}
              <DeleteConfirmationModal
                open={deleteDialog.open}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteConfirm}
                title="Delete Product"
                message="Are you sure you want to delete this product?"
                itemName={deleteDialog.item?.artikel}
                isLoading={isDeleting || isDeleteLoading}
              />
            </>
          );
        };

        return <ActionButtons />;
      },
    },
    {
      field: "image_preview",
      headerName: "Gambar",
      renderCell: (params) => {
        if (!params.row.gambar) return <div>No image</div>;
        // const hostUrl = process.env.BACKEND_URL;
        const hostUrl = "http://localhost:8080";
        const imageUrl = `${hostUrl}${params.row.gambar[0]}`;
        return (
          <div className="flex h-full w-full items-center justify-center p-2">
            <img src={imageUrl} alt="Product" className="h-full w-full rounded-md object-contain" />
          </div>
        );
      },
    },
    {
      field: "no",
      headerName: "ID",
      width: 90,
      filterable: true,
    },
    {
      field: "artikel",
      headerName: "Artikel",
      width: 150,
      filterable: true,
      filterOperators: createFilterOperators("artikel"),
    },
    {
      field: "nama",
      headerName: "Nama",
      width: 200,
      filterable: true,
      filterOperators: createFilterOperators("nama"),
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 320,
      filterable: true,
      filterOperators: createFilterOperators("rating"),
      renderCell: (params) => {
        const rating = params.row.rating;

        // Handle old format or empty rating
        if (!rating || typeof rating !== "object") {
          return <div className="text-sm text-gray-400">No rating</div>;
        }

        const { comfort = 0, style = 0, support = 0, purpose = [] } = rating;

        return (
          <Box className="flex h-full flex-col justify-center gap-y-2">
            {/* Ratings with star icons */}
            <Box className="flex flex-wrap items-center gap-3 text-sm">
              <Box className="flex items-center gap-1">
                <span className="text-gray-700">Comfort:</span>
                <span className="font-medium text-gray-900">{comfort}</span>
                <StarIcon fontSize="inherit" color="primary" />
              </Box>
              <Box className="flex items-center gap-1">
                <span className="text-gray-700">Style:</span>
                <span className="font-medium text-gray-900">{style}</span>
                <StarIcon fontSize="inherit" color="primary" />
              </Box>
              <Box className="flex items-center gap-1">
                <span className="text-gray-700">Support:</span>
                <span className="font-medium text-gray-900">{support}</span>
                <StarIcon fontSize="inherit" color="primary" />
              </Box>
            </Box>
            {/* Purpose categories as chips */}
            {purpose.length > 0 && (
              <Box className="flex flex-wrap items-center gap-1">
                <span className="text-sm text-gray-700">Purpose:</span>
                <Box className="flex flex-wrap items-center gap-1">
                  {purpose
                    .filter((p) => p && p.trim())
                    .map((purposeItem, index) => (
                      <Chip
                        key={index}
                        label={purposeItem}
                        size="medium"
                        variant="filled"
                        color="primary"
                        sx={{
                          fontSize: "10px",
                          height: "20px",
                          "& .MuiChip-label": {
                            padding: "0 6px",
                          },
                        }}
                      />
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      field: "deskripsi",
      headerName: "Deskripsi",
      filterable: true,
      width: 300,
      filterOperators: createFilterOperators("deskripsi"),
    },
    {
      field: "warna",
      headerName: "Warna",
      width: 300,
      renderCell: (params) => <ColorCell params={params} />,
      filterable: true,
      filterOperators: createFilterOperators("warna"),
    },
    {
      field: "size",
      headerName: "Size",
      width: 240,
      renderCell: (params) => <SizeCell params={params} />,
      filterable: true,
      filterOperators: createFilterOperators("size"),
    },
    {
      field: "grup",
      headerName: "Grup",
      width: 120,
      renderCell: (params) => <CategoryCell params={params} />,
      filterable: true,
      filterOperators: createFilterOperators("grup"),
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 120,
      renderCell: (params) => <CategoryCell params={params} />,
      filterable: true,
      filterOperators: createFilterOperators("unit"),
    },
    {
      field: "kat",
      headerName: "Kategori",
      width: 120,
      renderCell: (params) => <CategoryCell params={params} />,
      sortable: true,
      filterable: true,
      filterOperators: createFilterOperators("kat"),
    },
    {
      field: "model",
      headerName: "Model",
      width: 100,
      filterable: true,
      filterOperators: createFilterOperators("model"),
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) => <CategoryCell params={params} />,
      sortable: true,
      filterable: true,
      filterOperators: createFilterOperators("gender"),
    },
    {
      field: "tipe",
      headerName: "Tipe",
      width: 120,
      renderCell: (params) => <CategoryCell params={params} />,
      sortable: true,
      filterable: true,
      filterOperators: createFilterOperators("tipe"),
    },
    {
      field: "harga",
      headerName: "Harga",
      width: 150,
      valueGetter: (value) => formatCurrency(value),
    },
    {
      field: "harga_diskon",
      headerName: "Harga Diskon",
      width: 150,
      valueGetter: (value) => formatCurrency(value),
    },
    {
      field: "marketplace",
      headerName: "Marketplace",
      width: 400,
      filterable: true,
      filterOperators: createFilterOperators("marketplace"),
      renderCell: (params) => {
        const marketplace = params.row.marketplace;
        if (!marketplace || typeof marketplace !== "object" || Object.keys(marketplace).length <= 0) {
          console.log("no marketplace", marketplace);
          return <div className="text-sm text-gray-400">No marketplace</div>;
        }

        return (
          <Box sx={{ display: "flex", height: "100%", gap: 1, alignItems: "center", alignContent: "center" }}>
            {Object.keys(params.row.marketplace).map((key) => (
              <Link
                key={key}
                to={params.row.marketplace[key]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-fit items-center justify-center"
              >
                <Chip
                  label={key}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{
                    "&:hover": { backgroundColor: "primary.main", color: "white" },
                  }}
                />
              </Link>
            ))}
          </Box>
        );
      },
    },
    {
      field: "offline",
      headerName: "Toko Offline",
      width: 400,
      filterable: true,
      filterOperators: createFilterOperators("offline"),
      renderCell: (params) => {
        const offlineStores = params.row.offline || [];
        console.log(offlineStores);
        if (!Array.isArray(offlineStores) || offlineStores.length === 0) {
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <span className="text-sm text-gray-400">Tidak ada toko offline</span>
            </Box>
          );
        }

        return (
          <Box sx={{ display: "flex", height: "100%", gap: 1, alignItems: "center", alignContent: "center" }}>
            {offlineStores.map((store, index) => (
              <Link
                key={index}
                to={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-fit items-center justify-center"
              >
                <Chip
                  label={store.name}
                  color={store.is_active ? "primary" : "default"}
                  variant="outlined"
                  size="small"
                  sx={{
                    "&:hover": {
                      backgroundColor: store.is_active ? "primary.main" : "grey.300",
                      color: "white",
                    },
                  }}
                />
              </Link>
            ))}
          </Box>
        );
      },
    },
    {
      field: "tanggal_produk",
      headerName: "Tanggal Produk",
      width: 200,
      valueGetter: (value) => formatDate(value),
    },
    {
      field: "tanggal_terima",
      headerName: "Tanggal Terima",
      width: 200,
      valueGetter: (value) => formatDate(value),
    },
    {
      field: "usia",
      headerName: "Usia",
      renderCell: (params) => <CategoryCell params={params} />,
      width: 100,
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => <CategoryCell params={params} />,
      width: 120,
      filterable: true,
      filterOperators: createFilterOperators("status"),
    },
    {
      field: "supplier",
      headerName: "Supplier",
      width: 150,
      filterable: true,
      filterOperators: createFilterOperators("supplier"),
    },
    {
      field: "diupdate_oleh",
      headerName: "Di-update Oleh",
      width: 150,
      filterable: true,
      filterOperators: createFilterOperators("diupdate_oleh"),
    },
    {
      field: "tanggal_update",
      headerName: "Terakhir Di-update",
      width: 200,
      valueGetter: (value) => formatDate(value, true),
    },
  ];
};

export default createProductColumns;
