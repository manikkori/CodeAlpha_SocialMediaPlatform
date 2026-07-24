import { useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/api/posts", { content, image });
      setPosts([data, ...posts]);
      setContent("");
      setImage("");
    } catch (error) {
      console.error(error);
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {user && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              rows="3"
              placeholder={`What's on your mind, ${user.username}?`}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Image URL (optional)"
              className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition float-right"
            >
              Post
            </button>
            <div className="clear-both"></div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between items-center mb-3">
              <Link
                to={`/profile/${post.user?._id}`}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {post.user?.username?.charAt(0).toUpperCase()}
                </div>
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
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
