import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Store,
  Save,
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import businessService from "../../services/business.service.js";
import categoryService from "../../services/category.service.js";
import mediaService from "../../services/media.service.js";

export default function VendorProfilePage() {
  const priceLabels = {
    $: "Budget Friendly",
    $$: "Moderate",
    $$$: "Luxury",
    $$$$: "Ultra Luxury",
  };

  const [priceRange, setPriceRange] = useState("$$");
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Business images
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { register, handleSubmit, reset } = useForm();

  // Fetch business profile
  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);

      try {
        const res = await businessService.getMyBusiness();
        const b = res.data?.business || res.data;

        setBusiness(b);
        setSelectedCategory(b?.categoryId?._id || b?.categoryId || "");

        setLogoUrl(b?.logoUrl || "");
        setCoverImageUrl(b?.coverImageUrl || "");
        setPriceRange(b?.priceRange || "$$");

        reset({
          name: b?.name || "",
          tagline: b?.tagline || "",
          description: b?.description || "",
          city: b?.location?.city || "",
          state: b?.location?.state || "",
          country: b?.location?.country || "",
          phone: b?.contactInfo?.phone || "",
          email: b?.contactInfo?.email || "",
          website: b?.contactInfo?.website || "",
          pricingStartsAt: b?.pricing?.startingPrice || 1000,
        });
      } catch (err) {
        toast.error("Failed to load business profile");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [reset]);

  // Fetch categories
  useEffect(() => {
    categoryService
      .getCategories({ type: "vendor" })
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Upload business image
  const handleImageUpload = async (file, type) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB.");
      return;
    }

    const isLogo = type === "logo";

    isLogo ? setUploadingLogo(true) : setUploadingCover(true);

    try {
      const res = await mediaService.uploadFile(file);

      const asset = res.data || res;
      const uploadedUrl = asset.url;

      if (!uploadedUrl) {
        throw new Error("Image URL not received from server");
      }

      if (isLogo) {
        setLogoUrl(uploadedUrl);
      } else {
        setCoverImageUrl(uploadedUrl);
      }

      toast.success(
        `${isLogo ? "Business logo" : "Cover image"} uploaded successfully!`,
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Image upload failed",
      );
    } finally {
      isLogo ? setUploadingLogo(false) : setUploadingCover(false);

      if (isLogo && logoInputRef.current) {
        logoInputRef.current.value = "";
      }

      if (!isLogo && coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  // Remove image from profile
  const handleRemoveImage = (type) => {
    if (type === "logo") {
      setLogoUrl("");
    } else {
      setCoverImageUrl("");
    }
  };

  // Save business profile
  const onSubmit = async (data) => {
    setSaving(true);

    try {
      const payload = {
        name: data.name,
        tagline: data.tagline,
        description: data.description,

        categoryId: selectedCategory || null,

        logoUrl,
        coverImageUrl,

        priceRange,

        location: {
          city: data.city,
          state: data.state,
          country: data.country,
        },

        contactInfo: {
          phone: data.phone,
          email: data.email,
          website: data.website,
        },

        pricing: {
          startingPrice: Number(data.pricingStartsAt) || 0,
        },
      };

      let res;

      if (business?._id) {
        res = await businessService.updateBusiness(business._id, payload);
      } else {
        res = await businessService.createBusiness(payload);
      }

      const updatedBusiness =
        res.data?.business || res.data?.data?.business || res.data;

      if (updatedBusiness?._id) {
        setBusiness(updatedBusiness);
      }

      toast.success("Business profile saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 bg-white rounded-2xl animate-pulse shadow-soft" />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-playfair text-2xl font-bold text-charcoal flex items-center gap-2">
          <Store className="w-6 h-6 text-burgundy" />
          Storefront & Business Profile
        </h1>

        <p className="text-sm text-gray-500">
          Edit how couples discover and contact your wedding business
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-gray-100 space-y-6"
      >
        {/* Business Images */}
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-bold text-charcoal">Business Images</h2>
            <p className="text-xs text-gray-500 mt-1">
              Upload your business logo and storefront cover image.
            </p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-2">
              Cover Image
            </label>

            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0], "cover")}
            />

            <div
              onClick={() => !uploadingCover && coverInputRef.current?.click()}
              className="relative h-44 sm:h-52 rounded-2xl border-2 border-dashed border-gray-200 hover:border-burgundy/60 overflow-hidden cursor-pointer bg-gray-50 transition group"
            >
              {coverImageUrl ? (
                <>
                  <img
                    src={coverImageUrl}
                    alt="Business cover"
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
                      handleRemoveImage("cover");
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
                    <UploadCloud className="w-8 h-8 text-burgundy" />
                  )}

                  <span className="text-sm font-semibold text-charcoal">
                    {uploadingCover
                      ? "Uploading cover image..."
                      : "Upload Cover Image"}
                  </span>

                  <span className="text-xs">
                    Recommended: 1200 × 400px · Max 10MB
                  </span>
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

          {/* Business Logo */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-2">
              Business Logo
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files?.[0], "logo")}
              />

              <div className="relative w-28 h-28 shrink-0 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <>
                    <img
                      src={logoUrl}
                      alt="Business logo"
                      className="w-full h-full object-contain p-2"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImage("logo")}
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-black/70 text-white hover:bg-burgundy transition"
                      title="Remove logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : uploadingLogo ? (
                  <Loader2 className="w-7 h-7 animate-spin text-burgundy" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-burgundy text-white text-xs font-semibold hover:bg-burgundy/90 disabled:opacity-50 transition"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}

                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </button>

                <p className="text-xs text-gray-500">
                  PNG, JPG or WEBP. Recommended: 500 × 500px. Max 10MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Business Name */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Business Name
          </label>
          <input
            {...register("name", { required: true })}
            placeholder="e.g. Luminary Wedding Photography"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            Short Tagline / Specialty
          </label>
          <input
            {...register("tagline")}
            placeholder="e.g. Editorial, timeless destination wedding photography"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1">
            About the Business
          </label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="Describe your background, aesthetic, years of experience, and packages offered..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              City
            </label>
            <input
              {...register("city")}
              placeholder="Kochi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              State / Province
            </label>
            <input
              {...register("state")}
              placeholder="Kerala"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Country
            </label>
            <input
              {...register("country")}
              placeholder="India"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
        </div>

        {/* Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Business Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all"
            >
              <option value="">Select Category</option>

              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Business Phone
            </label>
            <input
              {...register("phone")}
              placeholder="+91 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Business Email
            </label>
            <input
              {...register("email")}
              placeholder="hello@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Website
            </label>
            <input
              {...register("website")}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Starting Price (₹)
            </label>
            <input
              type="number"
              {...register("pricingStartsAt")}
              placeholder="15000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Price Range
            </label>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-all"
            >
              {Object.entries(priceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({value})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving || uploadingLogo || uploadingCover}
            className="flex items-center gap-2 px-6 py-2.5 bg-burgundy text-white rounded-xl text-sm font-medium hover:bg-burgundy/90 disabled:opacity-50 transition-all shadow-soft"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
