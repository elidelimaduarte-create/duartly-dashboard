import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import ConvitePage from './ConvitePage';
import AdminPage from './AdminPage';
import ObrigadoPage from './ObrigadoPage';
import ImportarPage from './ImportarPage';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const tokens = {
  bg:        '#0f0f1a',
  bgCard:    '#1a1a2e',
  bgCardAlt: '#16213e',
  accent:    '#4ade80',
  accentSoft:'#22c55e',
  danger:    '#f87171',
  warning:   '#fbbf24',
  text:      '#f0fdf4',
  textMuted: '#6b7280',
  textSub:   '#9ca3af',
  border:    '#1f2937',
};

const CATEGORIA_CORES = [
  '#4ade80','#34d399','#60a5fa','#f472b6',
  '#fbbf24','#a78bfa','#fb923c','#38bdf8',
  '#e879f9','#84cc16','#f87171','#94a3b8',
];

const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${tokens.bg}; color: ${tokens.text}; font-family: 'Space Grotesk', sans-serif; min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${tokens.bg}; }
  ::-webkit-scrollbar-thumb { background: ${tokens.border}; border-radius: 2px; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
`;

function formatBRL(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatData(dataStr) {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}`;
}

function getMesAtual() {
  const agora = new Date();
  return {
    mes: agora.getMonth() + 1,
    ano: agora.getFullYear(),
    inicio: `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`,
    fim: new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split('T')[0],
    nome: agora.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  };
}

function getToken() {
  // Tenta via query param: ?token=xxx
  const params = new URLSearchParams(window.location.search);
  const tokenParam = params.get('token');
  if (tokenParam) return tokenParam;
  // Fallback via pathname: /abc123
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: tokens.bgCard, border: `1px solid ${tokens.border}`,
      borderRadius: 16, padding: '20px 24px', ...style
    }}>
      {children}
    </div>
  );
}

function Badge({ children, color = tokens.accent }) {
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}44`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
      letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'Space Mono, monospace',
    }}>
      {children}
    </span>
  );
}

function Stat({ label, value, sub, color = tokens.text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, color, fontFamily: 'Space Mono, monospace' }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: tokens.textSub }}>{sub}</span>}
    </div>
  );
}

function AgentCard({ nome, emoji, tipo, mensagem, cor }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${cor}11, ${tokens.bgCard})`,
      border: `1px solid ${cor}33`, borderRadius: 16, padding: '16px 20px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: `${cor}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, color: cor }}>{nome}</span>
          <Badge color={cor}>{tipo}</Badge>
        </div>
        <p style={{ fontSize: 13, color: tokens.textSub, lineHeight: 1.5 }}>{mensagem}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: tokens.bgCardAlt, border: `1px solid ${tokens.border}`,
      borderRadius: 8, padding: '8px 12px', fontSize: 13,
    }}>
      <p style={{ color: tokens.textSub, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || tokens.accent, fontWeight: 600 }}>{formatBRL(p.value)}</p>
      ))}
    </div>
  );
}

function TelaInvalida() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24,
    }}>
      <div style={{ fontSize: 64 }}>🦙</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>Link invalido ou expirado</h1>
      <p style={{ color: tokens.textSub, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        Este link de dashboard expirou ou e invalido.<br />
        Gere um novo link no bot com /dashboard
      </p>
      <div style={{
        background: tokens.bgCard, border: `1px solid ${tokens.border}`,
        borderRadius: 12, padding: '12px 20px',
        fontFamily: 'Space Mono, monospace', color: tokens.accent, fontSize: 14,
      }}>/dashboard</div>
    </div>
  );
}

function TelaLoading() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 48, animation: 'pulse 1.5s infinite' }}>🦙</div>
      <p style={{ color: tokens.textSub }}>Carregando seu dashboard...</p>
    </div>
  );
}

export default function App() {
  // Roteamento simples
  const path = window.location.pathname;
  const isConvite = path === '/convite' || path.startsWith('/c/') || new URLSearchParams(window.location.search).has('codigo');
  if (isConvite) return <ConvitePage />;
  const isAdmin = path === '/admin' || path.startsWith('/admin');
  if (isAdmin) return <AdminPage />;
  const isObrigado = path === '/obrigado';
  if (isObrigado) return <ObrigadoPage />;
  const isImportar = path === '/importar';
  if (isImportar) return <ImportarPage />;

  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    validarECarregar(token);
  }, [token]);

  async function validarECarregar(token) {
    try {
      const { data: tokenData, error } = await supabase
        .from('tokens_dashboard')
        .select('*, usuarios(*)')
        .eq('token', token)
        .eq('ativo', true)
        .gte('expira_em', new Date().toISOString())
        .single();

      if (error || !tokenData) {
        console.error('Token invalido:', error);
        setTokenValido(false);
        setLoading(false);
        return;
      }

      setTokenValido(true);
      await carregarDados(tokenData.usuario_id, tokenData.usuarios);
    } catch (err) {
      console.error('Erro:', err);
      setTokenValido(false);
    } finally {
      setLoading(false);
    }
  }

  async function carregarDados(usuarioId, usuario) {
    const { inicio, fim, nome: nomeMes } = getMesAtual();

    const { data: transacoes } = await supabase
      .from('transacoes')
      .select('*, categorias(nome, emoji)')
      .eq('usuario_id', usuarioId)
      .eq('cancelado', false)
      .gte('data_transacao', inicio)
      .lte('data_transacao', fim)
      .order('data_transacao', { ascending: false });

    const hoje = new Date().toISOString().split('T')[0];
    const { data: parcelas } = await supabase
      .from('transacoes')
      .select('*, categorias(nome, emoji)')
      .eq('usuario_id', usuarioId)
      .eq('cancelado', false)
      .eq('parcelado', true)
      .gte('data_transacao', hoje)
      .order('data_transacao', { ascending: true });

    const seisAtras = new Date();
    seisAtras.setMonth(seisAtras.getMonth() - 5);
    const { data: historico } = await supabase
      .from('transacoes')
      .select('valor, tipo, data_transacao')
      .eq('usuario_id', usuarioId)
      .eq('cancelado', false)
      .gte('data_transacao', seisAtras.toISOString().split('T')[0]);

    setDados({ transacoes: transacoes || [], parcelas: parcelas || [], historico: historico || [], usuario, nomeMes });
  }

  if (loading) return <><style>{globalStyle}</style><TelaLoading /></>;
  if (!tokenValido || !dados) return <><style>{globalStyle}</style><TelaInvalida /></>;

  const { transacoes, parcelas, historico, usuario, nomeMes } = dados;

  const gastos = transacoes.filter(t => t.tipo === 'gasto');
  const receitas = transacoes.filter(t => t.tipo === 'receita');
  const totalGastos = gastos.reduce((a, t) => a + parseFloat(t.valor), 0);
  const totalReceitas = receitas.reduce((a, t) => a + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalGastos;
  const totalParcelas = parcelas.reduce((a, p) => a + parseFloat(p.valor), 0);

  const porCategoria = {};
  gastos.forEach(t => {
    const cat = t.categorias?.nome || 'Outros';
    const emoji = t.categorias?.emoji || '📌';
    if (!porCategoria[cat]) porCategoria[cat] = { nome: cat, emoji, total: 0 };
    porCategoria[cat].total += parseFloat(t.valor);
  });
  const dadosPizza = Object.values(porCategoria).sort((a, b) => b.total - a.total).slice(0, 8);

  const dadosHistoricoMap = {};
  historico.forEach(t => {
    const [ano, mes] = t.data_transacao.split('-');
    const chave = `${mes}/${ano.slice(2)}`;
    if (!dadosHistoricoMap[chave]) dadosHistoricoMap[chave] = { mes: chave, gastos: 0, receitas: 0 };
    if (t.tipo === 'gasto') dadosHistoricoMap[chave].gastos += parseFloat(t.valor);
    else dadosHistoricoMap[chave].receitas += parseFloat(t.valor);
  });
  const dadosArea = Object.values(dadosHistoricoMap).slice(-6);

  const maiorCategoria = dadosPizza[0];
  const diasNoMes = new Date().getDate();

  return (
    <>
      <style>{globalStyle}</style>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${tokens.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🦙</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>Duartly</h1>
              <p style={{ fontSize: 12, color: tokens.textSub }}>Ola, {usuario?.nome || 'usuario'} · {nomeMes}</p>
            </div>
          </div>
          <Badge color={tokens.accent}>Dashboard</Badge>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card><Stat label="Saldo do mes" value={formatBRL(saldo)} color={saldo >= 0 ? tokens.accent : tokens.danger} sub={nomeMes} /></Card>
          <Card><Stat label="Total gasto" value={formatBRL(totalGastos)} color={tokens.danger} sub={`${gastos.length} lancamentos`} /></Card>
          <Card><Stat label="Receitas" value={formatBRL(totalReceitas)} color={tokens.accent} sub={`${receitas.length} entradas`} /></Card>
          <Card><Stat label="Parcelas ativas" value={formatBRL(totalParcelas)} color={tokens.warning} sub={`${parcelas.length} pendentes`} /></Card>
        </div>

        {/* HISTÓRICO */}
        {dadosArea.length > 0 && (
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Historico 6 meses</h2>
              <Badge color={tokens.accentSoft}>Evolucao</Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dadosArea}>
                <defs>
                  <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.danger} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={tokens.danger} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tokens.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={tokens.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fill: tokens.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: tokens.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="gastos" stroke={tokens.danger} fill="url(#gGastos)" strokeWidth={2} name="Gastos" />
                <Area type="monotone" dataKey="receitas" stroke={tokens.accent} fill="url(#gReceitas)" strokeWidth={2} name="Receitas" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* PIZZA + BARRAS */}
        {dadosPizza.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Por categoria</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={dadosPizza} dataKey="total" nameKey="nome" cx="50%" cy="50%" outerRadius={70} strokeWidth={0}>
                    {dadosPizza.map((_, i) => <Cell key={i} fill={CATEGORIA_CORES[i % CATEGORIA_CORES.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatBRL(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 8 }}>
                {dadosPizza.slice(0, 5).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORIA_CORES[i] }} />
                    <span style={{ color: tokens.textSub }}>{cat.emoji} {cat.nome}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top gastos</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dadosPizza.slice(0, 5)} layout="vertical">
                  <XAxis type="number" tick={{ fill: tokens.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                  <YAxis type="category" dataKey="nome" tick={{ fill: tokens.textSub, fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip formatter={(v) => formatBRL(v)} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                    {dadosPizza.slice(0, 5).map((_, i) => <Cell key={i} fill={CATEGORIA_CORES[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* AGENTES */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Agentes Duartly</h2>
            <Badge color={tokens.warning}>IA</Badge>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AgentCard nome="Cuzco" emoji="🦙" tipo="Diario" cor="#60a5fa"
              mensagem={maiorCategoria
                ? `Seu maior gasto este mes foi em ${maiorCategoria.emoji} ${maiorCategoria.nome}: ${formatBRL(maiorCategoria.total)}. Fique de olho!`
                : 'Nenhum gasto registrado ainda este mes. Me manda um gasto no bot!'}
            />
            <AgentCard nome="Luna" emoji="🌙" tipo="Quinzenal" cor="#a78bfa"
              mensagem={totalGastos > 0
                ? `Media diaria de gastos: ${formatBRL(totalGastos / diasNoMes)}. ${totalGastos > totalReceitas ? 'Atencao: gastos acima das receitas!' : 'Bom ritmo financeiro!'}`
                : 'Registre seus gastos para eu analisar as tendencias quinzenais.'}
            />
            <AgentCard nome="Inti" emoji="☀️" tipo="Mensal" cor="#fbbf24"
              mensagem={totalGastos > 0
                ? `No ritmo atual, voce deve gastar ${formatBRL(totalGastos / diasNoMes * 30)} este mes. Saldo projetado: ${formatBRL(totalReceitas - (totalGastos / diasNoMes * 30))}.`
                : 'Aguardando dados suficientes para projecao mensal.'}
            />
          </div>
        </Card>

        {/* ÚLTIMAS TRANSAÇÕES */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Ultimas transacoes</h2>
            <span style={{ fontSize: 12, color: tokens.textSub }}>{transacoes.length} este mes</span>
          </div>
          {transacoes.length === 0 && (
            <p style={{ color: tokens.textSub, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Nenhuma transacao este mes ainda.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {transacoes.slice(0, 10).map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < Math.min(transacoes.length, 10) - 1 ? `1px solid ${tokens.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: t.tipo === 'receita' ? `${tokens.accent}22` : `${tokens.danger}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{t.categorias?.emoji || '📌'}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{t.descricao}</p>
                    <p style={{ fontSize: 11, color: tokens.textSub }}>{t.categorias?.nome || 'Outros'} · {formatData(t.data_transacao)}</p>
                  </div>
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 700, fontFamily: 'Space Mono, monospace',
                  color: t.tipo === 'receita' ? tokens.accent : tokens.danger,
                }}>
                  {t.tipo === 'receita' ? '+' : '-'}{formatBRL(parseFloat(t.valor))}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* PARCELAS */}
        {parcelas.length > 0 && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600 }}>Parcelas ativas</h2>
              <Badge color={tokens.warning}>💳 {parcelas.length} pendentes</Badge>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {parcelas.slice(0, 8).map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < Math.min(parcelas.length, 8) - 1 ? `1px solid ${tokens.border}` : 'none',
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{p.descricao}</p>
                    <p style={{ fontSize: 11, color: tokens.textSub }}>Vence em {formatData(p.data_transacao)}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: tokens.warning }}>
                    {formatBRL(parseFloat(p.valor))}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div style={{ textAlign: 'center', marginTop: 40, color: tokens.textMuted, fontSize: 12 }}>
          🦙 Duartly · Sua lhama financeira pessoal
        </div>
      </div>
    </>
  );
}
