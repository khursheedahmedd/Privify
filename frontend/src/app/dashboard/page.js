"use client";
import { useState } from "react";

export default function DashboardPage() {
  const [scans] = useState([
    { id: 1, image: "/sample1.jpg", threats: 2, date: "March 1, 2025" },
    { id: 2, image: "/sample2.jpg", threats: 1, date: "March 5, 2025" }
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">Your Dashboard</h1>
      <p className="text-gray-400 mb-6">View your scan history and privacy score.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {scans.map((scan) => (
          <div key={scan.id} className="bg-gray-800 p-5 rounded-lg">
            <img src={scan.image} alt="Scanned Image" className="w-full h-40 object-cover rounded-lg" />
            <div className="mt-3">
              <h3 className="text-lg font-semibold">Scan from {scan.date}</h3>
              <p className="text-gray-300">Threats Detected: {scan.threats}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
