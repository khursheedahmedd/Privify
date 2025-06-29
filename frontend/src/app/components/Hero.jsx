"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import RiskAnalysis from "../components/RiskAnalysis";
import MapWrapper from "../components/MapWrapper";
import MetadataRemoval from "../components/MetadataRemoval";
import VisionAnalysis from "../components/VisionAnalysis";
import MetadataCard from "../components/MetadataCard";

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
  const [visionResults, setVisionResults] = useState(null);
  const [privacyResults, setPrivacyResults] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setMetadata(null);
      setRiskAnalysis(null);
      setSecurityAnalysis(null);
      setCleanImageUrl(null);
      setVisionResults(null);
      setPrivacyResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setMetadata(null);
      setRiskAnalysis(null);
      setSecurityAnalysis(null);
      setCleanImageUrl(null);
      setVisionResults(null);
      setPrivacyResults(null);
    }
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
    setVisionResults(null);
    setPrivacyResults(null);
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

      // First, scan metadata
      const metadataResponse = await fetch(
        "http://127.0.0.1:5000/metadata/scan",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!metadataResponse.ok) throw new Error("Failed to scan metadata");
      const metadataData = await metadataResponse.json();
      setMetadata(metadataData);

      // Then automatically scan for privacy-sensitive content
      const privacyFormData = new FormData();
      privacyFormData.append("file", selectedFile);

      const privacyResponse = await fetch(
        "http://localhost:5000/privacy-content/detect",
        {
          method: "POST",
          body: privacyFormData,
        }
      );

      if (privacyResponse.ok) {
        const privacyData = await privacyResponse.json();
        setPrivacyResults(privacyData.privacy_analysis);
      } else {
        console.warn(
          "Privacy content detection failed, but metadata scan succeeded"
        );
      }
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

  const handleVisionAnalysisComplete = (results) => {
    setVisionResults(results);
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
            <button
              onClick={handleMetadataScan}
              disabled={!selectedFile || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Scan Metadata & Content
                </>
              )}
            </button>

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

        {/* Results Section */}
        {(metadata || privacyResults) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <h3 className="text-2xl font-bold text-center text-gray-800">
              Privacy Analysis Results
            </h3>

            {/* Privacy Content Detection Results */}
            {privacyResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Overall Risk Alert */}
                {privacyResults.sensitive_content_found && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-lg border-2 ${
                      privacyResults.overall_risk === "high"
                        ? "bg-red-50 border-red-200"
                        : privacyResults.overall_risk === "medium"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">🚨</div>
                      <div>
                        <h4 className="font-bold text-lg">
                          Privacy Risk Detected!
                        </h4>
                        <p className="text-sm opacity-90">
                          {privacyResults.summary}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <strong>Risk Level:</strong>{" "}
                      {privacyResults.overall_risk?.toUpperCase()}
                    </div>
                  </motion.div>
                )}

                {/* Safe Content Message */}
                {!privacyResults.sensitive_content_found && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-green-50 border-2 border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <h4 className="font-bold text-lg text-green-800">
                          No Privacy Risks Found
                        </h4>
                        <p className="text-green-700">
                          Your image appears to be safe to share!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Detected Items */}
                {privacyResults.detected_items &&
                  privacyResults.detected_items.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Detected Sensitive Content:
                      </h4>
                      <div className="space-y-3">
                        {privacyResults.detected_items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${
                              item.risk_level === "high"
                                ? "bg-red-50 border-red-200"
                                : item.risk_level === "medium"
                                ? "bg-orange-50 border-orange-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-xl">
                                {item.type === "license_plate"
                                  ? "🚗"
                                  : item.type === "credit_card"
                                  ? "💳"
                                  : item.type === "id_document"
                                  ? "🆔"
                                  : item.type === "phone_number"
                                  ? "📞"
                                  : item.type === "address"
                                  ? "📍"
                                  : item.type === "name"
                                  ? "👤"
                                  : item.type === "medical"
                                  ? "🏥"
                                  : item.type === "business_card"
                                  ? "📇"
                                  : item.type === "screenshot"
                                  ? "📱"
                                  : "⚠️"}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold">
                                    {item.type === "license_plate"
                                      ? "License Plate"
                                      : item.type === "credit_card"
                                      ? "Credit Card"
                                      : item.type === "id_document"
                                      ? "ID Document"
                                      : item.type === "phone_number"
                                      ? "Phone Number"
                                      : item.type === "address"
                                      ? "Address"
                                      : item.type === "name"
                                      ? "Personal Name"
                                      : item.type === "medical"
                                      ? "Medical Information"
                                      : item.type === "business_card"
                                      ? "Business Card"
                                      : item.type === "screenshot"
                                      ? "Screenshot"
                                      : "Sensitive Content"}
                                  </h5>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.risk_level === "high"
                                        ? "bg-red-100 text-red-800"
                                        : item.risk_level === "medium"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {item.risk_level?.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm mb-2">
                                  {item.description}
                                </p>
                                <div className="text-sm">
                                  <strong>Recommendation:</strong>{" "}
                                  {item.recommendation}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* General Recommendations */}
                {privacyResults.recommendations &&
                  privacyResults.recommendations.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        General Recommendations:
                      </h4>
                      <ul className="space-y-2">
                        {privacyResults.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-blue-800"
                          >
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Warning Message */}
                {privacyResults.sensitive_content_found && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">⚠️ Privacy Warning</span>
                    </div>
                    <p className="text-red-700 mt-2 text-sm">
                      This image contains sensitive content that could be
                      misused if shared publicly. Consider removing or blurring
                      the detected content before sharing.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Metadata Card */}
            {metadata && <MetadataCard metadata={metadata} />}

            {/* Additional Analysis Components */}
            {metadata && (
              <div className="space-y-6">
                {/* Security Analysis */}
                <RiskAnalysis metadata={metadata} />

                {/* Location Map */}
                {showMap && (
                  <motion.div
                    className="bg-white p-4 rounded-lg shadow"
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

                {/* Vision Analysis Component */}
                <VisionAnalysis
                  selectedFile={selectedFile}
                  onAnalysisComplete={handleVisionAnalysisComplete}
                />
              </div>
            )}
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
