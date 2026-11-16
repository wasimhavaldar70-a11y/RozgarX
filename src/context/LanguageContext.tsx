'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'mr' | 'hi';

interface Translations {
  siteTitle: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  searchPlaceholder: string;
  districtPlaceholder: string;
  searchButton: string;
  home: string;
  findJobs: string;
  companies: string;
  careerAdvice: string;
  login: string;
  register: string;
  postJob: string;
  popularCategories: string;
  popularDistricts: string;
  latestJobs: string;
  howItWorks: string;
  forJobSeekers: string;
  forEmployers: string;
  applyForFree: string;
  viewDetails: string;
  saveJob: string;
  saved: string;
  perMonth: string;
  vacancies: string;
  experience: string;
  district: string;
  city: string;
  allDistricts: string;
  allCategories: string;
  allJobTypes: string;
  verifiedBadge: string;
  urgentHiring: string;
  featured: string;
  dashboard: string;
  myApplications: string;
  myProfile: string;
  myResume: string;
  manageJobs: string;
  subscriptionPlans: string;
  adminPanel: string;
  logout: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    siteTitle: 'RozgarX',
    tagline: 'Maharashtra Regional Job Portal',
    heroHeading: 'Find Your Next Job in Maharashtra',
    heroSubheading: 'Discover local opportunities and connect with trusted employers across all 36 districts of Maharashtra.',
    searchPlaceholder: 'Job Title, Skill, or Keyword (e.g. React, CNC Operator, Accountant)',
    districtPlaceholder: 'Select Maharashtra District (e.g. Pune, Kolhapur, Mumbai)',
    searchButton: 'Search Jobs',
    home: 'Home',
    findJobs: 'Find Jobs',
    companies: 'Companies',
    careerAdvice: 'Career Advice',
    login: 'Login',
    register: 'Register',
    postJob: 'Post a Job',
    popularCategories: 'Popular Categories',
    popularDistricts: 'Jobs by District',
    latestJobs: 'Latest Job Vacancies',
    howItWorks: 'How RozgarX Works',
    forJobSeekers: 'For Job Seekers',
    forEmployers: 'For Employers',
    applyForFree: 'Apply for FREE',
    viewDetails: 'View Details',
    saveJob: 'Save Job',
    saved: 'Saved',
    perMonth: 'per month',
    vacancies: 'Vacancies',
    experience: 'Experience',
    district: 'District',
    city: 'City',
    allDistricts: 'All 36 Districts',
    allCategories: 'All Categories',
    allJobTypes: 'All Job Types',
    verifiedBadge: 'Verified Employer',
    urgentHiring: 'Urgent Hiring',
    featured: 'Featured',
    dashboard: 'Dashboard',
    myApplications: 'My Applications',
    myProfile: 'My Profile',
    myResume: 'My Resume',
    manageJobs: 'Manage Jobs',
    subscriptionPlans: 'Employer Plans',
    adminPanel: 'Admin Panel',
    logout: 'Logout'
  },
  mr: {
    siteTitle: 'रोजगारX',
    tagline: 'महाराष्ट्र रोजगार पोर्टल',
    heroHeading: 'महाराष्ट्रात तुमची हक्काची नोकरी शोधा',
    heroSubheading: 'महाराष्ट्रातील सर्व ३६ जिल्ह्यांमधील स्थानिक संधी आणि नामांकित कंपन्यांशी थेट जोडा.',
    searchPlaceholder: 'नोकरीचे पद, कौशल्य किंवा कीवर्ड (उदा. सीएनसी ऑपरेटर, अकाउंटंट, शिक्षक)',
    districtPlaceholder: 'महाराष्ट्रातील जिल्हा निवडा (उदा. पुणे, कोल्हापूर, नागपूर)',
    searchButton: 'नोकरी शोधा',
    home: 'मुख्यपृष्ठ',
    findJobs: 'नोकऱ्या शोधा',
    companies: 'कंपन्या',
    careerAdvice: 'करिअर मार्गदर्शन',
    login: 'लॉगिन',
    register: 'नोंदणी करा',
    postJob: 'नोकरी जाहिरात द्या',
    popularCategories: 'प्रमुख क्षेत्रे व श्रेणी',
    popularDistricts: 'जिल्ह्यानुसार नोकऱ्या',
    latestJobs: 'नवीन नोकऱ्या',
    howItWorks: 'रोजगारX कसे कार्य करते',
    forJobSeekers: 'उमेदवारांसाठी',
    forEmployers: 'नियोक्त्यांसाठी',
    applyForFree: 'मोफत अर्ज करा',
    viewDetails: 'तपशील पहा',
    saveJob: 'सेव्ह करा',
    saved: 'सेव्ह केले',
    perMonth: 'दर महा',
    vacancies: 'जागा',
    experience: 'अनुभव',
    district: 'जिल्हा',
    city: 'शहर',
    allDistricts: 'सर्व ३६ जिल्हे',
    allCategories: 'सर्व श्रेणी',
    allJobTypes: 'सर्व नोकरी प्रकार',
    verifiedBadge: 'प्रमाणित कंपनी',
    urgentHiring: 'तातडीची भरती',
    featured: 'वैशिष्ट्यीकृत',
    dashboard: 'डॅशबोर्ड',
    myApplications: 'माझे अर्ज',
    myProfile: 'माझी प्रोफाइल',
    myResume: 'माझा बायोडाटा / Resume',
    manageJobs: 'नोकऱ्या व्यवस्थापित करा',
    subscriptionPlans: 'नियोक्ता पॅकेजेस',
    adminPanel: 'प्रशासन पॅनेल',
    logout: 'लॉगआउट'
  },
  hi: {
    siteTitle: 'रोजगारX',
    tagline: 'महाराष्ट्र रोजगार पोर्टल',
    heroHeading: 'महाराष्ट्र में अपनी मनपसंद नौकरी पाएं',
    heroSubheading: 'महाराष्ट्र के सभी ३६ जिलों में स्थानीय अवसर और सत्यापित नियोक्ताओं से जुड़ें।',
    searchPlaceholder: 'पद, कौशल या कीवर्ड (उदा. रिएक्ट, सीएनसी ऑपरेटर, अकाउंटेंट)',
    districtPlaceholder: 'महाराष्ट्र का जिला चुनें (उदा. पुणे, कोल्हापुर, मुंबई)',
    searchButton: 'नौकरी खोजें',
    home: 'होम',
    findJobs: 'नौकरियां खोजें',
    companies: 'कंपनियां',
    careerAdvice: 'करियर मार्गदर्शन',
    login: 'लॉग इन',
    register: 'पंजीकरण करें',
    postJob: 'नौकरी पोस्ट करें',
    popularCategories: 'प्रमुख श्रेणियां',
    popularDistricts: 'जिलानुसार नौकरियां',
    latestJobs: 'नवीनतम रिक्तियां',
    howItWorks: 'रोजगारX कैसे काम करता है',
    forJobSeekers: 'उम्मीदवारों के लिए',
    forEmployers: 'नियोक्ताओं के लिए',
    applyForFree: 'मुफ्त आवेदन करें',
    viewDetails: 'विवरण देखें',
    saveJob: 'सेव करें',
    saved: 'सेव किया',
    perMonth: 'प्रति माह',
    vacancies: 'पद',
    experience: 'अनुभव',
    district: 'जिला',
    city: 'शहर',
    allDistricts: 'सभी ३६ जिले',
    allCategories: 'सभी श्रेणियां',
    allJobTypes: 'सभी प्रकार',
    verifiedBadge: 'सत्यापित कंपनी',
    urgentHiring: 'तत्काल भर्ती',
    featured: 'फीचर्ड',
    dashboard: 'डैशबोर्ड',
    myApplications: 'मेरे आवेदन',
    myProfile: 'मेरी प्रोफाइल',
    myResume: 'मेरा बायोडाटा',
    manageJobs: 'नौकरियां प्रबंधित करें',
    subscriptionPlans: 'नियोक्ता प्लान',
    adminPanel: 'एडमिन पैनल',
    logout: 'लॉग आउट'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS.en
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mahajobs_lang');
    if (saved === 'mr' || saved === 'hi' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahajobs_lang', lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
