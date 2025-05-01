import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useApiRequest from "../hooks/useApiRequest";
import SidebarDashboard from "../components/SidebarDashboard";
import { DataGrid } from "@mui/x-data-grid";
import { CircularProgress, TextField, Typography } from "@mui/material";

export default function MasterProduct() {
  // Ambil offset & limit dari URL
  const [searchParams, setSearchParams] = useSearchParams();
  const offsetParam = Number(searchParams.get("offset")) || 0;
  const limitParam = Number(searchParams.get("limit")) || 10;

  // State untuk controlled pagination
  const [paginationModel, setPaginationModel] = useState({
    page: Math.floor(offsetParam / limitParam),
    pageSize: limitParam,
  });

  // Fetch data via hook (akan re-fetch saat offsetParam/limitParam berubah)
  const { data, isLoading, error } = useApiRequest({
    url: `/api/products?offset=${offsetParam}&limit=${limitParam}`,
    queryKey: ["products", offsetParam, limitParam],
  });

  // Sync paginationModel jika URL diubah manual
  useEffect(() => {
    setPaginationModel({
      page: Math.floor(offsetParam / limitParam),
      pageSize: limitParam,
    });
  }, [offsetParam, limitParam]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Handle perubahan page atau pageSize
  const handlePaginationModelChange = (model) => {
    setPaginationModel(model);
    setSearchParams({
      offset: model.page * model.pageSize,
      limit: model.pageSize,
    });
  };

  // Handle input search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  if (isLoading) {
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

  // Definisi kolom DataGrid
  const columns = [
    { field: "artikel", headerName: "Artikel", width: 150 },
    { field: "warna", headerName: "Warna", width: 120 },
    { field: "size", headerName: "Size", width: 80 },
    { field: "grup", headerName: "Grup", width: 120 },
    { field: "unit", headerName: "Unit", width: 120 },
    { field: "kat", headerName: "Kategori", width: 150 },
    { field: "model", headerName: "Model", width: 120 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "tipe", headerName: "Tipe", width: 120 },
    { field: "harga", headerName: "Harga", width: 120, type: "number" },
    { field: "tanggal_produk", headerName: "Tanggal Produk", width: 150 },
    { field: "tanggal_terima", headerName: "Tanggal Terima", width: 150 },
    { field: "usia", headerName: "Usia", width: 100 },
    { field: "status", headerName: "Status", width: 120 },
    { field: "supplier", headerName: "Supplier", width: 150 },
    { field: "diupdate_oleh", headerName: "Diupdate Oleh", width: 150 },
    { field: "tanggal_update", headerName: "Tanggal Update", width: 150 },
  ];

  // Filter data berdasarkan searchQuery
  const filteredProducts = (data.products || []).filter((prod) =>
    Object.values(prod).some((val) =>
      String(val).toLowerCase().includes(searchQuery)
    )
  );

  // Siapkan rows untuk DataGrid
  const rows = filteredProducts.map((prod, idx) => ({ id: idx, ...prod }));

  return (
    <div className="h-screen w-screen flex">
      <SidebarDashboard />

      <div className="flex-grow h-full p-4 overflow-hidden">
        <Typography variant="h4" gutterBottom>
          Master Product
        </Typography>

        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          onChange={handleSearchChange}
          className="mb-4"
        />

        <div
          className="h-full w-full overflow-auto"
          style={{
            maxHeight: "calc(100vh - 128px)",
            overflowX: "auto",
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={(data.total_page || 0) * paginationModel.pageSize}
            loading={isLoading}
            sx={{
              boxShadow: 3,
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
