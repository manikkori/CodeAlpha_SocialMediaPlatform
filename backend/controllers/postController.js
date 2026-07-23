const Post = require("../models/Post");

const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }
    const newPost = new Post({
      user: req.user._id,
      content,
      image: image || "",
    });
    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id).populate(
      "user",
      "username profilePicture",
    );
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }
    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.likes.includes(req.user._id)) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = {
      user: req.user._id,
      text,
    };
    post.comments.push(comment);
    await post.save();
    const updatedPost = await Post.findById(req.params.id)
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture");
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  deletePost,
  likePost,
  commentPost,
};
