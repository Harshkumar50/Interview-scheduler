const mongoose = require("mongoose")

const interviewSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: [true, "Candidate name is required"],
      trim: true,
      maxlength: [100, "Candidate name cannot be more than 100 characters"],
    },
    candidateEmail: {
      type: String,
      required: [true, "Candidate email is required"],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      maxlength: [100, "Position cannot be more than 100 characters"],
    },
    date: {
      type: Date,
      required: [true, "Interview date is required"],
      validate: {
        validator: (value) => value > new Date(),
        message: "Interview date must be in the future",
      },
    },
    time: {
      type: String,
      required: [true, "Interview time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time format (HH:MM)"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [15, "Duration must be at least 15 minutes"],
      max: [480, "Duration cannot exceed 8 hours"],
      default: 60,
    },
    type: {
      type: String,
      required: [true, "Interview type is required"],
      enum: {
        values: ["technical", "behavioral", "hr", "final"],
        message: "Interview type must be technical, behavioral, hr, or final",
      },
      default: "technical",
    },
    status: {
      type: String,
      enum: {
        values: ["scheduled", "completed", "cancelled", "rescheduled"],
        message: "Status must be scheduled, completed, cancelled, or rescheduled",
      },
      default: "scheduled",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot be more than 1000 characters"],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, "Feedback cannot be more than 2000 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
interviewSchema.index({ createdBy: 1, date: 1 })
interviewSchema.index({ candidateEmail: 1 })
interviewSchema.index({ status: 1 })

module.exports = mongoose.model("Interview", interviewSchema)
