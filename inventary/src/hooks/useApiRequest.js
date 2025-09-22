import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

/**
 *
 * Example GET request
 * const { data, isLoading, error } = useApiRequest({
 *   url: "/api/admin/products",
 *   queryKey: ["products"]
 * });
 *
 * Example POST request
 * const { mutate, isLoading, error } = useApiRequest({
 *   url: "/api/admin/products",
 *   method: "POST",
 *   body: { name: "New Product", price: 100 }
 * });
 *
 * Using the mutate function
 * const handleSubmit = () => {
 *   mutate(productData, {
 *     onSuccess: (data) => console.log("Created:", data),
 *     onError: (error) => console.error("Error:", error)
 *   });
 * };
 *
 */

export default function useApiRequest({
  url,
  method = "GET",
  body = null,
  queryKey = [],
  options = {},
  headers = {},
  enableQuery = true,
  requiresAuth = true,
}) {
  const authToken = requiresAuth ? localStorage.getItem("authToken") : null;
  const defaultHeaders = {
    Authorization: requiresAuth ? `Bearer ${authToken}` : undefined,
    ...headers,
  };

  // Always call both hooks unconditionally
  const isGetRequest = method.toUpperCase() === "GET";

  // For GET requests, use useQuery
  // Call useQuery unconditionally
  const query = useQuery({
    queryFn: () =>
      axios
        .get(url, {
          headers: defaultHeaders,
        })
        .then((res) => res.data),
    queryKey: queryKey.length ? queryKey : [url],
    enabled: enableQuery && isGetRequest,
    cacheTime: 0,
    staleTime: 1,
    ...options,
  });

  // For mutation methods (POST, PUT, DELETE), use useMutation
  // Call useMutation unconditionally
  const mutation = useMutation({
    mutationFn: async (customBody = body) => {
      const config = {
        headers: defaultHeaders,
      };

      switch (method.toUpperCase()) {
        case "POST":
          return axios.post(url, customBody, config).then((res) => res.data);
        case "PUT":
          return axios.put(url, customBody, config).then((res) => res.data);
        case "DELETE":
          return axios.delete(url, config).then((res) => res.data);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    },
    ...options,
  });

  // Return the appropriate hook result based on the method
  if (isGetRequest) {
    return {
      response: query.data,
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch,
    };
  } else {
    return {
      mutate: mutation.mutate,
      isLoading: mutation.isPending,
      error: mutation.error,
      response: mutation.data,
    };
  }
}
