import { Controller } from "react-hook-form";
import { MARKETPLACE_OPTIONS } from "./utils";

export default function MarketplaceInput({ control, index, remove }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Controller
        name={`marketplace.${index}.key`}
        control={control}
        render={({ field }) => (
          <select {...field} className="rounded border border-gray-300 px-3 py-2">
            <option value="">Select Marketplace</option>
            {MARKETPLACE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      />
      <Controller
        name={`marketplace.${index}.value`}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type="text"
            placeholder="Enter URL"
            className="flex-1 rounded border border-gray-300 px-3 py-2"
          />
        )}
      />
      <button type="button" onClick={() => remove(index)} className="rounded bg-red-500 px-3 py-2 text-white">
        Remove
      </button>
    </div>
  );
}
