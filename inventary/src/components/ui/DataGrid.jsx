import { DataGrid, GridPagination, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";

export default function DataGridComponent({
  columns,
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
}) {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
      }}
    >
      <DataGrid
        rows={rows}
        rowCount={rowCount}
        columns={columns}
        getRowHeight={() => "auto"}
        loading={loading}
        autosizeOptions={{
          includeOutliers: true,
          includeHeaders: true,
        }}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
        filterMode="server"
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        density="compact"
        disableRowSelectionOnClick
        resetPageOnSortFilter
        disableColumnMenu
        disableDensitySelector
        disableColumnFilter
        sx={{
          boxShadow: 1,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            fontWeight: "bold",
          },
          [`& .MuiDataGrid-cell:focus-within`]: {
            outline: "none !important",
          },

          // ✅ Remove blue border on selected cell
          [`& .MuiDataGrid-cell:focus`]: {
            outline: "none !important",
          },
          [`& .MuiDataGrid-cell`]: {
            whiteSpace: "normal",
            wordBreak: "break-word",
            py: 1,
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
    </Box>
  );
}

DataGridComponent.propTypes = {};

DataGridComponent.defaultProps = {};
