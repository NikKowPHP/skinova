import axios from "axios";
import type { OnboardingData, ProfileUpdateData, ScanWithAnalysis, RoutineWithStepsAndProducts, ProgressAnalyticsData } from "@/lib/types";

// Placeholder types for Skinova - will be refined in Task 1.2
interface SkinScan { id: string; [key: string]: any; }
interface Routine { id: string; [key: string]: any; }
interface Product { id: string; [key: string]: any; }
interface Consultation { id: string; [key: string]: any; }
interface Analytics { [key: string]: any; }

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
      const { data } = await axios.get<SkinScan[]>("/api/scan");
      return data;
    },
    getById: async (id: string) => {
      const { data } = await axios.get<ScanWithAnalysis>(`/api/scan/${id}`);
      return data;
    },
    create: async (payload: { imageUrl: string; notes?: string }) => {
      const { data } = await axios.post<SkinScan>("/api/scan", payload);
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
        const { data } = await axios.put<Routine>("/api/routine", payload);
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
};