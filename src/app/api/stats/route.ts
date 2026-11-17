import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/lib/otpServer';

// In-memory 60-second TTL cache for platform aggregate stats to protect DB under high traffic
let cachedStats: {
  data: any;
  cachedAt: number;
} | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedStats && now - cachedStats.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        stats: cachedStats.data,
        cached: true
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const [
      { count: liveJobsCount },
      { count: talentPoolCount },
      { count: companiesCount },
      { count: totalAppsCount },
      { count: successfulAppsCount },
      { data: districtRows },
      { data: viewRows }
    ] = await Promise.all([
      supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }).eq('is_discoverable', true),
      supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }).eq('verification_status', 'Verified'),
      supabaseAdmin.from('job_applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('job_applications').select('*', { count: 'exact', head: true }).in('status', ['Shortlisted', 'Interview Scheduled', 'Selected']),
      supabaseAdmin.from('jobs').select('district').eq('status', 'approved').limit(100),
      supabaseAdmin.from('jobs').select('view_count').eq('status', 'approved').limit(100)
    ]);

    const uniqueDistricts = new Set((districtRows || []).map(r => (r.district || '').trim()).filter(Boolean)).size;
    const totalApps = totalAppsCount || 0;
    const successfulApps = successfulAppsCount || 0;
    const placementRate = totalApps > 0 ? Math.round((successfulApps / totalApps) * 100) : 0;
    const totalViews = (viewRows || []).reduce((acc: number, r: { view_count?: number | null }) => acc + (r.view_count || 0), 0);

    const statsData = {
      liveJobsCount: typeof liveJobsCount === 'number' ? liveJobsCount : 0,
      talentPoolCount: typeof talentPoolCount === 'number' ? talentPoolCount : 0,
      companiesCount: typeof companiesCount === 'number' ? companiesCount : 0,
      districtsCount: uniqueDistricts || 36,
      placementRate,
      dailyInteractions: totalViews || 120
    };

    cachedStats = {
      data: statsData,
      cachedAt: now
    };

    return NextResponse.json({
      success: true,
      stats: statsData
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
