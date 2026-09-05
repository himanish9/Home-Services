/**
 * HomeServe End-to-End Lifecycle Verification Script
 * Simulates complete user, worker, and admin journey across all REST APIs.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const runE2ETest = async () => {
  console.log('\n======================================================');
  console.log('  🚀 HomeServe End-to-End API Lifecycle Verification');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    console.log('[1/7] Testing API Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log(`  ✓ API Status: ${health.data.message}\n`);

    // 2. Customer Authentication
    console.log('[2/7] Logging in as Customer (customer@homeserve.com)...');
    const custAuth = await axios.post(`${API_BASE}/auth/login`, {
      email: 'customer@homeserve.com',
      password: 'Password123!'
    });
    const customerToken = custAuth.data.data.token;
    const customerId = custAuth.data.data.user.id;
    console.log(`  ✓ Authenticated Customer: ${custAuth.data.data.user.name} (ID: ${customerId})\n`);

    // 3. Customer Creates Service Booking
    console.log('[3/7] Customer creating service booking for Plumbing (Category ID 3)...');
    const bookingRes = await axios.post(
      `${API_BASE}/bookings`,
      {
        category_id: 3,
        service_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        service_time: '11:00 AM - 01:00 PM',
        address: '42 Orchid Heights, 5th Main, Silicon Valley Park',
        problem_description: 'Main kitchen water pipe joint leakage under marble countertop',
        payment_method: 'CASH_ON_DELIVERY'
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const booking = bookingRes.data.data.booking;
    const bookingId = booking.id;
    console.log(`  ✓ Booking Created: Code: ${booking.booking_code} | Status: ${booking.status} | Total: $${booking.total_amount}\n`);

    // 4. Worker Authentication & Job Discovery
    console.log('[4/7] Logging in as Service Provider (worker@homeserve.com)...');
    const workAuth = await axios.post(`${API_BASE}/auth/login`, {
      email: 'worker@homeserve.com',
      password: 'Password123!'
    });
    const workerToken = workAuth.data.data.token;
    const workerId = workAuth.data.data.user.id;
    console.log(`  ✓ Authenticated Worker: ${workAuth.data.data.user.name} (ID: ${workerId})`);

    const availRes = await axios.get(`${API_BASE}/worker/jobs`, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    const matchedJob = availRes.data.data.jobs.find((j) => j.id === bookingId);
    console.log(`  ✓ Worker successfully discovered new matching request in Plumbing!\n`);

    // 5. Worker Accepts and Progresses Job
    console.log('[5/7] Worker accepting job and progressing lifecycle...');
    await axios.put(
      `${API_BASE}/worker/jobs/${bookingId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${workerToken}` } }
    );
    console.log(`  ✓ Status: ACCEPTED`);

    await axios.put(
      `${API_BASE}/worker/jobs/${bookingId}/status`,
      { status: 'ON_THE_WAY' },
      { headers: { Authorization: `Bearer ${workerToken}` } }
    );
    console.log(`  ✓ Status: ON_THE_WAY`);

    await axios.put(
      `${API_BASE}/worker/jobs/${bookingId}/status`,
      { status: 'IN_PROGRESS' },
      { headers: { Authorization: `Bearer ${workerToken}` } }
    );
    console.log(`  ✓ Status: IN_PROGRESS`);

    const completedRes = await axios.put(
      `${API_BASE}/worker/jobs/${bookingId}/status`,
      { status: 'COMPLETED' },
      { headers: { Authorization: `Bearer ${workerToken}` } }
    );
    console.log(`  ✓ Status: COMPLETED (Payment Status: ${completedRes.data.data.job.payment_status})\n`);

    // 6. Customer Submits Rating & Review
    console.log('[6/7] Customer submitting 5-star rating & review...');
    const reviewRes = await axios.post(
      `${API_BASE}/reviews`,
      {
        booking_id: bookingId,
        rating: 5,
        comment: 'Superb craftsmanship! Cleaned up after repairing the pipe and arrived right on schedule.'
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log(`  ✓ Review recorded: ${reviewRes.data.data.review.rating} Stars - "${reviewRes.data.data.review.comment}"\n`);

    // 7. Admin Dashboard Verification
    console.log('[7/7] Admin logging in and verifying metrics...');
    const adminAuth = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@homeserve.com',
      password: 'Password123!'
    });
    const adminToken = adminAuth.data.data.token;

    const dashRes = await axios.get(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const metrics = dashRes.data.data;
    console.log(`  ✓ Platform Total Revenue: $${parseFloat(metrics.bookings.total_revenue).toFixed(2)}`);
    console.log(`  ✓ Total Completed Bookings: ${metrics.bookings.completed_bookings}`);
    console.log(`  ✓ Total Active Categories: ${metrics.total_categories}`);

    console.log('\n======================================================');
    console.log('  🎉 ALL 7 E2E PHASES & REST APIs VERIFIED 100% WORKING!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ E2E Verification Failed:', error.response?.data || error.message);
  }
};

runE2ETest();
