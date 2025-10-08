# TODO: Fix Push Notifications in PWA

## Completed Tasks:

- [x] Enable OneSignal service worker registration in `components/onesignal-provider.tsx`
- [x] Remove FCM usage from `app/notifications/page.tsx`
- [x] Remove FCM sending code from `app/api/notifications/send/route.ts`
- [x] Integrate web push after OneSignal token in `components/onesignal-provider.tsx`

## Next Steps:

- [ ] Test the app in browser and PWA mode
- [ ] Check browser console for OneSignal initialization errors
- [ ] Verify service worker registration (Application tab in DevTools)
- [ ] Send a test notification and check if it appears as system notification
- [ ] Test on different devices/browsers
- [ ] If issues persist, check OneSignal dashboard for player IDs and notification delivery

## Testing Instructions:

1. Open the app in browser, log in
2. Check if OneSignal permission is requested
3. Grant permission
4. Check console for "OneSignal initialized" and playerId saved
5. Install as PWA (if not already)
6. Send a notification from the notifications page
7. Close the app/browser tab
8. Check if notification appears in system notification bar
9. Click the notification to open the app

## Potential Issues to Check:

- HTTPS required for push notifications
- OneSignal app ID and REST API key configured correctly
- VAPID keys for web push configured
- Service worker conflicts (only OneSignal SW should be active)
- Browser support (Chrome, Firefox, Safari)
