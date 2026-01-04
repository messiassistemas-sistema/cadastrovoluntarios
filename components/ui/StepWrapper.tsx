import React, { useEffect, useRef } from 'react';

const StepWrapper: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        titleRef.current?.focus();
    }, [title]);

    return (
        <div className="max-w-md mx-auto px-4 pb-20" role="form" aria-labelledby="step-title">
            {title && (
                <h2
                    id="step-title"
                    ref={titleRef}
                    tabIndex={-1}
                    className="text-xl font-semibold mb-6 text-slate-800 border-l-4 border-indigo-600 pl-3 focus:outline-none"
                >
                    {title}
                </h2>
            )}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn">
                {children}
            </div>
        </div>
    );
};

export default StepWrapper;
