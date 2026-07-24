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
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between items-center mb-3">
              <Link
                to={`/profile/${post.user?._id}`}
                className="flex items-center space-x-3"
              >
                {post.user?.profilePicture ? (
                  <img
                    src={post.user.profilePicture}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold text-gray-800 hover:underline">
                  {post.user?.username}
                </span>
              </Link>
              {user && user._id === post.user?._id && (
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-gray-700 mb-3 whitespace-pre-line">
              {post.content}
            </p>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full max-h-96 object-cover rounded-lg mb-3"
              />
            )}
            <div className="flex items-center space-x-6 border-t pt-3 text-gray-600">
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
              <div className="mt-4 border-t pt-3 space-y-3 bg-gray-50 p-3 rounded-lg">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {post.comments.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    post.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded shadow-sm text-sm"
                      >
                        <span className="font-bold text-gray-800 mr-2">
                          {comment.user?.username || "User"}:
                        </span>
                        <span className="text-gray-700">{comment.text}</span>
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
                      className="flex-1 px-3 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="text-blue-600 hover:text-blue-800 p-1"
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
