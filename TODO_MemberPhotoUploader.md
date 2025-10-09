# TODO: Implement NextJS Cloudinary MemberPhotoUploader

## Overview

Implement a React component for uploading member profile photos with interactive cropping and secure Cloudinary integration.

## Completed Tasks

- [x] Create NextJS_Cloudinary_MemberPhotoUploader.jsx component with cropping functionality
- [x] Integrate with existing /api/upload API route for secure signed uploads
- [x] Use react-image-crop for interactive cropping
- [x] Add toast notifications for user feedback
- [x] Verify required dependencies are installed (react-image-crop, react-hot-toast)

## Next Steps

- [ ] Set up environment variables in .env.local:
  - [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`
  - [ ] `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset`
  - [ ] Refer to CLOUDINARY_SETUP.md for detailed instructions
- [ ] Test the component in a member profile page
- [ ] Verify cropping functionality works correctly
- [ ] Confirm image uploads to Cloudinary successfully
- [ ] Handle error cases (invalid file types, large files, network errors)
- [ ] Add loading states and progress indicators if needed
- [ ] Customize styling to match app design

## Usage Example

```jsx
import MemberPhotoUploader from "@/components/ui/NextJS_Cloudinary_MemberPhotoUploader";

function MemberProfile({ memberId }) {
  const handleUploadSuccess = (imageUrl) => {
    // Update member profile with new image URL
    console.log("Uploaded image URL:", imageUrl);
  };

  return (
    <MemberPhotoUploader
      memberId={memberId}
      onUploadSuccess={handleUploadSuccess}
    />
  );
}
```

## Notes

- The component uses the existing API route /api/upload for server-side uploads
- Signed uploads are used for security (no API secret exposed to client)
- Cropping is done client-side before upload to reduce bandwidth
- Supports JPEG output with high quality
- Error handling includes toast notifications

## Testing Checklist

- [ ] Select image file and verify cropping interface appears
- [ ] Crop image and upload successfully
- [ ] Check Cloudinary dashboard for uploaded image
- [ ] Test with different image formats (JPEG, PNG)
- [ ] Test with large files (should be rejected if >5MB)
- [ ] Test error scenarios (network failure, invalid API keys)
- [ ] Verify on mobile devices with camera input (if added)
