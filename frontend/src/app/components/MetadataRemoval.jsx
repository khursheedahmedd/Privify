"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const MetadataRemoval = ({ metadata, selectedFile, onCleanImageGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [removalType, setRemovalType] = useState("selective");
  const [selectedMetadataTypes, setSelectedMetadataTypes] = useState([]);
  const [cleanImageUrl, setCleanImageUrl] = useState(null);
  const [verification, setVerification] = useState(null);

  // Define metadata categories
  const metadataCategories = {
    "High Risk": [
      {
        key: "GPSInfo",
        label: "GPS Location Data",
        description: "Exact coordinates where photo was taken",
      },
    ],
    "Moderate Risk": [
      {
        key: "DateTime",
        label: "Date & Time",
        description: "When the photo was taken",
      },
      {
        key: "DateTimeOriginal",
        label: "Original Date & Time",
        description: "Original capture timestamp",
      },
    ],
    "Low Risk": [
      { key: "Make", label: "Camera Make", description: "Camera manufacturer" },
      { key: "Model", label: "Camera Model", description: "Camera model name" },
      {
        key: "Software",
        label: "Software Used",
        description: "Software used to edit the image",
      },
    ],
  };

  const handleMetadataTypeToggle = (type) => {
    setSelectedMetadataTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleRemoveAllMetadata = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://localhost:5000/metadata-removal/remove-all",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Metadata removal failed");
      }

      // Get the blob from response
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      setCleanImageUrl(objectURL);

      // Extract filename from response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : "clean_image.jpg";

      setVerification({
        success: true,
        message: "All metadata removed successfully",
        filename: filename,
      });

      if (onCleanImageGenerated) {
        onCleanImageGenerated(objectURL, filename);
      }
    } catch (error) {
      console.error("Metadata removal failed:", error);
      setVerification({
        success: false,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSelectiveMetadata = async () => {
    if (!selectedFile || selectedMetadataTypes.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Add selected metadata types to form data
      selectedMetadataTypes.forEach((type) => {
        formData.append("metadata_types[]", type);
      });

      const response = await fetch(
        "http://localhost:5000/metadata-removal/remove-selective",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Selective metadata removal failed");
      }

      // Get the blob from response
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      setCleanImageUrl(objectURL);

      // Extract filename from response headers
      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : "selective_clean_image.jpg";

      setVerification({
        success: true,
        message: `Removed ${selectedMetadataTypes.length} metadata types successfully`,
        removedTypes: selectedMetadataTypes,
        filename: filename,
      });

      if (onCleanImageGenerated) {
        onCleanImageGenerated(objectURL, filename);
      }
    } catch (error) {
      console.error("Selective metadata removal failed:", error);
      setVerification({
        success: false,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (cleanImageUrl) {
      const link = document.createElement("a");
      link.href = cleanImageUrl;
      link.download = verification?.filename || "clean_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getMetadataCount = () => {
    return Object.keys(metadata || {}).length;
  };

  const hasSensitiveData = () => {
    if (!metadata) return false;
    return metadata.GPSInfo || metadata.DateTime || metadata.DateTimeOriginal;
  };

  return (
    <motion.div
      className="mt-8 bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Metadata Removal</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {getMetadataCount()} metadata items found
          </span>
          {hasSensitiveData() && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Sensitive Data Detected
            </span>
          )}
        </div>
      </div>

      {/* Removal Options */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRemoveAllMetadata}
            disabled={loading || !selectedFile}
            className="px-8 py-3 bg-purple-600 cursor-pointer text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
          >
            {loading ? "Removing..." : "Remove All Metadata"}
          </motion.button>

          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRemovalType("selective")}
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              removalType === "selective"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Selective Removal
          </motion.button> */}
        </div>

        {/* Selective Removal Options */}
        {removalType === "selective" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            <p className="text-sm text-gray-600">
              Select which metadata types to remove:
            </p>

            {Object.entries(metadataCategories).map(([category, types]) => (
              <div key={category} className="space-y-3">
                <h4
                  className={`font-medium text-sm ${
                    category === "High Risk"
                      ? "text-red-700"
                      : category === "Moderate Risk"
                      ? "text-orange-700"
                      : "text-yellow-700"
                  }`}
                >
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {types.map(({ key, label, description }) => {
                    const isPresent = metadata && metadata[key];
                    const isSelected = selectedMetadataTypes.includes(key);

                    return (
                      <label
                        key={key}
                        className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!isPresent ? "opacity-50" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMetadataTypeToggle(key)}
                          disabled={!isPresent}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{label}</div>
                          <div className="text-xs text-gray-500">
                            {description}
                          </div>
                          {!isPresent && (
                            <div className="text-xs text-gray-400 mt-1">
                              Not present in image
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRemoveSelectiveMetadata}
              disabled={loading || selectedMetadataTypes.length === 0}
              className="px-8 py-3 bg-purple-600 cursor-pointer text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              {loading
                ? "Removing..."
                : `Remove ${selectedMetadataTypes.length} Selected Items`}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Results */}
      {verification && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg border"
        >
          <div
            className={`flex items-center gap-3 ${
              verification.success ? "text-green-700" : "text-red-700"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                verification.success ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {verification.success ? "✓" : "✗"}
            </div>
            <div>
              <div className="font-medium">{verification.message}</div>
              {verification.removedTypes && (
                <div className="text-sm text-gray-600">
                  Removed: {verification.removedTypes.join(", ")}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Clean Image Display */}
      {cleanImageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          <h4 className="font-medium text-gray-900">Clean Image Generated</h4>
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <img
              src={cleanImageUrl}
              alt="Clean image without metadata"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Clean Image
            </motion.button>
            <button
              onClick={() => {
                setCleanImageUrl(null);
                setVerification(null);
              }}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MetadataRemoval;
