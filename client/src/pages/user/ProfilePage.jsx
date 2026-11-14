import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Settings,
  Edit3,
  Grid,
  Bookmark,
  Heart,
  MapPin,
  Calendar,
} from "lucide-react";
import userService from "../../services/user.service.js";
import collectionService from "../../services/collection.service.js";
import PostCard from "../../components/cards/PostCard.jsx";
import CollectionCard from "../../components/cards/CollectionCard.jsx";
import { PostCardSkeleton } from "../../components/common/Skeleton.jsx";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("posts"); // posts | collections | likes
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (!user?._id) return;
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [userRes, postsRes, collRes] = await Promise.allSettled([
          userService.getProfile(user._id),
          userService.getUserPosts(user._id),
          collectionService.getMyCollections(),
        ]);
        console.log(postsRes)
        if (userRes.status === "fulfilled") {
          setProfile(userRes.value.data || []);
        }
        if (postsRes.status === "fulfilled") {
          setPosts(postsRes.value.data?.posts || []);
        }
        if (collRes.status === "fulfilled") {
          setCollections(collRes.value.data || []);
        }
      } catch (err) {
        console.error("Failed to load profile content", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user?._id]);

  const avatarUrl =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${profile?.firstName}+${profile?.lastName}&background=7D1E3B&color=fff&size=200`;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={avatarUrl}
            alt={profile?.firstName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-rose/20 shadow-soft"
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-charcoal">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">
                  @{profile?.username || profile?.email?.split("@")[0]}
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-charcoal rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-soft"
                >
                  <Edit3 className="w-4 h-4 text-gray-500" /> Edit Profile
                </Link>
                <Link
                  to="/settings"
                  className="p-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-soft"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {profile?.bio && (
              <p className="text-sm text-gray-600 max-w-xl">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-500 pt-1">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-burgundy" />
                  {[
                    profile.location?.city,
                    profile.location?.state,
                    profile.location?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
              {profile?.weddingDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-burgundy" /> Wedding:{" "}
                  {new Date(profile.weddingDate).toLocaleDateString()}
                </span>
              )}
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-gold/15 text-charcoal font-medium">
                {profile?.role}
              </span>
            </div>

            {/* Follow stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 border-t border-gray-100">
              <div>
                <span className="font-bold text-charcoal">{posts.length}</span>{" "}
                <span className="text-xs text-gray-500">posts</span>
              </div>
              <div>
                <span className="font-bold text-charcoal">
                  {profile?.stats?.followersCount || 0}
                </span>{" "}
                <span className="text-xs text-gray-500">followers</span>
              </div>
              <div>
                <span className="font-bold text-charcoal">
                  {profile?.stats?.followingCount || 0}
                </span>{" "}
                <span className="text-xs text-gray-500">following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-gray-200 justify-center sm:justify-start gap-8">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "posts"
              ? "border-burgundy text-burgundy"
              : "border-transparent text-gray-500 hover:text-charcoal"
          }`}
        >
          <Grid className="w-4 h-4" /> Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "collections"
              ? "border-burgundy text-burgundy"
              : "border-transparent text-gray-500 hover:text-charcoal"
          }`}
        >
          <Bookmark className="w-4 h-4" /> Collections ({collections.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : activeTab === "posts" ? (
        posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
            <Grid className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-charcoal font-medium">No posts shared yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Start inspiring other couples!
            </p>
          </div>
        )
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {collections.map((col) => (
            <CollectionCard key={col._id} collection={col} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
          <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-charcoal font-medium">
            No collections created yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Save posts into moodboards to organize ideas.
          </p>
        </div>
      )}
    </div>
  );
}
