const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q
      ? {
          username: {
            $regex: req.query.q,
            $options: "i",
          },
        }
      : {};
    const users = await User.find(keyword)
      .select("username profilePicture bio")
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.username = req.body.username || user.username;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!userToFollow.followers.includes(req.user._id)) {
      userToFollow.followers.push(req.user._id);
      currentUser.following.push(req.params.id);
      await userToFollow.save();
      await currentUser.save();
      res.json({ message: "User followed successfully" });
    } else {
      res.status(400).json({ message: "You already follow this user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userToUnfollow.followers.includes(req.user._id)) {
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id,
      );
      await userToUnfollow.save();
      await currentUser.save();
      res.json({ message: "User unfollowed successfully" });
    } else {
      res.status(400).json({ message: "You do not follow this user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser,
};
