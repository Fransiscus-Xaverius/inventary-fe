import { useMemo } from "react";
import useApiRequest from "../../../../hooks/useApiRequest";

/**
 * Fetch option lists required by the Add/Edit Product form (colors, grups, etc.).
 * Collapses the six individual queries into a single hook that returns memo-ised
 * option arrays and a combined loading / error state.
 */
export default function useMasterOptions() {
  // Colors
  const {
    response: colorsRes,
    isLoading: isColorsLoading,
    error: colorsError,
  } = useApiRequest({ url: "/api/admin/colors", queryKey: ["colors"] });

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
  const colors = useMemo(() => colorsRes?.data?.colors ?? [], [colorsRes]);
  const grups = useMemo(() => grupsRes?.data?.grups ?? [], [grupsRes]);
  const units = useMemo(() => unitsRes?.data?.units ?? [], [unitsRes]);
  const kats = useMemo(() => katsRes?.data?.kats ?? [], [katsRes]);
  const genders = useMemo(() => gendersRes?.data?.genders ?? [], [gendersRes]);
  const tipes = useMemo(() => tipesRes?.data?.tipes ?? [], [tipesRes]);

  // Aggregate loading & error states for convenience.
  const isLoading =
    isColorsLoading || isGrupsLoading || isUnitsLoading || isKatsLoading || isGendersLoading || isTipesLoading;

  const error = colorsError || grupsError || unitsError || katsError || gendersError || tipesError;

  return {
    options: { colors, grups, units, kats, genders, tipes },
    isLoading,
    error,
  };
}
