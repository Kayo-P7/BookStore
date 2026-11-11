import * as React from 'react';
import { Activity, Server, Database, Globe, Check, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { useScreenNotice } from '../../components/ui/screen-notice';
import { cn } from '../../components/ui/button';

interface ServicePing {
    status: 'idle' | 'online' | 'offline';
    time: string | null;
}

export function SettingsPage() {
    const [testing, setTesting] = React.useState(false);
    const { notice, isExiting, showNotice } = useScreenNotice();
    const [pings, setPings] = React.useState<Record<string, ServicePing>>({
        catalog: { status: 'idle', time: null },
        customer: { status: 'idle', time: null },
        sales: { status: 'idle', time: null },
        loan: { status: 'idle', time: null },
        vue: { status: 'idle', time: null }
    });

    async function testConnections() {
        setTesting(true);
        const results: Record<string, ServicePing> = {};

        async function ping(key: string, url: string) {
            const start = performance.now();
            try {
                const res = await fetch(url, { method: 'GET', cache: 'no-cache' });
                const elapsed = Math.round(performance.now() - start);
                results[key] = {
                    status: res.ok || res.status < 500 ? 'online' : 'offline',
                    time: `${elapsed}ms`
                };
            } catch {
                results[key] = { status: 'offline', time: 'falha' };
            }
        }

        await Promise.allSettled([
            ping('catalog', '/api/catalog/books'),
            ping('customer', '/api/customers'),
            ping('sales', '/api/sales'),
            ping('loan', '/api/loans'),
            ping('vue', 'http://localhost:5174')
        ]);

        const hasOffline = Object.values(results).some(r => r.status === 'offline');
        setPings(results);
        setTesting(false);
        if (hasOffline) {
            showNotice('Diagnóstico concluído (serviços offline detectados)', 'error');
        } else {
            showNotice('Diagnóstico de conectividade concluído', 'success');
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* aparencia e tema */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Aparência & Identidade Visual</CardTitle>
                    <CardDescription className="text-xs">
                        Design System minimalista no padrão Refero Dub com contraste limpo e paleta verde suave.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md p-4 rounded-xl border border-primary ring-1 ring-primary/25 bg-white text-left">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-sm text-[#171717]">Tema Claro (Dub Minimalist)</span>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                                Ativo Padrão
                            </span>
                        </div>
                        <p className="text-xs text-[#737373] leading-relaxed">
                            Fundo papel suave, cartões brancos sólidos, bordas hairline de 1px e verde floresta refinado. O tema escuro foi desativado temporariamente.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* diagnostico de conectividade */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Diagnóstico de Conectividade
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Tempo de resposta e integridade da comunicação com os microsserviços backend e módulo Vue.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {notice && (
                            <div
                                role="status"
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-2xs',
                                    notice.type === 'success'
                                        ? 'bg-emerald-50/90 text-[#059669] border-emerald-200/80'
                                        : 'bg-rose-50/90 text-[#e11d48] border-rose-200/80',
                                    isExiting ? 'notice-fade-out pointer-events-none' : 'notice-fade-in'
                                )}
                            >
                                {notice.type === 'success' ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                ) : (
                                    <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                )}
                                <span>{notice.message}</span>
                            </div>
                        )}

                        <Button
                            variant="default"
                            size="sm"
                            hoverLift
                            onClick={testConnections}
                            disabled={testing}
                            className="gap-2 shrink-0"
                        >
                            <Server className="w-3.5 h-3.5" />
                            {testing ? 'Testando...' : 'Testar Conexões Agora'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { key: 'catalog', name: 'Catalog Service', port: '8081', endpoint: '/api/catalog/books' },
                            { key: 'customer', name: 'Customer Service', port: '8082', endpoint: '/api/customers' },
                            { key: 'sales', name: 'Sales Service', port: '8083', endpoint: '/api/sales' },
                            { key: 'loan', name: 'Loan Service', port: '8085', endpoint: '/api/loans' },
                            { key: 'vue', name: 'Módulo Frontend Vue', port: '5174', endpoint: 'http://localhost:5174' }
                        ].map(srv => {
                            const ping = pings[srv.key];
                            return (
                                <div key={srv.key} className="p-4 rounded-2xl glass-card border border-border/80 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-foreground truncate">{srv.name}</span>
                                        <div className="inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-border/70 bg-muted/40">
                                            <span
                                                className={cn(
                                                    'capitalize',
                                                    ping.status === 'online'
                                                        ? 'text-emerald-700'
                                                        : ping.status === 'offline'
                                                        ? 'text-destructive'
                                                        : 'text-muted-foreground'
                                                )}
                                            >
                                                {ping.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-mono">Porta :{srv.port}</p>
                                    <div className="text-[11px] text-foreground font-semibold flex items-center justify-between pt-1 border-t border-border/40">
                                        <span className="text-muted-foreground font-normal">Latência:</span>
                                        <span className="font-mono">{ping.time || '--'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* tabela arquitetural de apis do sistema */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Arquitetura de Comunicação & Protocolos
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Especificação dos contratos de dados, endpoints e comunicação heterogênea do ecossistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>API / Serviço</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Origem / Porta</TableHead>
                                <TableHead>Protocolo / Formato</TableHead>
                                <TableHead>Finalidade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-foreground">Catálogo de Livros</TableCell>
                                <TableCell>
                                    <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                                        REST
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">catalog-service (:8081)</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">JSON / HTTP</TableCell>
                                <TableCell className="text-xs text-muted-foreground">Cadastro e inventário de títulos</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-foreground">Clientes & Endereços</TableCell>
                                <TableCell>
                                    <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                                        REST
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">customer-service (:8082)</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">JSON / HTTP</TableCell>
                                <TableCell className="text-xs text-muted-foreground">Cadastro e validação de clientes</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-foreground">Vendas & Histórico</TableCell>
                                <TableCell>
                                    <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                                        GraphQL (Não-REST)
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">sales-service (:8083)</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">GraphQL Schema</TableCell>
                                <TableCell className="text-xs text-muted-foreground">Consultas flexíveis e relatórios</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-foreground">Empréstimos & Devoluções</TableCell>
                                <TableCell>
                                    <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                                        REST + AMQP
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">loan-service (:8085)</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">JSON / HTTP & RabbitMQ</TableCell>
                                <TableCell className="text-xs text-muted-foreground">Controle de empréstimos e inventário</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-foreground">ViaCEP</TableCell>
                                <TableCell>
                                    <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                                        REST Pública
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">viacep.com.br</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">HTTPS / JSON</TableCell>
                                <TableCell className="text-xs text-muted-foreground">Preenchimento automático de endereço</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-semibold text-xs text-foreground">Nager.Date Feriados</TableCell>
                                <TableCell>
                                    <span className="inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-border/80 bg-muted/30 text-muted-foreground">
                                        REST Pública
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">date.nager.at</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">HTTPS / JSON</TableCell>
                                <TableCell className="text-xs text-muted-foreground">Calendário bancário no módulo Vue</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* informacoes de infraestrutura e ambiente */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Infraestrutura & Persistência
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Bases de dados relacionais e variáveis de ambiente ativas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-1">
                            <span className="text-[11px] font-mono text-muted-foreground uppercase">Banco Catalog</span>
                            <p className="text-sm font-bold text-foreground font-mono">catalog_db</p>
                            <p className="text-xs text-muted-foreground">PostgreSQL 16 (:5432)</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-1">
                            <span className="text-[11px] font-mono text-muted-foreground uppercase">Banco Customer</span>
                            <p className="text-sm font-bold text-foreground font-mono">customer_db</p>
                            <p className="text-xs text-muted-foreground">PostgreSQL 16 (:5432)</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-1">
                            <span className="text-[11px] font-mono text-muted-foreground uppercase">Banco Sales</span>
                            <p className="text-sm font-bold text-foreground font-mono">sales_db</p>
                            <p className="text-xs text-muted-foreground">PostgreSQL 16 (:5432)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
