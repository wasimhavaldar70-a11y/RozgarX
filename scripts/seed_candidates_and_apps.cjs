const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedCandidates() {
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  await client.connect();

  console.log('Seeding candidate talent pool across Maharashtra districts...');

  const suhaniProf = await client.query("SELECT id FROM profiles WHERE email = 'suhani06@gmail.com' LIMIT 1;");
  const suhaniProfileId = suhaniProf.rows[0]?.id;

  const candidateTalentData = [
    {
      fullName: 'Suhani Patil',
      email: 'suhani06@gmail.com',
      mobile: '+91 98220 00006',
      district: 'Pune',
      city: 'Pune',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
    },
    {
      fullName: 'Amit Deshmukh',
      email: 'amit.deshmukh@gmail.com',
      mobile: '+91 98221 11201',
      district: 'Kolhapur',
      city: 'Kolhapur',
      skills: ['AutoCAD', 'SolidWorks', 'Foundry Quality Control', 'Casting QC', 'PPAP', 'Six Sigma']
    },
    {
      fullName: 'Pooja Kulkarni',
      email: 'pooja.kulkarni@gmail.com',
      mobile: '+91 98222 22302',
      district: 'Nashik',
      city: 'Nashik',
      skills: ['CATIA V5', 'SolidWorks', 'GD&T', 'Chassis Design', 'Production Planning']
    },
    {
      fullName: 'Rahul Jadhav',
      email: 'rahul.jadhav@gmail.com',
      mobile: '+91 98223 33403',
      district: 'Chhatrapati Sambhajinagar',
      city: 'Chhatrapati Sambhajinagar',
      skills: ['PLC Programming', 'SCADA', 'Instrumentation', 'Calibration', 'Electronics']
    },
    {
      fullName: 'Sneha Shinde',
      email: 'sneha.shinde@gmail.com',
      mobile: '+91 98224 44504',
      district: 'Nagpur',
      city: 'Nagpur',
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Linux', 'Python', 'CI/CD']
    },
    {
      fullName: 'Vikram Gaikwad',
      email: 'vikram.gaikwad@gmail.com',
      mobile: '+91 98225 55605',
      district: 'Thane',
      city: 'Bhiwandi',
      skills: ['Warehouse Management', 'Supply Chain', 'Inventory Control', 'SAP MM', 'ERP']
    },
    {
      fullName: 'Aniket More',
      email: 'aniket.more@gmail.com',
      mobile: '+91 98226 66706',
      district: 'Solapur',
      city: 'Solapur',
      skills: ['Textile Production', 'Loom Operations', 'Machine Maintenance', 'Yarn Testing']
    },
    {
      fullName: 'Neha Sawant',
      email: 'neha.sawant@gmail.com',
      mobile: '+91 98227 77807',
      district: 'Ratnagiri',
      city: 'Ratnagiri',
      skills: ['Food Safety', 'HACCP', 'Cold Chain Logistics', 'Quality Control', 'ISO 22000']
    },
    {
      fullName: 'Siddheshwar Joshi',
      email: 'siddheshwar.joshi@gmail.com',
      mobile: '+91 98228 88908',
      district: 'Nanded',
      city: 'Nanded',
      skills: ['Substation Maintenance', 'HT/LT Lines', 'Transformers', 'Switchgear', 'Electrical Safety']
    },
    {
      fullName: 'Deepika Waghmare',
      email: 'deepika.waghmare@gmail.com',
      mobile: '+91 98229 99009',
      district: 'Amravati',
      city: 'Amravati',
      skills: ['Agri-Finance', 'Field Operations', 'Farmer Relationship', 'Documentation', 'Credit Appraisal']
    },
    {
      fullName: 'Prasad Chougule',
      email: 'prasad.chougule@gmail.com',
      mobile: '+91 98230 00110',
      district: 'Sangli',
      city: 'Sangli',
      skills: ['Chemical Analysis', 'Moisture Testing', 'Cold Storage QC', 'HACCP']
    },
    {
      fullName: 'Girish Kadam',
      email: 'girish.kadam@gmail.com',
      mobile: '+91 98231 11211',
      district: 'Satara',
      city: 'Satara',
      skills: ['CNC Milling', 'VMC', 'G-Code Programming', 'Micrometer']
    },
    {
      fullName: 'Manish Rathi',
      email: 'manish.rathi@gmail.com',
      mobile: '+91 98232 22312',
      district: 'Akola',
      city: 'Akola',
      skills: ['Field Sales', 'Dealer Network', 'B2B Sales', 'Agronomy']
    },
    {
      fullName: 'Tanvi Bhosale',
      email: 'tanvi.bhosale@gmail.com',
      mobile: '+91 98233 33413',
      district: 'Mumbai City',
      city: 'Mumbai',
      skills: ['Financial Modeling', 'Excel', 'Corporate Finance', 'Valuation', 'Tally']
    },
    {
      fullName: 'Sunil Sonawane',
      email: 'sunil.sonawane@gmail.com',
      mobile: '+91 98234 44514',
      district: 'Dhule',
      city: 'Dhule',
      skills: ['Diesel Mechanics', 'Wheel Alignment', 'Suspension Repair', 'Auto Maintenance']
    }
  ];

  for (const c of candidateTalentData) {
    const existing = await client.query("SELECT id FROM candidates WHERE email = $1 LIMIT 1;", [c.email]);
    let candidateId;

    if (existing.rows.length === 0) {
      const ins = await client.query(`
        INSERT INTO candidates (
          profile_id, full_name, email, mobile, district, city, address,
          is_discoverable, is_suspended, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          TRUE, FALSE, NOW(), NOW()
        )
        RETURNING id;
      `, [
        suhaniProfileId || null, c.fullName, c.email, c.mobile, c.district, c.city, `${c.city}, ${c.district}, Maharashtra`
      ]);
      candidateId = ins.rows[0].id;

      // Also add skills in candidate_skills
      for (const skill of c.skills) {
        await client.query(`
          INSERT INTO candidate_skills (candidate_id, skill_name)
          VALUES ($1, $2);
        `, [candidateId, skill]);
      }
    }
  }

  // Seed applications
  const appCountRes = await client.query("SELECT count(*) as count FROM job_applications;");
  if (parseInt(appCountRes.rows[0].count, 10) < 5) {
    const jobs = await client.query("SELECT id FROM jobs WHERE status = 'approved' LIMIT 12;");
    const candidates = await client.query("SELECT id FROM candidates LIMIT 12;");

    const statuses = ['Shortlisted', 'Interview Scheduled', 'Applied', 'Viewed', 'Selected'];
    for (let i = 0; i < Math.min(jobs.rows.length, candidates.rows.length); i++) {
      const jobId = jobs.rows[i].id;
      const candId = candidates.rows[i].id;
      const status = statuses[i % statuses.length];

      await client.query(`
        INSERT INTO job_applications (job_id, candidate_id, cover_message, status, created_at, updated_at)
        VALUES ($1, $2, 'Applying for this vacancy based on verified matching skills.', $3, NOW(), NOW())
        ON CONFLICT (job_id, candidate_id) DO NOTHING;
      `, [jobId, candId, status]);
    }
    console.log('Seeded active job applications and placement records.');
  }

  const finalCandCount = await client.query("SELECT count(*) as count FROM candidates WHERE is_discoverable = true;");
  const finalAppCount = await client.query("SELECT count(*) as count FROM job_applications;");
  console.log(`Discoverable Verified Candidates in Pool: ${finalCandCount.rows[0].count}`);
  console.log(`Total Active Job Applications: ${finalAppCount.rows[0].count}`);

  await client.end();
}

seedCandidates().catch(err => {
  console.error('Candidate seeding error:', err);
  process.exit(1);
});
