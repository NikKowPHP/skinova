import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/api-client.service";
import { useToast } from "@/components/ui/use-toast";
import { useUserProfile } from "./data";
import { Product } from "@prisma/client";

// The profile data will be passed in to determine if the query should run.
export const useAdminUsers = (
  userProfile: { subscriptionTier?: string } | null | undefined,
  page: number,
  searchTerm: string,
) => {
  return useQuery({
    queryKey: ["admin-users", searchTerm, page],
    queryFn: () =>
      apiClient.admin.getUsers({ search: searchTerm, page, limit: 20 }),
    // Only enable this query if the user profile is loaded AND the tier is 'ADMIN'.
    enabled: !!userProfile && userProfile.subscriptionTier === "ADMIN",
  });
};

export const useUpdateUserSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { subscriptionTier: string; subscriptionStatus?: string };
    }) => apiClient.admin.updateSubscription(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "Subscription Updated",
        description: "The user's subscription has been successfully changed.",
      });
      // Invalidation of the user detail page is handled by router.refresh() in the component
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error.message || "The user's subscription could not be updated.",
      });
    },
  });
};

export const useAdminSettings = () => {
  const { data: userProfile } = useUserProfile();
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: apiClient.admin.getSettings,
    enabled: !!userProfile && userProfile.subscriptionTier === "ADMIN",
  });
};

export const useUpdateAdminSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      apiClient.admin.updateSetting({ key, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({
        title: "Setting Updated",
        description: "The system setting has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "The system setting could not be saved.",
      });
    },
  });
};

// Product Hooks
export const useAdminProducts = () => {
    const { data: userProfile } = useUserProfile();
    return useQuery<Product[]>({ 
        queryKey: ["admin-products"], 
        queryFn: apiClient.admin.getProducts,
        enabled: !!userProfile && userProfile.subscriptionTier === "ADMIN",
    });
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.admin.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product Created" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: (err as Error).message }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: Omit<Product, 'id'>}) => apiClient.admin.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: "Product Updated" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: (err as Error).message }),
  });
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
        mutationFn: apiClient.admin.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            toast({ title: "Product Deleted" });
        },
        onError: (err) => toast({ variant: "destructive", title: "Error", description: (err as Error).message }),
    });
}


// Consultation Hooks
export const useAdminConsultations = (status?: string) => {
    const { data: userProfile } = useUserProfile();
    return useQuery({ 
        queryKey: ["admin-consultations", status || 'all'], 
        queryFn: () => apiClient.admin.getConsultations({ status }),
        enabled: !!userProfile && userProfile.subscriptionTier === "ADMIN",
    });
}
export const useAdminConsultation = (id: string) => {
    const { data: userProfile } = useUserProfile();
    return useQuery({ 
        queryKey: ["admin-consultation", id], 
        queryFn: () => apiClient.admin.getConsultation(id), 
        enabled: !!id && !!userProfile && userProfile.subscriptionTier === "ADMIN"
    });
}

export const useUpdateConsultation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: { status: string; notes?: string } }) => apiClient.admin.updateConsultation(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-consultations", 'all'] });
      queryClient.invalidateQueries({ queryKey: ["admin-consultations", 'PENDING'] });
      queryClient.invalidateQueries({ queryKey: ["admin-consultations", 'COMPLETED'] });
      queryClient.invalidateQueries({ queryKey: ["admin-consultation", id] });
      toast({ title: "Consultation Updated" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: (err as Error).message }),
  });
};