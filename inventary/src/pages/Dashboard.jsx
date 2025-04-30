function Dashboard() {
  return (
    <div className="h-screen w-screen">
      <div className="flex w-full h-full">
        <div className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
          <ul className="space-y-2">
            <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
              Products
            </li>
          </ul>
        </div>

        <div className="flex-1 bg-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-6 text-black">Dashboard</h1>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
