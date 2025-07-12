import React from "react";
import { Chip, Box } from "@mui/material";
import useApiRequest from "../hooks/useApiRequest";
import { CircularProgress, Typography } from "@mui/material";

/**
 * Determines whether to use white or black text based on background color brightness
 * @param {string} backgroundColor - Hex color code including the # symbol
 * @returns {string} - 'white' for dark backgrounds, 'black' for light backgrounds
 */
const getContrastTextColor = (backgroundColor) => {
  // Default to white if no color provided
  if (!backgroundColor) return "white";

  // Remove # if present
  const hex = backgroundColor.replace("#", "");

  // Convert hex to RGB
  let r, g, b;
  if (hex.length === 3) {
    // For 3-digit hex codes
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // For 6-digit hex codes
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    // Invalid hex code, default to white
    return "white";
  }

  // Calculate luminance - using the ITU-R BT.709 formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Return white for dark colors, black for light colors
  return luminance < 150 ? "white" : "black";
};

/**
 * A single category chip component
 * @param {Object} props - Component props
 * @param {string} props.label - The text to display in the chip
 * @returns {React.ReactElement} A chip component with the appropriate styling
 */
export const CategoryChip = ({ label, color }) => {
  if (!label) return null;

  // Determine the appropriate text color based on background color
  const textColor = getContrastTextColor(color);

  return (
    <Chip
      label={label}
      size="medium"
      sx={{
        bgcolor: color,
        color: color ? textColor : "#000000",
        fontWeight: "bold",
        border: label === "Putih" || color === "#ffffff" ? "1px solid rgba(0, 0, 0, 0.20)" : "",
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

  const {
    response: categoryResponse,
    isLoading,
    error,
  } = useApiRequest({
    url: `/api/category-colors/${params.field}/${label}`,
    queryKey: ["category-colors", params.field, label],
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading category color</Typography>;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        alignItems: "center",
        height: "100%",
      }}
    >
      <CategoryChip label={label} color={categoryResponse?.data?.kode_warna} />
    </Box>
  );
};

/**
 * A cell component that displays a color chip
 * @param {Object} props - Component props
 * @param {Object} props.params - The DataGrid params object
 * @returns {React.ReactElement} A cell with one or more color chips
 */
export const ColorCell = ({ params }) => {
  if (params.row["colors"] === null) return null;

  const colors = params.row["colors"];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        alignItems: "center",
        height: "100%",
      }}
    >
      {colors.map((color) => (
        <CategoryChip key={color.id} label={color.name} color={color.hex} />
      ))}
    </Box>
  );
};

// Custom renderer for Size column to display comma-separated values as multiple CategoryCells
export const SizeCell = ({ params }) => {
  if (!params.value) return null;

  // Split the comma-separated size string
  const sizes = params.value
    .split(",")
    .map((size) => size.trim())
    .sort((a, b) => a.localeCompare(b));

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        alignItems: "center",
        height: "100%",
      }}
    >
      {sizes.map((size, index) => (
        <CategoryChip key={index} label={size} />
      ))}
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

  // Default colors if not provided elsewhere
  const defaultColors = {
    kat: "#3f51b5", // Indigo
    gender: "#f50057", // Pink
    tipe: "#4caf50", // Green
  };

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
      {kat && <CategoryChip label={kat} color={defaultColors.kat} />}
      {gender && <CategoryChip label={gender} color={defaultColors.gender} />}
      {tipe && <CategoryChip label={tipe} color={defaultColors.tipe} />}
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
