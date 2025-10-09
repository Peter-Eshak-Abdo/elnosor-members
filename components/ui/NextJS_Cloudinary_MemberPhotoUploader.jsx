/**
 * NextJS_Cloudinary_MemberPhotoUploader.jsx
 *
 * React component for member photo upload with cropping and Cloudinary integration.
 *
 * Features:
 * - Upload member profile photos from file input
 * - Interactive cropping using react-image-crop
 * - Upload cropped image to Next.js API route as file
 * - Server uploads to Cloudinary securely using signed uploads
 * - Comprehensive error handling with specific messages
 *
 * Usage:
 * 1) Install dependencies:
 *    npm i react-image-crop react-hot-toast
 * 2) Add environment variables to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
 * 3) Use this component in your Next.js pages or components.
 */

"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import toast from "react-hot-toast";

export default function MemberPhotoUploader({ memberId, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  // Handle file selection with validation
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `نوع الملف غير مدعوم. يرجى اختيار: ${allowedTypes.join(", ")}`
      );
      console.error("Unsupported file type:", file.type);
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(
        `حجم الملف ${Math.round(
          file.size / 1024 / 1024
        )}MB يتجاوز الحد الأقصى 5MB`
      );
      console.error("File too large:", file.size, "bytes");
      return;
    }

    // Check if file is actually an image
    if (!file.type.startsWith("image/")) {
      toast.error("الملف المختار ليس صورة صالحة");
      console.error("File is not an image:", file.type);
      return;
    }

    setSelectedFile(file);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  // Initialize crop when image loads
  const onImageLoad = (e) => {
    try {
      const { width, height } = e.currentTarget;

      if (width === 0 || height === 0) {
        toast.error("فشل في تحميل الصورة. يرجى المحاولة مرة أخرى");
        console.error("Image loaded with zero dimensions");
        return;
      }

      // Center the initial crop
      const initialCrop = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 50,
          },
          1, // aspect ratio 1:1 for square
          width,
          height
        ),
        width,
        height
      );
      setCrop(initialCrop);
      setCompletedCrop(initialCrop);
    } catch (error) {
      console.error("Error initializing crop:", error);
      toast.error("خطأ في تهيئة أداة القص");
    }
  };

  // Create cropped image blob from canvas with error handling
  const getCroppedImgBlob = (image, crop) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Canvas context not available - browser may not support canvas"
        );
      }

      // Validate crop dimensions
      if (!crop.width || !crop.height || crop.width <= 0 || crop.height <= 0) {
        throw new Error("Invalid crop dimensions");
      }

      // Since crop unit is '%', convert to natural pixels
      const naturalX = (crop.x / 100) * image.naturalWidth;
      const naturalY = (crop.y / 100) * image.naturalHeight;
      const naturalWidthCrop = (crop.width / 100) * image.naturalWidth;
      const naturalHeightCrop = (crop.height / 100) * image.naturalHeight;

      // Validate natural dimensions
      if (naturalWidthCrop <= 0 || naturalHeightCrop <= 0) {
        throw new Error("Crop area too small");
      }

      canvas.width = naturalWidthCrop;
      canvas.height = naturalHeightCrop;

      ctx.drawImage(
        image,
        naturalX,
        naturalY,
        naturalWidthCrop,
        naturalHeightCrop,
        0,
        0,
        naturalWidthCrop,
        naturalHeightCrop
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(
                new Error("فشل في إنشاء الصورة المقصوصة - قد تكون الصورة تالفة")
              );
            }
          },
          "image/jpeg",
          0.95 // High quality
        );
      });
    } catch (error) {
      console.error("Error creating cropped blob:", error);
      throw new Error(`خطأ في قص الصورة: ${error.message}`);
    }
  };

  // Upload cropped image to API route with detailed error handling
  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("يرجى إكمال عملية القص قبل الرفع");
      return;
    }

    if (!memberId) {
      toast.error("معرف العضو مطلوب");
      console.error("No memberId provided");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting cropped upload for member:", memberId);

      const blob = await getCroppedImgBlob(imgRef.current, completedCrop);
      console.log("Blob created successfully, size:", blob.size);

      const croppedFile = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", croppedFile);
      formData.append("type", "member");
      formData.append("id", memberId);

      console.log("Sending upload request to /api/upload");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error("استجابة غير صالحة من الخادم");
      }

      if (response.ok && data.success) {
        toast.success("تم رفع الصورة المقصوصة بنجاح!");
        console.log("Upload successful, URL:", data.url);
        onUploadSuccess && onUploadSuccess(data.url);
        setSelectedFile(null);
        setCompletedCrop(null);
        setCrop(undefined);
      } else {
        const errorMessage = data.error || "فشل في رفع الصورة";
        console.error("Upload failed:", errorMessage, data);
        toast.error(errorMessage);

        // Provide specific guidance for common errors
        if (response.status === 400) {
          toast.error("تحقق من إعدادات Cloudinary أو حجم الملف");
        } else if (response.status === 500) {
          toast.error("خطأ في الخادم - تحقق من السجلات");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.message || "حدث خطأ أثناء رفع الصورة";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Upload without cropping with error handling
  const uploadWithoutCrop = async () => {
    if (!selectedFile) {
      toast.error("يرجى اختيار صورة أولاً");
      return;
    }

    if (!memberId) {
      toast.error("معرف العضو مطلوب");
      console.error("No memberId provided");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting direct upload for member:", memberId);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "member");
      formData.append("id", memberId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error("استجابة غير صالحة من الخادم");
      }

      if (response.ok && data.success) {
        toast.success("تم رفع الصورة بنجاح!");
        console.log("Upload successful, URL:", data.url);
        onUploadSuccess && onUploadSuccess(data.url);
        setSelectedFile(null);
        setCompletedCrop(null);
        setCrop(undefined);
      } else {
        const errorMessage = data.error || "فشل في رفع الصورة";
        console.error("Upload failed:", errorMessage, data);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.message || "حدث خطأ أثناء رفع الصورة";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">
          PNG, JPG, GIF, WebP حتى 5 ميجابايت
        </p>
      </div>

      {selectedFile && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              crossorigin="anonymous"
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={URL.createObjectURL(selectedFile)}
                onLoad={onImageLoad}
                alt="Crop preview"
                className="max-w-full max-h-96 object-contain"
                style={{ display: "block" }}
              />
            </ReactCrop>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={uploadCroppedImage}
              disabled={uploading || !completedCrop}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? "جاري الرفع..." : "رفع الصورة المقصوصة"}
            </button>

            <button
              onClick={uploadWithoutCrop}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? "جاري الرفع..." : "رفع بدون قص"}
            </button>

            <button
              onClick={() => {
                setSelectedFile(null);
                setCompletedCrop(null);
                setCrop(undefined);
              }}
              disabled={uploading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Notes:
 * - This component uses the existing /api/upload API route for uploading images.
 * - Ensure your .env.local has NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET set.
 * - The server-side upload uses signed uploads for security.
 * - Cropping is done client-side before upload to reduce bandwidth.
 * - Comprehensive error handling with Arabic messages and console logging.
 */
