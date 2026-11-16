'use client';

import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle,
  ExternalLink,
  Users,
  Search,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { db } from '../../services/db';
import { Company } from '../../types';

interface CompaniesPageProps {
  onSelectCompany: (company: Company) => void;
  onViewJobsForCompany: (companyName: string) => void;
}

export const CompaniesPage: React.FC<CompaniesPageProps> = ({
  onSelectCompany,
  onViewJobsForCompany
}) => {
  const [search, setSearch] = useState('');
  const companies = db.getCompanies();

  const filteredCompanies = companies.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Maharashtra Employer Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Companies & Industrial Employers
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse registered businesses, MIDC units, and tech firms actively hiring across 36 districts of Maharashtra.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-8 max-w-xl flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by company name, industry, or district (e.g. Kolhapur, Hinjewadi)..."
            className="w-full text-sm py-1.5 border-none focus:outline-hidden text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Companies Grid or Empty State */}
        {filteredCompanies.length === 0 ? (
          <div className="py-14 px-6 text-center bg-white rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No registered companies yet
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Employers across Maharashtra can register their business, post vacancies, and hire verified local talent. New registered companies will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map(company => {
              const companyJobs = db.getJobs({ companyId: company.id }).length > 0
                ? db.getJobs({ companyId: company.id })
                : db.getJobs({ companyName: company.name });
              return (
                <div
                  key={company.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            {company.name}
                          </h3>
                          {company.verificationStatus === 'Verified' && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {company.industry}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {company.about}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{company.city}, {company.district}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{company.companySize || '20-100 Employees'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">
                      {companyJobs.length} Active {companyJobs.length === 1 ? 'Job' : 'Jobs'}
                    </span>
                    <button
                      onClick={() => onViewJobsForCompany(company.name)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600"
                    >
                      <span>View Openings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
