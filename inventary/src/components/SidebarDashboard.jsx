import { NavLink } from "react-router-dom";

export default function SidebarDashboard() {
  return (
    <div className="w-1/5 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
      <ul className="space-y-2">
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
          <NavLink to="/" className="text-white w-full">
            Dashboard
          </NavLink>
        </li>
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
          <NavLink to="/master-product" className="text-white w-full">
            Master Products
          </NavLink>
        </li>
        <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
          <NavLink to="/master-color" className="text-white w-full">
            Master Color
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
