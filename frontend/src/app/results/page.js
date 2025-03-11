"use client";
import { useState } from "react";

const threats = [
  { id: 1, name: "Face Detected", severity: "High", details: "Your face is visible, which may compromise privacy." },
  { id: 2, name: "Location Data", severity: "Medium", details: "This image contains metadata with GPS coordinates." },
  { id: 3, name: "Object Detected", severity: "Low", details: "A license plate is partially visible." }
];

export default function ResultsPage() {
  const [showDetails, setShowDetails] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">Privacy Scan Results</h1>
      <p className="text-gray-400 mb-6">Here are the detected threats in your image.</p>

      <div className="grid gap-6">
        {threats.map((threat) => (
          <div key={threat.id} className="bg-gray-800 p-5 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{threat.name}</h2>
              <span
                className={`px-3 py-1 rounded-md ${
                  threat.severity === "High" ? "bg-red-600" : threat.severity === "Medium" ? "bg-yellow-600" : "bg-green-600"
                }`}
              >
                {threat.severity}
              </span>
            </div>
            {showDetails === threat.id ? (
              <p className="text-gray-300 mt-2">{threat.details}</p>
            ) : (
              <button className="text-blue-400 mt-2" onClick={() => setShowDetails(threat.id)}>
                View Details
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
