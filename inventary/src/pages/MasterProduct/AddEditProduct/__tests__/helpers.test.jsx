import { describe, it, expect } from "vitest";
import { formatDateForApi, formatMarketplace, getColorById, parseGambar, MAX_FILE_SIZE, STATUSES } from "../helpers";

describe("formatDateForApi", () => {
  it("formats date string correctly", () => {
    const result = formatDateForApi("2025-01-15");
    expect(result).toBe("2025-01-15T00:00:00Z");
  });

  it("handles Date objects", () => {
    const date = new Date("2025-01-15");
    const result = formatDateForApi(date);
    expect(result).toBe("2025-01-15T00:00:00Z");
  });

  it("returns empty string for falsy values", () => {
    expect(formatDateForApi("")).toBe("");
    expect(formatDateForApi(null)).toBe("");
    expect(formatDateForApi(undefined)).toBe("");
  });
});

describe("formatMarketplace", () => {
  it("converts array to JSON string", () => {
    const input = [
      { key: "tokopedia", value: "https://tokopedia.com/product" },
      { key: "shopee", value: "https://shopee.co.id/product" },
    ];
    const result = formatMarketplace(input);
    const parsed = JSON.parse(result);

    expect(parsed.tokopedia).toBe("https://tokopedia.com/product");
    expect(parsed.shopee).toBe("https://shopee.co.id/product");
  });

  it("filters out empty entries", () => {
    const input = [
      { key: "tokopedia", value: "https://tokopedia.com/product" },
      { key: "", value: "" },
      { key: "shopee", value: "" },
    ];
    const result = formatMarketplace(input);
    const parsed = JSON.parse(result);

    expect(Object.keys(parsed)).toHaveLength(1);
    expect(parsed.tokopedia).toBe("https://tokopedia.com/product");
  });
});

describe("getColorById", () => {
  const colors = [
    { id: 1, nama: "Red", hex: "#FF0000" },
    { id: 2, nama: "Blue", hex: "#0000FF" },
  ];

  it("finds color by ID", () => {
    const result = getColorById(colors, "1");
    expect(result).toEqual({ id: 1, nama: "Red", hex: "#FF0000" });
  });

  it("returns undefined for non-existent ID", () => {
    const result = getColorById(colors, "999");
    expect(result).toBeUndefined();
  });
});

describe("parseGambar", () => {
  it("converts File array to FormData format", () => {
    const file1 = new File(["content1"], "image1.jpg", { type: "image/jpeg" });
    const file2 = new File(["content2"], "image2.jpg", { type: "image/jpeg" });

    const result = parseGambar([file1, file2]);

    expect(result["gambar[0]"]).toBe(file1);
    expect(result["gambar[1]"]).toBe(file2);
  });

  it("handles empty array", () => {
    const result = parseGambar([]);
    expect(result).toEqual({});
  });
});

describe("constants", () => {
  it("exports expected constants", () => {
    expect(MAX_FILE_SIZE).toBe(20 * 1024 * 1024);
    expect(STATUSES).toEqual(["active", "inactive", "discontinued"]);
  });
});
