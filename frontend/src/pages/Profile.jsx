import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Heart, MessageCircle, Edit2, X } from "lucide-react";

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

  if (!profileUser) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white p-6 rounded-xl shadow relative">
        {currentUser && currentUser._id === profileUser._id && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}

        <div className="text-center">
          {profileUser.profilePicture ? (
            <img
              src={profileUser.profilePicture}
              alt="Avatar"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-blue-500 mb-4 shadow"
            />
          ) : (
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4 shadow">
              {profileUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-800">
            {profileUser.username}
          </h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            {profileUser.bio}
          </p>
          <div className="flex justify-center space-x-8 my-6">
            <div>
              <span className="font-bold block text-xl">
                {userPosts.length}
              </span>
              <span className="text-gray-500 text-sm">Posts</span>
            </div>
            <div>
              <span className="font-bold block text-xl">
                {profileUser.followers.length}
              </span>
              <span className="text-gray-500 text-sm">Followers</span>
            </div>
            <div>
              <span className="font-bold block text-xl">
                {profileUser.following.length}
              </span>
              <span className="text-gray-500 text-sm">Following</span>
            </div>
          </div>
          {currentUser && currentUser._id !== profileUser._id && (
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-2 rounded-lg font-medium transition ${
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative shadow-xl">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/my-pic.jpg"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={picInput}
                  onChange={(e) => setPicInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Posts by {profileUser.username}
        </h3>
        {userPosts.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-white rounded-xl shadow">
            No posts shared yet.
          </p>
        ) : (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <div key={post._id} className="bg-white p-4 rounded-xl shadow">
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
                <div className="flex items-center space-x-6 border-t pt-3 text-gray-600 text-sm">
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
