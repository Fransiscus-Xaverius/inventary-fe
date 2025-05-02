import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook for managing product sorting with URL synchronization
 *
 * @returns {Object} Sorting management methods and state
 */
export function useProductSorting() {
	const [searchParams, setSearchParams] = useSearchParams();

	// Initialize sorting model from URL params
	const initialSortField = searchParams.get("sort") || "";
	const initialSortOrder = searchParams.get("order") || "asc";

	const [sortModel, setSortModel] = useState(
		initialSortField
			? [{ field: initialSortField, sort: initialSortOrder }]
			: []
	);

	// Build query string for sorting
	const buildSortQueryString = useCallback(() => {
		if (sortModel && sortModel.length > 0) {
			const { field, sort } = sortModel[0];
			return `&sort=${field}&order=${sort}`;
		}
		return "";
	}, [sortModel]);

	// Handle sort model changes
	const handleSortModelChange = useCallback(
		(model) => {
			setSortModel(model);

			// Update URL parameters with sort values
			setSearchParams(
				(prev) => {
					const newParams = new URLSearchParams(prev);

					// Clear existing sort params
					if (newParams.has("sort")) newParams.delete("sort");
					if (newParams.has("order")) newParams.delete("order");

					// Set new sort params if available
					if (model && model.length > 0) {
						const { field, sort } = model[0];
						newParams.set("sort", field);
						newParams.set("order", sort);
					}

					return newParams;
				},
				{ replace: true }
			);
		},
		[setSearchParams]
	);

	return {
		sortModel,
		setSortModel,
		handleSortModelChange,
		buildSortQueryString,
	};
}

export default useProductSorting;
