import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, Home, PlusSquare } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          SocialMedia
        </Link>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-blue-600"
                title="Home"
              >
                <Home className="w-6 h-6" />
              </Link>
              <Link
                to="/create"
                className="flex items-center text-gray-700 hover:text-blue-600"
                title="Create Post"
              >
                <PlusSquare className="w-6 h-6 text-blue-600" />
              </Link>
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center text-gray-700 hover:text-blue-600"
                title="Profile"
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-red-500 hover:text-red-700 font-medium"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
