import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  LogOut,
  User,
  Home,
  PlusSquare,
  Search,
  X,
  Menu,
  Sun,
  Moon,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (
      storedTheme === "dark" ||
      (!storedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

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
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/10 dark:border-indigo-500/20 sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          to="/"
          className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent shrink-0"
        >
          SocialMedia
        </Link>

        <div className="relative flex-1 max-w-xs" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-7 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition shadow-inner"
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
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-500/15 max-h-80 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  No user found for "{searchTerm}"
                </div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result._id}
                    onClick={() => handleSelectUser(result._id)}
                    className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-indigo-500/10 cursor-pointer transition"
                  >
                    {result.profilePicture ? (
                      <img
                        src={result.profilePicture}
                        alt="Avatar"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-indigo-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 shadow">
                        {result.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                        {result.username}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {result.bio}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-4 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 transition"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>
          {user ? (
            <>
              <Link
                to="/"
                className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Home"
              >
                <Home className="w-6 h-6" />
              </Link>
              <Link
                to="/create"
                className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Create Post"
              >
                <PlusSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </Link>
              <Link
                to={`/profile/${user._id}`}
                className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                title="Profile"
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="text-rose-500 hover:text-rose-600 transition font-medium"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-700 dark:text-slate-200 hover:text-indigo-600 font-medium text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <div className="flex sm:hidden items-center space-x-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
          {user ? (
            <>
              <Link
                to={`/profile/${user._id}`}
                className="text-slate-700 dark:text-slate-200 p-1"
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 text-slate-700 dark:text-slate-200 focus:outline-none"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {mobileMenuOpen && user && (
        <div className="sm:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-indigo-500/10 px-4 py-3 space-y-3 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 text-slate-700 dark:text-slate-200 py-2 hover:text-indigo-600 font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Home Feed</span>
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 py-2 font-medium"
          >
            <PlusSquare className="w-5 h-5" />
            <span>Create Post</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-rose-500 py-2 font-medium w-full text-left"
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
