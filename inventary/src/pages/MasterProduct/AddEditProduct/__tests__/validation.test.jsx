import { describe, it } from "vitest";
import { createProductSchema } from "../validation";

describe("createProductSchema", () => {
  describe("for add mode", () => {
    const schema = createProductSchema({ isEdit: false });

    it("validates required fields", () => {
      const validData = {
        artikel: "ART-001",
        nama: "Test Product",
        deskripsi: "Test Description",
        warna: ["1"],
        size: "30,32-38",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model A",
        gender: "1",
        tipe: "1",
        harga: 100000,
        harga_diskon: 80000,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com/product" }],
        gambar: [new File(["content"], "image.jpg", { type: "image/jpeg" })],
        status: "active",
        supplier: "Supplier A",
        diupdate_oleh: "Admin",
      };

      const { error } = schema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("rejects empty required fields", () => {
      const invalidData = {}; // Empty object should trigger validation errors
      const { error } = schema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details.length).toBeGreaterThanOrEqual(1); // At least one validation error
    });

    it("validates size pattern", () => {
      const validSizes = ["30", "30-38", "30,32-38,42"];
      const invalidSizes = ["", "30-", "-38", "30,", ",32"];

      validSizes.forEach((size) => {
        const { error } = schema.validate({
          artikel: "ART-001",
          nama: "Test",
          deskripsi: "Test",
          warna: ["1"],
          size,
          grup: "1",
          unit: "1",
          kat: "1",
          model: "Model",
          gender: "1",
          tipe: "1",
          harga: 100,
          marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
          gambar: [new File([""], "test.jpg")],
          status: "active",
          supplier: "Supplier",
          diupdate_oleh: "Admin",
        });
        expect(error).toBeUndefined(`Size "${size}" should be valid`);
      });

      invalidSizes.forEach((size) => {
        const { error } = schema.validate({
          artikel: "ART-001",
          nama: "Test",
          deskripsi: "Test",
          warna: ["1"],
          size,
          grup: "1",
          unit: "1",
          kat: "1",
          model: "Model",
          gender: "1",
          tipe: "1",
          harga: 100,
          marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
          gambar: [new File([""], "test.jpg")],
          status: "active",
          supplier: "Supplier",
          diupdate_oleh: "Admin",
        });
        expect(error).toBeDefined(`Size "${size}" should be invalid`);
      });
    });

    it("validates marketplace URLs", () => {
      const validMarketplace = [
        { key: "tokopedia", value: "https://tokopedia.com/product" },
        { key: "shopee", value: "http://shopee.co.id/product" },
      ];

      const invalidMarketplace = [
        { key: "tokopedia", value: "not-a-url" },
        { key: "invalid-platform", value: "https://example.com" },
      ];

      // Valid marketplace
      const { error: validError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: validMarketplace,
        gambar: [new File([""], "test.jpg")],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(validError).toBeUndefined();

      // Invalid URL
      const { error: invalidUrlError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [invalidMarketplace[0]],
        gambar: [new File([""], "test.jpg")],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(invalidUrlError).toBeDefined();

      // Invalid platform
      const { error: invalidPlatformError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [invalidMarketplace[1]],
        gambar: [new File([""], "test.jpg")],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(invalidPlatformError).toBeDefined();
    });

    it("validates file upload requirements", () => {
      // Valid with files
      const { error: validError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [new File(["content"], "image.jpg", { type: "image/jpeg" })],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(validError).toBeUndefined();

      // Invalid without files in add mode
      const { error: invalidError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(invalidError).toBeDefined();
    });
  });

  describe("for edit mode", () => {
    const schema = createProductSchema({ isEdit: true });

    it("allows empty gambar array in edit mode", () => {
      const { error } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [],
        image_url: ["/uploads/image.jpg"],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(error).toBeUndefined();
    });

    it("validates image_url format in edit mode", () => {
      // Valid image_url
      const { error: validError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [],
        image_url: ["/uploads/image.jpg"],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(validError).toBeUndefined();

      // Invalid image_url (doesn't start with /)
      const { error: invalidError } = schema.validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [],
        image_url: ["uploads/image.jpg"],
        status: "active",
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(invalidError).toBeDefined();
    });
  });

  it("validates status enum", () => {
    const validStatuses = ["active", "inactive", "discontinued"];
    const invalidStatuses = ["enabled", "disabled", "pending"];

    validStatuses.forEach((status) => {
      const { error } = createProductSchema({ isEdit: false }).validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [new File([""], "test.jpg")],
        status,
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(error).toBeUndefined(`Status "${status}" should be valid`);
    });

    invalidStatuses.forEach((status) => {
      const { error } = createProductSchema({ isEdit: false }).validate({
        artikel: "ART-001",
        nama: "Test",
        deskripsi: "Test",
        warna: ["1"],
        size: "30",
        grup: "1",
        unit: "1",
        kat: "1",
        model: "Model",
        gender: "1",
        tipe: "1",
        harga: 100,
        marketplace: [{ key: "tokopedia", value: "https://tokopedia.com" }],
        gambar: [new File([""], "test.jpg")],
        status,
        supplier: "Supplier",
        diupdate_oleh: "Admin",
      });
      expect(error).toBeDefined(`Status "${status}" should be invalid`);
    });
  });
});
