import React from 'react';
import { AppView } from '../types';

import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC<{ onToggleView: () => void; currentView: AppView }> = ({ onToggleView, currentView }) => {
    const { appName, orgName, logoUrl } = useConfig();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-indigo-900 text-white p-6 rounded-b-3xl shadow-lg mb-8 relative">
            <div className="text-center flex flex-col items-center">
                {logoUrl && (
                    <img src={logoUrl} alt={appName} className="h-16 w-auto mb-3 object-contain rounded-lg bg-white/10 p-1" />
                )}
                <h1 className="text-2xl font-bold tracking-tight">{appName}</h1>
                <p className="text-indigo-200 text-sm mt-1">{orgName}</p>
            </div>
            <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                className="absolute left-6 top-6 bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2 focus:ring-2 focus:ring-white outline-none"
            >
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true"></i>
            </button>
            <button
                onClick={onToggleView}
                aria-label={currentView === 'USER_FORM' ? 'Acessar Painel Administrativo' : 'Voltar ao Formulário de Cadastro'}
                title={currentView === 'USER_FORM' ? 'Painel Admin' : 'Voltar ao Cadastro'}
                className="absolute right-6 top-6 bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2 focus:ring-2 focus:ring-white outline-none"
            >
                <i className={`fas ${currentView === 'USER_FORM' ? 'fa-lock' : 'fa-user'}`} aria-hidden="true"></i>
                <span>{currentView === 'USER_FORM' ? 'Admin' : 'Sair'}</span>
            </button>
        </header>
    );
};

export default Header;
