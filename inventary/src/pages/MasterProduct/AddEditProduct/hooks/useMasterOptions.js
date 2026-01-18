import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useApiRequest from "../../../../hooks/useApiRequest";

/**
 * Fetch option lists required by the Add/Edit Product form (colors, grups, etc.).
 * Collapses the six individual queries into a single hook that returns memo-ised
 * option arrays and a combined loading / error state.
 */
export default function useMasterOptions() {
  // Colors
  const {
    data: colors,
    isLoading: isColorsLoading,
    error: colorsError,
  } = useQuery({
    queryKey: ["colors", "all"],
    staleTime: 1,
    gcTime: 0,
    queryFn: async () => {
      const authToken = localStorage.getItem("authToken");
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      const pageSize = 50;
      let offset = 0;
      const allColors = [];

      while (true) {
        const res = await axios
          .get(`/api/admin/colors?offset=${offset}&limit=${pageSize}`, {
            headers,
          })
          .then((r) => r.data);

        const pageColors = res?.data?.colors ?? [];
        allColors.push(...pageColors);

        if (pageColors.length < pageSize) break;
        offset += pageSize;
      }

      return allColors;
    },
  });

  // Grup
  const {
    response: grupsRes,
    isLoading: isGrupsLoading,
    error: grupsError,
  } = useApiRequest({ url: "/api/admin/grups", queryKey: ["grups"] });

  // Unit
  const {
    response: unitsRes,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useApiRequest({ url: "/api/admin/units", queryKey: ["units"] });

  // Kategori
  const {
    response: katsRes,
    isLoading: isKatsLoading,
    error: katsError,
  } = useApiRequest({ url: "/api/admin/kats", queryKey: ["kats"] });

  // Gender
  const {
    response: gendersRes,
    isLoading: isGendersLoading,
    error: gendersError,
  } = useApiRequest({ url: "/api/admin/genders", queryKey: ["genders"] });

  // Tipe
  const {
    response: tipesRes,
    isLoading: isTipesLoading,
    error: tipesError,
  } = useApiRequest({ url: "/api/admin/tipes", queryKey: ["tipes"] });

  // Memoise transformed option arrays so referential identity stays stable.
  const colorsMemo = useMemo(() => colors ?? [], [colors]);
  const grups = useMemo(() => grupsRes?.data?.grups ?? [], [grupsRes]);
  const units = useMemo(() => unitsRes?.data?.units ?? [], [unitsRes]);
  const kats = useMemo(() => katsRes?.data?.kats ?? [], [katsRes]);
  const genders = useMemo(() => gendersRes?.data?.genders ?? [], [gendersRes]);
  const tipes = useMemo(() => tipesRes?.data?.tipes ?? [], [tipesRes]);

  // Aggregate loading & error states for convenience.
  const isLoading =
    isColorsLoading || isGrupsLoading || isUnitsLoading || isKatsLoading || isGendersLoading || isTipesLoading;

  const error = colorsError || grupsError || unitsError || katsError || gendersError || tipesError;

  const options = useMemo(
    () => ({
      colors: colorsMemo,
      grups,
      units,
      kats,
      genders,
      tipes,
    }),
    [colorsMemo, grups, units, kats, genders, tipes]
  );

  return {
    options,
    isLoading,
    error,
  };
}
