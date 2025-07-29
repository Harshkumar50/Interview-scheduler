import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()
    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ name, email, password: hashedPassword })

    return NextResponse.json({ message: "User registered", userId: newUser._id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}
