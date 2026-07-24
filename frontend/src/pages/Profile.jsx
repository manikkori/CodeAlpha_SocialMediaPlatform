import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Heart, MessageCircle, Edit2, X, Trash2, Send } from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const { user: currentUser } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [picInput, setPicInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");

  const [openComments, setOpenComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [failedVideos, setFailedVideos] = useState({});

  const isVideo = (url) => {
    if (!url) return false;
    return (
      /\.(mp4|webm|ogg|mov|m4v)$/i.test(url) ||
      url.includes("video") ||
      url.includes(".mp4")
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userRes = await API.get(`/api/users/${id}`);
        setProfileUser(userRes.data);
        setBioInput(userRes.data.bio || "");
        setPicInput(userRes.data.profilePicture || "");
        setUsernameInput(userRes.data.username || "");

        if (currentUser) {
          setIsFollowing(
            userRes.data.followers.some(
              (f) => f._id === currentUser._id || f === currentUser._id,
            ),
          );
        }

        const postsRes = await API.get("/api/posts");
        const filtered = postsRes.data.filter((p) => p.user?._id === id);
        setUserPosts(filtered);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserAndPosts();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await API.put(`/api/users/${id}/unfollow`);
        setIsFollowing(false);
        setProfileUser({
          ...profileUser,
          followers: profileUser.followers.filter(
            (f) => f._id !== currentUser._id && f !== currentUser._id,
          ),
        });
      } else {
        await API.put(`/api/users/${id}/follow`);
        setIsFollowing(true);
        setProfileUser({
          ...profileUser,
          followers: [...profileUser.followers, currentUser._id],
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/api/users/profile", {
        username: usernameInput,
        bio: bioInput,
        profilePicture: picInput,
      });
      setProfileUser({
        ...profileUser,
        username: data.username,
        bio: data.bio,
        profilePicture: data.profilePicture,
      });
      setIsEditing(false);
      const stored = JSON.parse(localStorage.getItem("user"));
      if (stored) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...stored,
            username: data.username,
            profilePicture: data.profilePicture,
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/api/posts/${postId}`);
      setUserPosts(userPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.put(`/api/posts/${postId}/like`);
      setUserPosts(
        userPosts.map((post) =>
          post._id === postId ? { ...post, likes: data } : post,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCommentSection = (id) => {
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;
    try {
      const { data } = await API.post(`/api/posts/${postId}/comment`, { text });
      setUserPosts(
        userPosts.map((post) => (post._id === postId ? data : post)),
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  if (!profileUser)
    return (
      <div className="text-center py-10 font-medium">Loading Profile...</div>
    );

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-500/15 relative transition-colors duration-500">
        {currentUser && currentUser._id === profileUser._id && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 text-xs sm:text-sm bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-full font-medium transition"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        )}

        <div className="text-center">
          {profileUser.profilePicture ? (
            <img
              src={profileUser.profilePicture}
              alt="Avatar"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover border-4 border-indigo-500/30 mb-3 sm:mb-4 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow-lg">
              {profileUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
            {profileUser.username}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-md mx-auto break-words">
            {profileUser.bio}
          </p>
          <div className="flex justify-center space-x-6 sm:space-x-8 my-5 sm:my-6">
            <div className="bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
              <span className="font-black block text-lg sm:text-xl text-indigo-600 dark:text-indigo-400">
                {userPosts.length}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Posts
              </span>
            </div>
            <div className="bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
              <span className="font-black block text-lg sm:text-xl text-purple-600 dark:text-purple-400">
                {profileUser.followers.length}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Followers
              </span>
            </div>
            <div className="bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
              <span className="font-black block text-lg sm:text-xl text-pink-600 dark:text-pink-400">
                {profileUser.following.length}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Following
              </span>
            </div>
          </div>
          {currentUser && currentUser._id !== profileUser._id && (
            <button
              onClick={handleFollowToggle}
              className={`px-8 py-2.5 rounded-full text-sm sm:text-base font-semibold shadow-md transition ${
                isFollowing
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/25"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 max-w-md w-full relative shadow-2xl border border-indigo-500/20">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
              Edit Profile
            </h3>
            <form
              onSubmit={handleEditSubmit}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/my-pic.jpg"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={picInput}
                  onChange={(e) => setPicInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  rows="3"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-indigo-500/20 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2.5 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-indigo-500/15 pb-2">
          Posts by {profileUser.username}
        </h3>
        {userPosts.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow border border-indigo-500/10 text-sm sm:text-base">
            No posts shared yet.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {userPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-indigo-500/15 transition-colors duration-500"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(post.createdAt)}
                  </span>
                  {currentUser && currentUser._id === profileUser._id && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-slate-400 hover:text-rose-500 transition p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base mb-3 whitespace-pre-line break-words">
                  {post.content}
                </p>
                {post.image && (
                  <div className="mb-3 rounded-xl overflow-hidden bg-black flex justify-center max-h-96 border border-indigo-500/20">
                    {isVideo(post.image) ? (
                      failedVideos[post._id] ? (
                        <div className="p-6 text-center bg-slate-900 text-rose-400 text-xs sm:text-sm flex flex-col items-center justify-center min-h-[160px] w-full">
                          <span className="font-bold text-base mb-1">
                            ⚠️ Video Cannot Be Played
                          </span>
                          <span>
                            The file format or link is unsupported by your
                            browser.
                          </span>
                          <a
                            href={post.image}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 text-indigo-400 hover:underline text-xs"
                          >
                            Try opening direct link ↗
                          </a>
                        </div>
                      ) : (
                        <video
                          src={post.image}
                          controls
                          preload="metadata"
                          playsInline
                          onError={() =>
                            setFailedVideos((prev) => ({
                              ...prev,
                              [post._id]: true,
                            }))
                          }
                          className="w-full max-h-96 object-contain"
                        />
                      )
                    ) : (
                      <img
                        src={post.image}
                        alt="Post"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        className="w-full max-h-96 object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-6 border-t border-indigo-500/10 pt-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-1 hover:text-rose-500 transition ${
                      currentUser && post.likes.includes(currentUser._id)
                        ? "text-rose-500 font-medium"
                        : ""
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{post.likes.length} Likes</span>
                  </button>
                  <button
                    onClick={() => toggleCommentSection(post._id)}
                    className="flex items-center space-x-1 hover:text-indigo-500 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                {openComments[post._id] && (
                  <div className="mt-3 sm:mt-4 border-t border-indigo-500/10 pt-3 space-y-3 bg-indigo-500/5 p-2.5 sm:p-3 rounded-xl">
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {post.comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">
                          No comments yet. Be the first!
                        </p>
                      ) : (
                        post.comments.map((comment, index) => (
                          <div
                            key={index}
                            className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg shadow-sm border border-indigo-500/10 text-xs sm:text-sm"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-100">
                                {comment.user?.username || "User"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 break-words">
                              {comment.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    {currentUser ? (
                      <form
                        onSubmit={(e) => handleCommentSubmit(e, post._id)}
                        className="flex items-center gap-2 mt-2"
                      >
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-500/20 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={commentTexts[post._id] || ""}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="submit"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-1 shrink-0"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-center text-slate-500">
                        Login to comment
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
