import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/lib/otpServer';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const [
      { count: liveJobsCount },
      { count: talentPoolCount },
      { count: companiesCount },
      { data: districtRows },
      { data: appRows },
      { data: viewRows }
    ] = await Promise.all([
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('is_discoverable', true),
      supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('verification_status', 'Verified'),
      supabaseAdmin.from('jobs').select('district').eq('status', 'approved'),
      supabaseAdmin.from('job_applications').select('status'),
      supabaseAdmin.from('jobs').select('view_count').eq('status', 'approved')
    ]);

    const uniqueDistricts = new Set((districtRows || []).map(r => (r.district || '').trim()).filter(Boolean)).size;
    const totalApps = (appRows || []).length;
    const successfulApps = (appRows || []).filter(a =>
      ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(a.status)
    ).length;
    const placementRate = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 0;
    const totalViews = (viewRows || []).reduce((acc: number, r: { view_count?: number | null }) => acc + (r.view_count || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        liveJobsCount: typeof liveJobsCount === 'number' ? liveJobsCount : 0,
        talentPoolCount: typeof talentPoolCount === 'number' ? talentPoolCount : 0,
        companiesCount: typeof companiesCount === 'number' ? companiesCount : 0,
        districtsCount: uniqueDistricts,
        placementRate,
        dailyInteractions: totalViews
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      stats: {
        liveJobsCount: 0,
        talentPoolCount: 0,
        companiesCount: 0,
        districtsCount: 0,
        placementRate: 0,
        dailyInteractions: 0
      }
    });
  }
}
