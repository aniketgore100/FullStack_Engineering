import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  completeLogin,
  logout,
  selectAuthLoading,
  selectUser,
} from "../app/slices/authSlice";
import { createOAuthState } from "../lib/auth";

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  const login = useCallback(() => {
    window.location.assign(`/api/auth/google?state=${createOAuthState()}`);
  }, []);

  return {
    user,
    loading,
    login,
    completeLogin: (tokens) => dispatch(completeLogin(tokens)).unwrap(),
    logout: () => dispatch(logout()),
  };
}
