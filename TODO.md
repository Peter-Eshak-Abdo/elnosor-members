# TODO: PWA Background Sync and Offline Support

## Overview

Implement background synchronization and update capabilities for the PWA, and ensure offline functionality for the profile page and app navigation.

## Tasks

### 1. Test Offline Functionality

- Test profile page works offline after first load.
- Test app navigation works offline.
- Test background sync triggers updates.
- Test cache expiration and refresh.

Status: Pending

# TODO: Implement Push Notifications System

## Overview

Implement a complete push notifications system for the PWA to appear in the Notification Bar like WhatsApp, even when the app is closed or locked.

## Tasks

### 1. Fix Push Notifications to Appear as System Notifications

- **Problem**: Notifications only appear when PWA is open, not as system notifications in notification bar when app is closed/locked.
- **Root Cause**: Service worker push event handling may not be working properly, or notifications are being shown as in-app instead of system notifications.
- **Solution**:
  - Ensure service worker is properly registered and handles push events.
  - Check that notifications are created with `self.registration.showNotification()` in push event.
  - Verify manifest.json has proper PWA settings for notifications.
  - Test that notifications appear even when app is closed.
  - Add notification badge count to app icon.

Status: Pending

### 2. Add Notification Badge with Count

- **Problem**: No badge showing notification count on app icon.
- **Solution**:
  - Use `navigator.setAppBadge()` API for PWA badge.
  - Track unread notifications count in Firestore.
  - Update badge when notifications are read/unread.
  - Fallback for browsers that don't support badges.

Status: Pending

### 3. Test and Validate Push Notifications

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

### 1. Add Storage Permission Request

- **Problem**: Storage permission not requested for photo selection from gallery.
- **Solution**:
  - Request storage permission when selecting from gallery.
  - Note: Web doesn't have standard storage permission, but handle file access permission.
  - Show appropriate messages for different browsers.

Status: Pending

### 2. Test and Validate Fixes

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

### 1. Test Fixes in Deployed App

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

# TODO: Server Features

## Overview

Implement remaining server-side features for the admin interface.

## Tasks

### 1. Homepage Improvements

- Make Header glassy and rounded and 75% width

Status: Completed

### 2. Members Page Enhancements

- Delete member functionality
- Export members to Excel sheet
- Import members from Excel sheet
- Add member manually
- Create page showing people with birthdays in current month automatically sorted
- Edit member data: change profile picture

Status: Pending

### 3. Notifications Page Features

- Daily notifications for verses and fathers' sayings
- Automatic notification on person's birthday
- Send token for push notifications

Status: Pending

### 4. Gallery Page

- Download images functionality

Status: Pending

### 5. Offline Support

- Server records attendance and syncs in background when network available
- Member can open profile, notifications, and gallery pages offline

Status: Pending

### 6. Posts Page

- Format post appearance

Status: Pending

## Additional Notes

- Ensure all features work on both desktop and mobile PWA.
- Test thoroughly after implementation.

# TODO: Member Features

## Overview

Implement member-side features for the user interface.

## Tasks

### 1. Login Page Enhancements

- Login with email and password including forget password functionality
- Add photo from images
- Make birth date clearer using Shadcn calendar
- Add last communion date
- Add last confession date

Status: Pending

### 2. Homepage Improvements

- Make homepage work offline
- Allow taking screenshot

Status: Pending

### 3. Create Complaints and Suggestions Page

- List to choose complaint or suggestion
- Textarea to write in

Status: Pending

### 4. Update Notifications

- Notification for posts
- Automatic birthday notification

Status: Pending

## Additional Notes

- Ensure features are user-friendly and accessible.
- Test on different devices.

# TODO: Back-end Improvements

## Overview

Migrate to better back-end solutions and storage options.

## Tasks

### 1. Database Migration

- Migrate to Supabase
- Use Excel sheet as database

Status: Pending

### 2. Image Storage

- Store images on drive or Supabase

Status: Pending

## Additional Notes

- Plan migration carefully to avoid data loss.
- Test thoroughly after migration.

# TODO: UI & UX Enhancements

## Overview

Improve user interface and experience for better performance and usability.

## Tasks

### 1. Caching for Faster Loading

- Implement caching to load faster

Status: Pending

## Additional Notes

- Focus on performance improvements.
- Test loading times before and after changes.
