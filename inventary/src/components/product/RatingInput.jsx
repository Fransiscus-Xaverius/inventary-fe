import React, { useState, useCallback } from "react";
import { Controller } from "react-hook-form";
import { Box, Grid, Typography, IconButton, Chip, TextField } from "@mui/material";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import AddIcon from "@mui/icons-material/Add";
import ThumbUp from "@mui/icons-material/ThumbUp";
import Handshake from "@mui/icons-material/Handshake";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import SnowshoeingIcon from "@mui/icons-material/Snowshoeing";

/**
 * RatingInput Component
 *
 * Renders rating input with:
 * - Star buttons for comfort, style, support (0-10 scale)
 * - Chip-based input for purpose categories
 *
 * @param {Object} control - React Hook Form control object
 * @param {Object} errors - Form validation errors
 */
export default function RatingInput({ control, errors }) {
  // Star Rating Component
  const StarRating = ({ label, value, onChange, error, icon }) => {
    const [hoveredValue, setHoveredValue] = useState(null);
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
            {icon}
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                ml: 1,
                fontSize: 18,
                fontWeight: 600,
                pointerEvents: "none",
                userSelect: "none",
              }}
              className="text-gray-700"
            >
              {label}
            </Typography>
          </Box>
          {error && (
            <Typography variant="caption" color="error" className="mt-1">
              {error.message}
            </Typography>
          )}
        </Box>
        <Box sx={{ minWidth: "85%" }}>
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            return (
              <IconButton
                key={index}
                size="small"
                onClick={() => onChange(starValue)}
                className="p-1"
                onMouseEnter={() => {
                  setHoveredValue(starValue);
                }}
                onMouseLeave={() => {
                  setHoveredValue(null);
                }}
                sx={{
                  color:
                    hoveredValue == null && starValue <= value
                      ? "#1976d2"
                      : hoveredValue != null && hoveredValue >= starValue
                        ? "#3050c2"
                        : "#e0e0e0",
                }}
              >
                {(hoveredValue == null && starValue <= value) || hoveredValue >= starValue ? (
                  <StarIcon fontSize="large" />
                ) : (
                  <StarOutlineIcon fontSize="large" />
                )}
              </IconButton>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Purpose Chip Input Component
  const PurposeChipInput = ({ field, error }) => {
    const { value = [], onChange } = field;
    const [purposeInput, setPurposeInput] = useState("");

    const handleAddPurpose = useCallback(() => {
      if (purposeInput.trim() && !value.includes(purposeInput.trim())) {
        onChange([...value, purposeInput.trim()]);
        setPurposeInput("");
      }
    }, [purposeInput, value, onChange]);

    const handleRemovePurpose = useCallback(
      (indexToRemove) => {
        onChange(value.filter((_, index) => index !== indexToRemove));
      },
      [value, onChange]
    );

    const handleKeyPress = useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddPurpose();
        }
      },
      [handleAddPurpose]
    );

    return (
      <Box className="mb-4 flex flex-col gap-2">
        <span className="mb-2 flex flex-row items-center gap-2">
          <SnowshoeingIcon />
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              ml: 1,
              fontSize: 18,
              fontWeight: 600,
              pointerEvents: "none",
              userSelect: "none",
            }}
            className="text-gray-700"
          >
            Purpose Categories
          </Typography>
        </span>

        {/* Display existing chips */}
        <Box className="mb-2 flex flex-wrap gap-2">
          {value.map((purpose, index) => (
            <Chip
              key={index}
              label={purpose}
              onDelete={() => handleRemovePurpose(index)}
              color="primary"
              variant="outlined"
              size="medium"
            />
          ))}
        </Box>

        {/* Input for new purpose */}
        <Box className="flex items-center gap-2">
          <TextField
            size="small"
            value={purposeInput}
            onChange={(e) => setPurposeInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type purpose and press Enter..."
            variant="outlined"
            className="flex-1"
          />
          <IconButton onClick={handleAddPurpose} disabled={!purposeInput.trim()} color="primary" size="small">
            <AddIcon />
          </IconButton>
        </Box>

        {error && (
          <Typography variant="caption" color="error" className="mt-1">
            {error.message}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <div className="flex flex-col md:col-span-2">
      <span className="text-md mb-4 font-medium text-gray-700">Product Rating</span>

      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
        <Box
          className="grid grid-cols-1 gap-6 rounded-lg border border-gray-300 bg-gray-50 p-4"
          sx={{ width: "100%", height: "100%" }}
        >
          {/* Comfort Rating */}
          <Controller
            name="rating.comfort"
            control={control}
            render={({ field }) => (
              <StarRating
                field={field}
                icon={<ThumbUp fontSize="medium" />}
                label="Comfort"
                value={field.value || 0}
                onChange={field.onChange}
                error={errors?.rating?.comfort}
              />
            )}
          />

          {/* Style Rating */}
          <Controller
            name="rating.style"
            control={control}
            render={({ field }) => (
              <StarRating
                field={field}
                icon={<AutoAwesome fontSize="medium" />}
                label="Style"
                value={field.value || 0}
                onChange={field.onChange}
                error={errors?.rating?.style}
              />
            )}
          />

          {/* Support Rating */}
          <Controller
            name="rating.support"
            control={control}
            render={({ field }) => (
              <StarRating
                field={field}
                icon={<Handshake fontSize="medium" />}
                label="Support"
                value={field.value || 0}
                onChange={field.onChange}
                error={errors?.rating?.support}
              />
            )}
          />
        </Box>

        {/* Purpose Categories - Full Width */}
        <Box className="rounded-lg border border-gray-300 bg-gray-50 p-4" sx={{ width: "100%", height: "100%" }}>
          <Controller
            name="rating.purpose"
            control={control}
            render={({ field }) => <PurposeChipInput field={field} error={errors?.rating?.purpose} />}
          />
        </Box>
      </Box>

      {/* Overall rating error */}
      {errors?.rating?.message && (
        <Typography variant="caption" color="error" className="mt-2">
          {errors.rating.message}
        </Typography>
      )}
    </div>
  );
}
