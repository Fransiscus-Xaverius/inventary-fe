import { useState, useEffect } from 'react';

export default function AnimatedLogo() {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prevRotation => (prevRotation + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center items-center mb-6">
      <div 
        className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
          <span className="text-indigo-600 font-bold text-xl">YK</span>
        </div>
      </div>
    </div>
  );
}