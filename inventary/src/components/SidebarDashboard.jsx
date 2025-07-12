import { NavLink } from "react-router-dom";

export default function SidebarDashboard() {
  return (
    <div className="w-1/5 bg-gray-800 p-4 text-white">
      <h2 className="mb-6 text-xl font-semibold">Dashboard</h2>
      <ul className="space-y-2">
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/" className="w-full text-white">
            Dashboard
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-product" className="w-full text-white">
            Master Products
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-color" className="w-full text-white">
            Master Color
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-grup" className="w-full text-white">
            Master Grup
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-kat" className="w-full text-white">
            Master Kat
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-unit" className="w-full text-white">
            Master Unit
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-tipe" className="w-full text-white">
            Master Tipe
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-banner" className="w-full text-white">
            Master Banner
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
