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
      <div className="space-y-2">
        <NavLink to="/" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <DashboardIcon sx={{ mr: 1 }} /> Dashboard
          </div>
        </NavLink>
        <NavLink to="/master-product" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <Inventory2Icon sx={{ mr: 1 }} /> Master Products
          </div>
        </NavLink>
        <NavLink to="/master-color" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <ColorLensIcon sx={{ mr: 1 }} /> Master Color
          </div>
        </NavLink>
        <NavLink to="/master-grup" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <GroupIcon sx={{ mr: 1 }} /> Master Grup
          </div>
        </NavLink>
        <NavLink to="/master-kat" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <CategoryIcon sx={{ mr: 1 }} /> Master Kat
          </div>
        </NavLink>
        <NavLink to="/master-unit" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <BuildIcon sx={{ mr: 1 }} /> Master Unit
          </div>
        </NavLink>
        <NavLink to="/master-tipe" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <BuildIcon sx={{ mr: 1 }} /> Master Tipe
          </div>
        </NavLink>
        <NavLink to="/master-banner" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <ImageIcon sx={{ mr: 1 }} /> Master Banner
          </div>
        </NavLink>
        <NavLink to="/master-panduan-ukuran" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <ImageIcon sx={{ mr: 1 }} /> Panduan Ukuran
          </div>
        </NavLink>
        <NavLink to="/master-newsletter" className="block w-full text-white">
          <div className="cursor-pointer rounded p-2 hover:bg-gray-700">
            <EmailIcon sx={{ mr: 1 }} /> Newsletter
          </div>
        </NavLink>
      </div>

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
