import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook for managing product filters with URL synchronization
 *
 * @param {Array} filterFields - List of filter fields to support
 * @returns {Object} Filter management methods and state
 */
export function useProductFilters(filterFields) {
	const [searchParams, setSearchParams] = useSearchParams();

	// Initialize filter model from URL params
	const [filterModel, setFilterModel] = useState(() => {
		const initialFilters = { items: [] };

		filterFields.forEach((field) => {
			const fieldValue = searchParams.get(field);
			if (fieldValue) {
				initialFilters.items.push({
					field,
					operator: "equals",
					value: fieldValue,
				});
			}
		});

		return initialFilters;
	});

	// Build query string for filters
	const buildFilterQueryString = useCallback(() => {
		let filterQueryParams = "";

		if (filterModel?.items?.length > 0) {
			filterModel.items.forEach((filter) => {
				if (filterFields.includes(filter.field) && filter.value) {
					filterQueryParams += `&${filter.field}=${encodeURIComponent(
						filter.value
					)}`;
				}
			});
		}

		return filterQueryParams;
	}, [filterModel, filterFields]);

	// Handle filter model changes
	const handleFilterModelChange = useCallback(
		(model) => {
			setFilterModel(model);

			// Update URL parameters with filter values
			setSearchParams(
				(prev) => {
					const newParams = new URLSearchParams(prev);

					// First clear all existing filter params
					filterFields.forEach((field) => {
						if (newParams.has(field)) {
							newParams.delete(field);
						}
					});

					// Then set the new filter params
					model.items.forEach((filter) => {
						if (filterFields.includes(filter.field) && filter.value) {
							newParams.set(filter.field, filter.value);
						}
					});

					// Reset offset when filters change
					newParams.set("offset", "0");

					// Preserve search query if it exists
					const searchQuery = prev.get("q");
					if (searchQuery) {
						newParams.set("q", searchQuery);
					}

					return newParams;
				},
				{ replace: true }
			);
		},
		[setSearchParams, filterFields]
	);

	// Add an active filter or update an existing one
	const addFilter = useCallback(
		(field, value) => {
			// Clone current filter model
			const updatedModel = {
				...filterModel,
				items: [...filterModel.items],
			};

			// Check if filter already exists for this field
			const existingFilterIndex = updatedModel.items.findIndex(
				(filter) => filter.field === field
			);

			if (existingFilterIndex >= 0) {
				// Update existing filter
				updatedModel.items[existingFilterIndex] = {
					field,
					operator: "equals",
					value,
				};
			} else {
				// Add new filter
				updatedModel.items.push({
					field,
					operator: "equals",
					value,
				});
			}

			// Apply the filter
			handleFilterModelChange(updatedModel);
		},
		[filterModel, handleFilterModelChange]
	);

	return {
		filterModel,
		setFilterModel,
		handleFilterModelChange,
		buildFilterQueryString,
		addFilter,
	};
}

export default useProductFilters;
