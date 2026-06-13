import React, { useEffect, useState } from 'react';

const C = {
  bg:     '#0a0a14',
  card:   '#12121e',
  accent: '#4ade80',
  text:   '#f0fdf4',
  sub:    '#9ca3af',
  border: '#1f2937',
};

const G = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pop    { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes confetti { 0%{transform:translateY(-10px) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
`;

function Confetti() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ['#4ade80','#60a5fa','#fbbf24','#f472b6','#a78bfa'][Math.floor(Math.random() * 5)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: -20,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : 2,
          animation: `confetti ${p.duration}s ease ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

export default function ObrigadoPage() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    setTimeout(() => setMostrar(true), 100);
  }, []);

  return (
    <>
      <style>{G}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <Confetti />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 480, width: '100%', padding: 24,
        opacity: mostrar ? 1 : 0, transform: mostrar ? 'none' : 'translateY(30px)',
        transition: 'all 0.7s ease',
      }}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 24, padding: '40px 32px', textAlign: 'center',
          boxShadow: `0 0 80px ${C.accent}20`,
        }}>
          {/* Ícone animado */}
          <div style={{
            fontSize: 72, marginBottom: 20,
            animation: 'pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s both'
          }}>
            🦙
          </div>

          <div style={{
            display: 'inline-block',
            background: `${C.accent}20`, color: C.accent,
            border: `1px solid ${C.accent}40`,
            borderRadius: 100, padding: '4px 16px',
            fontSize: 12, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 20
          }}>
            Pagamento confirmado!
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, lineHeight: 1.2 }}>
            Bem-vindo ao<br />
            <span style={{ color: C.accent }}>Duartly Premium!</span>
          </h1>

          <p style={{ color: C.sub, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Sua assinatura está ativa! Sua lhama financeira já está de olho no seu dinheiro. 🎉
          </p>

          {/* O que fazer agora */}
          <div style={{
            background: '#0a0a14', borderRadius: 16, padding: 20,
            marginBottom: 28, textAlign: 'left',
            border: `1px solid ${C.border}`
          }}>
            <p style={{ fontSize: 12, color: C.sub, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
              O que fazer agora:
            </p>
            {[
              { icon: '💬', texto: 'Abra o Telegram e mande um gasto para o DuartlyBot' },
              { icon: '📊', texto: 'Use /dashboard para ver seu painel financeiro' },
              { icon: '🎯', texto: 'Defina suas metas com /meta' },
              { icon: '🎁', texto: 'Compartilhe seu código e ganhe dias grátis' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 0',
                borderBottom: i < 3 ? `1px solid ${C.border}` : 'none'
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: C.sub }}>{item.texto}</span>
              </div>
            ))}
          </div>

          <a href="https://t.me/DuartlyBot" style={{
            display: 'block',
            background: `linear-gradient(135deg, ${C.accent}, #16a34a)`,
            color: '#000', borderRadius: 14, padding: '14px',
            fontWeight: 800, fontSize: 15, textDecoration: 'none',
            boxShadow: `0 8px 32px ${C.accent}40`,
          }}>
            🦙 Abrir o DuartlyBot
          </a>
        </div>

        <p style={{ textAlign: 'center', color: C.sub, fontSize: 12, marginTop: 20 }}>
          Dúvidas? Fale com a gente pelo próprio bot com /ajuda
        </p>
      </div>
    </>
  );
}
