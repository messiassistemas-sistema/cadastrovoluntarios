import React from 'react';

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group inline-block ml-2">
        <button
            type="button"
            className="text-slate-400 hover:text-indigo-600 focus:text-indigo-600 outline-none transition-colors"
            aria-label="Mais informações"
        >
            <i className="fas fa-info-circle text-xs"></i>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-center leading-relaxed">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
        </div>
    </div>
);

export default InfoTooltip;
