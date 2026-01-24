import React, { useEffect, useState } from 'react';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent_accepted');
        if (!consent) {
            setShouldRender(true);
            // Small delay for a smooth entrance
            setTimeout(() => setIsVisible(true), 500);
        }
    }, []);

    const handleAccept = () => {
        setIsVisible(false);
        setTimeout(() => {
            localStorage.setItem('cookie_consent_accepted', 'true');
            setShouldRender(false);
        }, 500); // Wait for exit animation
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed bottom-6 right-6 z-[60] max-w-[360px] w-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
        >
            {/* Glass Container */}
            <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] rounded-[20px] p-6">

                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <h3 className="text-[15px] font-semibold text-gray-900 tracking-tight">
                            Privacidade em primeiro lugar
                        </h3>
                        <p className="text-[13px] leading-relaxed text-gray-600 font-normal">
                            Utilizamos cookies para aprimorar sua experiência de navegação e analisar nosso tráfego.
                            Ao continuar, você concorda com nossa{' '}
                            <a href="#" className="text-[#000033] font-medium underline decoration-black/20 hover:decoration-black/50 transition-all">
                                Política de Privacidade
                            </a>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAccept}
                            className="flex-1 bg-[#000033] hover:bg-[#000044] text-white text-[13px] font-medium py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-sm tracking-wide"
                        >
                            Aceitar
                        </button>
                        <button
                            onClick={handleAccept} // Treating close as accept/dismiss for now or could be "Customize"
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[13px] font-medium py-2.5 px-4 rounded-xl transition-all active:scale-[0.98]"
                        >
                            Agora não
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
