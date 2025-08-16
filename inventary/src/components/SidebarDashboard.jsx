import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import ImageIcon from "@mui/icons-material/Image";
import EmailIcon from "@mui/icons-material/Email";

import { AuthContext } from "../contexts/AuthContext";

export default function SidebarDashboard() {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex h-full flex-col bg-gray-800 p-4 text-white">
      <h2 className="mb-6 text-xl font-semibold">Admin Dashboard</h2>
      <ul className="space-y-2">
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/" className="w-full text-white">
            <DashboardIcon sx={{ mr: 1 }} /> Dashboard
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-product" className="w-full text-white">
            <Inventory2Icon sx={{ mr: 1 }} /> Master Products
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-color" className="w-full text-white">
            <ColorLensIcon sx={{ mr: 1 }} /> Master Color
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-grup" className="w-full text-white">
            <GroupIcon sx={{ mr: 1 }} /> Master Grup
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-kat" className="w-full text-white">
            <CategoryIcon sx={{ mr: 1 }} /> Master Kat
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-unit" className="w-full text-white">
            <BuildIcon sx={{ mr: 1 }} /> Master Unit
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-tipe" className="w-full text-white">
            <BuildIcon sx={{ mr: 1 }} /> Master Tipe
          </NavLink>
        </li>

        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-banner" className="w-full text-white">
            <ImageIcon sx={{ mr: 1 }} /> Master Banner
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-panduan-ukuran" className="w-full text-white">
            <ImageIcon sx={{ mr: 1 }} /> Panduan Ukuran
          </NavLink>
        </li>
        <li className="cursor-pointer rounded p-2 hover:bg-gray-700">
          <NavLink to="/master-newsletter" className="w-full text-white">
            <EmailIcon sx={{ mr: 1 }} /> Newsletter
          </NavLink>
        </li>
      </ul>

      <div className="mt-auto">
        <Button
          variant="contained"
          onClick={() => logout()}
          sx={{ width: "100%", mb: 2, mt: 2, backgroundColor: "#f44336" }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
