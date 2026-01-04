import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import VolunteerForm from './components/VolunteerForm';
import Login from './components/Login';
import { ConfigProvider } from './contexts/ConfigContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const [view, setView] = useState<AppView>('USER_FORM');
  const [showLogin, setShowLogin] = useState(false);

  const { user, userRole, loading } = useAuth();

  // Effect to redirect if user logs in while waiting
  useEffect(() => {
    if (user && showLogin) {
      setShowLogin(false);
      setView('ADMIN_DASHBOARD');
    }
  }, [user, showLogin]);

  const handleAdminToggle = () => {
    if (view === 'ADMIN_DASHBOARD') {
      setView('USER_FORM');
    } else {
      if (user) {
        setView('ADMIN_DASHBOARD');
      } else {
        setShowLogin(true);
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        currentView={view}
        onToggleView={handleAdminToggle}
      />

      <main className="flex-1" aria-live="polite">
        {showLogin && (
          <Login onCancel={() => setShowLogin(false)} />
        )}

        {view === 'ADMIN_DASHBOARD' ? (
          // Protect Admin Panel: Only show if user exists
          user ? (
            <AdminPanel userRole={userRole} />
          ) : (
            <div className="text-center pt-20">
              <p className="text-slate-500">Acesso não autorizado. Por favor faça login.</p>
              <button onClick={() => setShowLogin(true)} className="mt-4 text-indigo-600 font-bold hover:underline">Ir para Login</button>
            </div>
          )
        ) : (
          <VolunteerForm />
        )}
      </main>

      <footer className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} Ministério Vida na Palavra - MVP
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;