import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Image,
  FileText,
  HeartHandshake,
  Eye,
  Heart,
  Plus,
} from "lucide-react";
import creatorService from "../../services/creator.service.js";
import userService from "../../services/user.service.js";

export default function CreatorOverviewPage() {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      setLoading(true);
      try {
        const [cRes, colRes] = await Promise.allSettled([
          creatorService.getCreatorByUserId(user?._id),
          creatorService.getCollaborations(),
        ]);
        if (cRes.status === "fulfilled"){
          setProfile(cRes.value.data?.profile || cRes.value.data);
          setPosts(cRes.value.data?.posts || []);
        }
        if (colRes.status === "fulfilled")
          setCollabs(colRes.value.data || []);
      } catch (err) {
        console.error("Failed to load creator data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchCreatorData();
  }, [user]);

  const totalLikes = posts.reduce((acc, p) => acc + (p.likesCount || 0), 0);

  if (loading) {
    return (
      <div className="h-64 bg-white rounded-2xl animate-pulse shadow-soft" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-burgundy via-rose to-burgundy text-white rounded-2xl p-6 sm:p-8 shadow-luxury flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-gold text-xs font-semibold uppercase tracking-wider">
            Creator Studio
          </span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold mt-1">
            {profile?.brandName || `${user?.firstName} ${user?.lastName}`}
          </h1>
          <p className="text-white/80 text-sm mt-1 max-w-xl">
            {profile?.specialty || "Wedding Content Creator & Stylist"}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/create-post"
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-burgundy rounded-xl text-xs font-semibold hover:bg-ivory transition-all shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" /> Publish Inspiration
          </Link>
          <Link
            to="/creator/portfolio"
            className="px-4 py-2 bg-white/20 text-white rounded-xl text-xs font-medium hover:bg-white/30 transition-all"
          >
            Portfolio
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Published Posts</span>
            <FileText className="w-4 h-4 text-burgundy" />
          </div>
          <p className="font-bold text-xl text-charcoal mt-2">{posts.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Total Likes</span>
            <Heart className="w-4 h-4 text-rose fill-rose" />
          </div>
          <p className="font-bold text-xl text-charcoal mt-2">{totalLikes}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Collaborations</span>
            <HeartHandshake className="w-4 h-4 text-gold" />
          </div>
          <p className="font-bold text-xl text-charcoal mt-2">
            {collabs.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Portfolio Works</span>
            <Image className="w-4 h-4 text-charcoal" />
          </div>
          <p className="font-bold text-xl text-charcoal mt-2">
            {profile?.portfolio?.length || 0}
          </p>
        </div>
      </div>

      {/* Quick Nav Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/creator/collaborations"
          className="p-6 bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 block"
        >
          <h3 className="font-playfair font-bold text-lg text-charcoal">
            Brand & Vendor Collaborations
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Connect with wedding planners, brands, and venues for styled shoots
            and features.
          </p>
        </Link>
        <Link
          to="/creator/analytics"
          className="p-6 bg-white rounded-2xl shadow-soft hover:shadow-elevated transition-all border border-gray-100 block"
        >
          <h3 className="font-playfair font-bold text-lg text-charcoal">
            Performance & Audience
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Monitor post impressions, saves, and follower growth over time.
          </p>
        </Link>
      </div>
    </div>
  );
}
