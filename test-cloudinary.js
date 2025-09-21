#!/usr/bin/env node

/**
 * Cloudinary Configuration Test
 * Tests if Cloudinary is properly configured
 */

require("dotenv").config({ path: ".env.local" });

function testCloudinaryConfig() {
  console.log("🧪 Testing Cloudinary Configuration");
  console.log("==================================");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  console.log("");
  console.log("📋 Configuration Check:");

  if (cloudName) {
    console.log(`   ✅ Cloud Name: ${cloudName}`);
  } else {
    console.log("   ❌ Cloud Name: MISSING");
  }

  if (uploadPreset) {
    console.log(`   ✅ Upload Preset: ${uploadPreset}`);
  } else {
    console.log("   ❌ Upload Preset: MISSING");
  }

  console.log("");

  if (cloudName && uploadPreset) {
    console.log("🎉 Cloudinary is configured correctly!");
    console.log("");
    console.log("📝 Next steps:");
    console.log("   1. Restart your development server: npm run dev");
    console.log("   2. Test image upload in your app");
    console.log("   3. Check browser console for success messages");
  } else {
    console.log("⚠️  Cloudinary is not fully configured!");
    console.log("");
    console.log("🔧 To fix this:");
    console.log("   1. Run: node setup-cloudinary.js");
    console.log("   2. Or manually edit .env.local");
    console.log("   3. See CLOUDINARY_SETUP_COMPLETE.md for details");
  }

  console.log("");
  console.log("📚 For more help:");
  console.log("   - See CLOUDINARY_SETUP_COMPLETE.md");
  console.log("   - Check .env.example for required variables");
}

// Run the test
testCloudinaryConfig();
