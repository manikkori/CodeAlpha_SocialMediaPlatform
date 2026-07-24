import { useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const { user } = useContext(AuthContext);

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("video");
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

  const fetchPosts = async () => {
    try {
      const { data } = await API.get("/api/posts");
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
      const { data } = await API.put(`/api/posts/${id}/like`);
      setPosts(
        posts.map((post) =>
          post._id === id ? { ...post, likes: data } : post,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/api/posts/${id}`);
      setPosts(posts.filter((post) => post._id !== id));
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
      setPosts(posts.map((post) => (post._id === postId ? data : post)));
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-3 sm:p-4 rounded-xl shadow">
            <div className="flex justify-between items-center mb-3">
              <Link
                to={`/profile/${post.user?._id}`}
                className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden"
              >
                {post.user?.profilePicture ? (
                  <img
                    src={post.user.profilePicture}
                    alt="User"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {post.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-sm sm:text-base text-gray-800 hover:underline truncate">
                    {post.user?.username}
                  </span>
                  <span className="text-[11px] sm:text-xs text-gray-400 font-normal">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </Link>
              {user && user._id === post.user?._id && (
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-gray-400 hover:text-red-500 transition p-1 shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-gray-700 text-sm sm:text-base mb-3 whitespace-pre-line break-words">
              {post.content}
            </p>

            {post.image && (
              <div className="mb-3 rounded-lg overflow-hidden bg-black flex justify-center max-h-96">
                {isVideo(post.image) ? (
                  <video
                    src={post.image}
                    controls
                    className="w-full max-h-96 object-contain"
                  />
                ) : (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full max-h-96 object-cover"
                  />
                )}
              </div>
            )}

            <div className="flex items-center space-x-6 border-t pt-3 text-gray-600 text-sm">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-1 hover:text-red-500 transition ${
                  user && post.likes.includes(user._id)
                    ? "text-red-500 font-medium"
                    : ""
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{post.likes.length}</span>
              </button>
              <button
                onClick={() => toggleCommentSection(post._id)}
                className="flex items-center space-x-1 hover:text-blue-500 transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
            </div>

            {openComments[post._id] && (
              <div className="mt-3 sm:mt-4 border-t pt-3 space-y-3 bg-gray-50 p-2.5 sm:p-3 rounded-lg">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {post.comments.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    post.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded shadow-sm text-xs sm:text-sm"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-800">
                            {comment.user?.username || "User"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 break-words">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {user ? (
                  <form
                    onSubmit={(e) => handleCommentSubmit(e, post._id)}
                    className="flex items-center gap-2 mt-2"
                  >
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-1.5 border rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="text-blue-600 hover:text-blue-800 p-1 shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-center text-gray-500">
                    Login to comment
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
