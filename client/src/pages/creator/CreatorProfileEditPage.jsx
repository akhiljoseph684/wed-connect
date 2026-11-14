import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Save,
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  Handshake,
} from "lucide-react";
import toast from "react-hot-toast";
import creatorService from "../../services/creator.service.js";
import mediaService from "../../services/media.service.js";
import { useSelector } from "react-redux";

export default function CreatorProfileEditPage() {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [coverImageUrl, setCoverImageUrl] = useState("");

  const coverInputRef = useRef(null);

  const { register, handleSubmit, reset } = useForm();

  // Fetch creator profile
  useEffect(() => {
    if (!user?._id) return;

    const fetchProfile = async () => {
      setFetching(true);

      try {
        const res = await creatorService.getCreatorByUserId(user._id);
        const c = res.data?.profile;

        if (c) {
          setCoverImageUrl(c.coverImageUrl || "");

          reset({
            username: c.username || "",
            displayName: c.displayName || "",
            tagline: c.tagline || "",
            specialties: Array.isArray(c.specialties)
              ? c.specialties.join(", ")
              : c.specialties || "",
            bio: c.bio || "",
            instagram: c.socialLinks?.instagram || "",
            tiktok: c.socialLinks?.tiktok || "",
            pinterest: c.socialLinks?.pinterest || "",
            youtube: c.socialLinks?.youtube || "",
            website: c.socialLinks?.website || "",
            acceptingBrandCollaborations:
              c.acceptingBrandCollaborations !== false,
          });
        }
      } catch (err) {
        // toast.error("Failed to load creator profile");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [user?._id, reset]);

  // Upload cover image to Cloudinary
  const handleCoverUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB.");
      return;
    }

    setUploadingCover(true);

    try {
      const res = await mediaService.uploadFile(file);
      console.log(res)

      const asset =
        res || res.data;

      if (!asset?.url) {
        throw new Error("Uploaded image URL not received.");
      }

      setCoverImageUrl(asset.url);

      toast.success("Cover image uploaded successfully!");
    } catch (err) {
      console.log(err)
      toast.error(
        err.response?.data?.message || err.message || "Image upload failed",
      );
    } finally {
      setUploadingCover(false);

      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  // Remove cover image
  const handleRemoveCover = () => {
    setCoverImageUrl("");
  };

  // Submit profile
  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const specialtiesArray = (data.specialties || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        username: data.username?.trim().toLowerCase(),
        displayName: data.displayName,
        tagline: data.tagline,
        specialties: specialtiesArray,
        bio: data.bio,

        coverImageUrl,

        socialLinks: {
          instagram: data.instagram,
          tiktok: data.tiktok,
          pinterest: data.pinterest,
          youtube: data.youtube,
          website: data.website,
        },

        acceptingBrandCollaborations: Boolean(
          data.acceptingBrandCollaborations,
        ),
      };

      await creatorService.upsertProfile(payload);

      toast.success("Creator profile updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save creator profile",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-96 bg-white rounded-2xl animate-pulse shadow-soft" />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <User className="w-6 h-6 text-burgundy" />
          Creator Studio Profile
        </h1>

        <p className="text-sm text-gray-500">
          Configure your public persona, creative specialties, and brand
          collaboration preferences
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6"
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1">
              Username *
            </label>

            <input
              {...register("username", { required: true })}
              placeholder="e.g. elenarostova"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1">
              Brand or Creator Name *
            </label>

            <input
              {...register("displayName", { required: true })}
              placeholder="e.g. Elena Rostova Bridal"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
            />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1">
            Short Tagline
          </label>

          <input
            {...register("tagline")}
            placeholder="e.g. Bridal Stylist & Aesthetic Storyteller"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
          />
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1">
            Creative Specialties (Comma-separated)
          </label>

          <input
            {...register("specialties")}
            placeholder="e.g. Bridal Styling, Veil Design, Color Palettes, Stationery"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy"
          />

          <p className="text-[11px] text-gray-400 mt-1">
            Separate each specialty with a comma.
          </p>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-2">
            Cover Banner Image
          </label>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleCoverUpload(e.target.files?.[0])}
          />

          <div
            onClick={() => !uploadingCover && coverInputRef.current?.click()}
            className="relative h-44 sm:h-56 rounded-2xl border-2 border-dashed border-gray-200 hover:border-burgundy/60 overflow-hidden cursor-pointer bg-gray-50 transition group"
          >
            {coverImageUrl ? (
              <>
                <img
                  src={coverImageUrl}
                  alt="Creator cover"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <UploadCloud className="w-5 h-5" />
                    Change Cover Image
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCover();
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-burgundy transition"
                  title="Remove cover image"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                {uploadingCover ? (
                  <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blush flex items-center justify-center text-burgundy">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <span className="text-sm font-semibold text-charcoal">
                  {uploadingCover ? "Uploading image..." : "Upload Cover Image"}
                </span>

                <span className="text-xs">PNG, JPG, WEBP · Max 10MB</span>
              </div>
            )}

            {uploadingCover && coverImageUrl && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80 mb-1">
            Creator Bio & Philosophy
          </label>

          <textarea
            {...register("bio")}
            rows={4}
            placeholder="Tell couples and brands about your aesthetic, experience, styling philosophy, and preferred aesthetics..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy resize-none"
          />
        </div>

        {/* Brand Collaboration Switch */}
        <div className="p-4 rounded-xl border border-sand bg-sand/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-blush flex items-center justify-center text-burgundy">
              <Handshake className="w-5 h-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-charcoal">
                Accepting Brand Collaborations
              </p>

              <p className="text-xs text-mutedGray">
                Allow vendors and planners to submit project proposals directly
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              {...register("acceptingBrandCollaborations")}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
          </label>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/80">
            Social & Portfolio Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-mutedGray mb-1">
                Instagram
              </label>

              <input
                {...register("instagram")}
                placeholder="https://instagram.com/username"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-[11px] text-mutedGray mb-1">
                TikTok
              </label>

              <input
                {...register("tiktok")}
                placeholder="https://tiktok.com/@username"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-[11px] text-mutedGray mb-1">
                Pinterest
              </label>

              <input
                {...register("pinterest")}
                placeholder="https://pinterest.com/username"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-[11px] text-mutedGray mb-1">
                YouTube
              </label>

              <input
                {...register("youtube")}
                placeholder="https://youtube.com/@username"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-[11px] text-mutedGray mb-1">
                Website
              </label>

              <input
                {...register("website")}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-burgundy"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading || uploadingCover}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {loading ? "Saving..." : "Save Creator Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
