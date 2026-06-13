import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const C = {
  bg:      '#0a0a14',
  bgCard:  '#12121e',
  bgCard2: '#1a1a2e',
  accent:  '#4ade80',
  accent2: '#22c55e',
  text:    '#f0fdf4',
  muted:   '#6b7280',
  sub:     '#9ca3af',
  border:  '#1f2937',
  danger:  '#f87171',
  warning: '#fbbf24',
};

const G = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', 'Space Grotesk', sans-serif; overflow-x: hidden; }
  ::selection { background: ${C.accent}44; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 20px #4ade8044} 50%{box-shadow:0 0 40px #4ade8088} }
  @keyframes typing   { 0%{width:0} 50%{width:100%} 90%{width:100%} 100%{width:0} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .fadeUp   { animation: fadeUp 0.7s ease forwards; }
  .float    { animation: float 3s ease-in-out infinite; }
  .glow     { animation: glow 2s ease-in-out infinite; }

  @media (max-width: 640px) {
    .hide-mobile { display: none !important; }
    .col-2 { grid-template-columns: 1fr !important; }
  }
`;

// ── COMPONENTES ──────────────────────────────────────────────

function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}18`, color, border: `1px solid ${color}40`,
      borderRadius: 100, padding: '4px 14px', fontSize: 12, fontWeight: 700,
      letterSpacing: 1, textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function Section({ children, style = {}, id }) {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true);
        obs.unobserve(el); // Para de observar após animar
      }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section id={id} ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : 'translateY(24px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
      ...style
    }}>
      {children}
    </section>
  );
}

// ── DEMO DO BOT ──────────────────────────────────────────────
const MENSAGENS = [
  { tipo: 'user',  texto: 'iFood 45' },
  { tipo: 'bot',   texto: '🛵 iFood\n💰 -R$ 45,00\n🏷️ Delivery\n✅ Registrado!' },
  { tipo: 'user',  texto: 'Nike 300 em 3x' },
  { tipo: 'bot',   texto: '👟 Nike\n💳 3x de R$ 100,00\n📦 Total: R$ 300,00\n✅ 3 parcelas registradas!' },
  { tipo: 'user',  texto: 'Quanto gastei hoje?' },
  { tipo: 'bot',   texto: 'Hoje você gastou R$ 345,00 em 3 lançamentos. Seu maior gasto foi iFood (R$ 180,00 em 4 pedidos)! 🦙' },
];

function ChatDemo() {
  const [msgs, setMsgs] = useState([]);
  const [idx, setIdx] = useState(0);
  const endRef = useRef();

  useEffect(() => {
    if (idx >= MENSAGENS.length) {
      setTimeout(() => { setMsgs([]); setIdx(0); }, 3000);
      return;
    }
    const delay = idx === 0 ? 800 : MENSAGENS[idx - 1].tipo === 'user' ? 600 : 1200;
    const t = setTimeout(() => {
      setMsgs(prev => [...prev, MENSAGENS[idx]]);
      setIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [idx]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  return (
    <div style={{
      background: '#0d1117', borderRadius: 20, overflow: 'hidden',
      border: `1px solid ${C.border}`, maxWidth: 340, width: '100%',
      boxShadow: '0 24px 80px #00000060',
    }}>
      {/* Header do Telegram */}
      <div style={{
        background: '#17212b', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${C.border}`
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0
        }}>🦙</div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>DuartlyBot</p>
          <p style={{ fontSize: 11, color: C.accent }}>● online</p>
        </div>
      </div>

      {/* Mensagens */}
      <div style={{
        padding: '16px 12px', minHeight: 280, maxHeight: 280,
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.tipo === 'user' ? 'flex-end' : 'flex-start',
            animation: 'slideIn 0.3s ease'
          }}>
            <div style={{
              background: m.tipo === 'user' ? '#2b5278' : '#182533',
              borderRadius: m.tipo === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '8px 12px', maxWidth: '80%',
              fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-line',
              border: m.tipo === 'bot' ? `1px solid ${C.border}` : 'none',
            }}>
              {m.texto}
            </div>
          </div>
        ))}
        {idx < MENSAGENS.length && idx > 0 && MENSAGENS[idx - 1].tipo === 'user' && (
          <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: C.accent,
                animation: `pulse 1s ease ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        background: '#17212b', padding: '10px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderTop: `1px solid ${C.border}`
      }}>
        <div style={{
          flex: 1, background: '#0d1117', borderRadius: 20,
          padding: '8px 14px', fontSize: 12, color: C.muted
        }}>
          Mensagem...
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14
        }}>🎙️</div>
      </div>
    </div>
  );
}

// ── CARD DE FEATURE ──────────────────────────────────────────
function FeatureCard({ icon, titulo, desc, destaque = false }) {
  return (
    <div style={{
      background: destaque ? `linear-gradient(135deg, ${C.accent}18, ${C.bgCard2})` : C.bgCard,
      border: `1px solid ${destaque ? C.accent + '40' : C.border}`,
      borderRadius: 16, padding: '20px 22px',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${C.accent}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{titulo}</h3>
      <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

// ── STEP ─────────────────────────────────────────────────────
function Step({ num, titulo, desc }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: '#000',
        boxShadow: `0 0 20px ${C.accent}40`
      }}>{num}</div>
      <div>
        <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{titulo}</h4>
        <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export default function ConvitePage() {
  const [codigo, setCodigo] = useState('');
  const [status, setStatus] = useState(null);
  const [infoConvite, setInfoConvite] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cod = params.get('codigo') || params.get('code') || '';
    if (cod) { setCodigo(cod.toUpperCase()); validarCodigo(cod.toUpperCase()); }
  }, []);

  async function validarCodigo(cod) {
    if (!cod || cod.length < 4) return;
    setStatus('loading');
    const { data } = await supabase
      .from('convites').select('*, usuarios(nome)')
      .eq('codigo', cod.toUpperCase()).eq('ativo', true).single();
    if (data && data.usos < data.limite_usos) { setInfoConvite(data); setStatus('valido'); }
    else setStatus('invalido');
  }

  const linkTelegram = `https://t.me/DuartlyBot?start=${codigo}`;
  const linkBase = 'https://t.me/DuartlyBot';

  return (
    <>
      <style>{G}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.accent}15 0%, transparent 70%)`,
        padding: '80px 20px 60px',
      }}>
        {/* Glow de fundo */}
        <div style={{
          position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.accent}20 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
            alignItems: 'center'
          }} className="col-2">

            {/* LEFT */}
            <div style={{ animation: 'fadeUp 0.8s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <Badge>🦙 Sua lhama financeira</Badge>
              </div>

              <h1 style={{
                fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 900, lineHeight: 1.1,
                marginBottom: 20, letterSpacing: -1,
              }}>
                Controle suas{' '}
                <span style={{
                  background: `linear-gradient(135deg, ${C.accent}, #86efac)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  finanças
                </span>
                {' '}pelo Telegram
              </h1>

              <p style={{
                fontSize: 18, color: C.sub, lineHeight: 1.7, marginBottom: 32, maxWidth: 480
              }}>
                Sem planilha, sem app complicado. Só manda uma mensagem — texto, foto ou áudio — e a IA cuida do resto.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                <a href={codigo ? linkTelegram : linkBase} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
                  color: '#000', borderRadius: 14, padding: '14px 28px',
                  fontWeight: 800, fontSize: 15, textDecoration: 'none',
                  boxShadow: `0 8px 32px ${C.accent}40`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${C.accent}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 8px 32px ${C.accent}40`; }}
                >
                  🦙 Começar grátis
                </a>
                <a href="#como-funciona" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: C.text,
                  border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 28px',
                  fontWeight: 600, fontSize: 15, textDecoration: 'none',
                }}>
                  Ver como funciona
                </a>
              </div>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex' }}>
                  {['🧑', '👩', '🧔', '👱', '🙋'].map((e, i) => (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: '50%', border: `2px solid ${C.bg}`,
                      background: `linear-gradient(135deg, ${C.accent}40, ${C.bgCard2})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, marginLeft: i > 0 ? -8 : 0
                    }}>{e}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    {[1,2,3,4,5].map(i => <span key={i} style={{ color: C.warning, fontSize: 12 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: 12, color: C.sub }}>Amado por quem odeia planilha</p>
                </div>
              </div>
            </div>

            {/* RIGHT — Chat Demo */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ChatDemo />
            </div>
          </div>
        </div>
      </div>

      {/* ── COMO FUNCIONA ── */}
      <Section id="como-funciona" style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge color={C.accent}>Simples assim</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
              Como funciona?
            </h2>
            <p style={{ color: C.sub, fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Em menos de 30 segundos você já está registrando seus gastos
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 560, margin: '0 auto' }}>
            <Step num="1" titulo="Abre o Telegram e busca @DuartlyBot"
              desc="Telegram já instalado no seu celular? Pronto. Não precisa baixar mais nada, criar conta, lembrar senha. É só abrir." />
            <div style={{ width: 2, height: 24, background: `linear-gradient(${C.accent}60, transparent)`, marginLeft: 19 }} />
            <Step num="2" titulo="Manda um gasto — do jeito que preferir"
              desc='Digita "Padaria 18,50", manda uma foto do cupom fiscal, ou grava um áudio de 5 segundos falando o gasto. A IA entende tudo.' />
            <div style={{ width: 2, height: 24, background: `linear-gradient(${C.accent}60, transparent)`, marginLeft: 19 }} />
            <Step num="3" titulo="Duartly classifica e salva automaticamente"
              desc="Em menos de 2 segundos seu gasto está categorizado, salvo e contabilizado. Sem você fazer mais nada." />
            <div style={{ width: 2, height: 24, background: `linear-gradient(${C.accent}60, transparent)`, marginLeft: 19 }} />
            <Step num="4" titulo="Acompanhe pelo dashboard e receba alertas"
              desc="Acesse o painel web para ver gráficos, ou deixe os agentes Cuzco, Luna e Inti te avisarem automaticamente." />
          </div>
        </div>
      </Section>

      {/* ── 3 FORMAS DE REGISTRAR ── */}
      <Section style={{ padding: '80px 20px', background: `linear-gradient(180deg, transparent, ${C.bgCard}40, transparent)` }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge color="#60a5fa">Registro inteligente</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
              3 formas de registrar um gasto
            </h2>
            <p style={{ color: C.sub, fontSize: 16 }}>Escolha o que for mais fácil no momento</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="col-2">

            {/* Texto */}
            <div style={{
              background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20,
              padding: 28, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06
              }}>⌨️</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⌨️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Texto</h3>
              <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Digita naturalmente como você falaria para um amigo. A IA entende valor, categoria e até parcelamento.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['"Padaria 18,50"', '"iFood 45"', '"Nike 300 em 3x"', '"Salário 5000"'].map((e, i) => (
                  <div key={i} style={{
                    background: C.bg, borderRadius: 10, padding: '8px 14px',
                    fontSize: 13, fontFamily: 'monospace', color: C.accent,
                    border: `1px solid ${C.border}`
                  }}>{e}</div>
                ))}
              </div>
            </div>

            {/* Foto */}
            <div style={{
              background: C.bgCard, border: `1px solid ${C.accent}30`, borderRadius: 20,
              padding: 28, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06
              }}>📸</div>
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: `${C.accent}20`, color: C.accent, border: `1px solid ${C.accent}40`,
                borderRadius: 100, padding: '2px 10px', fontSize: 10, fontWeight: 700
              }}>POPULAR</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Foto do cupom</h3>
              <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Tirou o troco? Fotografa o cupom e manda. A IA lê o valor, estabelecimento e data automaticamente.
              </p>
              <div style={{
                background: C.bg, borderRadius: 12, padding: 16,
                border: `1px solid ${C.border}`, textAlign: 'center'
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
                <div style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>📸 Foto enviada</div>
                <div style={{ fontSize: 11, color: C.accent }}>↓ lendo cupom...</div>
                <div style={{
                  marginTop: 10, background: C.bgCard, borderRadius: 8, padding: '8px 12px',
                  fontSize: 12, textAlign: 'left', border: `1px solid ${C.border}`
                }}>
                  <div>🏪 Supermercado Extra</div>
                  <div style={{ color: C.accent }}>💰 R$ 127,80</div>
                  <div style={{ color: C.sub }}>🏷️ Mercado · ✅ Registrado!</div>
                </div>
              </div>
            </div>

            {/* Áudio */}
            <div style={{
              background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20,
              padding: 28, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06
              }}>🎙️</div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎙️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Áudio de voz</h3>
              <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Mãos ocupadas? Grava 5 segundos de áudio falando o gasto. Duartly transcreve e registra.
              </p>
              <div style={{
                background: C.bg, borderRadius: 12, padding: 16,
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `${C.accent}20`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 14
                  }}>🎙️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      {[3,5,8,4,7,5,3,6,4,8,5,3].map((h, i) => (
                        <div key={i} style={{
                          width: 3, height: h * 3, background: C.accent,
                          borderRadius: 2, opacity: 0.7,
                          animation: `pulse 0.8s ease ${i * 0.1}s infinite`
                        }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: C.sub }}>0:05</span>
                </div>
                <div style={{ fontSize: 11, color: C.sub, fontStyle: 'italic', marginBottom: 8 }}>
                  "Farmácia, quarenta e dois reais"
                </div>
                <div style={{
                  background: C.bgCard, borderRadius: 8, padding: '8px 12px',
                  fontSize: 12, border: `1px solid ${C.border}`
                }}>
                  <div>💊 Farmácia</div>
                  <div style={{ color: C.accent }}>💰 -R$ 42,00</div>
                  <div style={{ color: C.sub }}>🏷️ Saúde · ✅ Registrado!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── POR QUE TELEGRAM ── */}
      <Section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge color="#60a5fa">Por que Telegram?</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
              O app que você já usa, agora cuidando do seu dinheiro
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="col-2">
            {[
              { icon: '⚡', titulo: 'Zero atrito', desc: 'Não precisa abrir outro app. Já está no Telegram, que você usa todos os dias.' },
              { icon: '🔔', titulo: 'Notificações nativas', desc: 'Alertas chegam como mensagem normal. Sem precisar abrir o app de finanças.' },
              { icon: '🔒', titulo: '100% privado', desc: 'Seus dados ficam no seu banco de dados. Ninguém mais tem acesso às suas finanças.' },
              { icon: '📱', titulo: 'Funciona em qualquer celular', desc: 'Android, iPhone, qualquer modelo. Se tem Telegram, tem Duartly.' },
              { icon: '🌐', titulo: 'Disponível 24/7', desc: 'Bot rodando na nuvem o tempo todo. Registre gastos à meia-noite, de manhã, na fila.' },
              { icon: '🔄', titulo: 'Nunca perde seu histórico', desc: 'Trocou de celular? Não importa. Tudo salvo na nuvem, acessível de qualquer dispositivo.' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── AGENTES IA ── */}
      <Section style={{ padding: '80px 20px', background: `linear-gradient(180deg, transparent, ${C.bgCard}40, transparent)` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge color={C.warning}>Inteligência artificial</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
              3 agentes que trabalham por você
            </h2>
            <p style={{ color: C.sub, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Enquanto você vive sua vida, eles monitoram suas finanças e te avisam na hora certa
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                emoji: '🦙', nome: 'Cuzco', tipo: 'Agente Diário', cor: '#60a5fa',
                desc: 'Todo dia às 20h, o Cuzco analisa seus gastos do dia e te manda um resumo irônico e direto. Se você gastou acima da média histórica, ele avisa — sem papas na língua.',
                exemplo: '🦙 Cuzco aqui! Duarte, você pediu quatro iFoods hoje ou seu app travou no looping da fome? Total: R$ 379. Amanhã a gente segura a onda.',
              },
              {
                emoji: '🌙', nome: 'Luna', tipo: 'Agente Quinzenal', cor: '#a78bfa',
                desc: 'A cada 15 dias, Luna analisa suas tendências de gastos e identifica padrões antes que virem problema. Ela é serena, analítica e sempre termina com uma ação prática.',
                exemplo: '🌙 Luna aqui! Nos últimos 15 dias você gastou 40% mais com Delivery. Se mantiver o ritmo, vai gastar R$ 800 só em iFood esse mês. Que tal cozinhar 2x por semana?',
              },
              {
                emoji: '☀️', nome: 'Inti', tipo: 'Agente Mensal', cor: '#fbbf24',
                desc: 'No primeiro dia de cada mês, Inti entrega o fechamento completo do mês anterior e uma projeção estratégica para o mês que começa.',
                exemplo: '☀️ Inti aqui! Fechamento de junho: receitas R$ 5.000, gastos R$ 2.847, saldo R$ 2.153. No ritmo atual de julho, você vai fechar com R$ 1.900 de saldo. Estratégia: corte R$ 200 em delivery.',
              },
            ].map((ag, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${ag.cor}12, ${C.bgCard})`,
                border: `1px solid ${ag.cor}30`, borderRadius: 20, padding: 28,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center'
              }} className="col-2">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${ag.cor}22`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 24, border: `1px solid ${ag.cor}40`
                    }}>{ag.emoji}</div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: ag.cor }}>{ag.nome}</h3>
                      <Badge color={ag.cor}>{ag.tipo}</Badge>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7 }}>{ag.desc}</p>
                </div>
                <div style={{
                  background: C.bg, borderRadius: 14, padding: 16,
                  border: `1px solid ${C.border}`, fontSize: 13, lineHeight: 1.6,
                  fontStyle: 'italic', color: C.sub,
                  borderLeft: `3px solid ${ag.cor}`
                }}>
                  {ag.exemplo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── SEGURANÇA ── */}
      <Section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge color={C.accent}>Seus dados protegidos</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
              Segurança como prioridade
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="col-2">
            {[
              { icon: '🔐', titulo: 'Banco de dados isolado', desc: 'Cada usuário tem seus dados completamente separados. Ninguém vê as finanças de outro.' },
              { icon: '🛡️', titulo: 'Criptografia em trânsito', desc: 'Toda comunicação entre o app e o banco de dados é criptografada via HTTPS.' },
              { icon: '🚫', titulo: 'Sem acesso a contas bancárias', desc: 'O Duartly não se conecta ao seu banco. Você registra os gastos — nós só organizamos.' },
              { icon: '🔑', titulo: 'Login pelo Telegram', desc: 'Sua identidade é verificada pelo Telegram. Sem senhas para criar ou vazar.' },
              { icon: '📵', titulo: 'Sem anúncios', desc: 'Seus dados financeiros nunca são usados para publicidade. Nunca.' },
              { icon: '🗑️', titulo: 'Exclusão a qualquer momento', desc: 'Quer sair? Todos seus dados são apagados permanentemente sob solicitação.' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── TUDO QUE VOCÊ TEM ── */}
      <Section style={{ padding: '80px 20px', background: `linear-gradient(180deg, transparent, ${C.bgCard}40, transparent)` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Badge>Tudo incluído</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 12 }}>
              Uma assinatura, tudo liberado
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="col-2">
            {[
              '✅ Registro por texto, foto e áudio',
              '✅ Classificação automática com IA',
              '✅ Controle de parcelamentos por cartão',
              '✅ Dashboard web com gráficos',
              '✅ Relatório PDF mensal',
              '✅ Agente Cuzco (alertas diários)',
              '✅ Agente Luna (análise quinzenal)',
              '✅ Agente Inti (panorama mensal)',
              '✅ Metas por categoria com alertas',
              '✅ Agentes customizados',
              '✅ Consultas em linguagem natural',
              '✅ Histórico ilimitado',
            ].map((item, i) => (
              <div key={i} style={{
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '12px 16px', fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── PREÇO + CTA ── */}
      <Section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <Badge color={C.accent}>Investimento</Badge>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>
            Simples e justo
          </h2>
          <p style={{ color: C.sub, marginBottom: 40 }}>Menos que um café por semana</p>

          <div style={{
            background: C.bgCard, border: `1px solid ${C.accent}40`,
            borderRadius: 24, padding: 40, marginBottom: 24,
            boxShadow: `0 0 60px ${C.accent}15`,
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`
            }} />

            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 16, color: C.sub, textDecoration: 'line-through' }}>R$ 29,90</span>
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
              R$ 14,90
            </div>
            <p style={{ color: C.sub, marginBottom: 32 }}>por mês · cancele quando quiser</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
              {[
                { icon: '🎁', texto: '7 dias grátis para testar' },
                { icon: '👥', texto: '14 dias grátis com código de amigo' },
                { icon: '🔄', texto: 'Sem contrato de fidelidade' },
                { icon: '💳', texto: 'PIX ou cartão de crédito' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <span>{item.icon}</span>
                  <span style={{ color: C.sub }}>{item.texto}</span>
                </div>
              ))}
            </div>

            {/* Input de código */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: C.sub, marginBottom: 8 }}>
                Tem código de convite? Cole aqui e ganhe 14 dias grátis:
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && validarCodigo(codigo)}
                  placeholder="Ex: DUARTE2026"
                  style={{
                    flex: 1, background: C.bg, border: `1px solid ${status === 'valido' ? C.accent : status === 'invalido' ? C.danger : C.border}`,
                    borderRadius: 10, padding: '10px 14px', color: C.text,
                    fontSize: 13, fontFamily: 'monospace', letterSpacing: 1,
                    transition: 'border 0.2s'
                  }}
                />
                <button onClick={() => validarCodigo(codigo)} style={{
                  background: C.accent, color: '#000', border: 'none',
                  borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}>OK</button>
              </div>

              {status === 'loading' && <p style={{ color: C.sub, fontSize: 11, marginTop: 6, animation: 'pulse 1s infinite' }}>Verificando...</p>}
              {status === 'valido' && (
                <p style={{ color: C.accent, fontSize: 11, marginTop: 6 }}>
                  ✅ Código válido! {infoConvite?.usuarios?.nome && `Convidado por ${infoConvite.usuarios.nome}.`} Você ganha 14 dias grátis!
                </p>
              )}
              {status === 'invalido' && <p style={{ color: C.danger, fontSize: 11, marginTop: 6 }}>❌ Código inválido ou esgotado.</p>}
            </div>

            <a href={codigo && status === 'valido' ? linkTelegram : linkBase} style={{
              display: 'block', background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
              color: '#000', borderRadius: 14, padding: '16px',
              fontWeight: 800, fontSize: 16, textDecoration: 'none',
              boxShadow: `0 8px 32px ${C.accent}40`,
            }}>
              🦙 Começar grátis agora
            </a>
          </div>

          <p style={{ color: C.muted, fontSize: 12 }}>
            Não precisa de cartão para o trial · Só ter o Telegram
          </p>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: '32px 20px',
        textAlign: 'center', color: C.muted, fontSize: 13
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🦙</div>
        <p style={{ fontWeight: 700, marginBottom: 4 }}>Duartly</p>
        <p>Sua lhama financeira pessoal</p>
      </footer>
    </>
  );
}
