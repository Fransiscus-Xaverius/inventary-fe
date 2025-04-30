import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function Dashboard() {
  return (
    <div className="h-screen w-screen">
      <div className="flex w-full h-full">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-semibold mb-6">Dashboard</h2>
          <ul className="space-y-2">
            <li className="hover:bg-gray-700 p-2 rounded cursor-pointer">
              Products
            </li>
          </ul>
        </aside>

        <main className="flex-1 bg-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              A new, modern publishing experience is coming soon.
            </h2>
            <p className="text-gray-700 mb-4">
              Take your words, media, and layout in new directions with
              Gutenberg, the WordPress editor we're currently building.
            </p>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-1">Test the new editor today.</h3>
              <p className="text-sm text-gray-600 mb-4">
                You can take Gutenberg for a spin and share your feedback, if
                you'd like, before we officially release it. You can help by
                testing, filing bugs, or contributing on the{" "}
                <a href="#" className="text-blue-600 underline">
                  GitHub repository
                </a>
                .
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Install Gutenberg
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
