import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Custom hook for managing product search functionality with URL synchronization
 *
 * @returns {Object} Search management methods and state
 */
export function useProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("q") || "";

  // Non-debounced search handler - executes immediately
  const handleSearchChange = useCallback(
    (value) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          if (value && value.trim() !== "") {
            newParams.set("q", value);
          } else {
            // Remove search param if empty
            newParams.delete("q");
          }
          newParams.set("offset", "0"); // Reset to first page on search
          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Handle quick filter changes from DataGrid component
  const handleQuickFilterChange = useCallback(
    (values) => {
      if (values && values.length > 0) {
        handleSearchChange(values.join(" "));
      } else {
        handleSearchChange("");
      }
    },
    [handleSearchChange]
  );

  return {
    searchParam,
    handleSearchChange,
    handleQuickFilterChange,
  };
}

export default useProductSearch;
