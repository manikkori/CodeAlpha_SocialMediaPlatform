import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const { user: currentUser } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/api/users/${id}`);
        setProfileUser(data);
        if (currentUser) {
          setIsFollowing(
            data.followers.some(
              (f) => f._id === currentUser._id || f === currentUser._id,
            ),
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
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

  if (!profileUser) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
          {profileUser.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {profileUser.username}
        </h2>
        <p className="text-gray-600 mt-2">{profileUser.bio}</p>
        <div className="flex justify-center space-x-8 my-6">
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
  );
};

export default Profile;
