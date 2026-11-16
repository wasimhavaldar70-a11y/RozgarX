import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db';
import { MAHARASHTRA_DISTRICTS } from '../data/maharashtra';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/seed';

test('Maharashtra districts list contains all 36 districts', () => {
  assert.equal(MAHARASHTRA_DISTRICTS.length, 36);
  const pune = MAHARASHTRA_DISTRICTS.find(d => d.id === 'pune');
  const kolhapur = MAHARASHTRA_DISTRICTS.find(d => d.id === 'kolhapur');
  const nagpur = MAHARASHTRA_DISTRICTS.find(d => d.id === 'nagpur');

  assert.ok(pune, 'Pune district exists');
  assert.ok(kolhapur, 'Kolhapur district exists');
  assert.ok(nagpur, 'Nagpur district exists');
  assert.equal(pune?.division, 'Pune');
  assert.equal(kolhapur?.division, 'Pune');
});

test('Subscription plans are non-empty and have correct pricing hierarchy', () => {
  const plans = db.getSubscriptionPlans();
  assert.ok(plans.length >= 4);

  const free = plans.find(p => p.code === 'FREE');
  const basic = plans.find(p => p.code === 'BASIC');
  const standard = plans.find(p => p.code === 'STANDARD');
  const premium = plans.find(p => p.code === 'PREMIUM');

  assert.equal(free?.price, 0);
  assert.equal(free?.jobPostingLimit, 1);
  assert.equal(basic?.price, 499);
  assert.equal(basic?.jobPostingLimit, 3);
  assert.equal(standard?.price, 999);
  assert.equal(standard?.jobPostingLimit, 10);
  assert.equal(premium?.price, 1999);
  assert.equal(premium?.jobPostingLimit, 25);
});

test('Job filtering by district and category works accurately', () => {
  const puneJobs = db.getJobs({ district: 'Pune' });
  assert.ok(puneJobs.length > 0, 'Found jobs in Pune');
  puneJobs.forEach(j => {
    assert.equal(j.district, 'Pune');
    assert.equal(j.status, 'approved');
  });

  const itJobs = db.getJobs({ category: 'IT & Software' });
  assert.ok(itJobs.length > 0, 'Found IT & Software jobs');
  itJobs.forEach(j => {
    assert.equal(j.category, 'IT & Software');
  });
});

test('Application status workflow and history recording', () => {
  const apps = db.getApplications();
  assert.ok(apps.length > 0);
  const targetApp = apps[0];

  const initialHistoryCount = targetApp.statusHistory.length;
  const res = db.updateApplicationStatus(
    targetApp.id,
    'Interview Scheduled',
    'Technical Interview Round 1',
    { date: '2026-11-20', time: '02:00 PM', location: 'Online Google Meet' }
  );

  assert.equal(res.success, true);
  const updated = db.getApplications().find(a => a.id === targetApp.id);
  assert.equal(updated?.status, 'Interview Scheduled');
  assert.equal(updated?.interviewDate, '2026-11-20');
  assert.equal(updated?.statusHistory.length, initialHistoryCount + 1);
});

test('Duplicate application prevention prevents multiple submissions for same job', () => {
  const candidateId = 'cand_test_99';
  const jobId = 'job_1';

  // Ensure candidate profile exists
  db.updateCandidateProfile(candidateId, {
    fullName: 'Test Candidate',
    email: 'test@candidate.com',
    mobile: '9876543210',
    district: 'Pune'
  });

  const first = db.submitApplication({
    jobId,
    candidateId,
    coverMessage: 'First submission'
  });
  assert.equal(first.success, true);

  const duplicate = db.submitApplication({
    jobId,
    candidateId,
    coverMessage: 'Second attempt should fail'
  });
  assert.equal(duplicate.success, false);
  assert.match(duplicate.error || '', /already applied/i);
});

test('Job creation checks credit balance and deducts 1 credit upon submission', () => {
  const employerId = 'emp_test_credit';
  // Activate basic plan (3 credits)
  const activation = db.activateSubscription(employerId, 'plan_basic', {
    orderId: 'order_test_1',
    paymentId: 'pay_test_1',
    method: 'UPI'
  });
  assert.equal(activation.success, true);

  const subBefore = db.getEmployerSubscription(employerId);
  const initialCredits = subBefore.remainingCredits;
  assert.equal(initialCredits, 3);

  // Post 1 job
  const created = db.createJob({
    employerId,
    companyId: 'comp_test',
    companyName: 'Test Company',
    companyVerified: false,
    title: 'Junior CNC Machinist',
    category: 'Manufacturing & Industrial',
    description: 'Operating shop machines.',
    responsibilities: ['Operate lathe'],
    requiredSkills: ['Machining'],
    educationRequirement: 'ITI',
    experienceMinYears: 0,
    experienceMaxYears: 1,
    salaryMin: 15000,
    salaryMax: 20000,
    salaryType: 'Per Month',
    vacancies: 1,
    jobType: 'Full Time',
    workMode: 'Office',
    district: 'Kolhapur',
    city: 'Shiroli',
    address: 'MIDC',
    applicationDeadline: '2026-12-30',
    contactEmail: 'hr@test.com',
    contactPhone: '9876543210',
    status: 'pending'
  });

  assert.equal(created.success, true);
  const subAfter = db.getEmployerSubscription(employerId);
  assert.equal(subAfter.remainingCredits, initialCredits - 1);
});
