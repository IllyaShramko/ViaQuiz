import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '../models';
import { getAuthToken, setAuthToken, removeAuthToken } from '../../../shared/api/headers';
import { useGetMeQuery } from '../api/authApi';

export interface UserContextContract {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  refetchUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextContract | null>(null);

export function useUserContext(): UserContextContract {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}

export const useAuth = useUserContext;

export interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [token, setTokenState] = useState<string | null>(() => getAuthToken());
  const [user, setUserState] = useState<User | null>(null);

  const {
    data: userData,
    isFetching: isFetchingUser,
    isError,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (userData) {
      setUserState(userData);
    } else if (isError) {
      removeAuthToken();
      setTokenState(null);
      setUserState(null);
    } else if (!token) {
      setUserState(null);
    }
  }, [userData, isError, token]);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      setAuthToken(newToken);
    } else {
      removeAuthToken();
      setUserState(null);
    }
  }, []);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setAuthToken(newToken);
    setTokenState(newToken);
    setUserState(newUser);
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setTokenState(null);
    setUserState(null);
  }, []);

  const refetchUser = useCallback(async () => {
    if (token) {
      await refetch();
    }
  }, [token, refetch]);

  const currentUser = user ?? userData ?? null;
  const isInitializing = Boolean(token && !currentUser && !isError);

  const value: UserContextContract = {
    user: currentUser,
    token,
    isAuthenticated: Boolean(token && currentUser),
    isLoading: isInitializing || Boolean(token && isFetchingUser && !currentUser),
    login,
    logout,
    setUser,
    setToken,
    refetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

