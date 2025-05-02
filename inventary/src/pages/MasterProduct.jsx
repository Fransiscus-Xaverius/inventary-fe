import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import useApiRequest from "../hooks/useApiRequest";
import SidebarDashboard from "../components/SidebarDashboard";
import { DataGrid } from "@mui/x-data-grid";
import { CircularProgress, Typography } from "@mui/material";

export default function MasterProduct() {
	// Get URL parameters
	const [searchParams, setSearchParams] = useSearchParams();
	const offsetParam = Number(searchParams.get("offset")) || 0;
	const limitParam = Number(searchParams.get("limit")) || 10;
	const searchParam = searchParams.get("q") || "";

	// Track initial load vs subsequent loads
	const [initialLoad, setInitialLoad] = useState(true);

	// Local state for pagination
	const [paginationModel, setPaginationModel] = useState({
		page: Math.floor(offsetParam / limitParam),
		pageSize: limitParam,
	});

	// API request with URL parameters using a stable URL reference
	const searchUrl = useMemo(
		() =>
			`/api/products?q=${searchParam}&offset=${offsetParam}&limit=${limitParam}`,
		[searchParam, offsetParam, limitParam]
	);

	const { data, isLoading, error } = useApiRequest({
		url: searchUrl,
		queryKey: ["products", searchParam, offsetParam, limitParam],
	});

	// Mark initial load as complete after first data fetch
	useEffect(() => {
		if (data && initialLoad) {
			setInitialLoad(false);
		}
	}, [data, initialLoad]);

	// Debounced search handler
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleSearchChange = useCallback(
		debounce((value) => {
			setSearchParams(
				(prev) => {
					const newParams = new URLSearchParams(prev);
					newParams.set("q", value);
					newParams.set("offset", "0"); // Reset to first page on search
					return newParams;
				},
				{ replace: true }
			);
		}, 500),
		[setSearchParams]
	);

	// Handle pagination change
	const handlePaginationModelChange = useCallback(
		(model) => {
			setPaginationModel(model);
			setSearchParams(
				(prev) => {
					const newParams = new URLSearchParams(prev);
					newParams.set("offset", String(model.page * model.pageSize));
					newParams.set("limit", String(model.pageSize));
					return newParams;
				},
				{ replace: true }
			);
		},
		[setSearchParams]
	);

	// Memoize columns definition
	const columns = useMemo(
		() => [
			{ field: "no", headerName: "ID", width: 90 },
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
		],
		[]
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

	// Sync pagination model with URL params if changed externally
	useEffect(() => {
		setPaginationModel({
			page: Math.floor(offsetParam / limitParam),
			pageSize: limitParam,
		});
	}, [offsetParam, limitParam]);

	// Only show full page loading on initial load
	if (isLoading && initialLoad) {
		return (
			<div className='flex justify-center items-center h-screen w-screen'>
				<CircularProgress />
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex justify-center items-center h-screen w-screen'>
				<Typography variant='h6' color='error'>
					Error loading products
				</Typography>
			</div>
		);
	}

	return (
		<div className='h-screen w-screen flex'>
			<SidebarDashboard />

			<div className='flex flex-col flex-grow h-full p-4 overflow-hidden'>
				<Typography variant='h4' gutterBottom fontWeight={600}>
					Master Product
				</Typography>

				<div className='flex-grow w-full'>
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
						}}
						// Pagination settings
						pagination
						paginationMode='server'
						paginationModel={paginationModel}
						onPaginationModelChange={handlePaginationModelChange}
						pageSizeOptions={[10, 25, 50, 100]}
						// Updated toolbar configuration using slots API
						showToolbar
						slotProps={{
							toolbar: {
								showQuickFilter: true,
								quickFilterProps: {
									debounceMs: 200,
								},
							},
						}}
						// Connect the filter value to the URL search parameter
						filterMode='server'
						disableColumnFilter={false}
						onFilterModelChange={(filterModel) => {
							// When the quick filter text changes
							if (
								filterModel.quickFilterValues &&
								filterModel.quickFilterValues.length > 0
							) {
								handleSearchChange(filterModel.quickFilterValues.join(" "));
							} else {
								handleSearchChange("");
							}
						}}
						// Stylings
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
