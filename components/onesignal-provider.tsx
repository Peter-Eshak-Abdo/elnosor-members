"use client"

import { useEffect, useState } from 'react'
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

  const [oneSignal, setOneSignal] = useState<OneSignalSDK | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

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
          setOneSignal(OneSignal);

          // Check current permission
          const currentPermission = await OneSignal.Notifications.requestPermission();
          setPermission(currentPermission === 'granted' ? 'granted' : 'denied');

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
    if (!oneSignal) return false;
    try {
      const perm = await oneSignal.Notifications.requestPermission();
      setPermission(perm === 'granted' ? 'granted' : 'denied');
      if (perm === 'granted' && user) {
        const playerId = await oneSignal.User.getUserId();
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
      return perm === 'granted';
    } catch (error) {
      console.error('Error requesting OneSignal permission:', error);
      return false;
    }
  };

  // Expose the permission and requestPermission to the context or global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).oneSignalPermission = permission;
      (window as any).requestOneSignalPermission = requestPermission;
    }
  }, [permission, requestPermission]);

  return null;
}
