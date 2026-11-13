import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { creatorService } from "../../services/creator.service.js";
import { userService } from "../../services/user.service.js";
import PostCard from "../../components/cards/PostCard.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import Input from "../../components/common/Input.jsx";
import { useSelector } from "react-redux";
import {
  Sparkles,
  Users,
  Instagram,
  Globe,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

export const CreatorProfilePage = () => {
  const { username } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [collabTitle, setCollabTitle] = useState("");
  const [collabDetails, setCollabDetails] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      setIsLoading(true);
      try {
        const res = await creatorService.getCreatorByUserId(username);
        setProfile(res.data?.profile);
        setPosts(res.data?.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreator();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Please sign in to follow creators");
      return;
    }
    try {
      if (isFollowing) {
        await userService.unfollowUser(profile.userId._id);
        setIsFollowing(false);
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await userService.followUser(profile.userId._id);
        setIsFollowing(true);
        toast.success(`Following @${profile.username}!`);
      }
    } catch (err) {
      toast.error("Failed to update follow");
    }
  };

  const handleSendCollaboration = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    try {
      await creatorService.createCollaboration({
        receiverId: profile.userId._id,
        projectTitle: collabTitle,
        details: collabDetails,
      });

      toast.success("Collaboration invitation sent!");
      setIsCollabModalOpen(false);
      setCollabTitle("");
      setCollabDetails("");
    } catch (err) {
      toast.error("Failed to send collaboration request");
    }
  };

  if (!profile && !isLoading) {
    return (
      <div className="py-20 text-center">
        <h2 className="font-serif text-2xl text-charcoal">
          Creator Profile Not Found
        </h2>
        <Link
          to="/creators"
          className="text-sm text-burgundy underline mt-2 block"
        >
          Return to Creators Directory
        </Link>
      </div>
    );
  }

  const avatar =
    profile?.userId?.avatarUrl ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80";
  const cover =
    profile?.coverImageUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="space-y-12 pb-24">
      {/* Cover */}
      <div className="relative h-72 sm:h-80 bg-charcoal text-white overflow-hidden">
        <img
          src={cover}
          alt={profile?.displayName}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
      </div>

      {/* Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-burgundy/10 shadow-luxury flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={avatar}
              alt={profile?.displayName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-soft shrink-0"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
                  {profile?.displayName}
                </h1>
                <span className="text-xs bg-blush text-burgundy font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  Verified Creator
                </span>
              </div>
              <p className="text-xs text-mutedGray">@{profile?.username}</p>

              <p className="text-xs sm:text-sm text-charcoal/80 max-w-2xl leading-relaxed">
                {profile?.tagline || profile?.bio}
              </p>

              {/* Specialties */}
              {profile?.specialties && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-ivory-200 text-charcoal px-3 py-0.5 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <Button
              variant={isFollowing ? "outline" : "primary"}
              size="md"
              className="rounded-full"
              onClick={handleFollowToggle}
            >
              {isFollowing ? "Following" : "Follow Creator"}
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="rounded-full"
              onClick={() => setIsCollabModalOpen(true)}
            >
              <HeartHandshake className="w-4 h-4" />
              Collaborate
            </Button>
          </div>
        </div>
      </div>

      {/* Portfolio & Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Portfolio Gallery */}
        {profile?.portfolio && profile.portfolio.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl font-medium text-charcoal">
              Curated Portfolio Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {profile.portfolio.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-ivory-200"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-[10px] text-gold-300 uppercase tracking-widest">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base font-medium">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community Posts */}
        <section className="space-y-4 pt-6 border-t border-burgundy/10">
          <h2 className="font-serif text-2xl font-medium text-charcoal">
            Community Inspirations ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <p className="text-xs text-mutedGray">
              No community posts published yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Collaboration Modal */}
      {isCollabModalOpen && (
        <Modal
          isOpen={isCollabModalOpen}
          onClose={() => setIsCollabModalOpen(false)}
          title={`Collaborate with ${profile?.displayName}`}
          description="Send a project proposal for stylized wedding shoots, venue features, or aesthetic campaigns."
        >
          <form onSubmit={handleSendCollaboration} className="space-y-4">
            <Input
              label="Project Title *"
              required
              placeholder="e.g. Autumn Editorial Gown Shoot at Glasshouse Conservatory"
              value={collabTitle}
              onChange={(e) => setCollabTitle(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
                Project Details & Scope *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-charcoal/15 text-charcoal focus:outline-none focus:border-burgundy"
                placeholder="Explain the concept, location, proposed compensation, and target date..."
                value={collabDetails}
                onChange={(e) => setCollabDetails(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal/5">
              <Button
                variant="ghost"
                onClick={() => setIsCollabModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send Proposal
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CreatorProfilePage;
