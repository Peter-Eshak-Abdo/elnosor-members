# TODO: PWA Background Sync and Offline Support

## Overview

Implement background synchronization and update capabilities for the PWA, and ensure offline functionality for the profile page and app navigation.

## Tasks

### 1. Implement Background Sync for PWA Updates

- **Problem**: No background sync for app updates and data synchronization.
- **Solution**:
  - Create custom service worker with background sync API.
  - Add periodic sync for checking updates.
  - Implement sync event handlers for data updates.
  - Add API endpoints for update checking.

Status: Completed

### 2. Extend Offline Caching for 1 Year

- **Problem**: Limited offline caching duration (24 hours).
- **Solution**:
  - Change Firestore/Firebase caching to StaleWhileRevalidate.
  - Extend cache expiration to 1 year for member data.
  - Add member data specific caching rules.
  - Cache static assets for longer periods.

Status: Completed

### 3. Enhance Profile Page Offline Functionality

- **Problem**: Profile page requires network for initial load.
- **Solution**:
  - Always load from localStorage cache first for instant access.
  - Fetch fresh data in background when online.
  - Show cached data immediately when offline.
  - Better error handling for offline scenarios.

Status: Completed

### 4. Test Offline Functionality

- Test profile page works offline after first load.
- Test app navigation works offline.
- Test background sync triggers updates.
- Test cache expiration and refresh.

Status: Pending

# TODO: Implement Push Notifications System

## Overview

Implement a complete push notifications system for the PWA to appear in the Notification Bar like WhatsApp, even when the app is closed or locked.

## Tasks

### 1. Get Token / Subscription ID

- **Problem**: Need to obtain push subscription tokens for each user.
- **Solution**:
  - Use existing useFCM hook to get FCM token and save to user document.
  - Use existing OneSignalProvider to initialize OneSignal and get playerId.
  - Use existing useWebPush hook to subscribe to native Web Push and save subscription.
  - Ensure tokens are saved in Firestore under user documents.

Status: Completed (hooks already implemented)

### 2. Save Token for Each User

- **Problem**: Tokens need to be stored securely for sending notifications.
- **Solution**:
  - FCM token saved in user document as 'fcmToken'.
  - Web Push subscription saved in user subcollection 'pushSubscription/subscription'.
  - OneSignal playerId handled by OneSignal service.

Status: Completed (saving already implemented)

### 3. Send Notification Using Token

- **Problem**: Need API endpoint to send notifications using saved tokens.
- **Solution**:
  - Use existing /api/notifications/send endpoint that sends via OneSignal and web-push.
  - Ensure endpoint retrieves user tokens from Firestore and sends notifications.
  - Add support for FCM server-side sending if needed.

Status: Completed (API updated with FCM sending)

### 4. Service Worker Receives Notification

- **Problem**: Service worker must handle push events and show system notifications.
- **Solution**:
  - Ensure custom-sw.js handles push events with self.registration.showNotification().
  - Verify firebase-messaging-sw.js handles FCM background messages.
  - Check OneSignal service worker integration.
  - Test that notifications appear in notification bar when app is closed.

Status: Completed (Service workers configured and registered)

### 5. Fix Push Notifications to Appear as System Notifications

- **Problem**: Notifications only appear when PWA is open, not as system notifications in notification bar when app is closed/locked.
- **Root Cause**: Service worker push event handling may not be working properly, or notifications are being shown as in-app instead of system notifications.
- **Solution**:
  - Ensure service worker is properly registered and handles push events.
  - Check that notifications are created with `self.registration.showNotification()` in push event.
  - Verify manifest.json has proper PWA settings for notifications.
  - Test that notifications appear even when app is closed.
  - Add notification badge count to app icon.

Status: Pending

### 6. Add Notification Badge with Count

- **Problem**: No badge showing notification count on app icon.
- **Solution**:
  - Use `navigator.setAppBadge()` API for PWA badge.
  - Track unread notifications count in Firestore.
  - Update badge when notifications are read/unread.
  - Fallback for browsers that don't support badges.

Status: Pending

### 7. Test and Validate Push Notifications

- Test push notifications on mobile PWA (appear when app closed/locked).
- Test notification badges on supported browsers.
- Ensure tokens are properly saved and retrieved.
- Verify API sends notifications using tokens.

Status: Pending

## Files to Edit

- `public/custom-sw.js`: Ensure push event handling for system notifications.
- `public/firebase-messaging-sw.js`: Ensure FCM background message handling.
- `app/api/notifications/send/route.ts`: Ensure proper token retrieval and sending.
- `hooks/use-fcm.ts`: Ensure FCM token saving.
- `hooks/use-web-push.ts`: Ensure web push subscription saving.
- `components/onesignal-provider.tsx`: Ensure OneSignal integration.

Status: Pending

## Additional Notes

- Ensure all changes work on both desktop and mobile PWA.
- Test on different browsers (Chrome, Firefox, Safari).
- Handle edge cases like permission denied, invalid tokens, etc.
- Update TODO.md with completion status after implementing fixes.

# TODO: Add Permissions and Fix Image Selection Issues

## Overview

Add camera and storage permissions on first app open, and fix image selection issues where crop doesn't move and image doesn't update after save/skip.

## Tasks

### 1. Add Camera Permission Request on First App Open

- **Problem**: Camera permission not requested on app initialization.
- **Solution**:
  - Add camera permission request in providers after user authentication (non-blocking).
  - Request permission using `navigator.mediaDevices.getUserMedia({ video: true })`.
  - Handle permission denied gracefully - app works normally without permissions.
  - Also request notification permission for push notifications.

Status: Completed

### 2. Add Storage Permission Request

- **Problem**: Storage permission not requested for photo selection from gallery.
- **Solution**:
  - Request storage permission when selecting from gallery.
  - Note: Web doesn't have standard storage permission, but handle file access permission.
  - Show appropriate messages for different browsers.

Status: Pending

### 3. Fix Image Crop Not Moving from Center

- **Problem**: Crop rectangle doesn't move when user tries to drag it.
- **Solution**:
  - Check ReactCrop configuration in `components/ui/image-upload.tsx`.
  - Ensure `onChange` and `onComplete` are properly set.
  - Test crop dragging functionality.

Status: Completed

### 4. Fix Image Not Updating After Save or Skip Crop

- **Problem**: After selecting image and clicking save or skip crop, image stays as Google image instead of uploaded one.
- **Root Cause**: State not updating properly or upload failing silently.
- **Solution**:
  - Ensure `onUpload` callback updates state correctly in parent component.
  - Add error handling and user feedback for upload failures.
  - Check if `uploadedPhotoUrl` is being set and used in form submission.
  - Verify Cloudinary upload is working and returning valid URL.

Status: Completed

### 5. Test and Validate Fixes

- Test camera permission request on first open.
- Test storage/file access permission.
- Test image crop dragging.
- Test image upload and display after save/skip.
- Test on different devices and browsers.

Status: Pending

## Files to Edit

- `components/splash-screen.tsx`: Add permission requests.
- `app/providers.tsx`: Add permission logic.
- `components/ui/image-upload.tsx`: Fix crop and upload issues.
- `app/profile/complete/page.tsx`: Ensure state updates correctly.

Status: Pending

## Additional Notes

- Add user-friendly toast messages for permission requests.
- Handle permission denied cases gracefully.
- Ensure changes work on both mobile and desktop PWA.
- Update TODO.md with completion status after implementing fixes.

# TODO: Fix Camera Permissions and OneSignal Service Worker Issues

## Overview

Fix camera permissions policy violation and OneSignal service worker registration failures in the deployed app.

## Tasks

### 1. Update Permissions-Policy Header to Allow Camera Access

- **Problem**: Permissions-Policy header in next.config.js was set to "camera=()", blocking camera access.
- **Solution**:
  - Changed Permissions-Policy to "camera=(self), microphone=(), geolocation=()".
  - This allows camera access from the same origin.

Status: Completed

### 2. Fix OneSignal Service Worker Registration

- **Problem**: OneSignal service worker registration failed with origin mismatch error for malformed scriptURL.
- **Solution**:
  - Removed serviceWorkerPath and serviceWorkerParam from OneSignal.init config.
  - Let OneSignal use default CDN service worker to avoid registration issues.
  - Kept OneSignalSDKWorker.js and OneSignalSDK.sw.js files for potential future use.

Status: Completed

### 3. Test Fixes in Deployed App

- Test camera permission requests work without policy violations.
- Test OneSignal service worker registers successfully.
- Test OneSignal notifications work properly.
- Verify install prompt behavior remains correct.

Status: Pending

## Files Edited

- `next.config.js`: Updated Permissions-Policy header.
- `components/onesignal-provider.tsx`: Removed serviceWorkerPath config.

## Additional Notes

- Camera permissions should now work for QR scanning and photo uploads.
- OneSignal notifications should register service worker without origin errors.
- Monitor console logs after deployment to confirm fixes.

# TODO: Move Front-End Role Checks to Back-End

## Overview

Move all front-end role checks like `{role === "admin" && (` to back-end to prevent users from tampering via browser inspect or viewing code on GitHub. This ensures role-based logic is enforced server-side.

## Method

- Replace front-end role checks with API calls that perform role validation server-side.
- API endpoints will check user role from Firebase Auth custom claims or Firestore, and return appropriate data or permissions.
- Front-end will render UI based on API responses, not local role state.
- Use server-side rendering where possible for sensitive pages.

## Plan and Steps

1. **Identify All Role Checks**: Use grep search to find all `role === "admin"` instances (found 61 results across multiple files).

2. **Categorize by Feature**:

   - Navigation: Conditionally show admin/member menu items.
   - Dashboard: Show admin vs member stats and actions.
   - Posts: Edit/delete permissions.
   - Members: Admin management features.
   - Attendance: Admin controls.
   - Notifications: Admin scheduling features.
   - Profile: Edit permissions.

3. **Create API Endpoints**:

   - `/api/user/permissions`: Returns user permissions object based on role.
   - `/api/dashboard/data`: Returns dashboard data (stats, actions) based on role.
   - `/api/posts/permissions`: Returns edit/delete permissions for posts/comments.
   - `/api/navigation/items`: Returns navigation items based on role.
   - `/api/members/actions`: Returns available member management actions.
   - `/api/attendance/controls`: Returns attendance controls based on role.
   - `/api/notifications/features`: Returns notification features based on role.

4. **Update Front-End Components**:

   - Replace role checks with API calls in useEffect or hooks.
   - Store permissions in state and render conditionally.
   - Handle loading states while fetching permissions.

5. **Server-Side Role Checking**:

   - In API routes, verify user authentication and role from Firebase.
   - Return 403 Forbidden if insufficient permissions.
   - Log security attempts.

6. **Testing**:
   - Test that admin features are inaccessible to members.
   - Verify API responses match role.
   - Check that front-end can't be tampered with.

## Files to Edit

### Core Components

- `components/layout/navigation.tsx`: Navigation items based on role
- `components/layout/mobile-navigation.tsx`: Mobile nav items
- `components/auth/role-guard*.tsx`: Role checking logic

### Pages

- `app/dashboard/page.tsx`: Stats and actions
- `app/posts/page.tsx`: Edit/delete permissions
- `app/members/page.tsx`: Admin features
- `app/attendance/page.tsx`: Admin controls
- `app/notifications/page.tsx`: Admin features
- `app/profile/page.tsx`: Edit permissions
- `app/test-role/page.tsx`: Role display

### API Routes (Update existing)

- `app/api/members/route.ts`
- `app/api/admin/check-role*/route.ts`
- `app/api/members/[id]/*/route.ts`

### Lib Files

- `lib/auth.ts`: Role resolution
- `lib/auth-debug.ts`: Debug role checking

Status: Pending

## Additional Notes

- Ensure all API routes use proper authentication middleware.
- Implement rate limiting on permission checks.
- Add audit logging for role-based actions.
- Update after implementing to mark as completed.
