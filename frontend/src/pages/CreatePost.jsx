import { useState, useContext } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("video");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await API.post("/api/posts", { content, image });
      navigate("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 font-medium px-4">
        Please login to create a post.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl border border-indigo-500/15 transition-colors duration-500">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Create New Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium mb-1">
              Caption
            </label>
            <textarea
              rows="4"
              placeholder="What's on your mind?"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-indigo-500/20 rounded-xl text-sm sm:text-base text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium mb-1">
              Image or Video URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg or video.mp4"
              className="w-full p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/80 border border-indigo-500/20 rounded-xl text-sm sm:text-base text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">
              Supports direct image (.jpg, .png) and video (.mp4, .webm) links.
            </p>
          </div>
          {image && (
            <div className="mt-2">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
                Media Preview:
              </p>
              <div className="rounded-xl overflow-hidden bg-black flex justify-center max-h-64 border border-indigo-500/20">
                {isVideo(image) ? (
                  <video
                    src={image}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                ) : (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full max-h-64 object-cover"
                  />
                )}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {loading ? "Posting..." : "Share Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
