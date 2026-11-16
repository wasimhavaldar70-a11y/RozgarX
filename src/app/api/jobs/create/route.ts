import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/lib/otpServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      description,
      responsibilities = [],
      requiredSkills = [],
      educationRequirement = 'Any Graduate',
      experienceMinYears = 0,
      experienceMaxYears = 5,
      salaryMin = 0,
      salaryMax = 0,
      salaryType = 'Per Month',
      vacancies = 1,
      jobType = 'Full Time',
      workMode = 'Office',
      district = 'Pune',
      city = 'Pune',
      address = '',
      companyName = 'Maharashtra Enterprise',
      companyId,
      employerId,
      contactEmail,
      contactPhone,
      status = 'pending'
    } = body;

    if (!title || !description || !district) {
      return NextResponse.json(
        { success: false, error: 'Missing mandatory fields: title, description, district' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Resolve Employer
    let resolvedEmployerId = employerId;
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    if (!resolvedEmployerId || !isUuid(resolvedEmployerId)) {
      const { data: defaultEmp } = await supabaseAdmin
        .from('employers')
        .select('id')
        .limit(1)
        .maybeSingle();
      resolvedEmployerId = defaultEmp?.id || null;
    }

    // 2. Resolve Company
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId || !isUuid(resolvedCompanyId)) {
      // Check if company exists by name
      const { data: existingComp } = await supabaseAdmin
        .from('companies')
        .select('id')
        .ilike('name', companyName.trim())
        .limit(1)
        .maybeSingle();

      if (existingComp) {
        resolvedCompanyId = existingComp.id;
      } else {
        // Create company record
        const { data: newComp, error: compErr } = await supabaseAdmin
          .from('companies')
          .insert({
            employer_id: resolvedEmployerId,
            name: companyName.trim(),
            tagline: `${companyName} Recruitment Division`,
            industry: category || 'General Business',
            company_type: 'Private Limited',
            district: district,
            city: city || district,
            address: address || `${city}, ${district}, Maharashtra`,
            contact_email: contactEmail || 'hr@company.com',
            contact_phone: contactPhone || '+91 98220 12345',
            verification_status: 'Verified'
          })
          .select('id')
          .single();

        if (compErr) {
          console.error('Failed to create company:', compErr);
        } else {
          resolvedCompanyId = newComp?.id;
        }
      }
    }

    const resolvedAddress = (address || '').trim();
    let resolvedDistrict = district || 'Kolhapur';
    if (resolvedAddress.toLowerCase().includes('vathar') && resolvedDistrict === 'Pune') {
      resolvedDistrict = 'Kolhapur';
    }
    const resolvedCity = (city || '').trim() || (resolvedAddress ? resolvedAddress.split(',')[0].trim() : resolvedDistrict);

    // 3. Insert Job into database table
    const { data: insertedJob, error: jobErr } = await supabaseAdmin
      .from('jobs')
      .insert({
        employer_id: resolvedEmployerId,
        company_id: resolvedCompanyId,
        title: title.trim(),
        category: category || 'General',
        description: description.trim(),
        responsibilities: responsibilities,
        required_skills: requiredSkills,
        education_requirement: educationRequirement,
        experience_min_years: Number(experienceMinYears) || 0,
        experience_max_years: Number(experienceMaxYears) || 0,
        salary_min: Number(salaryMin) || 0,
        salary_max: Number(salaryMax) || 0,
        salary_type: salaryType,
        vacancies: Number(vacancies) || 1,
        job_type: jobType,
        work_mode: workMode,
        district: resolvedDistrict,
        city: resolvedCity,
        address: resolvedAddress,
        status: status === 'approved' ? 'approved' : 'pending',
        is_featured: false,
        view_count: 0,
        application_count: 0,
        contact_email: contactEmail,
        contact_phone: contactPhone
      })
      .select('id, title, category, district, city, salary_min, salary_max, status, created_at')
      .single();

    if (jobErr) {
      console.error('Database error inserting job:', jobErr);
      return NextResponse.json(
        { success: false, error: jobErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job successfully created and saved inside database table.',
      job: insertedJob
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

