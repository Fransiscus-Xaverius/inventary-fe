import React from "react";
import { Chip } from "@mui/material";

function getContrastYIQ(hexcolor) {
  // Remove # if present
  hexcolor = hexcolor.replace("#", "");

  // Convert r, g, b
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);

  // Calculate luminance
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Return text color based on brightness
  return yiq >= 128 ? "#000" : "#fff";
}

const AutoColoredChip = ({ value }) => {
  const textColor = getContrastYIQ(value);

  return (
    <Chip
      label={value}
      style={{
        backgroundColor: value,
        color: textColor,
        border: "1px solid",
      }}
    />
  );
};

export default AutoColoredChip;
