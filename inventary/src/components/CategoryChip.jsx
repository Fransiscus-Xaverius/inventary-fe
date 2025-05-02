import React from "react";
import { Chip, Box } from "@mui/material";
import { getCategoryColor } from "../constants/categoryColors";

/**
 * A single category chip component
 * @param {Object} props - Component props
 * @param {string} props.label - The text to display in the chip
 * @returns {React.ReactElement} A chip component with the appropriate styling
 */
export const CategoryChip = ({ label }) => {
	if (!label) return null;

	return (
		<Chip
			label={label}
			size='small'
			sx={{
				bgcolor: getCategoryColor(label),
				color: "white",
				fontWeight: "medium",
			}}
		/>
	);
};

/**
 * A cell component that displays multiple category chips
 * @param {Object} props - Component props
 * @param {Object} props.params - The DataGrid params object
 * @returns {React.ReactElement} A cell with one or more chips
 */
export const CategoryCell = ({ params }) => {
	const label = params.row[params.field] || "";
	if (!label) return null;

	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				gap: 0.5,
				alignContent: "center",
				height: "100%",
			}}
		>
			<CategoryChip label={label} />
		</Box>
	);
};

/**
 * A cell component that displays multiple category chips (one for each category type)
 * @param {Object} props - Component props
 * @param {Object} props.params - The DataGrid params object containing row data
 * @returns {React.ReactElement} - A cell with multiple category chips
 */
export const CombinedCategoryCell = ({ params }) => {
	const kat = params.row.kat || "";
	const gender = params.row.gender || "";
	const tipe = params.row.tipe || "";

	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				gap: 0.5,
				alignContent: "center",
				height: "100%",
			}}
		>
			{kat && <CategoryChip label={kat} />}
			{gender && <CategoryChip label={gender} />}
			{tipe && <CategoryChip label={tipe} />}
		</Box>
	);
};

/**
 * Helper function to get combined category value for search/filter
 * @param {Object} params - DataGrid params containing the row data
 * @returns {string} - Combined category values as a space-separated string
 */
export const getCombinedCategoryValue = (params) => {
	const kat = params.row.kat || "";
	const gender = params.row.gender || "";
	const tipe = params.row.tipe || "";
	return `${kat} ${gender} ${tipe}`.trim().toLowerCase();
};
