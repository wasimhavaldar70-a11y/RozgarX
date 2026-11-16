'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowLeft,
  Save,
  CheckCircle2,
  Eye,
  Languages,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { CandidateProfile } from '../../types';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtra';

interface EducationItem {
  id: string;
  degree: string;
  institute: string;
  year: string;
  score: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
}

interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  mobile: string;
  district: string;
  city: string;
  address: string;
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  isFresher: boolean;
  skills: string[];
  languages: string[];
  certifications: string[];
}

interface ResumeBuilderProps {
  isEmbedded?: boolean;
  onBack?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register_candidate') => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  isEmbedded = false,
  onBack,
  onOpenAuth
}) => {
  const { user, candidateProfile } = useAuth();

  // Selected Theme
  const [theme, setTheme] = useState<'navy' | 'slate' | 'emerald'>('navy');
  const [activeEditorSection, setActiveEditorSection] = useState<'personal' | 'summary' | 'education' | 'experience' | 'skills' | 'languages'>('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // Initial data from profile or comprehensive defaults
  const [resume, setResume] = useState<ResumeData>(() => {
    return {
      fullName: candidateProfile?.fullName || user?.fullName || 'Wasim Havaldar',
      jobTitle: candidateProfile?.experience?.designation || 'Full-Stack Software Engineer',
      email: candidateProfile?.email || user?.email || 'wasim.havaldar@example.com',
      mobile: candidateProfile?.mobile || '+91 98220 12345',
      district: candidateProfile?.district || 'Kolhapur',
      city: candidateProfile?.city || 'Kolhapur',
      address: candidateProfile?.address || 'MIDC Shiroli, Kolhapur, Maharashtra',
      summary:
        candidateProfile?.resumeSummary ||
        'Results-driven professional with hands-on expertise in technical operations, cross-functional collaboration, and quality delivery. Committed to driving growth for leading enterprises across Maharashtra.',
      education: [
        {
          id: 'edu_1',
          degree: candidateProfile?.education?.degreeName || candidateProfile?.education?.highestQualification || 'B.E. Computer Science & Engineering',
          institute: candidateProfile?.education?.institute || 'Shivaji University, Kolhapur',
          year: candidateProfile?.education?.passingYear || '2023',
          score: candidateProfile?.education?.percentageOrCgpa || '8.4 CGPA'
        },
        {
          id: 'edu_2',
          degree: 'Higher Secondary Certificate (HSC)',
          institute: 'Maharashtra State Board',
          year: '2019',
          score: '84.5%'
        }
      ],
      experience: candidateProfile?.experience?.isFresher
        ? []
        : [
            {
              id: 'exp_1',
              title: candidateProfile?.experience?.designation || 'Software Engineer',
              company: candidateProfile?.experience?.currentCompany || 'Tech Solutions Pvt Ltd',
              location: 'Kolhapur / Pune, Maharashtra',
              duration: '2023 – Present',
              description:
                'Architected client portals, implemented REST APIs, and improved page load times by 40%. Collaborated with cross-functional teams to deliver enterprise software solutions.'
            }
          ],
      isFresher: candidateProfile?.experience?.isFresher || false,
      skills:
        candidateProfile?.skills && candidateProfile.skills.length > 0
          ? candidateProfile.skills
          : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Inventory Audit', 'Communication', 'Problem Solving'],
      languages:
        candidateProfile?.languagesKnown && candidateProfile.languagesKnown.length > 0
          ? candidateProfile.languagesKnown
          : ['English', 'Marathi (मराठी)', 'Hindi (हिंदी)'],
      certifications: ['Certified Web Application Developer', 'Maharashtra State MS-CIT']
    };
  });

  // Sync if candidateProfile loads later
  useEffect(() => {
    if (candidateProfile) {
      setResume(prev => ({
        ...prev,
        fullName: prev.fullName || candidateProfile.fullName,
        email: prev.email || candidateProfile.email,
        mobile: prev.mobile || candidateProfile.mobile,
        district: prev.district || candidateProfile.district,
        city: prev.city || candidateProfile.city,
        address: prev.address || candidateProfile.address
      }));
    }
  }, [candidateProfile]);

  // Skill Handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const parts = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const newSkills = [...resume.skills];
    parts.forEach(p => {
      if (!newSkills.includes(p)) newSkills.push(p);
    });
    setResume({ ...resume, skills: newSkills });
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setResume({ ...resume, skills: resume.skills.filter(s => s !== skill) });
  };

  // Education Handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: 'edu_' + Date.now(),
      degree: 'Degree / Diploma Name',
      institute: 'College / Board / Institute Name',
      year: new Date().getFullYear().toString(),
      score: 'Grade / %'
    };
    setResume({ ...resume, education: [...resume.education, newEdu] });
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, val: string) => {
    setResume({
      ...resume,
      education: resume.education.map(e => (e.id === id ? { ...e, [field]: val } : e))
    });
  };

  const handleRemoveEducation = (id: string) => {
    setResume({ ...resume, education: resume.education.filter(e => e.id !== id) });
  };

  // Experience Handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: 'exp_' + Date.now(),
      title: 'Job Role / Title',
      company: 'Company / Organization Name',
      location: 'City, Maharashtra',
      duration: '2022 – Present',
      description: 'Key responsibilities, achievements, and tools used in this role.'
    };
    setResume({ ...resume, experience: [...resume.experience, newExp], isFresher: false });
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: string) => {
    setResume({
      ...resume,
      experience: resume.experience.map(e => (e.id === id ? { ...e, [field]: val } : e))
    });
  };

  const handleRemoveExperience = (id: string) => {
    setResume({ ...resume, experience: resume.experience.filter(e => e.id !== id) });
  };

  // Save to Database Service
  const handleSaveToProfile = () => {
    if (candidateProfile?.id) {
      db.updateCandidateProfile(candidateProfile.id, {
        fullName: resume.fullName,
        email: resume.email,
        mobile: resume.mobile,
        district: resume.district,
        city: resume.city,
        address: resume.address,
        skills: resume.skills,
        languagesKnown: resume.languages,
        resumeSummary: resume.summary,
        resumeFileName: `${resume.fullName.replace(/\s+/g, '_')}_CV.pdf`
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Trigger Print to PDF
  const handlePrint = () => {
    window.print();
  };

  // Theme styling helpers
  const themeClasses = {
    navy: {
      headerBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white',
      accentColor: 'text-blue-700',
      borderAccent: 'border-blue-700',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    slate: {
      headerBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white',
      accentColor: 'text-slate-800',
      borderAccent: 'border-slate-800',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300'
    },
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 text-white',
      accentColor: 'text-emerald-700',
      borderAccent: 'border-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  }[theme];

  return (
    <div className={`min-h-screen ${isEmbedded ? '' : 'py-6 sm:py-8 bg-slate-100'}`}>
      {/* Print Specific CSS to Isolate the CV */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ats-resume-print-area, #ats-resume-print-area * {
            visibility: visible !important;
          }
          #ats-resume-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Control Header */}
        <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && !isEmbedded && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Back to portal"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  Online ATS Resume Builder
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  ATS Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate a clean, modern curriculum vitae formatted for top corporate and industrial recruiters in Maharashtra.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Theme Picker */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setTheme('navy')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${theme === 'navy' ? 'bg-white shadow-2xs text-blue-700 font-bold' : 'hover:text-slate-900'}`}
              >
                Navy
              </button>
              <button
                onClick={() => setTheme('slate')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${theme === 'slate' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'hover:text-slate-900'}`}
              >
                Slate
              </button>
              <button
                onClick={() => setTheme('emerald')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${theme === 'emerald' ? 'bg-white shadow-2xs text-emerald-700 font-bold' : 'hover:text-slate-900'}`}
              >
                Emerald
              </button>
            </div>

            <button
              onClick={handleSaveToProfile}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved!' : 'Save Details'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF / Print</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Form Editor (Left) & Real-time Live ATS CV Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: RESUME FORM EDITOR */}
          <div className="no-print lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            
            {/* Section Tabs */}
            <div className="flex border-b border-slate-200 pb-2 gap-1 overflow-x-auto text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveEditorSection('personal')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeEditorSection === 'personal' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
              >
                1. Personal
              </button>
              <button
                onClick={() => setActiveEditorSection('summary')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeEditorSection === 'summary' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
              >
                2. Summary
              </button>
              <button
                onClick={() => setActiveEditorSection('education')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeEditorSection === 'education' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
              >
                3. Education
              </button>
              <button
                onClick={() => setActiveEditorSection('experience')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeEditorSection === 'experience' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
              >
                4. Experience
              </button>
              <button
                onClick={() => setActiveEditorSection('skills')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${activeEditorSection === 'skills' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50'}`}
              >
                5. Skills
              </button>
            </div>

            {/* SECTION 1: PERSONAL DETAILS */}
            {activeEditorSection === 'personal' && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={resume.fullName}
                    onChange={e => setResume({ ...resume, fullName: e.target.value })}
                    placeholder="e.g. Wasim Havaldar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Professional Title / Target Role *</label>
                  <input
                    type="text"
                    value={resume.jobTitle}
                    onChange={e => setResume({ ...resume, jobTitle: e.target.value })}
                    placeholder="e.g. Senior CNC Machinist / Accounts Executive / Full Stack Developer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      value={resume.mobile}
                      onChange={e => setResume({ ...resume, mobile: e.target.value })}
                      placeholder="+91 98220 12345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={resume.email}
                      onChange={e => setResume({ ...resume, email: e.target.value })}
                      placeholder="name@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Maharashtra District *</label>
                    <select
                      value={resume.district}
                      onChange={e => setResume({ ...resume, district: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    >
                      {MAHARASHTRA_DISTRICTS.map(d => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.marathiName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Taluka</label>
                    <input
                      type="text"
                      value={resume.city}
                      onChange={e => setResume({ ...resume, city: e.target.value })}
                      placeholder="e.g. Kolhapur / Hinjewadi / Chakan"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Residential Street Address</label>
                  <input
                    type="text"
                    value={resume.address}
                    onChange={e => setResume({ ...resume, address: e.target.value })}
                    placeholder="e.g. Plot No. 14, MIDC Shiroli, Kolhapur 416122"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: PROFESSIONAL SUMMARY */}
            {activeEditorSection === 'summary' && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Career Summary / Objective *</label>
                    <span className="text-[11px] text-slate-400">{resume.summary.length} characters</span>
                  </div>
                  <textarea
                    rows={5}
                    value={resume.summary}
                    onChange={e => setResume({ ...resume, summary: e.target.value })}
                    placeholder="Write a brief 2–4 sentence summary highlighting your core strengths, qualifications, and the value you bring to Maharashtra employers..."
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg leading-relaxed focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* 1-Click Template Helpers */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    Quick Sample Templates:
                  </p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setResume({
                          ...resume,
                          summary:
                            'Dedicated and detail-oriented professional with comprehensive experience in operations, client communication, and problem solving. Seeking a rewarding career opportunity with a reputed employer in Maharashtra.'
                        })
                      }
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 transition-colors"
                    >
                      💡 <strong>General Professional:</strong> "Dedicated and detail-oriented professional..."
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setResume({
                          ...resume,
                          summary:
                            'Enthusiastic and motivated fresher graduate eager to apply technical skills and theoretical knowledge in a fast-paced work environment. Quick learner with strong teamwork, integrity, and analytical abilities.'
                        })
                      }
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 transition-colors"
                    >
                      🎓 <strong>Fresher / Graduate:</strong> "Enthusiastic and motivated fresher graduate..."
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: EDUCATION */}
            {activeEditorSection === 'education' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800">Academic Qualifications</p>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {resume.education.map((edu, idx) => (
                  <div key={edu.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                        Entry #{idx + 1}
                      </span>
                      {resume.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(edu.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Degree / Certificate</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="e.g. B.Com / ITI Machinist / B.E."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">College / Institute / Board</label>
                      <input
                        type="text"
                        value={edu.institute}
                        onChange={e => handleUpdateEducation(edu.id, 'institute', e.target.value)}
                        placeholder="e.g. Shivaji University / Pune University"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Passing Year</label>
                        <input
                          type="text"
                          value={edu.year}
                          onChange={e => handleUpdateEducation(edu.id, 'year', e.target.value)}
                          placeholder="e.g. 2023"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Score / Grade / %</label>
                        <input
                          type="text"
                          value={edu.score}
                          onChange={e => handleUpdateEducation(edu.id, 'score', e.target.value)}
                          placeholder="e.g. 82.5% / First Class"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 4: EXPERIENCE */}
            {activeEditorSection === 'experience' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">Employment History</p>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={resume.isFresher}
                        onChange={e => setResume({ ...resume, isFresher: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span className="text-[11px]">Fresher (No Experience)</span>
                    </label>
                  </div>

                  {!resume.isFresher && (
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Job</span>
                    </button>
                  )}
                </div>

                {resume.isFresher ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="font-semibold text-slate-700">Marked as Fresher</p>
                    <p className="text-[11px] mt-0.5">Your resume will highlight your education, skills, and academic projects.</p>
                  </div>
                ) : (
                  resume.experience.map((exp, idx) => (
                    <div key={exp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                          Position #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={e => handleUpdateExperience(exp.id, 'title', e.target.value)}
                            placeholder="e.g. Production Supervisor"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={e => handleUpdateExperience(exp.id, 'company', e.target.value)}
                            placeholder="e.g. Tata Motors / Acme Ltd"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={e => handleUpdateExperience(exp.id, 'location', e.target.value)}
                            placeholder="e.g. Pune MIDC / Mumbai"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={e => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                            placeholder="e.g. 2021 – Present"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Key Duties & Contributions</label>
                        <textarea
                          rows={2}
                          value={exp.description}
                          onChange={e => handleUpdateExperience(exp.id, 'description', e.target.value)}
                          placeholder="Describe your primary role, equipment used, and achievements..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SECTION 5: SKILLS & LANGUAGES */}
            {activeEditorSection === 'skills' && (
              <div className="space-y-4 text-xs">
                {/* Skills Section */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skills & Technical Competencies</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      placeholder="Type a skill and press Enter (e.g. CNC, Tally, SQL)..."
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>

                  {/* Skills Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 min-h-[60px]">
                    {resume.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-semibold text-slate-700 mb-1">Languages Known</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Marathi (मराठी)', 'English', 'Hindi (हिंदी)', 'Gujarati', 'Kannada'].map((lang, i) => {
                      const isChecked = resume.languages.includes(lang);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setResume({ ...resume, languages: resume.languages.filter(l => l !== lang) });
                            } else {
                              setResume({ ...resume, languages: [...resume.languages, lang] });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '}
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: REAL-TIME ATS CURRICULUM VITAE PREVIEW */}
          <div className="lg:col-span-7">
            
            {/* Live Document Canvas */}
            <div
              id="ats-resume-print-area"
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden text-slate-900 transition-all font-sans-modern"
              style={{ minHeight: '840px' }}
            >
              {/* Top Banner Header */}
              <div className={`${themeClasses.headerBg} p-6 sm:p-8 space-y-2.5 relative`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/20 pb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                      {resume.fullName || 'Candidate Name'}
                    </h1>
                    <p className="text-sm font-semibold tracking-wide text-blue-100 sm:text-base mt-0.5">
                      {resume.jobTitle || 'Target Designation'}
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                    Curriculum Vitae
                  </span>
                </div>

                {/* Contact Strip */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-blue-100/90 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    <span>{resume.mobile}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    <span>{resume.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    <span>
                      {resume.city ? `${resume.city}, ` : ''}
                      {resume.district}, Maharashtra
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700">
                
                {/* 1. PROFESSIONAL SUMMARY */}
                {resume.summary && (
                  <div className="space-y-1.5">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${themeClasses.accentColor} border-b ${themeClasses.borderAccent} pb-1 flex items-center gap-1.5`}>
                      <User className="w-3.5 h-3.5" />
                      <span>Professional Summary</span>
                    </h2>
                    <p className="text-xs leading-relaxed text-slate-700 pt-1">
                      {resume.summary}
                    </p>
                  </div>
                )}

                {/* 2. EXPERIENCE */}
                {!resume.isFresher && resume.experience.length > 0 && (
                  <div className="space-y-3">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${themeClasses.accentColor} border-b ${themeClasses.borderAccent} pb-1 flex items-center gap-1.5`}>
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Work Experience</span>
                    </h2>

                    <div className="space-y-3.5 pt-1">
                      {resume.experience.map(exp => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {exp.title}{' '}
                              <span className="font-normal text-slate-600">at {exp.company}</span>
                            </h3>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {exp.duration}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic">
                            📍 {exp.location}
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-0.5">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. EDUCATION */}
                {resume.education.length > 0 && (
                  <div className="space-y-3">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${themeClasses.accentColor} border-b ${themeClasses.borderAccent} pb-1 flex items-center gap-1.5`}>
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Education & Qualifications</span>
                    </h2>

                    <div className="space-y-2.5 pt-1">
                      {resume.education.map(edu => (
                        <div key={edu.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pb-1.5 border-b border-slate-100 last:border-none">
                          <div>
                            <h3 className="font-bold text-slate-900 text-xs">
                              {edu.degree}
                            </h3>
                            <p className="text-[11px] text-slate-600">
                              {edu.institute}
                            </p>
                          </div>
                          <div className="sm:text-right shrink-0">
                            <span className="text-[11px] font-semibold text-slate-700 block">
                              Year: {edu.year}
                            </span>
                            {edu.score && (
                              <span className="text-[11px] font-medium text-slate-500 block">
                                Score: {edu.score}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. KEY SKILLS */}
                {resume.skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${themeClasses.accentColor} border-b ${themeClasses.borderAccent} pb-1 flex items-center gap-1.5`}>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Skills & Core Competencies</span>
                    </h2>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {resume.skills.map((skill, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${themeClasses.badgeBg} border`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. LANGUAGES */}
                {resume.languages.length > 0 && (
                  <div className="space-y-2">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${themeClasses.accentColor} border-b ${themeClasses.borderAccent} pb-1 flex items-center gap-1.5`}>
                      <Languages className="w-3.5 h-3.5" />
                      <span>Languages Known</span>
                    </h2>

                    <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-700">
                      {resume.languages.map((lang, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium">{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. VERIFICATION DECLARATION */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
                  <span>
                    Verified ATS Format • Generated via RozgarX Portal (Maharashtra Employment Initiative)
                  </span>
                  <span>Date: {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Quick Helper Pill under preview */}
            <div className="no-print mt-3 text-center">
              <p className="text-[11px] text-slate-500">
                💡 <strong>Tip for Candidates:</strong> Clicking <strong>"Download PDF / Print"</strong> opens your browser's print dialog. Choose <em>"Save as PDF"</em> to generate an ATS-ready document for job applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
