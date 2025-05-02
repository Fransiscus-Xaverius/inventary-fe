import { useCallback, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook for managing product data pagination with URL synchronization
 *
 * @returns {Object} Pagination management methods and state
 */
export function useProductPagination() {
	const [searchParams, setSearchParams] = useSearchParams();
	const offsetParam = Number(searchParams.get("offset")) || 0;
	const limitParam = Number(searchParams.get("limit")) || 10;

	// Local state for pagination
	const [paginationModel, setPaginationModel] = useState({
		page: Math.floor(offsetParam / limitParam),
		pageSize: limitParam,
	});

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

	// Sync pagination model with URL params if changed externally
	useEffect(() => {
		setPaginationModel({
			page: Math.floor(offsetParam / limitParam),
			pageSize: limitParam,
		});
	}, [offsetParam, limitParam]);

	return {
		paginationModel,
		setPaginationModel,
		handlePaginationModelChange,
		offsetParam,
		limitParam,
	};
}

export default useProductPagination;
