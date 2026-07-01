import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const C = {
  bg:     '#0f0f1a',
  card:   '#1a1a2e',
  card2:  '#12121e',
  accent: '#4ade80',
  text:   '#f0fdf4',
  sub:    '#9ca3af',
  border: '#1f2937',
  danger: '#f87171',
  warn:   '#fbbf24',
};

const G = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; min-height: 100vh; }
  input, select { outline: none; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .row:hover { background: #ffffff06 !important; }
`;

const CATEGORIAS = [
  'Alimentacao','Transporte','Moradia','Saude','Lazer',
  'Educacao','Vestuario','Mercado','Delivery','Assinaturas',
  'Investimentos','Outros'
];

const rowVazio = () => ({
  id: Math.random().toString(36).substr(2,9),
  descricao: '',
  valorParcela: '',
  totalParcelas: '',
  parcelasRestantes: '',
  categoria: 'Outros',
  diaVencimento: '',
});

export default function ImportarPage() {
  const [token, setToken] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [rows, setRows] = useState([rowVazio(), rowVazio(), rowVazio()]);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  // Pegar token da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
      validarToken(t);
    }
  }, []);

  async function validarToken(t) {
    const { data } = await supabase
      .from('tokens_dashboard')
      .select('usuario_id, expira_em, ativo')
      .eq('token', t).single();

    if (!data || !data.ativo || new Date(data.expira_em) < new Date()) {
      setErro('Link invalido ou expirado. Use /dashboard no bot para gerar um novo.');
      return;
    }
    setUsuarioId(data.usuario_id);

    // Buscar categorias
    const { data: cats } = await supabase
      .from('categorias').select('id, nome')
      .or(`usuario_id.eq.${data.usuario_id},padrao.eq.true`)
      .eq('ativo', true).order('nome');
    if (cats) setCategorias(cats);
  }

  function atualizarRow(id, campo, valor) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [campo]: valor } : r));
  }

  function adicionarRow() {
    setRows(prev => [...prev, rowVazio()]);
  }

  function removerRow(id) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function getDataBrasilia() {
    return new Date(Date.now() - 3 * 60 * 60 * 1000);
  }

  async function importar() {
    if (!usuarioId) { setErro('Sessao invalida.'); return; }

    const validas = rows.filter(r => r.descricao && r.valorParcela && r.totalParcelas && r.parcelasRestantes);
    if (validas.length === 0) {
      setErro('Preencha pelo menos um parcelamento completo.');
      return;
    }

    setSalvando(true);
    setErro('');
    let sucesso = 0, falha = 0;

    for (const row of validas) {
      try {
        const valorParcela = parseFloat(row.valorParcela.replace(',', '.'));
        const totalParcelas = parseInt(row.totalParcelas);
        const parcelasRestantes = parseInt(row.parcelasRestantes);
        const parcelasJaPagas = totalParcelas - parcelasRestantes;
        const diaVenc = parseInt(row.diaVencimento) || 10;

        // Buscar categoria
        const catMatch = categorias.find(c =>
          c.nome.toLowerCase() === row.categoria.toLowerCase()
        );
        const categoriaId = catMatch?.id || null;

        const grupoParcela = crypto.randomUUID ? crypto.randomUUID() :
          Math.random().toString(36).substr(2,9) + Date.now();

        const hoje = getDataBrasilia();
        const transacoes = [];

        for (let i = 0; i < parcelasRestantes; i++) {
          const dataVenc = new Date(hoje.getFullYear(), hoje.getMonth() + i, diaVenc);
          const parcelaNum = parcelasJaPagas + i + 1;

          transacoes.push({
            usuario_id:     usuarioId,
            categoria_id:   categoriaId,
            descricao:      `${row.descricao} (${parcelaNum}/${totalParcelas})`,
            valor:          valorParcela,
            tipo:           'gasto',
            origem:         'importacao',
            parcelado:      true,
            parcela_atual:  parcelaNum,
            total_parcelas: totalParcelas,
            grupo_parcela:  grupoParcela,
            data_transacao: dataVenc.toISOString().split('T')[0],
            cancelado:      false,
          });
        }

        const { error } = await supabase.from('transacoes').insert(transacoes);
        if (error) throw error;
        sucesso++;
      } catch (e) {
        console.error(e);
        falha++;
      }
    }

    setSalvando(false);
    setResultado({ sucesso, falha });
    if (sucesso > 0) {
      setRows([rowVazio(), rowVazio(), rowVazio()]);
    }
  }

  const inputStyle = {
    background: C.card2, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '7px 10px', color: C.text,
    fontSize: 13, width: '100%',
  };

  const selectStyle = {
    ...inputStyle, cursor: 'pointer',
  };

  if (erro && !usuarioId) {
    return (
      <>
        <style>{G}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 32, maxWidth: 400, textAlign: 'center', border: `1px solid ${C.danger}40` }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <p style={{ color: C.danger, fontSize: 14 }}>{erro}</p>
          </div>
        </div>
      </>
    );
  }

  if (!usuarioId) {
    return (
      <>
        <style>{G}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: C.sub }}>Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{G}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>🦙</span>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Importar Parcelamentos</h1>
          </div>
          <p style={{ color: C.sub, fontSize: 13 }}>
            Preencha os parcelamentos que voce ja possui. Informe apenas as parcelas que ainda faltam pagar.
          </p>
        </div>

        {/* RESULTADO */}
        {resultado && (
          <div style={{
            background: resultado.sucesso > 0 ? `${C.accent}18` : `${C.danger}18`,
            border: `1px solid ${resultado.sucesso > 0 ? C.accent : C.danger}40`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 20
          }}>
            {resultado.sucesso > 0 && (
              <p style={{ color: C.accent, fontSize: 14, fontWeight: 600 }}>
                ✅ {resultado.sucesso} parcelamento(s) importado(s) com sucesso!
              </p>
            )}
            {resultado.falha > 0 && (
              <p style={{ color: C.danger, fontSize: 13, marginTop: 4 }}>
                ❌ {resultado.falha} parcelamento(s) com erro.
              </p>
            )}
            <p style={{ color: C.sub, fontSize: 12, marginTop: 6 }}>
              Use /parcelas no bot para confirmar.
            </p>
          </div>
        )}

        {/* TABELA */}
        <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>

          {/* Cabeçalho */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr 40px',
            gap: 8, padding: '10px 14px',
            background: C.card2, borderBottom: `1px solid ${C.border}`,
            fontSize: 10, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700
          }}>
            <span>Descricao</span>
            <span>Vlr/Parcela</span>
            <span>Total Parc.</span>
            <span>Restantes</span>
            <span>Categoria</span>
            <span>Dia Venc.</span>
            <span></span>
          </div>

          {/* Linhas */}
          {rows.map((row, i) => (
            <div key={row.id} className="row" style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr 40px',
              gap: 8, padding: '10px 14px',
              borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none',
              alignItems: 'center',
            }}>
              <input
                value={row.descricao}
                onChange={e => atualizarRow(row.id, 'descricao', e.target.value)}
                placeholder="Ex: Nike, TikTok..."
                style={inputStyle}
              />
              <input
                value={row.valorParcela}
                onChange={e => atualizarRow(row.id, 'valorParcela', e.target.value)}
                placeholder="51,05"
                style={inputStyle}
                type="text"
                inputMode="decimal"
              />
              <input
                value={row.totalParcelas}
                onChange={e => atualizarRow(row.id, 'totalParcelas', e.target.value)}
                placeholder="12"
                style={inputStyle}
                type="number" min="1"
              />
              <input
                value={row.parcelasRestantes}
                onChange={e => atualizarRow(row.id, 'parcelasRestantes', e.target.value)}
                placeholder="8"
                style={inputStyle}
                type="number" min="1"
              />
              <select
                value={row.categoria}
                onChange={e => atualizarRow(row.id, 'categoria', e.target.value)}
                style={selectStyle}
              >
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                value={row.diaVencimento}
                onChange={e => atualizarRow(row.id, 'diaVencimento', e.target.value)}
                placeholder="10"
                style={inputStyle}
                type="number" min="1" max="31"
              />
              <button
                onClick={() => removerRow(row.id)}
                style={{
                  background: 'none', border: 'none', color: C.sub,
                  cursor: 'pointer', fontSize: 16, padding: 4
                }}
              >✕</button>
            </div>
          ))}
        </div>

        {/* LEGENDA */}
        <div style={{
          background: C.card2, borderRadius: 10, padding: '12px 16px',
          marginBottom: 20, fontSize: 12, color: C.sub, lineHeight: 1.7
        }}>
          <strong style={{ color: C.text }}>Como preencher:</strong><br />
          <strong>Vlr/Parcela</strong> = valor de cada parcela mensal (ex: 51,05)<br />
          <strong>Total Parc.</strong> = total de parcelas do produto (ex: 12)<br />
          <strong>Restantes</strong> = quantas ainda faltam pagar (ex: 8)<br />
          <strong>Dia Venc.</strong> = dia do mes que vence (ex: 10 para dia 10)
        </div>

        {/* AÇÕES */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={adicionarRow}
            style={{
              background: 'transparent', color: C.accent,
              border: `1px solid ${C.accent}40`, borderRadius: 10,
              padding: '12px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            + Adicionar linha
          </button>
          <button
            onClick={importar}
            disabled={salvando}
            style={{
              flex: 1, background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
              color: '#000', border: 'none', borderRadius: 10,
              padding: '12px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer'
            }}
          >
            {salvando ? 'Importando...' : '🦙 Importar parcelamentos'}
          </button>
        </div>

        {erro && (
          <p style={{ color: C.danger, fontSize: 13, marginTop: 12 }}>{erro}</p>
        )}

        <p style={{ textAlign: 'center', color: C.sub, fontSize: 11, marginTop: 32 }}>
          🦙 Duartly · Sua lhama financeira pessoal
        </p>
      </div>
    </>
  );
}
