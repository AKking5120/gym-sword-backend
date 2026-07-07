const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getReferrals,
  getAllReferrals,
  getDetails,
  generateCodeHandler,
  verifyReferralCode,
  sendReferralOTP,
  verifyReferralOTP,
  getReferralHistory,
  rewardReferral,
  redeemReward,
  shareReferral,
  getAdminSettings,
  updateAdminSettings,
  getAdminStats,
  checkReferralReward,
} = require('../controllers/referralController');

// Legacy routes (plural)
router.use(protect);
router.get('/', getReferrals);
router.get('/admin/all', adminOnly, getAllReferrals);

module.exports = router;

// New routes (singular)
const newRouter = express.Router();
newRouter.get('/details', protect, getDetails);
newRouter.post('/generate', protect, generateCodeHandler);
newRouter.post('/verify', verifyReferralCode);
newRouter.post('/reward', protect, rewardReferral);
newRouter.post('/redeem', protect, redeemReward);
newRouter.post('/share', protect, shareReferral);
newRouter.get('/history', protect, getReferralHistory);
newRouter.get('/check-reward', protect, checkReferralReward);
newRouter.post('/auth/send-otp', sendReferralOTP);
newRouter.post('/auth/verify-otp', verifyReferralOTP);
newRouter.get('/admin/settings', adminOnly, getAdminSettings);
newRouter.put('/admin/settings', adminOnly, updateAdminSettings);
newRouter.get('/admin/stats', adminOnly, getAdminStats);

module.exports.newRouter = newRouter;