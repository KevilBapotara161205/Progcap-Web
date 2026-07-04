/**
 * AI API functions — RBH Web Dashboard
 * All calls are offline-safe: return null on any error.
 * Never throws — business flow is never blocked by AI failure.
 */

import axiosClient from './axiosClient';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AIResponse<T> {
  aiAvailable: boolean;
  generatedAt?: string;
  data: T | null;
}

// ── Health check ──────────────────────────────────────────────────────────────
export const checkAIHealth = async (): Promise<boolean> => {
  try {
    const res = await axiosClient.get('/ai/health', { timeout: 5000 });
    return res.data?.data?.online === true;
  } catch {
    return false;
  }
};

// ── Feature 1: Merchant X-Ray ─────────────────────────────────────────────────
export const getMerchantXray = async (leadId?: string, dealerId?: string) => {
  try {
    const res = await axiosClient.post('/ai/merchant-xray', { leadId, dealerId }, { timeout: 35000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

// ── Feature 4: NBA Explanation ────────────────────────────────────────────────
export const getNbaExplanation = async (leadId: string, score?: number) => {
  try {
    const res = await axiosClient.post('/ai/nba-explain', { leadId, score }, { timeout: 35000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

// ── Feature 6: Follow-up Suggestions ─────────────────────────────────────────
export const getFollowUpSuggestions = async (leadId: string) => {
  try {
    const res = await axiosClient.post('/ai/follow-up', { leadId }, { timeout: 35000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

// ── Feature 8: Smart Search ───────────────────────────────────────────────────
export const smartSearch = async (query: string) => {
  try {
    const res = await axiosClient.post('/ai/smart-search', { query }, { timeout: 20000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};

// ── Feature 9: Manager Insights ───────────────────────────────────────────────
export const getManagerInsights = async () => {
  try {
    const res = await axiosClient.get('/ai/manager-insights', { timeout: 40000 });
    return res.data?.data ?? null;
  } catch {
    return null;
  }
};
