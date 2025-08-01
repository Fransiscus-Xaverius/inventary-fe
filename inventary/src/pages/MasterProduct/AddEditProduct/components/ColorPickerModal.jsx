import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Modal for selecting multiple colors with deduplication.
 * Extracted from the legacy AddEditProduct color selection logic.
 */
export default function ColorPickerModal({ open, onClose, colors = [], selectedColors = [], onSave }) {
  const [colorSelections, setColorSelections] = useState(() => {
    // Initialize with current selections or empty array with one dropdown
    return selectedColors.length > 0 ? [...selectedColors] : [""];
  });

  const handleColorSelectionChange = (index, colorId) => {
    const newSelections = [...colorSelections];
    newSelections[index] = colorId;
    setColorSelections(newSelections);
  };

  const handleAddColorDropdown = () => {
    setColorSelections([...colorSelections, ""]);
  };

  const handleRemoveColorDropdown = (index) => {
    const newSelections = [...colorSelections];
    newSelections.splice(index, 1);
    setColorSelections(newSelections);
  };

  const handleSave = () => {
    // Filter out empty selections and duplicates
    const validSelections = colorSelections
      .filter((id) => id !== "")
      .filter((id, index, self) => self.indexOf(id) === index);

    onSave(validSelections);
    onClose();
  };

  const getColorById = (colorId) => {
    return colors.find((color) => color.id === parseInt(colorId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Daftar Warna
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <div className="flex flex-col space-y-3">
          {colorSelections.map((selectedId, index) => (
            <div key={index} className="flex items-center space-x-2">
              <select
                value={selectedId}
                onChange={(e) => handleColorSelectionChange(index, e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Pilih warna</option>
                {colors
                  .filter(
                    (color) =>
                      // Show color if it's the current selection or not selected in other dropdowns
                      color.id === selectedId ||
                      !colorSelections.includes(color.id) ||
                      colorSelections.indexOf(color.id) === index
                  )
                  .map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.nama}
                    </option>
                  ))}
              </select>

              {/* Color preview */}
              {selectedId && (
                <div
                  className="h-8 w-8 rounded-sm border border-gray-300"
                  style={{
                    backgroundColor: getColorById(selectedId)?.hex || "#FFFFFF",
                  }}
                ></div>
              )}

              {/* Remove button */}
              {colorSelections.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveColorDropdown(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          {/* Add button */}
          <button
            type="button"
            onClick={handleAddColorDropdown}
            className="mt-2 flex items-center self-start rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300"
          >
            <span className="mr-1 text-lg">+</span> Add Color
          </button>
        </div>
      </DialogContent>
      <DialogActions>
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );
}
