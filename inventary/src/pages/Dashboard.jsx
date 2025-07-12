import SidebarDashboard from "../components/SidebarDashboard";

function Dashboard() {
  return (
    <div className="h-screen w-screen">
      <div className="flex h-full w-full">
        <SidebarDashboard />
        <div className="flex-1 bg-gray-100 p-8">
          <h1 className="mb-6 text-2xl font-bold text-black">Dashboard</h1>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
