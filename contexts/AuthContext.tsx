import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'ADMIN' | 'SECRETARIA' | null;

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: UserRole;
    loading: boolean;
    signIn: (email: string) => Promise<void>; // We will use Magic Link or Password
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    userRole: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            determineRole(session?.user);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            determineRole(session?.user);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const determineRole = (user: User | undefined | null) => {
        if (!user || !user.email) {
            setUserRole(null);
            return;
        }

        // Simple RBAC based on email for MVP
        // In a real app, this should be in 'profiles' table or App Metadata
        if (user.email === 'admin@mvp.com' || user.email === 'msig12@gmail.com') {
            setUserRole('ADMIN');
        } else if (user.email === 'secretaria@mvp.com') {
            setUserRole('SECRETARIA');
        } else {
            // Default to minimal access or deny
            // For now, let's treat unknown users as having no role or maybe Guest
            setUserRole(null);
        }
    };

    const signIn = async (email: string) => {
        // This is just a placeholder type signature if we want to expose it
        // The Login component will call supabase directly mostly
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, userRole, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
