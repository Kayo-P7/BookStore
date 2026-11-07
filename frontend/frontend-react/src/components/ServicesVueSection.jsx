import React, { useEffect, useState } from 'react';

// secao que integra o modulo vuejs diretamente no portal unificado com sincronizacao de tema
export function ServicesVueSection({ theme }) {
    const [iframeKey, setIframeKey] = useState(Date.now());
    const vueUrl = 'http://localhost:5174';

    // recarrega o iframe do modulo vue
    function handleReload() {
        setIframeKey(Date.now());
    }

    // envia o tema ativo para o iframe sempre que houver alteracao
    useEffect(() => {
        const iframe = document.querySelector('.vue-embedded-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'THEME_CHANGE', theme }, '*');
        }
    }, [theme]);

    return (
        <div className="services-vue-view">
            <section className="panel module-header-panel">
                <div className="module-banner-header">
                    <div>
                        <div className="module-pill">
                            <span className="dot vue"></span> Módulo Micro-frontend
                        </div>
                        <h2>Serviços e Utilitários (Vue.js 3)</h2>
                        <p className="description">
                            Este módulo roda na porta 5174 e está embutido diretamente nesta tela.
                            Você não precisa abrir uma segunda aba no navegador.
                        </p>
                    </div>

                    <div className="module-actions">
                        <button
                            type="button"
                            className="secondary"
                            onClick={handleReload}
                            title="Recarregar o frame do Vue"
                        >
                            Recarregar Módulo
                        </button>
                        <a
                            href={vueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="secondary module-external-link"
                            title="Abrir em aba separada"
                        >
                            Abrir em nova aba ↗
                        </a>
                    </div>
                </div>

                <div className="module-badges-list">
                    <span className="tech-badge">Framework: Vue 3 (Composition API)</span>
                    <span className="tech-badge">API Externa 1: ViaCEP (Endereços)</span>
                    <span className="tech-badge">API Externa 2: Nager.Date (Feriados Nacionais)</span>
                    <span className="tech-badge">Porta: 5174</span>
                </div>
            </section>

            <section className="panel iframe-wrapper-panel">
                <iframe
                    key={iframeKey}
                    src={vueUrl}
                    title="Modulo Vue BookStore"
                    className="vue-embedded-frame"
                    onLoad={e => {
                        if (e.target && e.target.contentWindow) {
                            e.target.contentWindow.postMessage({ type: 'THEME_CHANGE', theme }, '*');
                        }
                    }}
                />
            </section>
        </div>
    );
}
