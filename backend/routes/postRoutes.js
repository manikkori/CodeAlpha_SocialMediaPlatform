const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  deletePost,
  likePost,
  commentPost,
} = require("../controllers/postController");

router.route("/").post(protect, createPost).get(getPosts);
router.route("/:id").delete(protect, deletePost);
router.route("/:id/like").put(protect, likePost);
router.route("/:id/comment").post(protect, commentPost);

module.exports = router;
