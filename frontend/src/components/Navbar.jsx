import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { LogOut, User, Home, PlusSquare, Search, X } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        try {
          const { data } = await API.get(`/api/users/search?q=${searchTerm}`);
          setSearchResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSelectUser = (id) => {
    setSearchTerm("");
    setShowDropdown(false);
    navigate(`/profile/${id}`);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
        <Link to="/" className="text-2xl font-bold text-blue-600 shrink-0">
          SocialMedia
        </Link>

        <div className="relative flex-1 max-w-xs" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-8 py-1.5 bg-gray-100 border border-transparent focus:border-blue-500 rounded-full text-sm focus:outline-none focus:bg-white transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.trim() && setShowDropdown(true)}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowDropdown(false);
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50 divide-y divide-gray-50">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 font-medium">
                  No user found for "{searchTerm}"
                </div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result._id}
                    onClick={() => handleSelectUser(result._id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition"
                  >
                    {result.profilePicture ? (
                      <img
                        src={result.profilePicture}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {result.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">
                        {result.username}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {result.bio}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-5 shrink-0">
          {user ? (
            <>
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition"
                title="Home"
              >
                <Home className="w-6 h-6" />
              </Link>
              <Link
                to="/create"
                className="text-gray-700 hover:text-blue-600 transition"
                title="Create Post"
              >
                <PlusSquare className="w-6 h-6 text-blue-600" />
              </Link>
              <Link
                to={`/profile/${user._id}`}
                className="text-gray-700 hover:text-blue-600 transition"
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
                className="text-red-500 hover:text-red-700 transition font-medium"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
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
