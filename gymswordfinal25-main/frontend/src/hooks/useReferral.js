import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function useReferral() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get("/referral/details");
      if (res?.referral_code) {
        setData(res);
      } else if (res) {
        setData({ ...res, referral_code: null });
      }
    } catch (e) {
      if (e.response?.status !== 401) {
        setError(e.response?.data?.detail || "Failed to load referral data");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      const { data: res } = await api.get(`/referral/history?page=${page}`);
      return res;
    } catch (e) {
      throw new Error(e.response?.data?.detail || "Failed to load history");
    }
  }, []);

  const generateCode = useCallback(async () => {
    try {
      const { data: res } = await api.post("/referral/generate");
      setData((prev) => ({ ...prev, ...res }));
      return res;
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to generate code");
    }
  }, []);

  const getCode = useCallback(async () => {
    if (data?.referral_code) return data.referral_code;
    try {
      await fetchDetails();
    } catch {}
    if (data?.referral_code) return data.referral_code;
    try {
      const gen = await generateCode();
      return gen?.referral_code;
    } catch {
      return null;
    }
  }, [data?.referral_code, fetchDetails, generateCode]);

  const copyLink = useCallback(async () => {
    const code = await getCode();
    if (!code) {
      toast.error("Unable to get referral code");
      return false;
    }
    const link = `${window.location.origin}/register?ref=${code}`;
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  }, [getCode]);

  const share = useCallback(async (platform) => {
    const code = await getCode();
    if (!code) {
      toast.error("Unable to get referral code. Please try again.");
      return;
    }
    const link = `${window.location.origin}/register?ref=${code}`;
    const text = "Join GymSword — Premium Gymwear. Use my referral link to get exclusive rewards!";
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + " " + link)}`,
      email: `mailto:?subject=Join GymSword - Exclusive Rewards&body=${encodeURIComponent(text + "\n\n" + link)}`,
      sms: `sms:&body=${encodeURIComponent(text + " " + link)}`,
    };

    try {
      await api.post("/referral/share", { platform }).catch(() => {});
    } catch {}

    if (platform === "instagram") {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied! Paste it on Instagram");
      return;
    }
    if (platform === "native" && navigator.share) {
      navigator.share({ title: "GymSword Referral", text, url: link }).catch(() => {});
      return;
    }
    const url = urls[platform];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [getCode]);

  const verifyCode = useCallback(async (code) => {
    try {
      const { data: res } = await api.post("/referral/verify", { code });
      return res;
    } catch (e) {
      throw new Error(e.response?.data?.detail || "Invalid referral code");
    }
  }, []);

  const sendOTP = useCallback(async ({ email, mobile } = {}) => {
    try {
      const { data: res } = await api.post("/referral/auth/send-otp", { email, mobile });
      return res;
    } catch (e) {
      throw new Error(e.response?.data?.detail || "Failed to send OTP");
    }
  }, []);

  const verifyOTP = useCallback(async ({ email, mobile, otp } = {}) => {
    try {
      const { data: res } = await api.post("/referral/auth/verify-otp", { email, mobile, otp });
      if (res?.token) {
        localStorage.setItem("gs_token", res.token);
      }
      return res;
    } catch (e) {
      throw new Error(e.response?.data?.detail || "Invalid OTP");
    }
  }, []);

  const checkReward = useCallback(async () => {
    try {
      const { data: res } = await api.get("/referral/check-reward");
      return res;
    } catch {
      return null;
    }
  }, []);

  return {
    data, loading, error,
    fetchDetails, fetchHistory, generateCode, copyLink, share,
    verifyCode, sendOTP, verifyOTP, checkReward, getCode,
  };
}
