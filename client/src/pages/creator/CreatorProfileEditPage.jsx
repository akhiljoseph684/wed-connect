import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Save } from "lucide-react";
import toast from "react-hot-toast";
import creatorService from "../../services/creator.service.js";
import { useSelector } from "react-redux";

export default function CreatorProfileEditPage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    // Load creator profile if available
    creatorService
      .getCreatorByUserId(user?._id)
      .then((res) => {
        const c = res.data?.profile;
        console.log(res);
        if (c) {
          reset({
            displayName: c.displayName || "",
            specialty: c.specialty || "",
            bio: c.bio || "",
            instagram: c.socials?.instagram || "",
            tiktok: c.socials?.tiktok || "",
            pinterest: c.socials?.pinterest || "",
          });
        }
      })
      .catch(() => {});
  }, [reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await creatorService.upsertProfile({
        displayName: data.displayName,
        specialty: data.specialty,
        bio: data.bio,
        socials: {
          instagram: data.instagram,
          tiktok: data.tiktok,
          pinterest: data.pinterest,
        },
      });
      toast.success("Creator profile saved!");
    } catch (err) {
      toast.error("Failed to save creator profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <User className="w-6 h-6 text-burgundy" /> Creator Studio Profile
        </h1>
        <p className="text-sm text-gray-500">
          Configure your public creator persona and creative specialty
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-5"
      >
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Brand or Creator Name
          </label>
          <input
            {...register("displayName")}
            placeholder="e.g. Elena Floral Designs & Aesthetics"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Creative Specialty / Niche
          </label>
          <input
            {...register("specialty")}
            placeholder="e.g. Editorial Wedding Styling & Botanical Art"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Creator Bio
          </label>
          <textarea
            {...register("bio")}
            rows={4}
            placeholder="Tell couples and brands about your creative philosophy and style..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Instagram (@handle)
            </label>
            <input
              {...register("instagram")}
              placeholder="@handle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              TikTok (@handle)
            </label>
            <input
              {...register("tiktok")}
              placeholder="@handle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Pinterest (URL)
            </label>
            <input
              {...register("pinterest")}
              placeholder="pinterest.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Creator Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
