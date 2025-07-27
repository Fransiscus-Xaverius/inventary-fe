import { CircularProgress } from "@mui/material";

export default function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <CircularProgress />
    </div>
  );
}
