const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
} = require("../controllers/userController");

router.get("/search", searchUsers);
router.put("/profile", protect, updateUserProfile);
router.get("/:id", getUserProfile);
router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);

module.exports = router;
