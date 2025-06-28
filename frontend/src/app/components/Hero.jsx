"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import RiskAnalysis from "../components/RiskAnalysis";
import MapWrapper from "../components/MapWrapper";
import MetadataRemoval from "../components/MetadataRemoval";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [cleanImageUrl, setCleanImageUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setMetadata(null);
    setProcessedImage(null);
    setRiskAnalysis(null);
    setShowMap(false);
    setCleanImageUrl(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadProgress(0);
    setMetadata(null);
    setProcessedImage(null);
    setRiskAnalysis(null);
    setShowMap(false);
    setCleanImageUrl(null);
  };

  const simulateUploadProgress = useCallback(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
      } else {
        setUploadProgress(progress);
      }
    }, 200);
    return interval;
  }, []);

  const handleMetadataScan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const interval = simulateUploadProgress();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:5000/metadata/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to scan metadata");
      const data = await response.json();
      setMetadata(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    if (metadata) {
      setRiskAnalysis(null);
      setShowMap(!!metadata?.GPSInfo);
    }
  }, [metadata]);

  const handlePrivacyFilter = async () => {
    if (!selectedFile) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:5000/privacy/filter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      setProcessedImage(objectURL);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanImageGenerated = (imageUrl, filename) => {
    setCleanImageUrl(imageUrl);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <motion.section
        className="flex-1 container mx-auto px-4 py-8 mt-[6rem] md:mt-[8rem]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Protect Your Privacy
          </h1>
          <p className="mb-8 text-gray-600 text-lg">
            Secure your images by scanning metadata and blurring sensitive
            content
          </p>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-8 transition-colors hover:border-indigo-500">
            {!selectedFile ? (
              <label className="cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <div className="space-y-4">
                  <div className="mx-auto bg-indigo-100 w-max p-4 rounded-full">
                    <svg
                      className="w-8 h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Drag and drop your image here!
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: JPG, PNG, GIF • Max size: 10MB
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-6">
                {preview && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {loading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="inline-block relative w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="absolute left-0 top-0 h-full bg-indigo-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-white font-medium">
                            {Math.round(uploadProgress)}% Uploading...
                          </p>
                          <p className="text-sm text-gray-200">
                            Hang on while we analyze your image
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMetadataScan}
              disabled={!selectedFile || loading}
              className="px-8 py-3 bg-indigo-600 cursor-pointer text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              {loading ? "Scanning..." : "Scan Metadata"}
            </motion.button>

            {/* <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrivacyFilter}
              disabled={!selectedFile || loading}
              className="px-8 py-3 bg-purple-600 cursor-pointer text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              {loading ? "Processing..." : "Blur Sensitive Data"}
            </motion.button> */}
          </div>
        </div>

        {/* Results Sections */}
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Scan Results</h2>
            <div className="space-y-6">
              {/* Security Analysis */}
              <RiskAnalysis metadata={metadata} />

              {/* Location Map */}
              {showMap && (
                <motion.div
                  className="mt-6 bg-white p-4 rounded-lg shadow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 className="text-lg font-bold mb-4">Location Data</h3>
                  <MapWrapper gpsData={metadata.GPSInfo} />
                  <p className="mt-2 text-sm text-red-600">
                    Warning: Exact location data found in image metadata
                  </p>
                </motion.div>
              )}

              {/* Metadata Removal Component */}
              <MetadataRemoval
                metadata={metadata}
                selectedFile={selectedFile}
                onCleanImageGenerated={handleCleanImageGenerated}
              />

              {/* Raw Metadata Display */}
              {/* <div className="mt-6">
                <h3 className="text-lg font-bold mb-4">Full Metadata</h3>
                <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div> */}
            </div>
          </motion.div>
        )}

        {cleanImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white flex items-center flex-col rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              Clean Image (Metadata Removed)
            </h2>
            <img
              src={cleanImageUrl}
              alt="Clean image without metadata"
              className="rounded-lg border shadow-sm max-w-full h-auto"
            />
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = cleanImageUrl;
                  link.download = "clean_image.jpg";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Clean Image
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        {processedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white flex items-center flex-col rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Secure Image</h2>
            <img
              src={processedImage}
              alt="Processed result"
              className="rounded-lg border shadow-sm w-3xl h-3xl"
            />
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Download
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}
