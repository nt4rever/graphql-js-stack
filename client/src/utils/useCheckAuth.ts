import { useRouter } from "next/router";
import { useMeQuery } from "../generated/graphql";
import { useEffect } from "react";

export const useCheckAuth = () => {
  const router = useRouter();
  const { data, loading } = useMeQuery();
  const authRoutes = ["/login", "/register"];

  useEffect(() => {
    if (!loading) {
      if (data.me && authRoutes.some((value) => value === router.route)) {
        router.push("/");
      } else if (
        !data.me &&
        !authRoutes.some((value) => value === router.route)
      ) {
        router.push("/login");
      }
    }
  }, [data, loading, router]);

  return { data, loading };
};
