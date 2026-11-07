import * as React from 'react';
import { RefreshCw, ExternalLink, MapPin } from 'lucide-react';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useTheme } from '../../context/ThemeContext';

export function ServicesPage() {
    const { theme } = useTheme();
    const [iframeKey, setIframeKey] = React.useState(Date.now());
    const vueUrl = 'http://localhost:5174';

    function handleReload() {
        setIframeKey(Date.now());
    }

    React.useEffect(() => {
        const iframe = document.querySelector<HTMLIFrameElement>('.vue-embedded-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'THEME_CHANGE', theme }, '*');
        }
    }, [theme]);

    return (
        <div className="space-y-6 animate-liquid-in">
            <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Logística & Endereços</CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                                Consulta de CEP, logradouros, localização geográfica e calendário operacional.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReload}
                            className="gap-2 text-xs"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Recarregar
                        </Button>
                        <a
                            href={vueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 h-8 px-3 rounded-lg text-xs font-medium border border-border/80 bg-background/50 hover:bg-accent hover:text-accent-foreground backdrop-blur-sm transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Abrir em nova aba
                        </a>
                    </div>
                </div>
            </Card>

            {/* frame embutido ocupando a altura ideal */}
            <div className="glass-modal rounded-2xl overflow-hidden border border-border/80 shadow-xl">
                <iframe
                    key={iframeKey}
                    src={vueUrl}
                    title="Busca de Endereços BookStore"
                    className="vue-embedded-frame w-full h-[calc(100vh-250px)] min-h-[580px] border-0"
                    onLoad={e => {
                        const target = e.target as HTMLIFrameElement;
                        if (target && target.contentWindow) {
                            target.contentWindow.postMessage({ type: 'THEME_CHANGE', theme }, '*');
                        }
                    }}
                />
            </div>
        </div>
    );
}
