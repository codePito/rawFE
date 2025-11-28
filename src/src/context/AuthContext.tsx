// import React, { useEffect, useState, createContext, useContext } from 'react';
// import { User, LoginCredentials, RegisterData } from '../types';
// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   login: (credentials: LoginCredentials) => Promise<boolean>;
//   register: (data: RegisterData) => Promise<boolean>;
//   logout: () => void;
//   isAuthModalOpen: boolean;
//   openAuthModal: () => void;
//   closeAuthModal: () => void;
// }
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
// export function AuthProvider({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   const [user, setUser] = useState<User | null>(() => {
//     const saved = localStorage.getItem('user');
//     return saved ? JSON.parse(saved) : null;
//   });
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   useEffect(() => {
//     if (user) {
//       localStorage.setItem('user', JSON.stringify(user));
//     } else {
//       localStorage.removeItem('user');
//     }
//   }, [user]);
//   const login = async (credentials: LoginCredentials): Promise<boolean> => {
//     // Mock login - in production, this would call your backend API
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 500));
//       // Mock validation
//       if (!credentials.email || !credentials.password) {
//         return false;
//       }
//       // Create mock user
//       const mockUser: User = {
//         id: Math.random().toString(36).substr(2, 9),
//         email: credentials.email,
//         fullName: credentials.email.split('@')[0],
//         createdAt: new Date()
//       };
//       setUser(mockUser);
//       setIsAuthModalOpen(false);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };
//   const register = async (data: RegisterData): Promise<boolean> => {
//     // Mock registration - in production, this would call your backend API
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 500));
//       // Mock validation
//       if (!data.email || !data.password || !data.fullName) {
//         return false;
//       }
//       // Create mock user
//       const mockUser: User = {
//         id: Math.random().toString(36).substr(2, 9),
//         email: data.email,
//         fullName: data.fullName,
//         phone: data.phone,
//         createdAt: new Date()
//       };
//       setUser(mockUser);
//       setIsAuthModalOpen(false);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   };
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };
//   const openAuthModal = () => setIsAuthModalOpen(true);
//   const closeAuthModal = () => setIsAuthModalOpen(false);
//   return <AuthContext.Provider value={{
//     user,
//     isAuthenticated: !!user,
//     login,
//     register,
//     logout,
//     isAuthModalOpen,
//     openAuthModal,
//     closeAuthModal
//   }}>
//       {children}
//     </AuthContext.Provider>;
// }
// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// }