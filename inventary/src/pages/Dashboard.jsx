import SidebarDashboard from "../components/SidebarDashboard";

function Dashboard() {
  return (
    <div className="h-screen w-screen">
      <div className="flex w-full h-full">
        <SidebarDashboard />
        <div className="flex-1 bg-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-6 text-black">Dashboard</h1>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
