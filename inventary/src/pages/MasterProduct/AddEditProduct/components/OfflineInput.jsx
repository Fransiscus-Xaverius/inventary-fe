import { Controller } from "react-hook-form";

// import { OFFLINE_MAP_TYPES } from "../helpers";

export default function OfflineInput({ control, index, remove }) {
  return (
    <div className="mb-4 rounded border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-700">Toko Offline #{index + 1}</h4>
        <button
          type="button"
          onClick={() => remove(index)}
          className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
        >
          Hapus
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Name - Required */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Nama Toko <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`offline.${index}.name`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="text"
                  placeholder="Contoh: Cabang Jakarta Pusat"
                  className={`rounded border px-3 py-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Type - Required */}
        {/* <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Tipe Peta <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`offline.${index}.type`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <select
                  {...field}
                  className={`rounded border px-3 py-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Tipe Peta</option>
                  {OFFLINE_MAP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === "google-map" && "Google Maps"}
                      {type === "waze" && "Waze"}
                      {type === "apple-maps" && "Apple Maps"}
                      {type === "custom" && "Custom"}
                    </option>
                  ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div> */}

        {/* URL - Required */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 text-sm font-medium text-gray-700">
            URL Peta <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`offline.${index}.url`}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  type="url"
                  placeholder="https://maps.google.com/..."
                  className={`rounded border px-3 py-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Address - Optional */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 text-sm font-medium text-gray-700">Alamat (Opsional)</label>
          <Controller
            name={`offline.${index}.address`}
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                rows={2}
                placeholder="Alamat lengkap toko..."
                className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </div>

        {/* Phone - Optional */}
        {/* <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Telepon (Opsional)</label>
          <Controller
            name={`offline.${index}.phone`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                placeholder="Contoh: +62 21 1234567"
                className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </div> */}

        {/* Hours - Optional */}
        {/* <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Jam Operasional (Opsional)</label>
          <Controller
            name={`offline.${index}.hours`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Contoh: 09:00 - 21:00"
                className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          />
        </div> */}

        {/* Is Active - Optional */}
        <div className="flex items-center md:col-span-2">
          <Controller
            name={`offline.${index}.is_active`}
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <label className="flex cursor-pointer items-center">
                <input
                  {...field}
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Toko Aktif</span>
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
}
