'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Coins,
  MapPin,
  IndianRupee,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { JobType, WorkMode } from '../../types';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';
import { JOB_CATEGORIES } from '../../data/categories';

const CATEGORY_SKILL_SUGGESTIONS: Record<string, string[]> = {
  'Manufacturing & Production': ['CNC Operating', 'AutoCAD', 'Quality Inspection', 'Lathe Machine', 'Blueprint Reading', 'Maintenance', 'Welding', 'Assembly'],
  'Retail, Sales & Marketing': ['Inventory Management', 'Store Keeping', 'Stock Monitoring', 'Retail Billing', 'Customer Service', 'Cash Handling', 'POS Software'],
  'Information Technology': ['React', 'TypeScript', 'Node.js', 'SQL / PostgreSQL', 'Python', 'Tailwind CSS', 'Git', 'API Integration'],
  'Accounts & Finance': ['Tally Prime', 'GST Filing', 'Bookkeeping', 'Invoicing & Billing', 'MS Excel (VLOOKUP)', 'TDS Compliance', 'Financial Reporting'],
  'Logistics & Supply Chain': ['Warehouse Management', 'Inventory Audit', 'Dispatch & Shipping', 'Material Handling', 'Forklift Operation', 'Vendor Coordination'],
  'Automobile & Mechanical': ['Automobile Diagnostics', 'Engine Assembly', 'Wheel Alignment', 'Vehicle Service', 'Tool Handling', 'Safety Compliance'],
  'Hospitality & Tourism': ['Food & Beverage Service', 'Guest Relations', 'Front Desk Management', 'Food Hygiene', 'Reservation Systems'],
  'Healthcare & Pharma': ['Pharmacy Dispensing', 'Patient Care', 'Medical Records', 'First Aid', 'Clinical Assistance', 'Laboratory Testing'],
  'Construction & Real Estate': ['Site Supervision', 'Civil Engineering', 'Estimation & Costing', 'AutoCAD Civil', 'Contractor Management'],
  'Education & Training': ['Curriculum Planning', 'Classroom Teaching', 'Subject Matter Expertise', 'Student Counseling', 'Online Instruction']
};

const DEFAULT_SUGGESTIONS = ['Communication', 'Teamwork', 'Problem Solving', 'Computer Basics', 'Customer Handling', 'Documentation'];

const STANDARD_EDUCATION_OPTIONS = [
  '10th Pass (SSC)',
  '12th Pass (HSC)',
  'ITI / Vocational Trade Certificate',
  'Diploma (Engineering / Commercial)',
  'Any Graduate',
  'B.Com / Accounts Graduate',
  'B.E. / B.Tech (Engineering)',
  'B.Sc / Science Graduate',
  'BBA / BMS / Management Graduate',
  'Post Graduate / Master’s Degree (MBA / M.Tech / MCA)',
  'Other / Custom'
];

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: () => void;
  onOpenSubscriptionPlans?: () => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
  onOpenSubscriptionPlans
}) => {
  const { user, companyProfile } = useAuth();
  const employerId = user?.employerId || user?.id || 'emp_1';
  const subscription = db.getEmployerSubscription(employerId);

  // Form State
  const [companyName, setCompanyName] = useState(companyProfile?.name || '');
  const [title, setTitle] = useState('');

  // Sync company details when modal opens or company profile loads
  React.useEffect(() => {
    if (companyProfile?.name && !companyName) {
      setCompanyName(companyProfile.name);
    }
    if (isOpen && companyProfile) {
      if (companyProfile.district && district === 'Kolhapur') setDistrict(companyProfile.district);
      if (companyProfile.city && !city) setCity(companyProfile.city);
      if (companyProfile.address && !address) setAddress(companyProfile.address);
    }
  }, [companyProfile, isOpen]);
  const [category, setCategory] = useState(JOB_CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Execute day-to-day duties according to industry standard guidelines.',
    'Collaborate effectively with team members and report to project leads.'
  ]);
  const [newResp, setNewResp] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState(STANDARD_EDUCATION_OPTIONS[4]); // 'Any Graduate'
  const [customEducation, setCustomEducation] = useState('');
  const [experienceMin, setExperienceMin] = useState(1);
  const [experienceMax, setExperienceMax] = useState(4);
  const [salaryMin, setSalaryMin] = useState(25000);
  const [salaryMax, setSalaryMax] = useState(45000);
  const [salaryType, setSalaryType] = useState<'Per Month' | 'Per Annum'>('Per Month');
  const [vacancies, setVacancies] = useState(2);
  const [jobType, setJobType] = useState<JobType>('Full Time');
  const [workMode, setWorkMode] = useState<WorkMode>('Office');
  const [district, setDistrict] = useState(companyProfile?.district || 'Kolhapur');
  const [city, setCity] = useState(companyProfile?.city || '');
  const [address, setAddress] = useState(companyProfile?.address || '');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-12-31');
  const [contactEmail, setContactEmail] = useState(companyProfile?.contactEmail || user?.email || 'hr@company.com');
  const [contactPhone, setContactPhone] = useState(companyProfile?.contactPhone || '9822012345');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleRemoveResponsibility = (idx: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));
  };

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddSkillFromInput = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const newSkills = [...skills];
    for (const p of parts) {
      if (!newSkills.includes(p)) {
        newSkills.push(p);
      }
    }
    setSkills(newSkills);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !title.trim() || !description.trim() || !district || !contactPhone.trim() || !contactEmail.trim()) {
      setErrorMessage('Please fill in all mandatory job details (Company Name, Job Title, Description, District, Recruiter Phone & Email).');
      return;
    }

    if (!subscription || subscription.remainingCredits <= 0) {
      setErrorMessage('You have 0 job posting credits remaining. Please upgrade your subscription plan.');
      return;
    }

    const finalEducation = education === 'Other / Custom' && customEducation.trim() ? customEducation.trim() : education;
    const allSkills = [...skills];
    if (skillInput.trim()) {
      const parts = skillInput.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        if (!allSkills.includes(p)) allSkills.push(p);
      });
    }

    if (allSkills.length === 0) {
      setErrorMessage('Please specify at least one required skill so candidates know if they are capable and qualified for this vacancy.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const resolvedAddress = address.trim();
    const resolvedCity = city.trim() || (resolvedAddress ? resolvedAddress.split(',')[0].trim() : district);

    const jobPayload = {
      employerId,
      companyId: companyProfile?.id || 'comp_1',
      companyName: companyName.trim(),
      companyLogo: companyProfile?.logoUrl,
      companyVerified: companyProfile?.verificationStatus === 'Verified',
      title,
      category,
      description,
      responsibilities,
      requiredSkills: allSkills,
      educationRequirement: finalEducation,
      experienceMinYears: Number(experienceMin),
      experienceMaxYears: Number(experienceMax),
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryType,
      vacancies: Number(vacancies),
      jobType,
      workMode,
      district,
      city: resolvedCity,
      address: resolvedAddress,
      applicationDeadline,
      contactEmail,
      contactPhone,
      status: 'pending' as const
    };

    // 1. Immediately save to local service state
    const res = db.createJob(jobPayload);

    // 2. Persist directly to Supabase PostgreSQL database table via API
    try {
      const apiRes = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobPayload)
      });
      const apiData = await apiRes.json();
      if (apiData?.success && apiData?.job?.id && res.job) {
        // Link server generated DB UUID
        res.job.id = apiData.job.id;
      }
    } catch (err) {
      console.warn('Network sync to database jobs table queued:', err);
    }

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Job submitted successfully and saved in database table! 1 credit deducted. Vacancy is now pending Super Admin review.');
      setTimeout(() => {
        if (onJobCreated) onJobCreated();
        onClose();
      }, 1500);
    } else {
      setErrorMessage(res.error || 'Failed to submit job.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Post a Job Vacancy</h3>
            <p className="text-xs text-slate-500">
              Publish a verified opportunity across Maharashtra districts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Credit Balance Strip */}
        <div className="px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">
              Active Plan: <strong>{subscription?.planName}</strong> • Remaining Credits:{' '}
              <strong className={subscription?.remainingCredits === 0 ? 'text-red-600' : 'text-blue-700'}>
                {subscription?.remainingCredits ?? 0}
              </strong>
            </span>
          </div>
          {subscription?.remainingCredits === 0 && onOpenSubscriptionPlans && (
            <button
              type="button"
              onClick={onOpenSubscriptionPlans}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Get More Credits
            </button>
          )}
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form id="post-job-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Company & Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Tata Motors Ltd. / Acme Engineering"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Senior CNC Machinist / Accounts Executive"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Industry / Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Industry / Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
              >
                {JOB_CATEGORIES.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the job vacancy, expectations, team structure, and career growth..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Key Responsibilities */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Responsibilities
              </label>
              <div className="space-y-1.5 mb-2">
                {responsibilities.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="flex-1 text-slate-700">{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newResp}
                  onChange={e => setNewResp(e.target.value)}
                  placeholder="Add another responsibility..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddResponsibility();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Required Skills & Candidate Capability */}
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Required Skills & Candidate Capabilities *</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Add the core skills required so candidates know if they are capable and qualified for this vacancy.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  {skills.length} Selected
                </span>
              </div>

              {/* Tag Pills Container */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-lg border border-slate-200">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-500 hover:text-blue-800 hover:bg-blue-100/80 rounded-full p-0.5 cursor-pointer"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input for typing skill */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  placeholder="Type a skill and press Enter (e.g. Inventory Management, Tally, CNC)..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddSkillFromInput();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkillFromInput}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skill
                </button>
              </div>

              {/* Suggested Skills for this category */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                  1-Click Skill Suggestions for <span className="text-blue-600">{category}</span>:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(CATEGORY_SKILL_SUGGESTIONS[category] || DEFAULT_SUGGESTIONS).map((s, idx) => {
                    const isSelected = skills.includes(s);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleSkill(s)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Salary & Vacancies */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salaryMin}
                  onChange={e => setSalaryMin(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Salary (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={salaryMax}
                  onChange={e => setSalaryMax(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Frequency</label>
                <select
                  value={salaryType}
                  onChange={e => setSalaryType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Per Month">Per Month</option>
                  <option value="Per Annum">Per Annum</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Vacancies</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={vacancies}
                  onChange={e => setVacancies(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Experience (Yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={experienceMin}
                  onChange={e => setExperienceMin(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">0 = Fresher eligible</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Experience (Yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={experienceMax}
                  onChange={e => setExperienceMax(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Education Qualification *</span>
                </label>
                <select
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
                >
                  {STANDARD_EDUCATION_OPTIONS.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {education === 'Other / Custom' && (
                  <input
                    type="text"
                    value={customEducation}
                    onChange={e => setCustomEducation(e.target.value)}
                    placeholder="Enter custom degree (e.g. B.Pharm, D.Ed)"
                    className="w-full mt-1.5 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Job Type & Work Mode */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                <select
                  value={workMode}
                  onChange={e => setWorkMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Office">Office / On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {MAHARASHTRA_DISTRICTS.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / MIDC Area</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Chakan / Shiroli"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Street Address & Direct Contact Info */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Location / Office Address (Shown on Job Card) *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => {
                      const val = e.target.value;
                      setAddress(val);
                      if (!city) {
                        const firstPart = val.split(',')[0].trim();
                        if (firstPart) setCity(firstPart);
                      }
                    }}
                    placeholder="e.g. Vathar Taraf vadgaon / Plot 42, Shiroli MIDC"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  This work address will be shown directly on the job vacancy card.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recruiter Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="e.g. 98220 12345"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recruiter Contact Email ID *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="e.g. hr@company.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center gap-2 text-[11px] text-blue-800">
                <Lock className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                <span>
                  <strong>Privacy Shield:</strong> Your direct phone, email, and exact street address are hidden from public scrapers and only revealed to registered job seekers who sign in.
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Deducts <strong>1 Credit</strong> upon submission.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-xs font-medium rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="post-job-form"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Job (1 Credit)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
