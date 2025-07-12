import { useState, useEffect } from "react";

export default function AnimatedLogo() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prevRotation) => (prevRotation + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 flex items-center justify-center">
      <div
        className="flex h-16 w-16 transform items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg transition-all duration-300 hover:scale-110"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
          <span className="text-xl font-bold text-indigo-600">YK</span>
        </div>
      </div>
    </div>
  );
}
