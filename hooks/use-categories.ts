import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
};

export function useCategories(activeOnly = false) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/categories${activeOnly ? "?activeOnly=true" : ""}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    categories: data?.categories || [],
    isLoading,
    isError: error,
    mutate,
  };
}
