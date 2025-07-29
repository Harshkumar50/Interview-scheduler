const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error while fetching profile" })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Please enter a valid email"),
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

      const { name, email } = req.body
      const updateData = {}

      if (name) updateData.name = name
      if (email) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({
          email,
          _id: { $ne: req.user._id },
        })

        if (existingUser) {
          return res.status(400).json({ message: "Email is already taken" })
        }

        updateData.email = email
      }

      const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select(
        "-password",
      )

      res.json({
        message: "Profile updated successfully",
        user,
      })
    } catch (error) {
      console.error("Error updating user profile:", error)
      res.status(500).json({ message: "Server error while updating profile" })
    }
  },
)

module.exports = router
