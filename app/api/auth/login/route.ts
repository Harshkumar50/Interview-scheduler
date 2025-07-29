import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    await connectDB()

    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    return NextResponse.json({ token, user: { id: user._id, name: user.name, role: user.role } })
  } catch (error) {
    return NextResponse.json({ message: "Login failed" }, { status: 500 })
  }
}
