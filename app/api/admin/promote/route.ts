import { NextRequest, NextResponse } from "next/server";
import { adminAuth as auth } from "@/lib/firebase-admin";
import { firestoreHelpers } from "@/hooks/use-firestore";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify admin authentication (you might want to add admin role check here)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      await auth.verifyIdToken(idToken);
    } catch (verifyError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Promote user to admin
    await firestoreHelpers.promoteUserToAdmin(userId);

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully",
    });
  } catch (error) {
    console.error("Promote to admin error:", error);
    return NextResponse.json(
      { error: "Failed to promote user to admin" },
      { status: 500 }
    );
  }
}
