"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const ContentBlur = ({
  selectedFile,
  detectedContent,
  onBlurComplete,
  defaultIntensity,
}) => {
  const [loading, setLoading] = useState(false);
  const [blurType, setBlurType] = useState("license_plate");
  const [intensity, setIntensity] = useState(defaultIntensity || "heavy");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [blurredImageUrl, setBlurredImageUrl] = useState(null);

  const handlePreview = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("content_type", blurType);
      formData.append("intensity", intensity);

      const response = await fetch(
        "http://localhost:5000/content-blur/blur-preview",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Preview generation failed");
      }

      const data = await response.json();
      setPreview(data.preview);
    } catch (error) {
      console.error("Preview generation failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBlur = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("content_type", blurType);
      formData.append("intensity", intensity);

      const response = await fetch(
        "http://localhost:5000/content-blur/blur-content",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Blur application failed");
      }

      // Get the blurred image as blob
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBlurredImageUrl(imageUrl);

      if (onBlurComplete) {
        onBlurComplete(imageUrl);
      }
    } catch (error) {
      console.error("Blur application failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (blurredImageUrl) {
      const link = document.createElement("a");
      link.href = blurredImageUrl;
      link.download = `blurred_${selectedFile?.name || "image.jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getContentTypeLabel = (type) => {
    const labels = {
      license_plate: "License Plate",
      text: "Text Content",
      face: "Faces",
      custom: "Custom Region",
    };
    return labels[type] || type;
  };

  const getIntensityLabel = (intensity) => {
    const labels = {
      light: "Light",
      medium: "Medium",
      heavy: "Heavy",
    };
    return labels[intensity] || intensity;
  };

  return (
    <motion.div
      className="mt-8 bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Blur Sensitive Content
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Protect privacy by blurring detected content
          </span>
        </div>
      </div>

      {/* Blur Options */}
      <div className="space-y-4 mb-6">
        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type to Blur
          </label>
          <select
            value={blurType}
            onChange={(e) => setBlurType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="license_plate">License Plate</option>
            <option value="text">Text Content</option>
            <option value="face">Faces</option>
            <option value="custom">Custom Region</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {blurType === "license_plate" &&
              "Blur the bottom region where license plates are typically located"}
            {blurType === "text" &&
              "Blur regions where text is likely to be found"}
            {blurType === "face" &&
              "Blur detected face regions using skin tone detection"}
            {blurType === "custom" && "Blur a specific rectangular region"}
          </p>
        </div>

        {/* Intensity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blur Intensity
          </label>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="light">Light Blur</option>
            <option value="medium">Medium Blur</option>
            <option value="heavy">Heavy Blur</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePreview}
          disabled={loading || !selectedFile}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {loading ? "Generating Preview..." : "Preview Blur"}
        </motion.button> */}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleApplyBlur}
          disabled={loading || !selectedFile}
          className="px-8 py-3 bg-purple-600 cursor-pointer text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
        >
          {loading ? "Applying Blur..." : "Apply Blur"}
        </motion.button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Error: {error}</span>
          </div>
        </motion.div>
      )}

      {/* Preview Display */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h4 className="font-medium text-gray-900 mb-3">Blur Preview</h4>
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <img
              src={preview}
              alt="Blur preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {getContentTypeLabel(blurType)} - {getIntensityLabel(intensity)}{" "}
              Blur
            </div>
          </div>
        </motion.div>
      )}

      {/* Blurred Image Display */}
      {blurredImageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="font-medium text-gray-900">Blurred Image</h4>
          <div className="relative aspect-video rounded-lg overflow-hidden border">
            <img
              src={blurredImageUrl}
              alt="Blurred image"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Download Blurred Image
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setBlurredImageUrl(null);
                setPreview(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Start Over
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ContentBlur;
