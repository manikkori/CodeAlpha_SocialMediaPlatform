import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Heart, MessageCircle, Edit2, X, Trash2 } from "lucide-react";

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

  if (!profileUser) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-3 sm:px-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow relative">
        {currentUser && currentUser._id === profileUser._id && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition"
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
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover border-2 border-blue-500 mb-3 sm:mb-4 shadow"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 shadow">
              {profileUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {profileUser.username}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-md mx-auto break-words">
            {profileUser.bio}
          </p>
          <div className="flex justify-center space-x-6 sm:space-x-8 my-5 sm:my-6">
            <div>
              <span className="font-bold block text-lg sm:text-xl">
                {userPosts.length}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">Posts</span>
            </div>
            <div>
              <span className="font-bold block text-lg sm:text-xl">
                {profileUser.followers.length}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                Followers
              </span>
            </div>
            <div>
              <span className="font-bold block text-lg sm:text-xl">
                {profileUser.following.length}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                Following
              </span>
            </div>
          </div>
          {currentUser && currentUser._id !== profileUser._id && (
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition ${
                isFollowing
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-md w-full relative shadow-xl">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h3 className="text-lg sm:text-xl font-bold mb-4">Edit Profile</h3>
            <form
              onSubmit={handleEditSubmit}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/my-pic.jpg"
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={picInput}
                  onChange={(e) => setPicInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows="3"
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Posts by {profileUser.username}
        </h3>
        {userPosts.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-white rounded-xl shadow text-sm sm:text-base">
            No posts shared yet.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {userPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-3 sm:p-4 rounded-xl shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDate(post.createdAt)}
                  </span>
                  {currentUser && currentUser._id === profileUser._id && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-gray-400 hover:text-red-500 transition p-1"
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
                <div className="flex items-center space-x-6 border-t pt-3 text-gray-600 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 fill-current text-red-500" />
                    <span>{post.likes.length} Likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
