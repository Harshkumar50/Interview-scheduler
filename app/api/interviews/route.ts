import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Interview from "@/models/Interview"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    await connectDB()
    const interviews = await Interview.find({ createdBy: decoded.userId }).sort({ date: 1, time: 1 })

    return NextResponse.json(interviews)
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    const interviewData = await request.json()

    await connectDB()
    const interview = await Interview.create({
      ...interviewData,
      createdBy: decoded.userId,
      status: "scheduled",
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error("Error creating interview:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}