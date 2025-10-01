import { NextResponse } from "next/server"
import { clearUserSession } from "@/lib/auth"

export async function GET() {
  try {
    await clearUserSession()
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
