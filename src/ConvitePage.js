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
  text:    '#f0fdf4',
  muted:   '#6b7280',
  sub:     '#9ca3af',
  border:  '#1f2937',
};

const globalStyle = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${tokens.bg}; color: ${tokens.text}; font-family: 'Space Grotesk', sans-serif; min-height: 100vh; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

export default function ConvitePage() {
  const [codigo, setCodigo] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'valido' | 'invalido'
  const [infoConvite, setInfoConvite] = useState(null);

  // Pegar código da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cod = params.get('codigo') || params.get('code') || '';
    if (cod) {
      setCodigo(cod.toUpperCase());
      validarCodigo(cod.toUpperCase());
    }
  }, []);

  async function validarCodigo(cod) {
    if (!cod || cod.length < 4) return;
    setStatus('loading');

    const { data } = await supabase
      .from('convites')
      .select('*, usuarios(nome)')
      .eq('codigo', cod.toUpperCase())
      .eq('ativo', true)
      .single();

    if (data && data.usos < data.limite_usos) {
      setInfoConvite(data);
      setStatus('valido');
    } else {
      setStatus('invalido');
    }
  }

  const linkTelegram = `https://t.me/DuartlyBot?start=${codigo}`;

  return (
    <>
      <style>{globalStyle}</style>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 60px', animation: 'fadeIn 0.5s ease' }}>

        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🦙</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Duartly</h1>
          <p style={{ color: tokens.sub, fontSize: 15 }}>Sua lhama financeira pessoal</p>
        </div>

        {/* HERO */}
        <div style={{
          background: `linear-gradient(135deg, ${tokens.accent}22, ${tokens.bgCard})`,
          border: `1px solid ${tokens.accent}44`,
          borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center'
        }}>
          <div style={{ fontSize: 13, color: tokens.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
            VOCE FOI CONVIDADO
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            7 dias gratis +<br />
            <span style={{ color: tokens.accent }}>14 dias com codigo de amigo</span>
          </h2>
          <p style={{ color: tokens.sub, fontSize: 13, lineHeight: 1.6 }}>
            Controle suas financas com IA direto no Telegram. Sem planilha, sem complicacao.
          </p>
        </div>

        {/* FEATURES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { icon: '🧠', titulo: 'IA que entende', desc: '"iFood 45" → registrado!' },
            { icon: '📊', titulo: 'Dashboard web', desc: 'Visualize tudo graficamente' },
            { icon: '🦙', titulo: 'Agentes IA', desc: 'Cuzco, Luna e Inti te avisam' },
            { icon: '📄', titulo: 'Relatorio PDF', desc: 'Fechamento mensal completo' },
            { icon: '💳', titulo: 'Parcelamentos', desc: 'Controle suas faturas' },
            { icon: '🎯', titulo: 'Metas', desc: 'Alertas de limite por categoria' },
          ].map((f, i) => (
            <div key={i} style={{
              background: tokens.bgCard, border: `1px solid ${tokens.border}`,
              borderRadius: 12, padding: '14px 16px'
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{f.titulo}</div>
              <div style={{ fontSize: 11, color: tokens.sub }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* INPUT CÓDIGO */}
        <div style={{
          background: tokens.bgCard, border: `1px solid ${tokens.border}`,
          borderRadius: 16, padding: '20px 20px', marginBottom: 20
        }}>
          <p style={{ fontSize: 13, color: tokens.sub, marginBottom: 12 }}>
            Tem um codigo de convite? Cole aqui para ganhar 14 dias gratis:
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ex: DUARTE2026"
              style={{
                flex: 1, background: tokens.bg, border: `1px solid ${tokens.border}`,
                borderRadius: 10, padding: '10px 14px', color: tokens.text,
                fontSize: 14, fontFamily: 'Space Mono, monospace', letterSpacing: 2,
                outline: 'none'
              }}
            />
            <button
              onClick={() => validarCodigo(codigo)}
              style={{
                background: tokens.accent, color: '#000', border: 'none',
                borderRadius: 10, padding: '10px 16px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>

          {status === 'loading' && (
            <p style={{ color: tokens.sub, fontSize: 12, marginTop: 8, animation: 'pulse 1s infinite' }}>
              Verificando...
            </p>
          )}

          {status === 'valido' && (
            <div style={{
              marginTop: 10, background: `${tokens.accent}22`, border: `1px solid ${tokens.accent}44`,
              borderRadius: 8, padding: '8px 12px'
            }}>
              <p style={{ color: tokens.accent, fontSize: 12, fontWeight: 600 }}>
                ✅ Codigo valido! Voce vai ganhar 14 dias gratis.
                {infoConvite?.usuarios?.nome && ` Convidado por ${infoConvite.usuarios.nome}.`}
              </p>
            </div>
          )}

          {status === 'invalido' && (
            <div style={{
              marginTop: 10, background: `${tokens.danger}22`, border: `1px solid ${tokens.danger}44`,
              borderRadius: 8, padding: '8px 12px'
            }}>
              <p style={{ color: tokens.danger, fontSize: 12 }}>
                ❌ Codigo invalido ou esgotado.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={linkTelegram}
          style={{
            display: 'block', background: tokens.accent, color: '#000',
            borderRadius: 14, padding: '16px', textAlign: 'center',
            fontWeight: 800, fontSize: 16, textDecoration: 'none',
            marginBottom: 16, transition: 'opacity 0.2s'
          }}
        >
          🦙 Comecar gratis no Telegram
        </a>

        <p style={{ textAlign: 'center', color: tokens.muted, fontSize: 11 }}>
          Nao precisa de cadastro · So ter o Telegram · Cancele quando quiser
        </p>

        {/* PRECO */}
        <div style={{
          background: tokens.bgCard, border: `1px solid ${tokens.border}`,
          borderRadius: 16, padding: '20px', marginTop: 24, textAlign: 'center'
        }}>
          <p style={{ color: tokens.sub, fontSize: 12, marginBottom: 8 }}>Apos o trial</p>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Mono, monospace' }}>
            R$ 14,90
          </div>
          <p style={{ color: tokens.sub, fontSize: 12 }}>por mes · cancele quando quiser</p>
        </div>

        {/* FOOTER */}
        <p style={{ textAlign: 'center', color: tokens.muted, fontSize: 11, marginTop: 32 }}>
          🦙 Duartly · Sua lhama financeira pessoal
        </p>

      </div>
    </>
  );
}
