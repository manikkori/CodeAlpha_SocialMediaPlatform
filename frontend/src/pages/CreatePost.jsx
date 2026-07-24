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
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Create New Post
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
              Caption
            </label>
            <textarea
              rows="4"
              placeholder="What's on your mind?"
              className="w-full p-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm sm:text-base font-medium mb-1">
              Image or Video URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/photo.jpg or video.mp4"
              className="w-full p-2.5 sm:p-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Supports direct image (.jpg, .png) and video (.mp4, .webm) links.
            </p>
          </div>
          {image && (
            <div className="mt-2">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                Media Preview:
              </p>
              <div className="rounded-lg overflow-hidden bg-black flex justify-center max-h-64 border">
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
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Posting..." : "Share Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
