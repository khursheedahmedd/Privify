"use client";
import { useState } from "react";
import Image from 'next/image';

export default function ScanPage() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Scan Your Image</h1>
      <p className="text-gray-300 mb-6">Upload an image to check for privacy risks.</p>

      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
        Upload Image
        <input type="file" className="hidden" onChange={handleImageUpload} />
      </label>

      {image && (
        <div className="mt-6">
          <Image src={image} alt="Uploaded Preview" width={400} height={300} className="max-w-sm rounded-lg shadow-lg" />
          <button className="mt-4 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg">
            Analyze Image
          </button>
        </div>
      )}
    </div>
  );
}
