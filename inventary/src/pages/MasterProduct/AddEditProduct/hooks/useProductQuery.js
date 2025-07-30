import { useEffect, useMemo } from "react";

import useApiRequest from "../../../../hooks/useApiRequest";

/**
 * Fetch a single product by artikel when in edit mode.
 *
 * @param {string | undefined} artikel – product identifier (may be undefined for add mode)
 * @returns {object} { product, isLoading, error }
 */
export default function useProductQuery(artikel, options, setSelectedColors, reset) {
  const isEdit = Boolean(artikel);

  const { response, isLoading, error, refetch } = useApiRequest({
    url: `/api/admin/products/${artikel}`,
    queryKey: ["product", artikel],
    enableQuery: isEdit,
  });

  // The API returns { data: { /* product */ } }
  const product = useMemo(() => response?.data ?? null, [response]);

  const shouldPopulateForm = useMemo(
    () => isEdit && product && Object.keys(options).every((key) => options[key].length > 0),
    [isEdit, product, options]
  );

  // Populate form when editing
  useEffect(() => {
    if (!shouldPopulateForm) return;

    const stringify = (id) => id?.toString() || "";

    const valuesToReset = {
      artikel: product.artikel || "",
      nama: product.nama || "",
      deskripsi: product.deskripsi || "",
      warna: [], // Handled separately
      size: product.size || "",
      grup: stringify(options.grups.find((grup) => grup.value === product.grup)?.id),
      unit: stringify(options.units.find((unit) => unit.value === product.unit)?.id),
      kat: stringify(options.kats.find((kat) => kat.value === product.kat)?.id),
      model: product.model || "",
      gender: stringify(options.genders.find((gender) => gender.value === product.gender)?.id),
      tipe: stringify(options.tipes.find((tipe) => tipe.value === product.tipe)?.id),
      harga: product.harga !== null ? Number(product.harga) : "",
      harga_diskon: product.harga_diskon !== null ? Number(product.harga_diskon) : "",
      rating: product.rating || { comfort: 0, style: 0, support: 0, purpose: [] },
      marketplace: product.marketplace || [],
      image_url: product.gambar || [],
      tanggal_produk: product.tanggal_produk ? product.tanggal_produk.split("T")[0] : "",
      tanggal_terima: product.tanggal_terima ? product.tanggal_terima.split("T")[0] : "",
      status: product.status ? product.status.toLowerCase() : "active",
      supplier: product.supplier || "",
      diupdate_oleh: product.diupdate_oleh || "",
    };

    // Handle warna (colors) separately
    let warnaIdsFromApi = product.warna;
    if (typeof warnaIdsFromApi === "string") {
      warnaIdsFromApi = warnaIdsFromApi.split(",").map((id) => id.trim());
    }
    setSelectedColors(warnaIdsFromApi || []);
    valuesToReset.warna = warnaIdsFromApi || [];

    // Handle marketplace
    if (product.marketplace && typeof product.marketplace === "object") {
      const marketplaceArray = Object.entries(product.marketplace)
        .map(([key, value]) => ({ key, value }))
        .filter((item) => item.value);
      valuesToReset.marketplace = marketplaceArray;
    }

    reset(valuesToReset);
  }, [shouldPopulateForm, product, options, reset, setSelectedColors]); // Removed setSelectedColors from dependencies

  return { product, isLoading, error, refetch };
}
