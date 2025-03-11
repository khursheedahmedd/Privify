"use client";
import { useState } from "react";
import Image from 'next/image';

export default function HomePage() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0f1a] to-black text-white px-6">
      <h1 className="text-5xl font-extrabold mb-6 text-center animate-fade-in">
        Secure Your Privacy with <span className="text-blue-500">Overshare</span>
      </h1>
      <p className="text-gray-300 text-lg mb-8 text-center max-w-2xl animate-fade-in">
        Upload an image, let AI scan for privacy threats, and get instant results.
      </p>

      {/* Start Scan Button */}
      <label className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transform transition duration-300">
        Start Scan
        <input type="file" className="hidden" onChange={handleImageUpload} />
      </label>

      {/* Display Image & Result Card */}
      {image && (
        <div className="mt-10 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center animate-slide-up">
          <Image src={image} alt="Uploaded" width={500} height={300} className="max-w-full rounded-lg mb-4 shadow-md" />
          <h2 className="text-xl font-bold text-blue-400">Privacy Scan Completed</h2>
          <p className="text-gray-300 mt-2">Threats detected in your image. Review details below.</p>
        </div>
      )}
    </div>
  );
}
