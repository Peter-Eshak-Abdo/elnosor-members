import { NextRequest, NextResponse } from "next/server"
import { adminAuth as auth, adminDb } from "@/lib/firebase-admin"
import { firestoreHelpers } from "@/hooks/use-firestore"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 })
    }

    // Verify the ID token
    let decodedToken
    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decodedToken.uid

    // Handle first login - create user document in users collection if it doesn't exist
    const userData = {
      uid: userId,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email?.split('@')[0],
      photoURL: decodedToken.picture,
      role: "user", // Default role
      createdAt: new Date(),
      lastLogin: new Date(),
    }

    await firestoreHelpers.handleFirstLogin(userId, userData)

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to handle login" }, { status: 500 })
  }
}
