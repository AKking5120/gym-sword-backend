const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const { sendSuccess, sendError, generateReferralCode, generatePublicId } = require('../utils/helpers');
const { creditWallet } = require('../services/walletService');
const { createNotification } = require('../services/notificationService');
const { createOTP, checkOTP } = require('../services/otpService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// GET /api/referrals (legacy)
const getReferrals = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', req.user.id)
      .single();

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*, referred_user:referred_user_id(name, email, created_at)')
      .eq('referrer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return sendError(res, error.message);

    const totalEarned = referrals
      .filter((r) => r.reward_given)
      .reduce((sum, r) => sum + r.reward_coins, 0);

    return sendSuccess(res, {
      data: {
        referral_code: user.referral_code,
        total_referrals: referrals.length,
        total_coins_earned: totalEarned,
        referrals,
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/referral/details
const getDetails = async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('referral_code, wallet_coins')
      .eq('id', req.user.id)
      .single();

    if (!user.referral_code) {
      const code = generateReferralCode();
      await supabase.from('users').update({ referral_code: code }).eq('id', req.user.id);
      user.referral_code = code;
    }

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select('*, referred_user:referred_user_id(id, name, email, created_at)')
      .eq('referrer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return sendError(res, error.message);

    const totalCoinsEarned = referrals
      .filter((r) => r.reward_given)
      .reduce((sum, r) => sum + r.reward_coins, 0);

    return sendSuccess(res, {
      data: {
        referral_code: user.referral_code,
        wallet_coins: user.wallet_coins || 0,
        total_referrals: referrals.length,
        total_coins_earned: totalCoinsEarned,
        referrals,
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/generate
const generateCodeHandler = async (req, res) => {
  try {
    const code = generateReferralCode();
    const { error } = await supabase
      .from('users')
      .update({ referral_code: code })
      .eq('id', req.user.id);
    if (error) return sendError(res, error.message);
    return sendSuccess(res, { data: { referral_code: code } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/verify
const verifyReferralCode = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return sendError(res, 'Referral code is required');

    const { data: referrer, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('referral_code', code.toUpperCase())
      .single();

    if (error || !referrer) return sendError(res, 'Invalid referral code');

    return sendSuccess(res, {
      data: { valid: true, referrer_id: referrer.id, referrer_name: referrer.name, discount: 500 },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/auth/send-otp
const sendReferralOTP = async (req, res) => {
  try {
    let { email, mobile } = req.body;
    let identifier, isMobile = false;

    if (mobile) {
      identifier = mobile.trim();
      isMobile = true;
    } else if (email) {
      identifier = email.trim().toLowerCase();
    } else {
      return sendError(res, 'Email or mobile number is required', 400);
    }

    let user;
    if (isMobile) {
      const { data } = await supabase.from('users').select('id, name, email, email_verified, is_disabled').eq('mobile', identifier).maybeSingle();
      user = data;
    } else {
      const { data } = await supabase.from('users').select('*').eq('email', identifier).single();
      user = data;
    }

    if (user && user.is_disabled) return sendError(res, 'Account has been disabled', 403);

    let userId;
    if (user) {
      userId = user.id;
    } else {
      const publicId = await generatePublicId(supabase);
      const insertData = isMobile
        ? { mobile: identifier, public_id: publicId, referral_code: generateReferralCode() }
        : { email: identifier, public_id: publicId, referral_code: generateReferralCode() };

      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert(insertData)
        .select('id')
        .single();

      if (createErr) return sendError(res, createErr.message);
      userId = newUser.id;
    }

    const { otp, error: otpError } = await createOTP('referral_auth', isMobile ? identifier : identifier, userId);
    if (otpError) return sendError(res, otpError, 429);

    console.log(`[Referral OTP] for ${identifier}: ${otp}`);

    return sendSuccess(res, { data: { is_new: !user, is_mobile: isMobile } }, 'OTP sent successfully');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/auth/verify-otp
const verifyReferralOTP = async (req, res) => {
  try {
    let { email, mobile, otp } = req.body;
    if ((!email && !mobile) || !otp) return sendError(res, 'Email or mobile and OTP are required', 400);

    let identifier = email ? email.trim().toLowerCase() : mobile.trim();
    let isMobile = !!mobile;

    const { success, error: otpError, userId } = await checkOTP('referral_auth', identifier, otp);
    if (!success) return sendError(res, otpError || 'Invalid OTP', 400);

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchErr || !user) return sendError(res, 'User not found', 404);
    if (user.is_disabled) return sendError(res, 'Account has been disabled', 403);

    if (isMobile && !user.mobile_verified) {
      await supabase.from('users').update({ mobile_verified: true }).eq('id', userId);
    }
    if (!isMobile && !user.email_verified) {
      await supabase.from('users').update({ email_verified: true }).eq('id', userId);
    }

    if (!user.referral_code) {
      const code = generateReferralCode();
      await supabase.from('users').update({ referral_code: code }).eq('id', userId);
      user.referral_code = code;
    }

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;

    return sendSuccess(res, {
      data: { user: safeUser, token, is_new: !user.name },
    }, 'Login successful');
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/referral/history
const getReferralHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: referrals, error, count } = await supabase
      .from('referrals')
      .select('*, referred_user:referred_user_id(id, name, email, created_at)', { count: 'exact' })
      .eq('referrer_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return sendError(res, error.message);

    const { data: user } = await supabase
      .from('users')
      .select('wallet_coins, referral_code')
      .eq('id', req.user.id)
      .single();

    return sendSuccess(res, {
      data: {
        referrals,
        wallet_coins: user?.wallet_coins || 0,
        referral_code: user?.referral_code,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/reward
const rewardReferral = async (req, res) => {
  try {
    const { referrer_id, referred_user_id } = req.body;
    if (!referrer_id || !referred_user_id) {
      return sendError(res, 'Missing referrer_id or referred_user_id');
    }

    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer_id)
      .eq('referred_user_id', referred_user_id)
      .single();

    if (existing) return sendError(res, 'Referral already recorded');

    const { data: referrer } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', referrer_id)
      .single();

    const { error: insertErr } = await supabase.from('referrals').insert({
      referrer_id,
      referred_user_id,
      referral_code: referrer?.referral_code || null,
      reward_coins: 500,
      reward_given: false,
    });
    if (insertErr) return sendError(res, insertErr.message);

    return sendSuccess(res, { data: { message: 'Referral recorded' } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/redeem
const redeemReward = async (req, res) => {
  try {
    const { referral_id } = req.body;
    if (!referral_id) return sendError(res, 'referral_id is required');

    const { data: referral, error: fetchErr } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referral_id)
      .eq('referrer_id', req.user.id)
      .single();

    if (fetchErr || !referral) return sendError(res, 'Referral not found');
    if (referral.reward_given) return sendError(res, 'Reward already redeemed');

    await creditWallet(req.user.id, referral.reward_coins, `Referral reward - ${referral.reward_coins} coins`);
    await supabase.from('referrals').update({ reward_given: true }).eq('id', referral_id);
    await createNotification(req.user.id, 'Referral Reward', `You earned ${referral.reward_coins} coins from a referral!`);

    return sendSuccess(res, { data: { message: 'Reward redeemed', coins: referral.reward_coins } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// POST /api/referral/share
const shareReferral = async (req, res) => {
  try {
    const { platform } = req.body;
    const { data: user } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', req.user.id)
      .single();

    if (!user?.referral_code) return sendError(res, 'No referral code found');

    const { error } = await supabase.from('referral_shares').insert({
      user_id: req.user.id,
      platform: platform || 'unknown',
    });
    if (error) console.error('Share tracking error:', error.message);

    return sendSuccess(res, { data: { message: 'Share tracked' } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/referral/admin/settings
const getAdminSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();
    if (error && error.code !== 'PGRST116') return sendError(res, error.message);
    return sendSuccess(res, {
      data: data || {
        referral_enabled: true,
        referral_reward_amount: 500,
        referral_min_purchase: 1500,
        referral_coupon_days: 30,
        referral_bonus_coins: 50,
        referral_reward_type: 'wallet',
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// PUT /api/referral/admin/settings
const updateAdminSettings = async (req, res) => {
  try {
    const updates = req.body;
    const { error } = await supabase.from('settings').upsert(updates);
    if (error) return sendError(res, error.message);
    return sendSuccess(res, { data: { message: 'Settings updated' } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/referral/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const { data: referrals } = await supabase.from('referrals').select('*');
    const total = referrals?.length || 0;
    const completed = referrals?.filter((r) => r.reward_given).length || 0;
    const pending = total - completed;
    const totalCoins = referrals?.filter((r) => r.reward_given).reduce((s, r) => s + r.reward_coins, 0) || 0;

    const { data: topReferrers } = await supabase
      .from('referrals')
      .select('referrer_id, reward_coins, reward_given');

    const referrerMap = {};
    topReferrers?.forEach((r) => {
      if (!referrerMap[r.referrer_id]) referrerMap[r.referrer_id] = { total: 0, coins: 0 };
      referrerMap[r.referrer_id].total++;
      if (r.reward_given) referrerMap[r.referrer_id].coins += r.reward_coins;
    });

    const topList = Object.entries(referrerMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .map(([id, data]) => ({ id, ...data }));

    const { data: allReferrals } = await supabase
      .from('referrals')
      .select('*, referrer:referrer_id(name, email), referred_user:referred_user_id(name, email)')
      .order('created_at', { ascending: false });

    return sendSuccess(res, {
      data: {
        stats: { total, completed, pending, total_coins: totalCoins },
        top_referrers: topList,
        referrals: allReferrals || [],
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/referrals/admin/all (legacy)
const getAllReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: referrals, error, count } = await supabase
      .from('referrals')
      .select('*, referrer:referrer_id(name, email, public_id), referred_user:referred_user_id(name, email, public_id, created_at)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) return sendError(res, error.message);

    const { data: allReferrals } = await supabase.from('referrals').select('reward_coins, reward_given');

    const totalReferrals = allReferrals?.length || 0;
    const totalCoinsGiven = allReferrals?.filter(r => r.reward_given).reduce((sum, r) => sum + r.reward_coins, 0) || 0;

    return sendSuccess(res, {
      data: referrals,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      stats: { total_referrals: totalReferrals, total_coins_given: totalCoinsGiven },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

// GET /api/referral/check-reward
const checkReferralReward = async (req, res) => {
  try {
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, reward_given, reward_coins, created_at, referred_user:referred_user_id(name, email)')
      .eq('referrer_id', req.user.id)
      .eq('reward_given', true)
      .order('created_at', { ascending: false })
      .limit(1);

    const latest = referrals?.[0] || null;
    return sendSuccess(res, { data: { has_reward: !!latest, reward: latest } });
  } catch (err) {
    return sendError(res, err.message);
  }
};

module.exports = {
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
};