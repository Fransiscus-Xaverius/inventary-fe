import { useCallback } from "react";
import { useSnackbar } from "notistack";
import useApiRequest from "../../../../hooks/useApiRequest";

/**
 * Wrap POST / PUT product submission with notistack notifications.
 *
 * @param {boolean} isEdit – true when updating existing product
 * @param {string} artikel  – artikel id used for PUT endpoint
 * @returns {object} { submit, isLoading, error }
 */
export default function useProductMutation({ isEdit, artikel }) {
  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isLoading, error } = useApiRequest({
    url: isEdit ? `/api/admin/products/${artikel}` : "/api/admin/products",
    method: isEdit ? "PUT" : "POST",
  });

  // Wrap the original mutate to inject snackbars.
  const submit = useCallback(
    (payload, callbacks = {}) => {
      mutate(payload, {
        onSuccess: (data) => {
          enqueueSnackbar(`Product ${isEdit ? "updated" : "created"} successfully`, {
            variant: "success",
          });
          callbacks.onSuccess?.(data);
        },
        onError: (err) => {
          const message = err?.response?.data?.error || "Failed to save product";
          enqueueSnackbar(message, { variant: "error" });
          callbacks.onError?.(err);
        },
        onSettled: callbacks.onSettled,
      });
    },
    [enqueueSnackbar, isEdit, mutate]
  );

  return { submit, isLoading, error };
}
