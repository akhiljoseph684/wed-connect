import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  MessageSquare,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import userService from "../../services/user.service.js";
import messageService from "../../services/message.service.js";
import PostCard from "../../components/cards/PostCard.jsx";
import { PostCardSkeleton } from "../../components/common/Skeleton.jsx";

export default function UserPublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, postsRes] = await Promise.all([
          userService.getProfile(userId),
          userService.getUserPosts(userId),
        ]);
        const u = userRes.data?.user || userRes.data;
        setProfileUser(u);
        setPosts(postsRes.data?.posts || []);
        setIsFollowing(Boolean(u?.isFollowing));
      } catch (err) {
        toast.error("User not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, navigate]);

  const toggleFollow = async () => {
    if (!currentUser) {
      toast.error("Please log in to follow");
      return navigate("/login");
    }
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        toast.success(`Unfollowed ${profileUser?.firstName}`);
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
        toast.success(`Following ${profileUser?.firstName}`);
      }
    } catch (err) {
      toast.error("Failed to update follow status");
    }
  };

  const handleMessage = async () => {
    if (!currentUser) return navigate("/login");
    try {
      const res = await messageService.startConversation(userId);
      const convId = res.data?.conversation?._id || res.data?._id;
      if (convId) navigate(`/messages/${convId}`);
    } catch (err) {
      toast.error("Failed to open chat");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="h-44 bg-white rounded-2xl animate-pulse shadow-soft" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const avatar =
    profileUser?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${profileUser?.firstName}+${profileUser?.lastName}&background=7D1E3B&color=fff&size=200`;
  const userRole = profileUser?.capabilities.isVendor
    ? "Vendor"
    : profileUser?.capabilities.isCreator
      ? "Creator"
      : "User";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-charcoal"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={avatar}
          alt={profileUser?.firstName}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-rose/20 shadow-soft"
        />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-charcoal">
                {profileUser?.firstName} {profileUser?.lastName}
              </h1>
              <p className="text-gray-500 text-sm">
                @{profileUser?.username || profileUser?.email?.split("@")[0]}
              </p>
            </div>
            {currentUser?._id !== userId && (
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={toggleFollow}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-soft ${
                    isFollowing
                      ? "bg-gray-100 text-charcoal hover:bg-gray-200"
                      : "bg-burgundy text-white hover:bg-burgundy/90"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow
                    </>
                  )}
                </button>
                <button
                  onClick={handleMessage}
                  className="p-2 border border-gray-200 text-charcoal rounded-xl hover:bg-gray-50 transition-all shadow-soft"
                  title="Send message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {profileUser?.bio && (
            <p className="text-sm text-gray-600 max-w-xl">{profileUser.bio}</p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 pt-1">
            {profileUser?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-burgundy" />{" "}
                {[
                  profileUser.location?.city,
                  profileUser.location?.state,
                  profileUser.location?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
            <span className="capitalize px-2.5 py-0.5 rounded-full bg-gold/15 text-charcoal font-medium">
              {userRole}
            </span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 border-t border-gray-100">
            <div>
              <span className="font-bold text-charcoal">{posts.length}</span>{" "}
              <span className="text-xs text-gray-500">posts</span>
            </div>
            <div>
              <span className="font-bold text-charcoal">
                {profileUser?.followersCount || 0}
              </span>{" "}
              <span className="text-xs text-gray-500">followers</span>
            </div>
            <div>
              <span className="font-bold text-charcoal">
                {profileUser?.followingCount || 0}
              </span>{" "}
              <span className="text-xs text-gray-500">following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <section>
        <h2 className="font-playfair text-xl font-bold text-charcoal mb-4">
          Posts by {profileUser?.firstName}
        </h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
            <p className="text-gray-500 text-sm">No posts shared yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
