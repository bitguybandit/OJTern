const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const companyRoutes = require('./company.routes');
const postingRoutes = require('./posting.routes');
const partnerRoutes = require('./partner.routes');
const applicationRoutes = require('./application.routes');
const recommendationRoutes = require('./recommendation.routes');
const coordinatorRoutes = require('./coordinator.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');

// Health check endpoint (NFR-01: unauthenticated)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'OJTerm API',
      timestamp: new Date().toISOString()
    }
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/companies', companyRoutes);
router.use('/postings', postingRoutes);
router.use('/partner', partnerRoutes);
router.use('/applications', applicationRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/coordinator', coordinatorRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
