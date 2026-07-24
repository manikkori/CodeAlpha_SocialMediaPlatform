import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [failedVideos, setFailedVideos] = useState({});
  const { user } = useContext(AuthContext);

  const isVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url) || url.includes('video') || url.includes('.mp4');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const fetchPosts = async () => {
    try {
      const { data } = await API.get('/api/posts');
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
      const { data } = await API.put(`/api/posts/${id}/like`);
      setPosts(posts.map(post => post._id === id ? { ...post, likes: data } : post));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/api/posts/${id}`);
      setPosts(posts.filter(post => post._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCommentSection = (id) => {
    setOpenComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;
    try {
      const { data } = await API.post(`/api/posts/${postId}/comment`, { text });
      setPosts(posts.map(post => post._id === postId ? data : post));
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-indigo-500/15 transition-colors duration-500">
            <div className="flex justify-between items-center mb-3">
              <Link to={`/profile/${post.user?._id}`} className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden">
                {post.user?.profilePicture ? (
                  <img src={post.user.profilePicture} alt="User" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-indigo-500/40 shrink-0" />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow">
                    {post.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 hover:text-indigo-600 truncate">
                    {post.user?.username}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </Link>
              {user && user._id === post.user?._id && (
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-slate-400 hover:text-rose-500 transition p-1 shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base mb-3 whitespace-pre-line break-words">{post.content}</p>

            {post.image && (
              <div className="mb-3 rounded-xl overflow-hidden bg-slate-950 flex justify-center max-h-[700px] sm:max-h-[750px] border border-indigo-500/20">
                {isVideo(post.image) ? (
                  failedVideos[post._id] ? (
                    <div className="p-6 text-center bg-slate-900 text-rose-400 text-xs sm:text-sm flex flex-col items-center justify-center min-h-[160px] w-full">
                      <span className="font-bold text-base mb-1">⚠️ Video Cannot Be Played</span>
                      <span>The file format or link is unsupported by your browser.</span>
                      <a href={post.image} target="_blank" rel="noreferrer" className="mt-3 text-indigo-400 hover:underline text-xs">
                        Try opening direct link ↗
                      </a>
                    </div>
                  ) : (
                    <video
                      src={post.image}
                      controls
                      preload="metadata"
                      playsInline
                      onError={() => setFailedVideos(prev => ({ ...prev, [post._id]: true }))}
                      className="w-full h-auto max-h-[700px] sm:max-h-[750px] object-contain"
                    />
                  )
                ) : (
                  <img
                    src={post.image}
                    alt="Post"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    className="w-full h-auto max-h-[700px] sm:max-h-[750px] object-contain"
                  />
                )}
              </div>
            )}

            <div className="flex items-center space-x-6 border-t border-indigo-500/10 pt-3 text-slate-600 dark:text-slate-300 text-sm">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center space-x-1 hover:text-rose-500 transition ${user && post.likes.includes(user._id) ? 'text-rose-500 font-medium' : ''
                  }`}
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{post.likes.length}</span>
              </button>
              <button
                onClick={() => toggleCommentSection(post._id)}
                className="flex items-center space-x-1 hover:text-indigo-500 transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
            </div>

            {openComments[post._id] && (
              <div className="mt-3 sm:mt-4 border-t border-indigo-500/10 pt-3 space-y-3 bg-indigo-500/5 p-2.5 sm:p-3 rounded-xl">
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {post.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">No comments yet. Be the first!</p>
                  ) : (
                    post.comments.map((comment, index) => (
                      <div key={index} className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg shadow-sm border border-indigo-500/10 text-xs sm:text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {comment.user?.username || 'User'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 break-words">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>
                {user ? (
                  <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-500/20 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={commentTexts[post._id] || ''}
                      onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                    />
                    <button type="submit" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 p-1 shrink-0">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-center text-slate-500">Login to comment</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;