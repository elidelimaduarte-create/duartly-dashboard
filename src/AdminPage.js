import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const tokens = {
  bg:      '#0f0f1a',
  bgCard:  '#1a1a2e',
  accent:  '#4ade80',
  danger:  '#f87171',
  warning: '#fbbf24',
  text:    '#f0fdf4',
  muted:   '#6b7280',
  sub:     '#9ca3af',
  border:  '#1f2937',
};

const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${tokens.bg}; color: ${tokens.text}; font-family: 'Space Grotesk', sans-serif; min-height: 100vh; }
  input, select { outline: none; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
`;

function formatBRL(v) {
  return `R$ ${parseFloat(v || 0).toFixed(2).replace('.', ',')}`;
}

function formatData(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function diasRestantes(dataStr) {
  if (!dataStr) return null;
  const diff = new Date(dataStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function Badge({ children, cor }) {
  const cores = {
    verde:    { bg: '#22c55e22', text: '#22c55e', border: '#22c55e44' },
    vermelho: { bg: '#ef444422', text: '#ef4444', border: '#ef444444' },
    amarelo:  { bg: '#fbbf2422', text: '#fbbf24', border: '#fbbf2444' },
    cinza:    { bg: '#6b728022', text: '#6b7280', border: '#6b728044' },
  };
  const c = cores[cor] || cores.cinza;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
}

function StatusBadge({ usuario }) {
  const agora = new Date();
  const plano = usuario.plano;

  if (plano === 'ativo' && usuario.assinatura_ativa_ate) {
    const dias = diasRestantes(usuario.assinatura_ativa_ate);
    if (dias > 0) return <Badge cor="verde">Ativo · {dias}d</Badge>;
    return <Badge cor="vermelho">Expirado</Badge>;
  }
  if (plano === 'trial' && usuario.trial_expira_em) {
    const dias = diasRestantes(usuario.trial_expira_em);
    if (dias > 0) return <Badge cor="amarelo">Trial · {dias}d</Badge>;
    return <Badge cor="vermelho">Trial expirado</Badge>;
  }
  return <Badge cor="cinza">{plano || 'sem plano'}</Badge>;
}

// ============================================================
// TELA DE LOGIN
// ============================================================
function TelaLogin({ onLogin }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  function tentar() {
    if (senha === process.env.REACT_APP_ADMIN_PASSWORD) {
      onLogin();
    } else {
      setErro(true);
      setTimeout(() => setErro(false), 2000);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24
    }}>
      <div style={{ fontSize: 48 }}>🦙</div>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Duartly Admin</h1>
      <div style={{
        background: tokens.bgCard, border: `1px solid ${tokens.border}`,
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 320
      }}>
        <p style={{ color: tokens.sub, fontSize: 13, marginBottom: 16 }}>Digite a senha de administrador:</p>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tentar()}
          placeholder="Senha"
          style={{
            width: '100%', background: tokens.bg, border: `1px solid ${erro ? tokens.danger : tokens.border}`,
            borderRadius: 10, padding: '10px 14px', color: tokens.text,
            fontSize: 14, marginBottom: 12, transition: 'border 0.2s'
          }}
        />
        <button
          onClick={tentar}
          style={{
            width: '100%', background: tokens.accent, color: '#000',
            border: 'none', borderRadius: 10, padding: '12px',
            fontWeight: 700, fontSize: 14, cursor: 'pointer'
          }}
        >
          Entrar
        </button>
        {erro && <p style={{ color: tokens.danger, fontSize: 12, marginTop: 8, textAlign: 'center' }}>Senha incorreta</p>}
      </div>
    </div>
  );
}

// ============================================================
// MODAL DE AÇÕES DO USUÁRIO
// ============================================================
function ModalUsuario({ usuario, onClose, onAtualizar }) {
  const [dias, setDias] = useState(30);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function adicionarDias() {
    setCarregando(true);
    try {
      const agora = new Date();
      const base = usuario.assinatura_ativa_ate && new Date(usuario.assinatura_ativa_ate) > agora
        ? new Date(usuario.assinatura_ativa_ate)
        : usuario.trial_expira_em && new Date(usuario.trial_expira_em) > agora
        ? new Date(usuario.trial_expira_em)
        : agora;

      const nova = new Date(base);
      nova.setDate(nova.getDate() + parseInt(dias));

      const campo = usuario.plano === 'ativo' ? 'assinatura_ativa_ate' : 'trial_expira_em';
      await supabase.from('usuarios').update({
        [campo]: nova.toISOString(),
        plano: usuario.plano === 'expirado' ? 'trial' : usuario.plano
      }).eq('id', usuario.id);

      setMensagem(`✅ +${dias} dias adicionados! Novo prazo: ${nova.toLocaleDateString('pt-BR')}`);
      onAtualizar();
    } catch (err) {
      setMensagem('❌ Erro ao adicionar dias');
    }
    setCarregando(false);
  }

  async function ativarManual() {
    setCarregando(true);
    try {
      const nova = new Date();
      nova.setMonth(nova.getMonth() + 1);
      await supabase.from('usuarios').update({
        plano: 'ativo',
        assinatura_ativa_ate: nova.toISOString()
      }).eq('id', usuario.id);

      await supabase.from('assinaturas').insert({
        usuario_id: usuario.id,
        mp_payment_id: `manual_${Date.now()}`,
        status: 'active',
        valor: 14.90,
        periodo_inicio: new Date().toISOString(),
        periodo_fim: nova.toISOString()
      });

      setMensagem(`✅ Assinatura ativada manualmente por 30 dias!`);
      onAtualizar();
    } catch (err) {
      setMensagem('❌ Erro ao ativar');
    }
    setCarregando(false);
  }

  async function bloquearAcesso() {
    if (!window.confirm(`Bloquear ${usuario.nome}?`)) return;
    setCarregando(true);
    try {
      await supabase.from('usuarios').update({ plano: 'expirado', ativo: false }).eq('id', usuario.id);
      setMensagem('✅ Acesso bloqueado!');
      onAtualizar();
    } catch (err) {
      setMensagem('❌ Erro ao bloquear');
    }
    setCarregando(false);
  }

  async function reativarAcesso() {
    setCarregando(true);
    try {
      const nova = new Date();
      nova.setDate(nova.getDate() + 7);
      await supabase.from('usuarios').update({
        plano: 'trial',
        trial_expira_em: nova.toISOString(),
        ativo: true
      }).eq('id', usuario.id);
      setMensagem('✅ Acesso reativado com 7 dias!');
      onAtualizar();
    } catch (err) {
      setMensagem('❌ Erro ao reativar');
    }
    setCarregando(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20
    }}>
      <div style={{
        background: tokens.bgCard, border: `1px solid ${tokens.border}`,
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 420,
        animation: 'fadeIn 0.2s ease'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{usuario.nome || 'Sem nome'}</h3>
            <p style={{ fontSize: 12, color: tokens.sub }}>@{usuario.username || usuario.telegram_id}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: tokens.sub, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Info */}
        <div style={{ background: tokens.bg, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: tokens.sub, fontSize: 12 }}>Status atual</span>
            <StatusBadge usuario={usuario} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: tokens.sub, fontSize: 12 }}>Trial expira</span>
            <span style={{ fontSize: 12 }}>{formatData(usuario.trial_expira_em)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: tokens.sub, fontSize: 12 }}>Assinatura ate</span>
            <span style={{ fontSize: 12 }}>{formatData(usuario.assinatura_ativa_ate)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: tokens.sub, fontSize: 12 }}>Codigo convite</span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: tokens.accent }}>{usuario.codigo_convite || '—'}</span>
          </div>
        </div>

        {/* Adicionar dias */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: tokens.sub, marginBottom: 8 }}>Adicionar dias de acesso:</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={dias}
              onChange={e => setDias(e.target.value)}
              style={{
                flex: 1, background: tokens.bg, border: `1px solid ${tokens.border}`,
                borderRadius: 10, padding: '8px 12px', color: tokens.text, fontSize: 13
              }}
            >
              <option value={7}>+ 7 dias</option>
              <option value={14}>+ 14 dias</option>
              <option value={30}>+ 30 dias</option>
              <option value={60}>+ 60 dias</option>
              <option value={90}>+ 90 dias</option>
              <option value={365}>+ 1 ano</option>
            </select>
            <button
              onClick={adicionarDias}
              disabled={carregando}
              style={{
                background: tokens.accent, color: '#000', border: 'none',
                borderRadius: 10, padding: '8px 16px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer'
              }}
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={ativarManual}
            disabled={carregando}
            style={{
              background: '#22c55e22', color: tokens.accent, border: `1px solid #22c55e44`,
              borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            ✅ Ativar assinatura manual (30 dias)
          </button>

          {usuario.ativo !== false ? (
            <button
              onClick={bloquearAcesso}
              disabled={carregando}
              style={{
                background: '#ef444422', color: tokens.danger, border: `1px solid #ef444444`,
                borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}
            >
              🚫 Bloquear acesso
            </button>
          ) : (
            <button
              onClick={reativarAcesso}
              disabled={carregando}
              style={{
                background: '#fbbf2422', color: tokens.warning, border: `1px solid #fbbf2444`,
                borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}
            >
              ▶️ Reativar acesso
            </button>
          )}
        </div>

        {mensagem && (
          <div style={{
            marginTop: 12, background: tokens.bg, borderRadius: 10,
            padding: '10px 14px', fontSize: 13, color: tokens.accent, textAlign: 'center'
          }}>
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAINEL ADMIN PRINCIPAL
// ============================================================
export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('todos');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  useEffect(() => {
    if (autenticado) carregarDados();
  }, [autenticado]);

  async function carregarDados() {
    setLoading(true);
    const [{ data: u }, { data: a }] = await Promise.all([
      supabase.from('usuarios').select('*').order('criado_em', { ascending: false }),
      supabase.from('assinaturas').select('*').order('criado_em', { ascending: false })
    ]);
    setUsuarios(u || []);
    setAssinaturas(a || []);
    setLoading(false);
  }

  if (!autenticado) return (
    <>
      <style>{globalStyle}</style>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet" />
      <TelaLogin onLogin={() => setAutenticado(true)} />
    </>
  );

  // Stats
  const agora = new Date();
  const totalUsuarios = usuarios.length;
  const emTrial = usuarios.filter(u => u.plano === 'trial' && u.trial_expira_em && new Date(u.trial_expira_em) > agora).length;
  const ativos = usuarios.filter(u => u.plano === 'ativo' && u.assinatura_ativa_ate && new Date(u.assinatura_ativa_ate) > agora).length;
  const expirados = usuarios.filter(u => u.plano === 'expirado' || (!u.trial_expira_em && !u.assinatura_ativa_ate)).length;
  const receitaMes = assinaturas
    .filter(a => a.status === 'active' && new Date(a.criado_em).getMonth() === agora.getMonth())
    .reduce((acc, a) => acc + parseFloat(a.valor || 0), 0);

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusca = !busca ||
      (u.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(busca.toLowerCase()) ||
      (u.codigo_convite || '').toLowerCase().includes(busca.toLowerCase()) ||
      String(u.telegram_id).includes(busca);

    const matchPlano = filtroPlano === 'todos' ||
      (filtroPlano === 'trial' && u.plano === 'trial') ||
      (filtroPlano === 'ativo' && u.plano === 'ativo') ||
      (filtroPlano === 'expirado' && (u.plano === 'expirado' || u.ativo === false));

    return matchBusca && matchPlano;
  });

  return (
    <>
      <style>{globalStyle}</style>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>🦙</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700 }}>Duartly Admin</h1>
              <p style={{ fontSize: 11, color: tokens.sub }}>Painel de controle</p>
            </div>
          </div>
          <button
            onClick={carregarDados}
            style={{
              background: tokens.bgCard, border: `1px solid ${tokens.border}`,
              borderRadius: 10, padding: '8px 14px', color: tokens.sub,
              fontSize: 12, cursor: 'pointer'
            }}
          >
            🔄 Atualizar
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total usuários', valor: totalUsuarios, cor: tokens.text },
            { label: 'Em trial', valor: emTrial, cor: tokens.warning },
            { label: 'Ativos', valor: ativos, cor: tokens.accent },
            { label: 'Expirados', valor: expirados, cor: tokens.danger },
            { label: 'Receita do mês', valor: formatBRL(receitaMes), cor: tokens.accent },
          ].map((s, i) => (
            <div key={i} style={{
              background: tokens.bgCard, border: `1px solid ${tokens.border}`,
              borderRadius: 12, padding: '14px 16px'
            }}>
              <p style={{ fontSize: 10, color: tokens.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.cor, fontFamily: 'Space Mono, monospace' }}>{s.valor}</p>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, @username ou código..."
            style={{
              flex: 1, minWidth: 200, background: tokens.bgCard,
              border: `1px solid ${tokens.border}`, borderRadius: 10,
              padding: '9px 14px', color: tokens.text, fontSize: 13
            }}
          />
          <select
            value={filtroPlano}
            onChange={e => setFiltroPlano(e.target.value)}
            style={{
              background: tokens.bgCard, border: `1px solid ${tokens.border}`,
              borderRadius: 10, padding: '9px 14px', color: tokens.text, fontSize: 13
            }}
          >
            <option value="todos">Todos</option>
            <option value="trial">Trial</option>
            <option value="ativo">Ativos</option>
            <option value="expirado">Expirados</option>
          </select>
        </div>

        {/* TABELA */}
        <div style={{ background: tokens.bgCard, border: `1px solid ${tokens.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {/* Cabeçalho */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 110px 100px 80px',
            padding: '10px 16px', borderBottom: `1px solid ${tokens.border}`,
            fontSize: 10, color: tokens.sub, textTransform: 'uppercase', letterSpacing: 1
          }}>
            <span>Usuário</span>
            <span>Status</span>
            <span>Expira em</span>
            <span>Código</span>
            <span>Ação</span>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: tokens.sub }}>Carregando...</div>
          ) : usuariosFiltrados.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: tokens.sub }}>Nenhum usuário encontrado</div>
          ) : (
            usuariosFiltrados.map((u, i) => {
              const expira = u.plano === 'ativo' ? u.assinatura_ativa_ate : u.trial_expira_em;
              const dias = expira ? diasRestantes(expira) : null;

              return (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 110px 100px 80px',
                  padding: '12px 16px',
                  borderBottom: i < usuariosFiltrados.length - 1 ? `1px solid ${tokens.border}` : 'none',
                  alignItems: 'center',
                  background: i % 2 === 0 ? 'transparent' : '#ffffff04'
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{u.nome || 'Sem nome'}</p>
                    <p style={{ fontSize: 11, color: tokens.sub }}>
                      {u.username ? `@${u.username}` : `ID: ${u.telegram_id}`}
                    </p>
                  </div>
                  <div><StatusBadge usuario={u} /></div>
                  <div>
                    <p style={{ fontSize: 12 }}>{expira ? formatData(expira) : '—'}</p>
                    {dias !== null && (
                      <p style={{ fontSize: 10, color: dias > 0 ? tokens.sub : tokens.danger }}>
                        {dias > 0 ? `${dias} dias` : 'Expirado'}
                      </p>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: tokens.accent }}>
                      {u.codigo_convite || '—'}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => setUsuarioSelecionado(u)}
                      style={{
                        background: `${tokens.accent}22`, color: tokens.accent,
                        border: `1px solid ${tokens.accent}44`, borderRadius: 8,
                        padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p style={{ textAlign: 'center', color: tokens.muted, fontSize: 11, marginTop: 24 }}>
          {usuariosFiltrados.length} de {totalUsuarios} usuarios · 🦙 Duartly Admin
        </p>
      </div>

      {usuarioSelecionado && (
        <ModalUsuario
          usuario={usuarioSelecionado}
          onClose={() => setUsuarioSelecionado(null)}
          onAtualizar={() => {
            carregarDados();
            setUsuarioSelecionado(null);
          }}
        />
      )}
    </>
  );
}
