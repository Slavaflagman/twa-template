import React, { useState, useEffect } from 'react';

interface GiftItem {
  id: string;
  name: string;
  number: string;
  priceStars: number;
  bgGradient: string;
  image: string;
  category: 'market' | 'auction' | 'loans';
  seller: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'auctions' | 'loans' | 'gifts' | 'profile' | 'activity'>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // Модалка выставления своего товара
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const [items, setItems] = useState<GiftItem[]>([
    {
      id: '1',
      name: 'Crystal Ball',
      number: '#17867',
      priceStars: 500,
      bgGradient: 'linear-gradient(135deg, #e57373 0%, #ba68c8 100%)',
      image: 'https://api.iconify.design/fluent-emoji:crystal-ball.svg',
      category: 'market',
      seller: 'User123'
    },
    {
      id: '2',
      name: 'Heart Locket',
      number: '#1700',
      priceStars: 2500,
      bgGradient: 'linear-gradient(135deg, #81c784 0%, #4db6ac 100%)',
      image: 'https://api.iconify.design/fluent-emoji:gem-stone.svg',
      category: 'market',
      seller: 'CryptoTrader'
    },
    {
      id: '3',
      name: 'Golden Surfboard',
      number: '#0421',
      priceStars: 12000,
      bgGradient: 'linear-gradient(135deg, #ffb74d 0%, #f06292 100%)',
      image: 'https://api.iconify.design/fluent-emoji:snowboarder.svg',
      category: 'auction',
      seller: 'Whale_99'
    },
    {
      id: '4',
      name: 'Cyber Hood',
      number: '#889',
      priceStars: 1800,
      bgGradient: 'linear-gradient(135deg, #90a4ae 0%, #37474f 100%)',
      image: 'https://api.iconify.design/fluent-emoji:ninja.svg',
      category: 'market',
      seller: 'Anon'
    },
    {
      id: '5',
      name: 'Royal Crown',
      number: '#007',
      priceStars: 50000,
      bgGradient: 'linear-gradient(135deg, #ffd54f 0%, #ff8a65 100%)',
      image: 'https://api.iconify.design/fluent-emoji:crown.svg',
      category: 'auction',
      seller: 'King'
    },
    {
      id: '6',
      name: 'Magic Potion',
      number: '#512',
      priceStars: 350,
      bgGradient: 'linear-gradient(135deg, #64b5f6 0%, #ba68c8 100%)',
      image: 'https://api.iconify.design/fluent-emoji:potion.svg',
      category: 'market',
      seller: 'Trader_X'
    }
  ]);

  const toggleLike = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Покупка через Telegram Stars
  const handleBuyWithStars = (item: GiftItem) => {
    const tg = window.Telegram?.WebApp;

    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }

    if (tg?.openInvoice) {
      alert(`Запрос на покупку ${item.name} (${item.priceStars} ⭐️)\nКомиссия сервиса 3% учтена.`);
    } else {
      alert(`Покупка ${item.name} за ⭐️ ${item.priceStars}. (Запустите в Telegram)`);
    }
  };

  // Добавление нового товара пользователем
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const newItem: GiftItem = {
      id: Date.now().toString(),
      name: newName,
      number: `#${Math.floor(1000 + Math.random() * 9000)}`,
      priceStars: parseInt(newPrice),
      bgGradient: 'linear-gradient(135deg, #64b5f6 0%, #33e0ff 100%)',
      image: 'https://api.iconify.design/fluent-emoji:wrapped-gift.svg',
      category: 'market',
      seller: 'You'
    };

    setItems([newItem, ...items]);
    setNewName('');
    setNewPrice('');
    setIsModalOpen(false);
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
      {/* Шапка */}
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
            background: 'rgba(255,193,7,0.15)',
            border: '1px solid rgba(255,193,7,0.3)',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#ffc107'
          }}>
            <span>⭐️</span>
            <span>TonVia Market</span>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#ffc107',
            color: '#000',
            border: 'none',
            padding: '7px 14px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Продать
        </button>
      </header>

      {/* Панель сборов */}
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
            <div style={{ color: '#8e8e93', fontSize: '11px' }}>КОМИССИЯ СЕРВИСА</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ background: '#1c1c1e', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#ffc107' }}>⭐️ P2P Escrow</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>Гарант</div>
            <div style={{ color: '#8e8e93', fontSize: '11px' }}>БЕЗОПАСНО</div>
          </div>
        </div>
      </div>

      {/* Подразделы */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto' }}>
        <button style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          📦 Обзор ›
        </button>
        <button style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          ⏱️ Займы под залог ›
        </button>
        <button style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          ⚙️ Фильтр ↕
        </button>
      </div>

      {/* Поиск */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1, background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Поиск гифтов и предметов..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
          />
        </div>
        <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 16px', fontWeight: 600, fontSize: '13px' }}>
          🛒 {cartCount}
        </div>
      </div>

      {/* Сетка товаров */}
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

            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <img src={item.image} alt={item.name} style={{ width: '75px', height: '75px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{item.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 600 }}>{item.number}</span>
              </div>
              
              <button 
                onClick={() => handleBuyWithStars(item)}
                style={{
                  width: '100%',
                  background: '#ffc107',
                  color: '#000',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>⭐️</span> {item.priceStars.toLocaleString()}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Модальное окно "Выставить на продажу" */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: '#1c1c1e', width: '100%', maxWidth: '340px', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '16px', fontWeight: 700 }}>Продать подарок (P2P)</h3>
            <form onSubmit={handleCreateListing}>
              <input 
                type="text" 
                placeholder="Название гифта / предмета" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' }}
              />
              <input 
                type="number" 
                placeholder="Цена в ⭐️ Stars" 
                value={newPrice} 
                onChange={e => setNewPrice(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Отмена</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Выставить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Нижнее меню */}
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
              color: activeTab === tab.id ? '#ffc107' : '#8e8e93',
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
