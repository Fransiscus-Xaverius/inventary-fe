import { renderHook } from "@testing-library/react";
import { SnackbarProvider } from "notistack";
import { vi, describe, it } from "vitest";
import * as api from "../../../../hooks/useApiRequest";

// Mock the useApiRequest hook
vi.mock("../../../../hooks/useApiRequest");

const wrapper = ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>;

describe("useMasterOptions", () => {
  it("aggregates loading state", async () => {
    // Arrange mock responses: first call returns loading true, rest false
    api.default
      .mockReturnValueOnce({ response: null, isLoading: true, error: null })
      .mockReturnValue({ response: null, isLoading: false, error: null });

    const { default: useMasterOptions } = await import("../hooks/useMasterOptions");

    const { result } = renderHook(() => useMasterOptions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});

describe("useProductMutation", () => {
  it("exposes submit that calls mutate", async () => {
    const mutateMock = vi.fn();
    api.default.mockReturnValue({ mutate: mutateMock, isLoading: false, error: null });

    const { default: useProductMutation } = await import("../hooks/useProductMutation");

    const { result } = renderHook(() => useProductMutation({ isEdit: false, artikel: "" }), { wrapper });

    result.current.submit({ foo: "bar" });
    expect(mutateMock).toHaveBeenCalled();
  });
});
