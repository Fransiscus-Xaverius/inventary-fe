import { useState } from "react";
import SidebarDashboard from "../components/SidebarDashboard";

export default function AddEditProduct({
  isEdit = false,
  initialData = {},
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    artikel: initialData.artikel || "",
    warna: initialData.warna || "",
    size: initialData.size || [],
    grup: initialData.grup || "",
    unit: initialData.unit || "",
    kategori: initialData.kategori || "",
    model: initialData.model || "",
    gender: initialData.gender || "",
    tipe: initialData.tipe || "",
    harga: initialData.harga || "",
    tanggalProduk: initialData.tanggalProduk || "",
    tanggalDiterima: initialData.tanggalDiterima || "",
    usia: initialData.usia || "",
    status: initialData.status || "",
    supplier: initialData.supplier || "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        size: checked
          ? [...prev.size, value]
          : prev.size.filter((s) => s !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      size: formData.size.join(", "),
    };
    if (onSubmit) onSubmit(processedData);
    alert(`${isEdit ? "Updated" : "Added"} product successfully!`);
  };

  const dummyColors = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Black",
    "White",
    "Pink",
    "Orange",
    "Purple",
    "Brown",
  ];
  const dummyGroups = ["Formal", "Casual", "Accessories", "Sport", "Kids"];
  const dummyUnits = ["SET", "BOX", "PCS"];
  const dummyCategories = ["Regular", "Premium", "Basic"];
  const dummyGenders = ["Pria", "Wanita", "Unisex"];
  const dummyTypes = ["Normal", "Spesial", "Obral"];
  const dummyAges = ["Aging", "Fresh", "Normal"];
  const dummyStatuses = ["Inactive", "Active", "Discontinued"];
  const sizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow"
        >
          <div className="flex flex-col">
            <label
              htmlFor="artikel"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Artikel
            </label>
            <input
              type="text"
              id="artikel"
              name="artikel"
              value={formData.artikel}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="warna"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Warna
            </label>
            <select
              id="warna"
              name="warna"
              value={formData.warna}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Warna</option>
              {dummyColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium text-sm text-gray-700">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <label key={size} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="size"
                    value={size}
                    checked={formData.size.includes(size)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {size}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={formData.size.join(", ")}
              readOnly
              className="mt-2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="grup"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Grup
            </label>
            <select
              id="grup"
              name="grup"
              value={formData.grup}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Grup</option>
              {dummyGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="unit"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Unit</option>
              {dummyUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="kategori"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Kategori
            </label>
            <select
              id="kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Kategori</option>
              {dummyCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="gender"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Gender</option>
              {dummyGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="tipe"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Tipe Harga
            </label>
            <select
              id="tipe"
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Tipe Harga</option>
              {dummyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="usia"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Usia
            </label>
            <select
              id="usia"
              name="usia"
              value={formData.usia}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Usia</option>
              {dummyAges.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="status"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Pilih Status</option>
              {dummyStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="supplier"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Supplier
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
            >
              {isEdit ? "Update" : "Add"} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
