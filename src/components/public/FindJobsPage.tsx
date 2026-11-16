'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  X,
  IndianRupee,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Job, getJobLocationDisplay } from '../../types';
import { JobCard } from '../common/JobCard';
import { db } from '../../services/db';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';
import { JOB_CATEGORIES } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface FindJobsPageProps {
  initialSearch?: string;
  initialDistrict?: string;
  initialCategory?: string;
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const FindJobsPage: React.FC<FindJobsPageProps> = ({
  initialSearch = '',
  initialDistrict = 'All',
  initialCategory = 'All',
  onSelectJob,
  onApplyJob
}) => {
  const { isJobSaved, toggleSaveJob } = useAuth();
  const { t } = useLanguage();

  // Filters State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [district, setDistrict] = useState(initialDistrict);
  const [category, setCategory] = useState(initialCategory);
  const [jobType, setJobType] = useState('All');
  const [workMode, setWorkMode] = useState('All');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [experience, setExperience] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'latest' | 'salary_high' | 'featured'>('latest');

  // Mobile Filters Drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Synchronize internal state when props change (e.g. browser back/forward or new URL params)
  React.useEffect(() => {
    setSearchTerm(initialSearch || '');
    setDistrict(initialDistrict || 'All');
    setCategory(initialCategory || 'All');
    setCurrentPage(1);
  }, [initialSearch, initialDistrict, initialCategory]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDistrict('All');
    setCategory('All');
    setJobType('All');
    setWorkMode('All');
    setMinSalary(0);
    setExperience(0);
    setSortBy('latest');
    setCurrentPage(1);
  };

  // Filter & Query
  const filteredJobs = useMemo(() => {
    const jobs = db.getJobs({
      search: searchTerm,
      district: district !== 'All' ? district : undefined,
      category: category !== 'All' ? category : undefined,
      jobType: jobType !== 'All' ? jobType : undefined,
      workMode: workMode !== 'All' ? workMode : undefined,
      minSalary: minSalary > 0 ? minSalary : undefined,
      experience: experience > 0 ? experience : undefined
    });

    if (sortBy === 'salary_high') {
      return [...jobs].sort((a, b) => b.salaryMax - a.salaryMax);
    }
    if (sortBy === 'featured') {
      return [...jobs].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return jobs;
  }, [searchTerm, district, category, jobType, workMode, minSalary, experience, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeFilterCount =
    (district !== 'All' ? 1 : 0) +
    (category !== 'All' ? 1 : 0) +
    (jobType !== 'All' ? 1 : 0) +
    (workMode !== 'All' ? 1 : 0) +
    (minSalary > 0 ? 1 : 0) +
    (experience > 0 ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Search Banner */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search job title, skills, or company (e.g. React, CNC, Accountant)..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:w-64 relative flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <select
                value={district}
                onChange={e => {
                  setDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-8 py-2.5 bg-slate-50 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="All">All Maharashtra Districts</option>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.marathiName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters ({activeFilterCount})</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden md:block col-span-1 bg-white p-5 rounded-2xl border border-slate-200 h-fit sticky top-20 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Refine Search</h3>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Category</label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="All">All Categories</option>
                {JOB_CATEGORIES.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Job Type</label>
              <div className="space-y-1.5 text-xs text-slate-600">
                {['All', 'Full Time', 'Part Time', 'Internship', 'Contract'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      checked={jobType === type}
                      onChange={() => {
                        setJobType(type);
                        setCurrentPage(1);
                      }}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Work Mode Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Work Mode</label>
              <div className="space-y-1.5 text-xs text-slate-600">
                {['All', 'Office', 'Hybrid', 'Remote'].map(mode => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="workMode"
                      checked={workMode === mode}
                      onChange={() => {
                        setWorkMode(mode);
                        setCurrentPage(1);
                      }}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Salary Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Min Monthly Salary</span>
                <span className="text-blue-600">
                  {minSalary > 0 ? `₹${minSalary.toLocaleString('en-IN')}` : 'Any'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80000"
                step="5000"
                value={minSalary}
                onChange={e => {
                  setMinSalary(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹0</span>
                <span>₹40k</span>
                <span>₹80k+</span>
              </div>
            </div>

            {/* Max Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={e => {
                  setExperience(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value={0}>Any Experience / Fresher</option>
                <option value={1}>1+ Years Experience</option>
                <option value={3}>3+ Years Experience</option>
                <option value={5}>5+ Years Experience</option>
              </select>
            </div>
          </aside>

          {/* MAIN RESULTS COLUMN */}
          <main className="col-span-1 md:col-span-3">
            {/* Header / Sort bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="text-xs text-slate-600">
                Showing{' '}
                <span className="font-bold text-slate-900">
                  {filteredJobs.length}
                </span>{' '}
                vacancies across Maharashtra
                {district !== 'All' && ` in ${district}`}
                {category !== 'All' && ` for ${category}`}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="latest">Latest Vacancies</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="featured">Featured First</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            {paginatedJobs.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  No matching jobs found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  We couldn’t find any active vacancies matching your current filters. Try resetting
                  district or keyword filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelectJob={onSelectJob}
                    onApplyJob={onApplyJob}
                  />
                ))}
              </div>
            )}

{/* Pagination Controls */ }
{
  totalPages > 1 && (
    <div className="mt-8 flex items-center justify-center gap-2 text-xs">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="px-3 py-2 text-slate-600 font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
          </main >
        </div >
      </div >

  {/* MOBILE FILTERS MODAL */ }
{
  mobileFiltersOpen && (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex justify-end md:hidden">
      <div className="w-full max-w-xs bg-white h-full p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Filter Jobs</h3>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg"
            >
              <option value="All">All Maharashtra Districts</option>
              {MAHARASHTRA_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg"
            >
              <option value="All">All Categories</option>
              {JOB_CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
            <select
              value={jobType}
              onChange={e => setJobType(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg"
            >
              <option value="All">All Job Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={e => setWorkMode(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg"
            >
              <option value="All">All Modes</option>
              <option value="Office">Office</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Minimum Salary Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Min Monthly Salary</span>
              <span className="text-blue-600">
                {minSalary > 0 ? `₹${minSalary.toLocaleString('en-IN')}` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80000"
              step="5000"
              value={minSalary}
              onChange={e => setMinSalary(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹0</span>
              <span>₹40k</span>
              <span>₹80k+</span>
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
            <select
              value={experience}
              onChange={e => setExperience(Number(e.target.value))}
              className="w-full p-2 text-xs border rounded-lg"
            >
              <option value={0}>Any Experience / Fresher</option>
              <option value={1}>1+ Years Experience</option>
              <option value={3}>3+ Years Experience</option>
              <option value={5}>5+ Years Experience</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex gap-2">
          <button
            onClick={handleClearFilters}
            className="flex-1 py-2 text-xs font-medium border border-slate-200 rounded-lg text-slate-700"
          >
            Reset
          </button>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="flex-1 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
    </div >
  );
};
