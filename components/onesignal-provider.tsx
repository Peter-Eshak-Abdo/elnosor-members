"use client"

import { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/app/providers'
import { useWebPush } from '@/hooks/use-web-push'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    OneSignalDeferred: Array<((OneSignalSDK: any) => void) | undefined> | undefined;
    OneSignal: OneSignalSDK | undefined; // Add OneSignal to Window interface
  }
}

interface OneSignalSDK {
  init: (config: {
    appId: string;
    safari_web_id?: string;
    notifyButton?: { enable: boolean };
    allowLocalhostAsSecureOrigin?: boolean;
    serviceWorkerPath?: string;
    serviceWorkerParam?: { scope: string };
  }) => Promise<void>;
  Notifications: {
    permission: NotificationPermission;
    requestPermission: () => Promise<string>;
    addEventListener: (event: string, callback: (event: any) => void) => void;
  };
  User: {
    getUserId: () => Promise<string | null>;
  };
}

export function OneSignalProvider() {
  const { user } = useAuth();
  const { permission: webPushPermission, requestPermission: requestWebPushPermission } = useWebPush();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal: OneSignalSDK) {
        try {
          await OneSignal.init({
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '',
            safari_web_id: "web.onesignal.auto.2b3f64b2-7083-4ec5-9c09-3f8119751fed",
            notifyButton: {
              enable: false,
            },
            allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          });

          console.log('OneSignal initialized');

          // Set current permission to global
          (window as any).oneSignalPermission = Notification.permission;

          // Handle notification received (foreground)
          OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
            console.log('OneSignal foreground notification:', event);
            // Allow default display
            event.preventDefault();
            event.notification.display();
          });

          // Handle notification clicked
          OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('OneSignal notification clicked:', event);
            // Navigate to notification URL or home
            const url = event.notification.additionalData?.url || '/';
            window.location.href = url;
          });

        } catch (error) {
          console.error('OneSignal initialization error:', error);
        }
      });
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        (window as any).oneSignalPermission = perm;
        if (perm === 'granted') {
          toast.success('تم تفعيل الإشعارات');
          // Wait for OneSignal to be ready to get playerId
          if (window.OneSignalDeferred) {
            const OneSignal = await new Promise<OneSignalSDK>((resolve) => {
              if (window.OneSignal) {
                resolve(window.OneSignal);
              } else {
                window.OneSignalDeferred!.push((OneSignal: OneSignalSDK) => resolve(OneSignal));
              }
            });
            if (user) {
              const playerId = await OneSignal.User.getUserId();
              if (playerId) {
                const userSettingsRef = doc(db, 'user_settings', user.uid);
                await updateDoc(userSettingsRef, {
                  oneSignalPlayerId: playerId,
                  notificationsEnabled: true,
                });
                console.log('OneSignal playerId saved:', playerId);

                // Request web push permission after OneSignal token
                if (webPushPermission !== "granted") {
                  await requestWebPushPermission();
                }
              }
            }
          }
        } else if (perm === 'denied') {
          toast.error('الإشعارات محظورة, يرجى تفعيلها من إعدادات المتصفح');
        }
        return perm === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  // Expose the requestPermission to global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).requestOneSignalPermission = requestPermission;
    }
  }, [requestPermission]);

  return null;
}
