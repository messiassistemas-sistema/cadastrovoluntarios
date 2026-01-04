import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppConfig {
    appName: string;
    orgName: string;
    logoUrl: string | null;
    registrationOpen?: boolean;
}

interface ConfigContextType extends AppConfig {
    updateConfig: (newConfig: Partial<AppConfig>) => void;
}

const defaultValue: AppConfig = {
    appName: 'Portal MVP',
    orgName: 'Ministério Vida na Palavra',
    logoUrl: null,
    registrationOpen: true
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<AppConfig>(() => {
        const saved = localStorage.getItem('mvp_app_config');
        return saved ? JSON.parse(saved) : defaultValue;
    });

    // Sync with Supabase on mount
    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await import('../services/VolunteerServiceSupabase').then(m => m.VolunteerServiceSupabase.getSettings());
            if (settings) {
                setConfig(prev => ({
                    ...prev,
                    appName: settings.app_name || prev.appName,
                    orgName: settings.org_name || prev.orgName,
                    logoUrl: settings.logo_url || prev.logoUrl,
                    registrationOpen: settings.registration_open ?? true
                }));
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        localStorage.setItem('mvp_app_config', JSON.stringify(config));
    }, [config]);

    const updateConfig = async (newConfig: Partial<AppConfig>) => {
        // Optimistic update
        setConfig(prev => ({ ...prev, ...newConfig }));

        // Sync to Supabase
        const payload: any = {};
        if (newConfig.appName !== undefined) payload.app_name = newConfig.appName;
        if (newConfig.orgName !== undefined) payload.org_name = newConfig.orgName;
        if (newConfig.logoUrl !== undefined) payload.logo_url = newConfig.logoUrl;
        if (newConfig.registrationOpen !== undefined) payload.registration_open = newConfig.registrationOpen;

        if (Object.keys(payload).length > 0) {
            await import('../services/VolunteerServiceSupabase').then(m => m.VolunteerServiceSupabase.updateSettings(payload));
        }
    };

    return (
        <ConfigContext.Provider value={{ ...config, updateConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
