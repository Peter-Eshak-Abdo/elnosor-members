"use client"

import { useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/app/providers'
import { useWebPush } from '@/hooks/use-web-push'

declare global {
  interface Window {
    OneSignalDeferred: Array<((OneSignalSDK: any) => void) | undefined> | undefined;
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
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            serviceWorkerParam: { scope: '/' },
          });

          console.log('OneSignal initialized');

          // Request permission after initialization
          const permission = await OneSignal.Notifications.requestPermission();
          if (permission === 'granted') {
            console.log('OneSignal permission granted');

            // Get and save OneSignal playerId
            if (user) {
              try {
                const playerId = await OneSignal.User.getUserId();
                if (playerId) {
                  const userSettingsRef = doc(db, 'user_settings', user.uid);
                  await updateDoc(userSettingsRef, {
                    oneSignalPlayerId: playerId,
                    notificationsEnabled: true,
                  });
                  console.log('OneSignal playerId saved in user_settings:', playerId);

                  // Request web push permission after OneSignal token
                  if (webPushPermission !== "granted") {
                    await requestWebPushPermission();
                  }
                }
              } catch (error) {
                console.error('Error saving OneSignal playerId:', error);
              }
            }
          } else {
            console.log('OneSignal permission denied');
          }

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
  }, [user]);

  return null;
}
