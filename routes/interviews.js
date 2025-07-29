const express = require("express")
const { body, validationResult, param } = require("express-validator")
const Interview = require("../models/Interview")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/interviews
// @desc    Get all interviews for the authenticated user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10, sortBy = "date", sortOrder = "asc" } = req.query

    // Build query
    const query = { createdBy: req.user._id }

    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const interviews = await Interview.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("createdBy", "name email")

    // Get total count for pagination
    const total = await Interview.countDocuments(query)

    res.json({
      interviews,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
        total,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching interviews:", error)
    res.status(500).json({ message: "Server error while fetching interviews" })
  }
})

// @route   GET /api/interviews/stats
// @desc    Get interview statistics for the authenticated user
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user._id
    const now = new Date()

    const stats = await Interview.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: {
            $sum: {
              $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
          upcoming: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$status", "scheduled"] }, { $gt: ["$date", now] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    const result = stats[0] || {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      upcoming: 0,
    }

    res.json(result)
  } catch (error) {
    console.error("Error fetching interview stats:", error)
    res.status(500).json({ message: "Server error while fetching statistics" })
  }
})

// @route   GET /api/interviews/:id
// @desc    Get a specific interview
// @access  Private
router.get("/:id", [param("id").isMongoId().withMessage("Invalid interview ID"), auth], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const interview = await Interview.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("createdBy", "name email")

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" })
    }

    res.json(interview)
  } catch (error) {
    console.error("Error fetching interview:", error)
    res.status(500).json({ message: "Server error while fetching interview" })
  }
})

// @route   POST /api/interviews
// @desc    Create a new interview
// @access  Private
router.post(
  "/",
  [
    body("candidateName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Candidate name must be between 2 and 100 characters"),
    body("candidateEmail").isEmail().normalizeEmail().withMessage("Please enter a valid candidate email"),
    body("position").trim().isLength({ min: 2, max: 100 }).withMessage("Position must be between 2 and 100 characters"),
    body("date")
      .isISO8601()
      .withMessage("Please enter a valid date")
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("Interview date must be in the future")
        }
        return true
      }),
    body("time")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Please enter a valid time format (HH:MM)"),
    body("duration").isInt({ min: 15, max: 480 }).withMessage("Duration must be between 15 and 480 minutes"),
    body("type")
      .isIn(["technical", "behavioral", "hr", "final"])
      .withMessage("Interview type must be technical, behavioral, hr, or final"),
    body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
    auth,
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const interviewData = {
        ...req.body,
        createdBy: req.user._id,
        status: "scheduled",
      }

      const interview = new Interview(interviewData)
      await interview.save()

      // Populate the created interview
      await interview.populate("createdBy", "name email")

      res.status(201).json({
        message: "Interview scheduled successfully",
        interview,
      })
    } catch (error) {
      console.error("Error creating interview:", error)
      res.status(500).json({ message: "Server error while creating interview" })
    }
  },
)

// @route   PUT /api/interviews/:id
// @desc    Update an interview
// @access  Private
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid interview ID"),
    body("candidateName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Candidate name must be between 2 and 100 characters"),
    body("candidateEmail").optional().isEmail().normalizeEmail().withMessage("Please enter a valid candidate email"),
    body("position")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Position must be between 2 and 100 characters"),
    body("date").optional().isISO8601().withMessage("Please enter a valid date"),
    body("time")
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Please enter a valid time format (HH:MM)"),
    body("duration").optional().isInt({ min: 15, max: 480 }).withMessage("Duration must be between 15 and 480 minutes"),
    body("type")
      .optional()
      .isIn(["technical", "behavioral", "hr", "final"])
      .withMessage("Interview type must be technical, behavioral, hr, or final"),
    body("status")
      .optional()
      .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
      .withMessage("Status must be scheduled, completed, cancelled, or rescheduled"),
    body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
    body("feedback").optional().trim().isLength({ max: 2000 }).withMessage("Feedback cannot exceed 2000 characters"),
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    auth,
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const interview = await Interview.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, {
        new: true,
        runValidators: true,
      }).populate("createdBy", "name email")

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" })
      }

      res.json({
        message: "Interview updated successfully",
        interview,
      })
    } catch (error) {
      console.error("Error updating interview:", error)
      res.status(500).json({ message: "Server error while updating interview" })
    }
  },
)

// @route   PATCH /api/interviews/:id/status
// @desc    Update interview status
// @access  Private
router.patch(
  "/:id/status",
  [
    param("id").isMongoId().withMessage("Invalid interview ID"),
    body("status")
      .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
      .withMessage("Status must be scheduled, completed, cancelled, or rescheduled"),
    auth,
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const interview = await Interview.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user._id },
        { status: req.body.status },
        { new: true },
      ).populate("createdBy", "name email")

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" })
      }

      res.json({
        message: "Interview status updated successfully",
        interview,
      })
    } catch (error) {
      console.error("Error updating interview status:", error)
      res.status(500).json({ message: "Server error while updating interview status" })
    }
  },
)

// @route   DELETE /api/interviews/:id
// @desc    Delete an interview
// @access  Private
router.delete("/:id", [param("id").isMongoId().withMessage("Invalid interview ID"), auth], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    })

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" })
    }

    res.json({ message: "Interview deleted successfully" })
  } catch (error) {
    console.error("Error deleting interview:", error)
    res.status(500).json({ message: "Server error while deleting interview" })
  }
})

module.exports = router
