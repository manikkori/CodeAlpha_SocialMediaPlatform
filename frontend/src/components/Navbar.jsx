import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { LogOut, User, Home, PlusSquare, Search, X, Menu } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      setMobileMenuOpen(false);
      navigate("/login");
    }
  };

  const handleSelectUser = (id) => {
    setSearchTerm("");
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate(`/profile/${id}`);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          to="/"
          className="text-lg sm:text-2xl font-bold text-blue-600 shrink-0"
        >
          SocialMedia
        </Link>

        <div className="relative flex-1 max-w-xs" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-7 py-1.5 bg-gray-100 border border-transparent focus:border-blue-500 rounded-full text-xs sm:text-sm focus:outline-none focus:bg-white transition"
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
                className="absolute right-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50 divide-y divide-gray-50">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs sm:text-sm text-gray-500 font-medium">
                  No user found for "{searchTerm}"
                </div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result._id}
                    onClick={() => handleSelectUser(result._id)}
                    className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-gray-50 cursor-pointer transition"
                  >
                    {result.profilePicture ? (
                      <img
                        src={result.profilePicture}
                        alt="Avatar"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
                        {result.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
                        {result.username}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                        {result.bio}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-5 shrink-0">
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

        <div className="flex sm:hidden items-center space-x-2 shrink-0">
          {user ? (
            <>
              <Link to={`/profile/${user._id}`} className="text-gray-700 p-1">
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 text-gray-700 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {mobileMenuOpen && user && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 text-gray-700 py-2 hover:text-blue-600 font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Home Feed</span>
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 text-blue-600 py-2 font-medium"
          >
            <PlusSquare className="w-5 h-5" />
            <span>Create Post</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-500 py-2 font-medium w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
