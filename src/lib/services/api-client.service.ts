import axios from "axios";
import type { OnboardingData, ProfileUpdateData, ScanWithAnalysis, RoutineWithStepsAndProducts, ProgressAnalyticsData, ScanHistoryItem } from "@/lib/types";
import { Product, Consultation } from "@prisma/client";

export const apiClient = {
  profile: {
    get: async () => {
      const { data } = await axios.get("/api/user/profile");
      return data;
    },
    update: async (profileData: ProfileUpdateData) => {
      const { data } = await axios.put("/api/user/profile", profileData);
      return data;
    },
  },
  scan: {
    getAll: async () => {
      const { data } = await axios.get<ScanHistoryItem[]>("/api/scan");
      return data;
    },
    getById: async (id: string) => {
      const { data } = await axios.get<ScanWithAnalysis>(`/api/scan/${id}`);
      return data;
    },
    create: async (payload: { imageUrl: string; notes?: string }) => {
      const { data } = await axios.post<ScanWithAnalysis>("/api/scan", payload);
      return data;
    },
    delete: async (id: string) => {
        await axios.delete(`/api/scan/${id}`);
    }
  },
  analyze: {
    start: async (scanId: string) => {
      const { data } = await axios.post("/api/scan/analyze", { scanId });
      return data;
    },
  },
  routine: {
    get: async () => {
        const { data } = await axios.get<RoutineWithStepsAndProducts>("/api/routine");
        return data;
    },
    update: async (payload: { steps: any[] }) => {
        const { data } = await axios.put<RoutineWithStepsAndProducts>("/api/routine", payload);
        return data;
    }
  },
  products: {
    getAll: async () => {
        const { data } = await axios.get<Product[]>("/api/products");
        return data;
    }
  },
  consultation: {
    getAll: async () => {
        const { data } = await axios.get<Consultation[]>("/api/consultation");
        return data;
    }
  },
  progress: {
    getAnalytics: async () => {
        const { data } = await axios.get<ProgressAnalyticsData>("/api/progress/analytics");
        return data;
    }
  },
  user: {
    onboard: async (onboardingData: OnboardingData) => {
      const { data } = await axios.post("/api/user/onboard", onboardingData);
      return data;
    },
    completeOnboarding: async () => {
      const { data } = await axios.post("/api/user/complete-onboarding");
      return data;
    },
    delete: async () => {
      const { data } = await axios.delete("/api/user");
      return data;
    },
  },
   admin: {
    getUsers: async (params: {
      search: string;
      page: number;
      limit: number;
    }) => {
      const { data } = await axios.get("/api/admin/users", { params });
      return data;
    },
    updateSubscription: async (
      userId: string,
      payload: { subscriptionTier: string; subscriptionStatus?: string },
    ) => {
      const { data } = await axios.put(
        `/api/admin/users/${userId}/subscription`,
        payload,
      );
      return data;
    },
    getSettings: async () => {
      const { data } = await axios.get("/api/admin/settings");
      return data;
    },
    updateSetting: async (payload: { key: string; value: any }) => {
      const { data } = await axios.put("/api/admin/settings", payload);
      return data;
    },
    getProducts: async () => { const { data } = await axios.get<Product[]>("/api/admin/products"); return data; },
    createProduct: async (payload: Omit<Product, 'id'>) => { const { data } = await axios.post("/api/admin/products", payload); return data; },
    updateProduct: async (id: string, payload: Omit<Product, 'id'>) => { const { data } = await axios.put(`/api/admin/products/${id}`, payload); return data; },
    deleteProduct: async (id: string) => { await axios.delete(`/api/admin/products/${id}`); },
    getConsultations: async (params?: { status?: string }) => { const { data } = await axios.get<Consultation[]>("/api/admin/consultations", { params }); return data; },
    getConsultation: async (id: string) => { const { data } = await axios.get(`/api/admin/consultations/${id}`); return data; },
    updateConsultation: async (id: string, payload: { status: string; notes?: string }) => { const { data } = await axios.put(`/api/admin/consultations/${id}`, payload); return data; },
  },
   billing: {
    createCheckoutSession: async (payload: { priceId: string; scanId?: string }) => {
      const { data } = await axios.post("/api/billing/checkout", payload);
      return data;
    },
    createPortalSession: async () => {
      const { data } = await axios.post("/api/billing/portal");
      return data;
    },
  },
};