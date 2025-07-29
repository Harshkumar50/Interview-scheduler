import mongoose from "mongoose"

const interviewSchema = new mongoose.Schema({
  candidate: String,
  position: String,
  date: String,
  time: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "scheduled" },
})

export default mongoose.models.Interview || mongoose.model("Interview", interviewSchema)
