import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  PaymentSettings,
  Product,
  backendInterface,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetBestSellers() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["bestSellers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBestSellers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["allProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      customerName: string;
      phone: string;
      email: string;
      address: string;
      productId: string;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        params.customerName,
        params.phone,
        params.email,
        params.address,
        params.productId,
        params.quantity,
      );
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      priceINR: number;
      category: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const fullActor = actor as unknown as backendInterface;
      return fullActor.addProduct(
        params.name,
        params.description,
        params.priceINR,
        params.category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
      queryClient.invalidateQueries({ queryKey: ["bestSellers"] });
    },
  });
}

export function useUpdateProductStock() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; inStock: boolean }) => {
      if (!actor) throw new Error("Not connected");
      const fullActor = actor as unknown as backendInterface;
      return fullActor.updateProductStock(params.id, params.inStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allProducts"] });
      queryClient.invalidateQueries({ queryKey: ["bestSellers"] });
    },
  });
}

export function useGetPaymentSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<PaymentSettings>({
    queryKey: ["paymentSettings"],
    queryFn: async () => {
      if (!actor) return { upiId: "", instructions: "" };
      const fullActor = actor as unknown as backendInterface;
      return fullActor.getPaymentSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPaymentSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { upiId: string; instructions: string }) => {
      if (!actor) throw new Error("Not connected");
      const fullActor = actor as unknown as backendInterface;
      return fullActor.setPaymentSettings(params.upiId, params.instructions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentSettings"] });
    },
  });
}

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      const fullActor = actor as unknown as backendInterface;
      return fullActor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      emoji: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const fullActor = actor as unknown as backendInterface;
      return fullActor.addCategory(
        params.name,
        params.emoji,
        params.description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useRemoveCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const fullActor = actor as unknown as backendInterface;
      return fullActor.removeCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
