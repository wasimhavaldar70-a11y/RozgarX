'use client';

import React from 'react';
import {
  Laptop,
  Factory,
  Calculator,
  TrendingUp,
  Landmark,
  HeartPulse,
  GraduationCap,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Truck,
  Headphones,
  ArrowRight
} from 'lucide-react';
import { JOB_CATEGORIES } from '../../data/categories';
import { useLanguage } from '../../context/LanguageContext';

interface PopularCategoriesProps {
  onSelectCategory: (categoryName: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Laptop,
  Factory,
  Calculator,
  TrendingUp,
  Landmark,
  HeartPulse,
  GraduationCap,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Truck,
  Headphones
};

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ onSelectCategory }) => {
  const { language, t } = useLanguage();

  return (
    <section className="py-14 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="font-sans-modern text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Explore <span className="text-blue-600 font-extrabold italic px-1 inline-block">popular</span> categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore high-demand career fields and industrial vacancies across Maharashtra.
            </p>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="mt-2 sm:mt-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {JOB_CATEGORIES.map(cat => {
            const Icon = ICON_MAP[cat.iconName] || Briefcase;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {language === 'mr' ? cat.marathiName : cat.name}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Explore Vacancies</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
