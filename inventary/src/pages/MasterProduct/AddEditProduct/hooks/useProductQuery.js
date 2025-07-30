import { useMemo } from "react";

import useApiRequest from "../../../../hooks/useApiRequest";

/**
 * Fetch a single product by artikel when in edit mode.
 *
 * @param {string | undefined} artikel – product identifier (may be undefined for add mode)
 * @returns {object} { product, isLoading, error }
 */
export default function useProductQuery(artikel) {
  const isEdit = Boolean(artikel);

  const { response, isLoading, error, refetch } = useApiRequest({
    url: `/api/admin/products/${artikel}`,
    queryKey: ["product", artikel],
    enableQuery: isEdit,
  });

  // The API returns { data: { /* product */ } }
  const product = useMemo(() => response?.data ?? null, [response]);

  return { product, isLoading, error, refetch };
}
