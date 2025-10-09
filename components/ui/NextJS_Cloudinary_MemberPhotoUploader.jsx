/**
 * NextJS_Cloudinary_MemberPhotoUploader.jsx
 *
 * React component for member photo upload with cropping and Cloudinary integration.
 *
 * Features:
 * - Upload member profile photos from file input or camera
 * - Interactive cropping using react-image-crop
 * - Upload cropped image to Next.js API route as file
 * - Server uploads to Cloudinary securely using signed uploads
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
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import toast from "react-hot-toast";

export default function MemberPhotoUploader({ memberId, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);

  // Handle file selection
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setCrop({ aspect: 1 });
      setCompletedCrop(null);
    } else {
      toast.error("Please select a valid image file.");
    }
  };

  // Create cropped image blob from canvas
  const getCroppedImgBlob = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        1
      );
    });
  };

  // Upload cropped image to API route
  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please complete cropping before uploading.");
      return;
    }
    setUploading(true);
    try {
      const blob = await getCroppedImgBlob(imgRef.current, completedCrop);
      const croppedFile = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", croppedFile);
      formData.append("type", "member");
      formData.append("id", memberId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Image uploaded successfully!");
        onUploadSuccess && onUploadSuccess(data.url);
        setSelectedFile(null);
        setCompletedCrop(null);
      } else {
        toast.error(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed due to an error.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={uploading}
      />
      {selectedFile && (
        <div>
          <ReactCrop
            src={URL.createObjectURL(selectedFile)}
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            crossorigin="anonymous"
          >
            <img ref={imgRef} alt="Crop preview" />
          </ReactCrop>
          <button
            onClick={uploadCroppedImage}
            disabled={uploading || !completedCrop}
          >
            {uploading ? "Uploading..." : "Upload Cropped Image"}
          </button>
          <button
            onClick={() => {
              setSelectedFile(null);
              setCompletedCrop(null);
            }}
            disabled={uploading}
          >
            Cancel
          </button>
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
 * - You can customize styling and UI as needed.
 */
