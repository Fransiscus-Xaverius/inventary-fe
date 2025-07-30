import { useCallback } from "react";
import { useSnackbar } from "notistack";
import useApiRequest from "../../../../hooks/useApiRequest";
import { formatMarketplace, formatDateForApi, parseGambar } from "../helpers";

/**
 * Wrap POST / PUT product submission with notistack notifications.
 *
 * @param {boolean} isEdit – true when updating existing product
 * @param {string} artikel  – artikel id used for PUT endpoint
 * @returns {object} { submit, isLoading, error }
 */
export default function useProductMutation({ isEdit, artikel, onSuccess }) {
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

  // Form submission handler
  const onSubmit = useCallback(
    (data) => {
      // Process data for API submission
      const processedData = {
        artikel: data.artikel,
        nama: data.nama,
        deskripsi: data.deskripsi,
        warna: Array.isArray(data.warna) ? data.warna.join(",") : data.warna,
        size: data.size,
        grup: data.grup,
        unit: data.unit,
        kat: data.kat,
        model: data.model,
        gender: data.gender,
        tipe: data.tipe,
        harga: Number(data.harga),
        harga_diskon: Number(data.harga_diskon),
        marketplace: formatMarketplace(data.marketplace),
        tanggal_produk: formatDateForApi(data.tanggal_produk),
        tanggal_terima: formatDateForApi(data.tanggal_terima),
        status: data.status ? data.status.toLowerCase() : "",
        // status: data.status,
        supplier: data.supplier,
        diupdate_oleh: data.diupdate_oleh,
        ...parseGambar(data.gambar),
      };

      let submissionData;

      const formData = new FormData();
      Object.keys(processedData).forEach((key) => {
        formData.append(key, processedData[key]);
      });
      submissionData = formData;

      submit(submissionData, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    },
    [onSuccess, submit]
  );

  return { onSubmit, isLoading, error };
}
