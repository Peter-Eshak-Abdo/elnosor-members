"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getUserRole } from "@/lib/auth"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import SplashScreen from "@/components/splash-screen"

export interface AuthContextType {
  user: User | null
  role: "admin" | "member" | null
  token: string | null
  loading: boolean
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  token: null,
  loading: true,
  refreshRole: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<"admin" | "member" | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const hasShownSplash = useRef(false)

  const refreshRole = async () => {
    if (user) {
      try {
        const userRole = await getUserRole(user)
        setRole(userRole)
      } catch (error) {
        console.error("Error refreshing user role:", error)
        setRole("member") // Default fallback
      }
    }
  }

  useEffect(() => {
    // Set hydrated flag after component mounts to prevent hydration mismatch
    setIsHydrated(true)

    // Service worker is registered by next-pwa, no need to register manually

    // Load cached auth state first for offline support
    const loadCachedAuth = () => {
      try {
        const cachedAuth = localStorage.getItem('auth-cache')
        if (cachedAuth) {
          const { user: cachedUser, role: cachedRole, token: cachedToken } = JSON.parse(cachedAuth)
          if (cachedUser && cachedRole) {
            setUser(cachedUser)
            setRole(cachedRole)
            setToken(cachedToken)
            // If offline, use cached data
            if (!navigator.onLine) {
              setLoading(false)
              return true
            }
          }
        }
      } catch (error) {
        console.error("Error loading cached auth:", error)
      }
      return false
    }

    const cachedLoaded = loadCachedAuth()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const userRole = await getUserRole(user)
          setRole(userRole)
          const idToken = await user.getIdToken()
          setToken(idToken)

          // Cache auth state for offline use
          try {
            localStorage.setItem('auth-cache', JSON.stringify({
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
              },
              role: userRole,
              token: idToken,
              timestamp: Date.now()
            }))
          } catch (cacheError) {
            console.error("Error caching auth:", cacheError)
          }

          // Request permissions after user is authenticated (non-blocking)
          setTimeout(() => {
            requestOptionalPermissions()
          }, 2000)
        } catch (error) {
          console.error("Error getting user role:", error)
          setRole("member") // Default fallback
          setToken(null)
        }
      } else {
        setRole(null)
        setToken(null)
        // Clear cache if logged out
        localStorage.removeItem('auth-cache')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Request optional permissions (camera only - notifications handled by OneSignal) - non-blocking
  const requestOptionalPermissions = async () => {
    try {
      // Request camera permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop()) // Stop immediately after permission granted
        console.log('Camera permission granted')
      }
    } catch (error) {
      console.log('Camera permission not granted - app will work without camera features')
    }
  }

  useEffect(() => {
    if (isHydrated && !loading && !hasShownSplash.current && !showSplash) {
      setShowSplash(true)
    }
  }, [isHydrated, loading, showSplash])

  // Prevent hydration mismatch by not rendering until after client-side hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, role, token, loading, refreshRole }}>
      <ThemeProvider>
        {children}
        {showSplash && (<SplashScreen />)}
      </ThemeProvider>
    </AuthContext.Provider>
  )
}
