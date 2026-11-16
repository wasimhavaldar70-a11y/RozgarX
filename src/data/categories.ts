export interface JobCategoryInfo {
  id: string;
  name: string;
  marathiName: string;
  iconName: string;
  description: string;
  subcategories: string[];
}

export const JOB_CATEGORIES: JobCategoryInfo[] = [
  {
    id: 'it-software',
    name: 'IT & Software',
    marathiName: 'माहिती तंत्रज्ञान व सॉफ्टवेअर',
    iconName: 'Laptop',
    description: 'Full Stack, React, Java, Python, Mobile Apps, QA, Cloud & DevOps',
    subcategories: ['Software Development', 'Frontend / React', 'Backend / Node', 'DevOps & Cloud', 'QA & Testing', 'UI/UX Design', 'Data Analysis']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial',
    marathiName: 'उत्पादन व उद्योग',
    iconName: 'Factory',
    description: 'Automobile, CNC Operators, Production Engineers, Assembly, Quality Control',
    subcategories: ['CNC / VMC Operators', 'Production Engineer', 'Quality Control / QA', 'Maintenance Technician', 'Tool Room', 'Plant Manager']
  },
  {
    id: 'accounting-finance',
    name: 'Accounting & Finance',
    marathiName: 'हिशोब व वित्त',
    iconName: 'Calculator',
    description: 'Tally Prime, GST filing, Accounts Executive, Financial Analyst, Auditing',
    subcategories: ['Accounts Executive', 'Tally Operator', 'GST / Tax Consultant', 'Financial Analyst', 'Billing Executive', 'Internal Auditor']
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Marketing',
    marathiName: 'विक्री व विपणन',
    iconName: 'TrendingUp',
    description: 'Field Sales, Digital Marketing, Business Development, B2B Sales, SEO',
    subcategories: ['Business Development', 'Field Sales Executive', 'Digital Marketing', 'Telemarketing', 'Retail Sales', 'Brand Management']
  },
  {
    id: 'banking',
    name: 'Banking & Insurance',
    marathiName: 'बँकिंग व विमा',
    iconName: 'Landmark',
    description: 'Cooperative Banks, Loan Officers, Credit Officers, Cashiers, Insurance Agents',
    subcategories: ['Branch Executive', 'Loan Officer', 'Credit Analyst', 'Cashier', 'Insurance Advisor', 'Recovery Officer']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Pharma',
    marathiName: 'आरोग्य व औषधनिर्माण',
    iconName: 'HeartPulse',
    description: 'Staff Nurse, Pharmacist, Lab Technician, Medical Representative, Hospital Admin',
    subcategories: ['Staff Nurse', 'Registered Pharmacist', 'Lab Technician', 'Medical Representative', 'Hospital Administration', 'OT Assistant']
  },
  {
    id: 'education',
    name: 'Education & Teaching',
    marathiName: 'शिक्षण व प्रशिक्षण',
    iconName: 'GraduationCap',
    description: 'School Teachers, College Lecturers, Tutors, Academic Counselors, Trainers',
    subcategories: ['Primary Teacher', 'High School Teacher', 'College Lecturer', 'Competitive Exam Faculty', 'Educational Counselor', 'Computer Instructor']
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    marathiName: 'हॉस्पिटॅलिटी व पर्यटन',
    iconName: 'UtensilsCrossed',
    description: 'Chefs, Hotel Front Desk, Stewards, Housekeeping, Travel Planners',
    subcategories: ['Front Office Executive', 'Head Chef / Cook', 'Steward / Waiter', 'Housekeeping Supervisor', 'Event Coordinator']
  },
  {
    id: 'retail',
    name: 'Retail & Store Operations',
    marathiName: 'किरकोळ विक्री व स्टोअर',
    iconName: 'ShoppingBag',
    description: 'Store Managers, Cashiers, Merchandisers, Customer Assistance, Stock Keepers',
    subcategories: ['Store Manager', 'Retail Cashier', 'Visual Merchandiser', 'Inventory Assistant', 'Customer Service Representative']
  },
  {
    id: 'office-admin',
    name: 'Office Administration & HR',
    marathiName: 'कार्यालय प्रशासन व मनुष्यबळ',
    iconName: 'Briefcase',
    description: 'HR Executive, Office Assistant, Receptionist, Data Entry Operator, MIS Executive',
    subcategories: ['HR Recruiter', 'Office Admin', 'Receptionist', 'Data Entry / Computer Operator', 'MIS Executive', 'Executive Assistant']
  },
  {
    id: 'driving-logistics',
    name: 'Logistics, Delivery & Driving',
    marathiName: 'वाहतूक, वितरण व ड्रायव्हिंग',
    iconName: 'Truck',
    description: 'Warehouse In-charge, Commercial Driver, Delivery Partners, Dispatch Officer',
    subcategories: ['Commercial Driver (HMV/LMV)', 'Warehouse Supervisor', 'Delivery Partner', 'Logistics Coordinator', 'Forklift Operator']
  },
  {
    id: 'customer-support',
    name: 'Customer Support & BPO',
    marathiName: 'ग्राहक सेवा व बीपीओ',
    iconName: 'Headphones',
    description: 'Voice / Non-Voice Support, Inbound/Outbound, Technical Helpdesk, Marathi/Hindi Support',
    subcategories: ['Customer Care Executive', 'Technical Support Representative', 'Inbound Call Center', 'Outbound Sales', 'Chat Support']
  }
];
