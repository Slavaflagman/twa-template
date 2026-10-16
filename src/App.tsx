import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

interface GiftItem {
  id: string;
  name: string;
  number: string;
  price: number;
  bgGradient: string;
  image: string;
  category: 'market' | 'auction' | 'loans';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'auctions' | 'loans' | 'gifts' | 'profile' | 'activity'>('market');
  const [filter, setFilter] = useState<'all' | 'gifts' | 'nft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const ADMIN_WALLET = 'UQC1CJmdKh2aOAj2Y0BPQUrGqtAnsGl755F5813SE-9ZBNG0';

  // Реальные заполненные карточки предметов (Telegram Gifts / NFT) с красивыми стилями как на референсе
  const [items, setItems] = useState<GiftItem[]>([
    {
      id: '1',
      name: 'Crystal Ball',
      number: '#17867',
      price: 23.115,
      bgGradient: 'linear-gradient(135deg, #e57373 0%, #ba68c8 100%)',
      image: 'https://api.iconify.design/fluent-emoji:crystal-ball.svg',
      category: 'market'
    },
    {
      id: '2',
      name: 'Heart Locket',
      number: '#1700',
      price: 1163.79,
      bgGradient: 'linear-gradient(135deg, #81c784 0%, #4db6ac 100%)',
      image: 'https://api.iconify.design/fluent-emoji:gem-stone.svg',
      category: 'market'
    },
    {
      id: '3',
      name: 'Golden Surfboard',
      number: '#0421',
      price: 450.0,
      bgGradient: 'linear-gradient(135deg, #ffb74d 0%, #f06292 100%)',
      image: 'https://api.iconify.design/fluent-emoji:snowboarder.svg',
      category: 'auction'
    },
    {
      id: '4',
      name: 'Cyber Hood',
      number: '#889',
      price: 89.5,
      bgGradient: 'linear-gradient(135deg, #90a4ae 0%, #37474f 100%)',
      image: 'https://api.iconify.design/fluent-emoji:ninja.svg',
      category: 'market'
    },
    {
      id: '5',
      name: 'Royal Crown',
      number: '#007',
      price: 2500.0,
      bgGradient: 'linear-gradient(135deg, #ffd54f 0%, #ff8a65 100%)',
      image: 'https://api.iconify.design/fluent-emoji:crown.svg',
      category: 'auction'
    },
    {
      id: '6',
      name: 'Magic Potion',
      number: '#512',
      price: 14.2,
      bgGradient: 'linear-gradient(135deg, #64b5f6 0%, #ba68c8 100%)',
      image: 'https://api.iconify.design/fluent-emoji:potion.svg',
      category: 'market'
    }
  ]);

  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(0);

  const toggleLike = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuy = async (item: GiftItem) => {
    if (!userAddress) {
      alert('Сначала подключите кошелек!');
      tonConnectUI.openModal();
      return;
    }

    const priceNano = Math.floor(item.price * 1e9);
    const feeNano = Math.floor(priceNano * 0.03); // 3% комиссия сервису
    const sellerNano = priceNano - feeNano;

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          { address: ADMIN_WALLET, amount: feeNano.toString() },
          { address: ADMIN_WALLET, amount: sellerNano.toString() }
        ]
      });
      alert(`Успешно приобретено: ${item.name} ${item.number}!`);
    } catch (error) {
      console.error(error);
      alert('Транзакция отменена или произошла ошибка');
    }
  };

  const filteredItems = items.filter(i => {
    if (activeTab === 'market' && i.category !== 'market') return false;
    if (activeTab === 'auctions' && i.category !== 'auction') return false;
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      background: '#0e0e11',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '90px'
    }}>
      {/* Верхняя шапка */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(14, 14, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <span style={{ color: '#0098ea' }}>💎</span>
            <span>0</span>
          </div>
          <button style={{ background: '#0098ea', border: 'none', width: '28px', height: '28px', borderRadius: '50%', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
          <button style={{ background: '#0098ea', border: 'none', width: '28px', height: '28px', borderRadius: '50%', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>

        <TonConnectButton />
      </header>

      {/* Панель сбора ( Protocol fee / Ref fee ) */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>3%</div>
            <div style={{ color: '#8e8e93', fontSize: '11px' }}>ПРОТОКОЛЬНЫЙ СБОР</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ background: '#1c1c1e', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#f39c12' }}>Gift Hub</span>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>3%</div>
              <div style={{ color: '#8e8e93', fontSize: '11px' }}>РЕФ. СБОР</div>
            </div>
            <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</button>
          </div>
        </div>
      </div>

      {/* Кнопки подразделов (Обзор, Аренда, Фильтр) */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto' }}>
        <button style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          📦 Обзор ›
        </button>
        <button style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          ⏱️ Аренда ›
        </button>
        <button style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          ⚙️ Фильтр ↕
        </button>
      </div>

      {/* Поиск и счетчик корзины */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛒</span>
          <input 
            type="text" 
            placeholder="Поиск подарков..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
        <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 16px', fontWeight: 600, fontSize: '13px' }}>
          {cartCount}
        </div>
      </div>

      {/* Сетка товаров (Красивые карточки с градиентами) */}
      <main style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{
            background: item.bgGradient,
            borderRadius: '20px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            minHeight: '210px'
          }}>
            {/* Верхние иконки (Лайк и Корзина) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={() => toggleLike(item.id)}
                style={{ background: 'rgba(0,0,0,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: likes[item.id] ? '#ff3b30' : '#fff' }}
              >
                ♥
              </button>
              <button 
                onClick={() => setCartCount(c => c + 1)}
                style={{ background: 'rgba(0,0,0,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                🛒
              </button>
            </div>

            {/* Изображение подарка в центре */}
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <img src={item.image} alt={item.name} style={{ width: '75px', height: '75px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' }} />
            </div>

            {/* Название и номер */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{item.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 600 }}>{item.number}</span>
              </div>
              
              {/* Кнопка покупки */}
              <button 
                onClick={() => handleBuy(item)}
                style={{
                  width: '100%',
                  background: '#0098ea',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 152, 234, 0.4)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>💎</span> {item.price.toLocaleString()}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Нижняя навигация (строго как на референсе) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(14, 14, 17, 0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 4px 16px',
        zIndex: 100,
        fontSize: '10px',
        color: '#8e8e93'
      }}>
        {[
          { id: 'market', label: 'Маркет', icon: '🛍️' },
          { id: 'auctions', label: 'Аукционы', icon: '🔨' },
          { id: 'loans', label: 'Займы', icon: '🤝' },
          { id: 'gifts', label: 'Мои подарки', icon: '🎁' },
          { id: 'profile', label: 'Профиль', icon: '👤' },
          { id: 'activity', label: 'Активность', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              color: activeTab === tab.id ? '#0098ea' : '#8e8e93',
              cursor: 'pointer',
              fontWeight: 600,
              flex: 1
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

