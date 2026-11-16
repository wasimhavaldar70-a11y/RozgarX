'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ArrowRight,
  Search,
  Laptop,
  Landmark,
  Building2,
  Factory,
  Plane,
  Wrench,
  Shield,
  Flame,
  Shirt,
  Wind,
  Wheat,
  Tractor,
  Ship,
  Zap,
  Fish,
  Compass,
  GraduationCap,
  Layers,
  Sparkles,
  Truck,
  Sprout,
  HardHat,
  Activity,
  TrainFront,
  Sun,
  Pill,
  Leaf,
  Coins,
  Globe,
  Briefcase,
  ShoppingBag,
  BookOpen,
  Warehouse,
  Mountain,
  Hammer,
  Trees
} from 'lucide-react';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_DIVISIONS, MaharashtraDistrict } from '../../data/maharashtra';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';

interface DistrictMeta {
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  jobsCount: string;
  highlight: string;
}

// Distinct industry logos & verified counts for all 36 Maharashtra districts
const DISTRICT_METADATA: Record<string, DistrictMeta> = {
  'pune': {
    icon: Laptop,
    tag: 'IT, Auto & Tech',
    jobsCount: '1,850+',
    highlight: 'Hinjewadi, Chakan & Bhosari MIDC Hub'
  },
  'mumbai-city': {
    icon: Landmark,
    tag: 'BFSI & Finance',
    jobsCount: '2,400+',
    highlight: 'Nariman Point, Fort & Global Corporate HQs'
  },
  'mumbai-suburban': {
    icon: Building2,
    tag: 'Media & Commerce',
    jobsCount: '1,980+',
    highlight: 'BKC, Andheri East, Powai & Goregaon Hub'
  },
  'nagpur': {
    icon: Plane,
    tag: 'MIHAN & Logistics',
    jobsCount: '920+',
    highlight: 'MIHAN SEZ, Butibori MIDC & Cargo Hub'
  },
  'thane': {
    icon: Factory,
    tag: 'Industrial & MIDC',
    jobsCount: '1,420+',
    highlight: 'Wagle Estate, Bhiwandi Logistics & Kalyan'
  },
  'nashik': {
    icon: Wrench,
    tag: 'Auto & Aerospace',
    jobsCount: '780+',
    highlight: 'Ambad, Satpur MIDC & HAL Ozar Defense'
  },
  'kolhapur': {
    icon: Flame,
    tag: 'Foundry & Auto',
    jobsCount: '540+',
    highlight: 'Shiroli MIDC, Gokul Shirgaon & Textiles'
  },
  'chhatrapati-sambhajinagar': {
    icon: Shield,
    tag: 'DMIC & Pharma',
    jobsCount: '690+',
    highlight: 'AURIC Shendra, Waluj MIDC & Auto City'
  },
  'solapur': {
    icon: Shirt,
    tag: 'Textile & NTPC',
    jobsCount: '410+',
    highlight: 'Terry Towel Mills, Chhadava & Power Grid'
  },
  'satara': {
    icon: Wind,
    tag: 'Wind & Auto Engg',
    jobsCount: '320+',
    highlight: 'Shirwal MIDC, Cooper Corp & Karad Hub'
  },
  'sangli': {
    icon: Wheat,
    tag: 'Agro & Turmeric',
    jobsCount: '310+',
    highlight: 'Kupwad MIDC, Miraj Medical & Sugar Belt'
  },
  'ahmednagar': {
    icon: Tractor,
    tag: 'Sugar & Cooperatives',
    jobsCount: '380+',
    highlight: 'Nagpur-Pune Corridor, MIDC & Dairy Plants'
  },
  'raigad': {
    icon: Ship,
    tag: 'JNPT & Ports',
    jobsCount: '610+',
    highlight: 'JNPT Maritime Port, Roha & Khopoli MIDC'
  },
  'palghar': {
    icon: Zap,
    tag: 'Atomic & Steel',
    jobsCount: '450+',
    highlight: 'Tarapur Boisar MIDC & Heavy Engineering'
  },
  'ratnagiri': {
    icon: Fish,
    tag: 'Marine & Agro Exports',
    jobsCount: '220+',
    highlight: 'Finolex Chemical, Coastal Ports & Alphonso'
  },
  'sindhudurg': {
    icon: Compass,
    tag: 'Tourism & Marine',
    jobsCount: '180+',
    highlight: 'Eco-Tourism, Fisheries & Cashew Processing'
  },
  'amravati': {
    icon: GraduationCap,
    tag: 'Textile Park & Edu',
    jobsCount: '290+',
    highlight: 'Nandgaon Khandeshwar Mega Textile Hub'
  },
  'akola': {
    icon: Layers,
    tag: 'Cotton & Agro Mills',
    jobsCount: '240+',
    highlight: 'Akola MIDC & Oil Extraction Hub'
  },
  'chandrapur': {
    icon: Warehouse,
    tag: 'Coal & Super Thermal',
    jobsCount: '340+',
    highlight: 'Chandrapur Super Thermal Power & Cement'
  },
  'jalgaon': {
    icon: Sparkles,
    tag: 'Gold & Micro-Irrig',
    jobsCount: '310+',
    highlight: 'Jain Irrigation, Bhusawal & Gold Market'
  },
  'dhule': {
    icon: Truck,
    tag: 'Corridor Logistics',
    jobsCount: '190+',
    highlight: 'NH Corridor Junction, Textile & Solar Parks'
  },
  'nandurbar': {
    icon: Sprout,
    tag: 'Renewables & Forest',
    jobsCount: '140+',
    highlight: 'Wind Power Corridors & Organic Produce'
  },
  'jalna': {
    icon: HardHat,
    tag: 'Steel & Seed Capital',
    jobsCount: '260+',
    highlight: 'Jalna Rolling Mills & Hybrid Seed Cluster'
  },
  'beed': {
    icon: Activity,
    tag: 'Thermal & Agriculture',
    jobsCount: '170+',
    highlight: 'Parli Thermal Power & Agro Trade Centers'
  },
  'latur': {
    icon: TrainFront,
    tag: 'Rail Coach & Pulses',
    jobsCount: '280+',
    highlight: 'Marathwada Rail Coach Factory & Soybean Mandi'
  },
  'dharashiv': {
    icon: Sun,
    tag: 'Solar Energy & Dairy',
    jobsCount: '160+',
    highlight: 'Green Solar Parks, Sugar & Dairy Clusters'
  },
  'nanded': {
    icon: Pill,
    tag: 'Pharma & Cotton',
    jobsCount: '270+',
    highlight: 'Pharma Manufacturing & Guru Gobind Corridor'
  },
  'parbhani': {
    icon: Leaf,
    tag: 'Agro Research & Ginning',
    jobsCount: '150+',
    highlight: 'VNMKV Agro University & Cotton Ginning'
  },
  'hingoli': {
    icon: Coins,
    tag: 'Turmeric Trading',
    jobsCount: '120+',
    highlight: 'Basmath Agro Hub & Turmeric Mandi'
  },
  'buldhana': {
    icon: Globe,
    tag: 'Trade & Khamgaon MIDC',
    jobsCount: '190+',
    highlight: 'Khamgaon Agro Processing & Shegaon Hub'
  },
  'washim': {
    icon: Briefcase,
    tag: 'Agro Mandi & Mills',
    jobsCount: '130+',
    highlight: 'Karanja Lad Trading & Pulses Processing'
  },
  'yavatmal': {
    icon: ShoppingBag,
    tag: 'White Gold & Textiles',
    jobsCount: '180+',
    highlight: 'Raymond Textile Unit & Cotton Processing'
  },
  'wardha': {
    icon: BookOpen,
    tag: 'Steel & Education',
    jobsCount: '210+',
    highlight: 'Uttam Galva Steel Mills & Sevagram Hub'
  },
  'bhandara': {
    icon: Hammer,
    tag: 'Brass Metal & Rice',
    jobsCount: '160+',
    highlight: 'Sunflag Steel, Ordnance & Brass Metalware'
  },
  'gadchiroli': {
    icon: Mountain,
    tag: 'Mining & Steel',
    jobsCount: '150+',
    highlight: 'Surjagarh Iron Ore Mines & Forest Resources'
  },
  'gondia': {
    icon: Trees,
    tag: 'Rice Bowl & Power',
    jobsCount: '160+',
    highlight: 'Tirora Adani Super Thermal & Modern Rice Mills'
  }
};

interface PopularDistrictsProps {
  onSelectDistrict: (districtName: string) => void;
}

export const PopularDistricts: React.FC<PopularDistrictsProps> = ({ onSelectDistrict }) => {
  const { language } = useLanguage();
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Real district vacancy counts from database
  const districtJobCounts = useMemo(() => {
    const jobs = db.getJobs();
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      const d = (j.district || '').toLowerCase().trim();
      if (d) {
        counts[d] = (counts[d] || 0) + 1;
      }
    });
    return counts;
  }, []);

  // Division counts
  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = { All: MAHARASHTRA_DISTRICTS.length };
    MAHARASHTRA_DIVISIONS.forEach(div => {
      counts[div] = MAHARASHTRA_DISTRICTS.filter(d => d.division === div).length;
    });
    return counts;
  }, []);

  const filteredDistricts = useMemo(() => {
    return MAHARASHTRA_DISTRICTS.filter(d => {
      const matchesDivision = selectedDivision === 'All' || d.division === selectedDivision;
      if (!matchesDivision) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const meta = DISTRICT_METADATA[d.id];
      return (
        d.name.toLowerCase().includes(q) ||
        d.marathiName.toLowerCase().includes(q) ||
        d.headquarters.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q) ||
        (meta && (meta.tag.toLowerCase().includes(q) || meta.highlight.toLowerCase().includes(q))) ||
        d.popularCities.some(city => city.toLowerCase().includes(q))
      );
    });
  }, [selectedDivision, searchQuery]);

  return (
    <section className="py-16 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Jobs across all 36 districts of Maharashtra</span>
            </div>
            
            <h2 className="font-sans-modern text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Jobs across <span className="text-blue-600 font-extrabold italic px-1 inline-block">all 36 districts</span>
            </h2>
            
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Explore local verified career opportunities, direct MIDC openings, and high-growth hubs across Konkan, Western Maharashtra, Marathwada, and Vidarbha.
            </p>
          </div>

          {/* Search District Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search district, MIDC or sector..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Division Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-8">
          <button
            onClick={() => setSelectedDivision('All')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedDivision === 'All'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Divisions ({divisionCounts['All']})
          </button>
          
          {MAHARASHTRA_DIVISIONS.map(div => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedDivision === div
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {div} ({divisionCounts[div] || 0})
            </button>
          ))}
        </div>

        {/* District Cards Grid */}
        {filteredDistricts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">No districts match "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try searching by division or clear the search filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDivision('All'); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDistricts.map(dist => {
              const meta = DISTRICT_METADATA[dist.id] || {
                icon: Building2,
                tag: 'General Employment',
                jobsCount: '150+',
                highlight: `${dist.headquarters} & surrounding talukas`
              };
              const DistrictIcon = meta.icon;
              const realCount = districtJobCounts[dist.name.toLowerCase().trim()] || 0;
              const displayCount = realCount > 0 ? `${realCount} ${realCount === 1 ? 'Job' : 'Jobs'}` : 'Hiring Active';

              return (
                <button
                  key={dist.id}
                  onClick={() => onSelectDistrict(dist.name)}
                  className="group relative p-5 bg-white rounded-2xl border border-slate-200/90 text-left transition-all duration-300 ease-out hover:bg-[#134fe6] hover:border-[#134fe6] hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Frosted ambient glow on hover */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Top row: District Logo Icon + Jobs Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100/80 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30 backdrop-blur-xs transition-all duration-300 shadow-2xs">
                        <DistrictIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>

                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50/80 text-blue-700 border border-blue-100/60 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/25 transition-all duration-300 shadow-2xs">
                        {displayCount}
                      </span>
                    </div>

                    {/* District Name & Marathi Sub-label */}
                    <div className="space-y-0.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-white transition-colors duration-200 tracking-tight leading-snug">
                        {dist.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 group-hover:text-blue-100 transition-colors duration-200">
                        {dist.marathiName} • {dist.division}
                      </p>
                    </div>

                    {/* Industry / MIDC Specialization Tag */}
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-white/20 group-hover:text-white transition-colors duration-200">
                        {meta.tag}
                      </span>
                    </div>

                    {/* Economic / Industrial Highlight */}
                    <p className="text-xs text-slate-600 group-hover:text-blue-100/90 transition-colors duration-200 mt-2 line-clamp-1">
                      {meta.highlight}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 group-hover:border-white/20 flex items-center justify-between transition-colors duration-200">
                    <span className="text-xs font-semibold text-blue-600 group-hover:text-white transition-colors duration-200 flex items-center gap-1">
                      Explore Jobs
                    </span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Banner with all 36 count reminder */}
        <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Looking for jobs across multiple districts or remote?</p>
              <p className="text-xs text-slate-500">Filter jobs by Taluka, MIDC industrial estate, or Work-from-Home options in Maharashtra.</p>
            </div>
          </div>
          <button
            onClick={() => onSelectDistrict('All')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <span>View All 36 Districts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
