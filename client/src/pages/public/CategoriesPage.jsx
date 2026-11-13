import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/category.service.js';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType || c.type === 'both';
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">Explore by Category</span>
        <h1 className="font-serif text-4xl font-medium text-charcoal">The Wedding Taxonomy</h1>
        <p className="text-sm text-mutedGray leading-relaxed">
          Explore curated categories spanning destination venues, film photography, bespoke attire, floral installations, and full-service wedding design.
        </p>

        {/* Filters */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {['all', 'vendor', 'inspiration'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? 'bg-burgundy text-white shadow-soft'
                  : 'bg-white border border-charcoal/10 text-charcoal hover:bg-rose-50'
              }`}
            >
              {type === 'all' ? 'All Specialties' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCategories.map((category) => (
          <Link
            key={category._id}
            to={`/categories/${category.slug}`}
            className="group block bg-white rounded-2xl overflow-hidden border border-burgundy/10 shadow-soft hover:shadow-elevated transition-all duration-300"
          >
            <div className="relative h-56 overflow-hidden bg-ivory-200">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-300 block mb-1">
                  Category
                </span>
                <h3 className="font-serif text-xl font-medium leading-tight group-hover:text-gold transition-colors">
                  {category.name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-charcoal/80 leading-relaxed line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-ivory-200 text-xs font-semibold text-burgundy">
                <span>Explore Vendors & Inspiration</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
