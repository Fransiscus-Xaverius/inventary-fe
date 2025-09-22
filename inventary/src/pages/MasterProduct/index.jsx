import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Divider,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import { DataGrid, GridLogicOperator } from "@mui/x-data-grid";
import { PRODUCT_FILTER_FIELDS } from "../../constants/filterFields";
import useApiRequest from "../../hooks/useApiRequest";
import useProductFilters from "../../hooks/useProductFilters";
import useProductPagination from "../../hooks/useProductPagination";
import useProductSearch from "../../hooks/useProductSearch";
import useProductSorting from "../../hooks/useProductSorting";
import { createProductColumns } from "../../components/product/ProductColumns";
import SidebarDashboard from "../../components/SidebarDashboard";
import { useNavigate } from "react-router-dom";

export default function MasterProduct() {
  // Track initial load vs subsequent loads
  const [initialLoad, setInitialLoad] = useState(true);
  const searchInputValue = useRef("");
  const navigate = useNavigate();

  // State for tracking filter dropdown values
  const [filterValues, setFilterValues] = useState({});

  // Use custom hooks for pagination, filtering, search, and sorting
  const { paginationModel, handlePaginationModelChange, offsetParam, limitParam } = useProductPagination();

  const { filterModel, handleFilterModelChange, buildFilterQueryString, addFilter } =
    useProductFilters(PRODUCT_FILTER_FIELDS);

  const { searchParam, handleSearchChange } = useProductSearch();

  const { sortModel, handleSortModelChange, buildSortQueryString } = useProductSorting();

  // Fetch available filter options
  const { response: filterResponse } = useApiRequest({
    url: "/api/filters",
    queryKey: ["filterOptions"],
  });

  // Initialize search input from URL parameter
  useEffect(() => {
    searchInputValue.current = searchParam;
  }, [searchParam]);

  // Handle search input change with Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchChange(searchInputValue.current);
    }
  };

  // API request with URL parameters using a stable URL reference
  const searchUrl = useMemo(() => {
    const filterParams = buildFilterQueryString();
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam ? `q=${encodeURIComponent(searchParam)}` : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

    // Construct URL with all parameters
    let url = `/api/admin/products?${baseParams}`;

    if (searchQuery) {
      url += `&${searchQuery}`;
    }

    url += filterParams;
    url += sortParams;

    return url;
  }, [
    searchParam, // Only depends on the actual search parameter, not the input value
    offsetParam,
    limitParam,
    buildFilterQueryString,
    buildSortQueryString,
  ]);

  const {
    response: productResponse,
    isLoading,
    error,
    refetch,
  } = useApiRequest({
    url: searchUrl,
    queryKey: ["products", searchParam, offsetParam, limitParam, filterModel, sortModel],
  });

  // Mark initial load as complete after first data fetch
  useEffect(() => {
    if (productResponse && initialLoad) {
      setInitialLoad(false);
    }
  }, [productResponse, initialLoad]);

  // Get column definitions from the extracted component
  const columns = useMemo(() => {
    const filterOptions = filterResponse?.data || {};
    return createProductColumns(filterOptions, refetch);
  }, [filterResponse, refetch]);

  // Prepare rows data with useMemo
  const rows = useMemo(() => {
    const data = productResponse?.data || {};
    const products = data?.items || [];
    // Ensure each row has a stable unique identifier.
    // Backend may not always supply a `no` field; fall back to artikel or generated index.
    return products.map((prod, idx) => {
      const fallbackNo = offsetParam + idx + 1; // 1-based running number across pages
      return {
        // Provide an internal id used by DataGrid (not shown unless a column uses it)
        id: prod.id || prod.artikel || prod.no || `row-${offsetParam}-${idx}`,
        no: prod.no ?? fallbackNo,
        ...prod,
      };
    });
  }, [productResponse, offsetParam]);

  // Debug log if no rows while we do have a response payload
  useEffect(() => {
    if ((rows?.length ?? 0) === 0 && productResponse) {
      // Only log the high-level keys to avoid spamming console with large payloads
      console.debug("MasterProduct: Empty rows derived from response keys:", Object.keys(productResponse || {}));
      console.debug(
        "MasterProduct: Raw response data keys:",
        productResponse?.data && typeof productResponse.data === "object"
          ? Object.keys(productResponse.data)
          : typeof productResponse
      );
    }
  }, [rows, productResponse]);

  // Count for pagination
  const rowCount = useMemo(() => {
    const data = productResponse?.data || {};
    return data?.total_items || 0;
  }, [productResponse]);

  // Get filterable columns
  const filterableColumns = useMemo(() => {
    if (!columns) return [];
    return columns.filter((col) => col.filterable !== false);
  }, [columns]);

  // Handle filter change for dropdown
  const handleFilterChange = (field, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (value) {
      addFilter(field, value);
    } else {
      // Remove filter if value is empty
      const updatedModel = {
        ...filterModel,
        items: filterModel.items.filter((item) => item.field !== field),
      };
      handleFilterModelChange(updatedModel);
    }
  };

  // Handle removing a filter
  const handleRemoveFilter = (field) => {
    setFilterValues((prev) => ({
      ...prev,
      [field]: "",
    }));

    // Update filter model to remove the filter
    const updatedModel = {
      ...filterModel,
      items: filterModel.items.filter((item) => item.field !== field),
    };
    handleFilterModelChange(updatedModel);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setFilterValues({});
    handleFilterModelChange({
      items: [],
      logicOperator: GridLogicOperator.And,
    });
  };

  // Get available filter options for a specific field
  const getFilterOptionsForField = (field) => {
    const filterOptions = filterResponse?.data?.filter_options || {};
    if (!filterOptions?.fields?.[field]?.values) return [];
    return filterOptions.fields[field].values;
  };

  // Only show full page loading on initial load
  if (isLoading && initialLoad) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Typography variant="h6" color="error">
          Error loading products
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-grow flex-col overflow-auto p-6">
      {/* Left Filter Sidebar */}
      <Box
        component={Paper}
        elevation={2}
        sx={{
          width: "450px",
          height: "100%",
          borderRight: "1px solid #e0e0e0",
          overflow: "auto",
          p: 2,
          display: "none",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Filters
          {filterModel.items.length > 0 && (
            <Chip label={filterModel.items.length} size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Filter dropdowns stacked vertically */}
        {filterableColumns.map((column) => (
          <FormControl fullWidth variant="outlined" size="small" key={column.field} sx={{ mb: 2 }}>
            <InputLabel id={`filter-label-${column.field}`}>{column.headerName || column.field}</InputLabel>
            <Select
              labelId={`filter-label-${column.field}`}
              id={`filter-${column.field}`}
              value={filterValues[column.field] || ""}
              onChange={(e) => handleFilterChange(column.field, e.target.value)}
              label={column.headerName || column.field}
              endAdornment={
                filterValues[column.field] ? (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFilter(column.field);
                    }}
                    sx={{ marginRight: 1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {getFilterOptionsForField(column.field).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        {filterModel.items.length > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearAllFilters}
            sx={{ mt: 1 }}
            fullWidth
            startIcon={<ClearIcon />}
          >
            Clear All Filters
          </Button>
        )}
      </Box>

      <div className="mb-4 flex">
        <Typography variant="h1" gutterBottom fontWeight={600} sx={{ fontSize: "2rem" }}>
          Master Product
        </Typography>
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          className="rounded bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
          onClick={() => navigate("/addEdit-product")}
        >
          Add Product
        </button>
      </div>

      <div className="mb-4 flex justify-between">
        <div className="flex flex-col">
          {/* Active filters display */}
          {filterModel.items.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              <Typography variant="subtitle2" className="mr-2">
                Active Filters:
              </Typography>
              {filterModel.items.map(
                (filter, index) =>
                  filter.value && (
                    <Chip
                      key={`${filter.field}-${index}`}
                      label={`${
                        columns.find((col) => col.field === filter.field)?.headerName || filter.field
                      }: ${filter.value}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onDelete={() => handleRemoveFilter(filter.field)}
                    />
                  )
              )}
            </div>
          )}

          {/* Active sort display */}
          {sortModel.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Typography variant="subtitle2" className="mr-2">
                Sorting:
              </Typography>
              <Chip
                label={`${
                  columns.find((col) => col.field === sortModel[0].field)?.headerName || sortModel[0].field
                }: ${sortModel[0].sort}`}
                size="small"
                color="success"
                variant="outlined"
              />
            </div>
          )}
        </div>

        {/* Search field with direct state update */}
        <div className="mt-4 w-full max-w-md">
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            size="small"
            defaultValue={searchInputValue.current}
            onChange={(e) => {
              searchInputValue.current = e.target.value;
            }}
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
        </div>
      </div>

      {/* DataGrid - unchanged structure */}
      <div className="w-full overflow-auto">
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          // Use multiple fallbacks for row id to avoid blank grid when specific field is absent
          getRowId={(p) => p.id || p.no || p.artikel}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel,
            },
            filter: {
              filterModel: {
                ...filterModel,
                logicOperator: GridLogicOperator.And,
              },
            },
            sorting: {
              sortModel,
            },
          }}
          // Pagination settings - unchanged
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
          // Filter settings
          disableColumnFilter // Disable default column filters since we're using custom sidebar
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          // Sorting settings - unchanged
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={handleSortModelChange}
          // Styling
          rowHeight={100}
          sx={{
            boxShadow: 1,
            border: 1,
            borderColor: "divider",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.9rem",
            },
            // Enable horizontal scrolling for the grid
            "& .MuiDataGrid-main": {
              overflow: "auto",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflow: "auto",
              // Customize scrollbars
              "&::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
