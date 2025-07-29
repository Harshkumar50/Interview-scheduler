import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Interview from "@/models/Interview"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }
    const updateData = await request.json()

    await connectDB()
    const interview = await Interview.findOneAndUpdate({ _id: params.id, createdBy: decoded.userId }, updateData, {
      new: true,
    })

    if (!interview) return NextResponse.json({ message: "Interview not found" }, { status: 404 })

    return NextResponse.json(interview)
  } catch (error) {
    console.error("Error updating interview:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) return NextResponse.json({ message: "No token provided" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    await connectDB()
    const interview = await Interview.findOneAndDelete({
      _id: params.id,
      createdBy: decoded.userId,
    })

    if (!interview) return NextResponse.json({ message: "Interview not found" }, { status: 404 })

    return NextResponse.json({ message: "Interview deleted successfully" })
  } catch (error) {
    console.error("Error deleting interview:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
