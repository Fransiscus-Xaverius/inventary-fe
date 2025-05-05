import React, { useState, useEffect, useMemo } from "react";
import {
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridLogicOperator } from "@mui/x-data-grid";
import { PRODUCT_FILTER_FIELDS } from "../constants/filterFields";
import useApiRequest from "../hooks/useApiRequest";
import useProductFilters from "../hooks/useProductFilters";
import useProductPagination from "../hooks/useProductPagination";
import useProductSearch from "../hooks/useProductSearch";
import useProductSorting from "../hooks/useProductSorting";
import { createProductColumns } from "../components/product/ProductColumns";
import SidebarDashboard from "../components/SidebarDashboard";

export default function MasterProduct() {
  // Track initial load vs subsequent loads
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState("");

  // Use custom hooks for pagination, filtering, search, and sorting
  const {
    paginationModel,
    handlePaginationModelChange,
    offsetParam,
    limitParam,
  } = useProductPagination();

  const { filterModel, handleFilterModelChange, buildFilterQueryString } =
    useProductFilters(PRODUCT_FILTER_FIELDS);

  const { searchParam, handleSearchChange } = useProductSearch();

  const { sortModel, handleSortModelChange, buildSortQueryString } =
    useProductSorting();

  // Fetch available filter options
  const { data: filterOptions } = useApiRequest({
    url: "/api/filters",
    queryKey: ["filterOptions"],
  });

  // Initialize search input from URL parameter
  useEffect(() => {
    setSearchInputValue(searchParam);
  }, [searchParam]);

  // Handle search input change with Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchChange(searchInputValue);
    }
  };

  // API request with URL parameters using a stable URL reference
  const searchUrl = useMemo(() => {
    const filterParams = buildFilterQueryString();
    const sortParams = buildSortQueryString();
    const searchQuery = searchParam
      ? `q=${encodeURIComponent(searchParam)}`
      : "";
    const baseParams = `offset=${offsetParam}&limit=${limitParam}`;

    // Construct URL with all parameters
    let url = `/api/products?${baseParams}`;

    if (searchQuery) {
      url += `&${searchQuery}`;
    }

    url += filterParams;
    url += sortParams;

    return url;
  }, [
    searchParam,
    offsetParam,
    limitParam,
    buildFilterQueryString,
    buildSortQueryString,
  ]);

  const { data, isLoading, error } = useApiRequest({
    url: searchUrl,
    queryKey: [
      "products",
      searchParam,
      offsetParam,
      limitParam,
      filterModel,
      sortModel,
    ],
  });

  // Mark initial load as complete after first data fetch
  useEffect(() => {
    if (data && initialLoad) {
      setInitialLoad(false);
    }
  }, [data, initialLoad]);

  // Get column definitions from the extracted component
  const columns = useMemo(
    () => createProductColumns(filterOptions),
    [filterOptions]
  );

  // Prepare rows data with useMemo
  const rows = useMemo(() => {
    const products = data?.products || [];
    return products.map((prod) => ({ ...prod }));
  }, [data]);

  // Count for pagination
  const rowCount = useMemo(
    () => (data?.total_page || 0) * paginationModel.pageSize,
    [data, paginationModel.pageSize]
  );

  // Only show full page loading on initial load
  if (isLoading && initialLoad) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Typography variant="h6" color="error">
          Error loading products
        </Typography>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex">
      <SidebarDashboard />

      <div className="flex flex-col flex-grow h-full p-4 overflow-hidden">
        <div className="flex mb-4">
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Master Product
          </Typography>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex flex-col">
            {/* Active filters display */}
            {filterModel.items.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <Typography variant="subtitle2" className="mr-2">
                  Active Filters:
                </Typography>
                {filterModel.items.map(
                  (filter, index) =>
                    filter.value && (
                      <span
                        key={`${filter.field}-${index}`}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded"
                      >
                        {filter.field}: {filter.value} ({filter.operator})
                      </span>
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
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                  {sortModel[0].field} ({sortModel[0].sort})
                </span>
              </div>
            )}
          </div>

          {/* Custom search field */}
          <div className="w-full max-w-md mt-4">
            <TextField
              label="Search Products"
              variant="outlined"
              fullWidth
              size="small"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleSearchKeyDown} // Trigger search on Enter key
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

        <div className="flex-grow w-full overflow-auto">
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={rowCount}
            getRowId={(p) => p.no}
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
            // Pagination settings
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 25, 50, 100]}
            // Filter settings
            filterMode="server"
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            // Sorting settings
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            // Styling
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
            }}
          />
        </div>
      </div>
    </div>
  );
}
