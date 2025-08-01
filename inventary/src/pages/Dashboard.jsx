import { Typography } from "@mui/material";

function Dashboard() {
  return (
    <div className="flex h-full flex-grow flex-col overflow-auto p-6">
      <div className="mb-4 flex flex-col gap-4">
        <Typography variant="h1" gutterBottom fontWeight={600} sx={{ fontSize: "2rem" }}>
          Dashboard
        </Typography>

        <Typography variant="h3" gutterBottom fontWeight={600} sx={{ fontSize: "1.2rem" }}>
          Welcome back, Admin!
        </Typography>
      </div>
    </div>
  );
}

export default Dashboard;
