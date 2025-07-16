import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

// Define the shape of your authenticated user
type AuthUser = {
  id?: string;
  email?: string;
  phone?: string;
  account_id: {
    tagname?: string
    ng_balance: number
    //...more
  }
};

// Define context structure
type AuthContextType = {
  authUser: AuthUser | null;
  setAuthUser: Dispatch<SetStateAction<AuthUser | null>>;
};

// Default value
const defaultValue: AuthContextType = {
  authUser: null,
  setAuthUser: () => {}, // noop
};

// Create context
export const AuthContext = createContext<AuthContextType>(defaultValue);

// Provider Props
type AuthProviderProps = {
  children: ReactNode;
};

// Create the provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Optional: helper hook
export const useAuth = () => useContext(AuthContext);
