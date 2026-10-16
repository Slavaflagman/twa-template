import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

interface GiftNFT {
  id: string;
  name: string;
  number: string;
  priceTon: number;
  recipientAddress: string;
  imageUrl: string;
  bgGradient: string;
}

const MARKET_GIFTS: GiftNFT[] = [
  {
    id: '1',
    name: 'Crystal Ball',
    number: '#17867',
    priceTon: 0.1,
    recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    imageUrl: 'https://cache.tonapi.io/imgproxy/Qo0S4O5qH2P1k.png', // Ссылка на картинку подарка
    bgGradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)'
  },
  {
    id: '2',
    name: 'Heart Locket',
    number: '#1700',
    priceTon: 0.5,
    recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    imageUrl: 'https://cache.tonapi.io/imgproxy/HeartLocket.png',
    bgGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)'
  },
  {
    id: '3',
    name: 'Golden Rocket',
    number: '#9042',
    priceTon: 0.2,
    recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    imageUrl: 'https://cache.tonapi.io/imgproxy/Rocket.png',
    bgGradient: 'linear-gradient(135deg, #701a75 0%, #a21caf 50%, #c026d3 100%)'
  },
  {
    id: '4',
    name: 'Plush Bear',
    number: '#305',
    priceTon: 0.15,
    recipientAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    imageUrl: 'https://cache.tonapi.io/imgproxy/PlushBear.png',
    bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)'
  }
];

export default function App() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<'market' | 'profile'>('market');
  const [myGifts, setMyGifts] = useState<GiftNFT[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuyNFT = async (gift: GiftNFT) => {
    if (!userAddress) {
      alert('Сначала подключите кошелек!');
      return;
    }

    try {
      setLoadingId(gift.id);
      const amountInNano = Math.floor(gift.priceTon * 1000000000).toString();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: gift.recipientAddress,
            amount: amountInNano,
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
      
      setMyGifts((prev) => [...prev, gift]);
      alert(`Поздравляем! Вы успешно купили ${gift.name} ${gift.number}`);
    } catch (e) {
      console.error(e);
      alert('Ошибка при покупке или транзакция отменена.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ background: '#090d16', color: '#f8fafc', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', paddingBottom: '85px' }}>
      
      {/* Шапка приложения */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#0f172a', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '18px', letterSpacing: '0.5px' }}>TonVia</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>NFT Marketplace</div>
        </div>
        <TonConnectButton />
      </header>

      {/* Вкладка Маркет */}
      {activeTab === 'market' && (
        <main style={{ padding: '16px' }}>
          
          {/* Быстрые категории / фильтры */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', whitespace: 'nowrap' }}>Обзор</button>
            <button style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', whitespace: 'nowrap' }}>Аренда</button>
            <button style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500', whitespace: 'nowrap' }}>Фильтр</button>
          </div>

          <div style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', marginBottom: '12px' }}>Доступные Подарки</div>

          {/* Сетка карточек */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {MARKET_GIFTS.map((gift) => (
              <div key={gift.id} style={{ background: '#0f172a', borderRadius: '18px', padding: '10px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                
                {/* Аватар подарка с градиентом */}
                <div style={{ background: gift.bgGradient, height: '140px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={gift.imageUrl} 
                    alt={gift.name} 
                    onError={(e) => {
                      // Фолбэк если картинка не загрузится
                      (e.target as HTMLElement).style.display = 'none';
                    }} 
                    style={{ width: '90px', height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))' }} 
                  />
                </div>

                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>{gift.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>{gift.number}</div>
                </div>

                <button
                  onClick={() => handleBuyNFT(gift)}
                  disabled={loadingId === gift.id}
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', width: '100%', cursor: 'pointer', boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)' }}
                >
                  {loadingId === gift.id ? 'Обработка...' : `${gift.priceTon} TON`}
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Вкладка Профиль */}
      {activeTab === 'profile' && (
        <main style={{ padding: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Профиль пользователя</div>
          
          <div style={{ background: '#0f172a', padding: '14px', borderRadius: '14px', border: '1px solid #1e293b', fontSize: '12px', color: '#94a3b8', marginBottom: '20px', wordBreak: 'break-all' }}>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Подключенный адрес:</span>
            {userAddress ? userAddress : 'Кошелек не подключен'}
          </div>

          <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', marginBottom: '12px' }}>
            Мои Инвентарь ({myGifts.length})
          </div>

          {myGifts.length === 0 ? (
            <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px dashed #1e293b', padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              Купленные предметы появятся здесь.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {myGifts.map((gift, idx) => (
                <div key={idx} style={{ background: '#0f172a', borderRadius: '18px', padding: '10px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ background: gift.bgGradient, height: '120px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={gift.imageUrl} alt={gift.name} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#f1f5f9' }}>{gift.name}</div>
                    <div style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>В собственности</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Нижняя навигация */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 10 }}>
        <button 
          onClick={() => setActiveTab('market')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'market' ? '#38bdf8' : '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          Маркет
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          Профиль
        </button>
      </nav>
    </div>
  );
}

