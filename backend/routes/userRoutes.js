const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
} = require("../controllers/userController");

router.route("/profile").put(protect, updateUserProfile);
router.route("/:id").get(getUserProfile);
router.route("/:id/follow").put(protect, followUser);
router.route("/:id/unfollow").put(protect, unfollowUser);

module.exports = router;
