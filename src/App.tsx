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
  url?: string;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'crystal' | 'heart' | 'hanging' | 'hood'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // Стартовые реальные лоты с поддержкой официального стиля
  const [items, setItems] = useState<GiftItem[]>([
    {
      id: '1',
      name: 'Hanging Star',
      number: '#28316',
      priceStars: 15400,
      bgGradient: 'linear-gradient(135deg, #4a148c 0%, #1a237e 100%)',
      image: 'https://nft.fragment.com/gift/hanging-star.webp',
      category: 'market',
      seller: 'StarLord',
      url: 'https://t.me/nft/HangingStar-28316'
    },
    {
      id: '2',
      name: 'Crystal Ball',
      number: '#17867',
      priceStars: 23115,
      bgGradient: 'linear-gradient(135deg, #d81b60 0%, #880e4f 100%)',
      image: 'https://nft.fragment.com/gift/crystal-ball.webp',
      category: 'market',
      seller: 'TonWhale',
      url: 'https://t.me/nft/CrystalBall-17867'
    },
    {
      id: '3',
      name: 'Heart Locket',
      number: '#1700',
      priceStars: 116379,
      bgGradient: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      image: 'https://nft.fragment.com/gift/heart-locket.webp',
      category: 'market',
      seller: 'CryptoKing',
      url: 'https://t.me/nft/HeartLocket-1700'
    },
    {
      id: '4',
      name: 'Cyber Hood',
      number: '#0889',
      priceStars: 8400,
      bgGradient: 'linear-gradient(135deg, #455a64 0%, #212121 100%)',
      image: 'https://nft.fragment.com/gift/hood.webp',
      category: 'auction',
      seller: 'Anon',
      url: 'https://t.me/nft/CyberHood-889'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const toggleLike = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuyWithStars = (item: GiftItem) => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
    
    // Если есть официальная ссылка t.me/nft, можно открывать её через Telegram WebApp
    if (item.url && tg?.openTelegramLink) {
      // Или проводим оплату через Звёзды
      alert(`Оплата ${item.name} (${item.number}) за ⭐️ ${item.priceStars.toLocaleString()}. Комиссия 3% учтена.`);
    } else {
      alert(`Покупка лота ${item.name} за ⭐️ ${item.priceStars.toLocaleString()}`);
    }
  };

  // Автоматическое распознавание ссылки t.me/nft при выставлении
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink || !newPrice) return;

    let cleanName = 'Telegram Gift';
    let cleanNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    let imageUrl = 'https://nft.fragment.com/gift/crystal-ball.webp';

    // Парсим ссылку вида https://t.me/nft/HangingStar-28316
    if (inputLink.includes('t.me/nft/')) {
      const parts = inputLink.split('t.me/nft/')[1].split('-');
      if (parts.length >= 2) {
        // Превращаем "HangingStar" в "Hanging Star"
        cleanName = parts[0].replace(/([A-Z])/g, ' $1').trim();
        cleanNumber = `#${parts[1]}`;
      } else {
        cleanName = parts[0];
      }
      imageUrl = `https://nft.fragment.com/gift/${parts[0].toLowerCase()}.webp`;
    } else {
      cleanName = inputLink;
    }

    const newItem: GiftItem = {
      id: Date.now().toString(),
      name: cleanName,
      number: cleanNumber,
      priceStars: parseInt(newPrice),
      bgGradient: 'linear-gradient(135deg, #1f4068 0%, #162447 100%)',
      image: imageUrl,
      category: 'market',
      seller: 'You',
      url: inputLink.startsWith('http') ? inputLink : `https://t.me/nft/${inputLink}`
    };

    setItems([newItem, ...items]);
    setInputLink('');
    setNewPrice('');
    setIsModalOpen(false);
  };

  const filteredItems = items.filter(i => {
    if (activeTab === 'market' && i.category !== 'market') return false;
    if (activeTab === 'auctions' && i.category !== 'auction') return false;

    if (activeFilter === 'hanging' && !i.name.toLowerCase().includes('hanging')) return false;
    if (activeFilter === 'crystal' && !i.name.toLowerCase().includes('crystal')) return false;
    if (activeFilter === 'heart' && !i.name.toLowerCase().includes('heart')) return false;
    if (activeFilter === 'hood' && !i.name.toLowerCase().includes('hood')) return false;

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
        <div style={{
          background: 'rgba(0, 136, 204, 0.15)',
          border: '1px solid rgba(0, 136, 204, 0.3)',
          padding: '6px 12px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#3390ec'
        }}>
          <span>💎</span>
          <span>TonVia Hub</span>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#3390ec',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          + Продать
        </button>
      </header>

      {activeTab === 'market' || activeTab === 'auctions' ? (
        <>
          {/* Инфо-плашка */}
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
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#3390ec' }}>3%</div>
                <div style={{ color: '#8e8e93', fontSize: '11px' }}>КОМИССИЯ</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ background: '#1c1c1e', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#ffc107' }}>⭐️ Stars Escrow</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Гарант</div>
                <div style={{ color: '#8e8e93', fontSize: '11px' }}>БЕЗОПАСНО</div>
              </div>
            </div>
          </div>

          {/* Фильтры */}
          <div style={{ display: 'flex', gap: '8px', padding: '0 16px 12px', overflowX: 'auto' }}>
            <button onClick={() => setActiveFilter('all')} style={{ background: activeFilter === 'all' ? '#3390ec' : '#1c1c1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🔥 Все лоты
            </button>
            <button onClick={() => setActiveFilter('hanging')} style={{ background: activeFilter === 'hanging' ? '#3390ec' : '#1c1c1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🌟 Hanging Star
            </button>
            <button onClick={() => setActiveFilter('crystal')} style={{ background: activeFilter === 'crystal' ? '#3390ec' : '#1c1c1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🔮 Crystal Ball
            </button>
            <button onClick={() => setActiveFilter('heart')} style={{ background: activeFilter === 'heart' ? '#3390ec' : '#1c1c1e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              💚 Heart Locket
            </button>
          </div>

          {/* Поиск */}
          <div style={{ padding: '0 16px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔍</span>
              <input 
                type="text" 
                placeholder="Поиск по названию или #номеру..." 
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
          <main style={{ padding: '0 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {filteredItems.map(item => (
                <div key={item.id} style={{
                  background: item.bgGradient,
                  borderRadius: '24px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  minHeight: '220px',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      onClick={() => toggleLike(item.id)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: likes[item.id] ? '#ff3b30' : '#fff' }}
                    >
                      ♥
                    </button>
                    <button 
                      onClick={() => setCartCount(c => c + 1)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: 'none', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                    >
                      🛒
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', margin: '8px 0' }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '85px', height: '85px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }} 
                      onError={(e)=>{
                        (e.target as HTMLImageElement).src = 'https://nft.fragment.com/gift/crystal-ball.webp';
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{item.name}</span>
                      <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 600, color: '#e0e0e0' }}>{item.number}</span>
                    </div>
                    
                    <button 
                      onClick={() => handleBuyWithStars(item)}
                      style={{
                        width: '100%',
                        background: '#3390ec',
                        color: '#fff',
                        border: 'none',
                        padding: '11px',
                        borderRadius: '14px',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(51, 144, 236, 0.4)'
                      }}
                    >
                      <span>⭐️</span> {item.priceStars.toLocaleString()}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      ) : activeTab === 'loans' ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>🤝 Аренда и Займы под залог NFT</h2>
          <p style={{ color: '#8e8e93', fontSize: '13px' }}>Получайте ликвидность под залог коллекционных предметов.</p>
        </div>
      ) : activeTab === 'gifts' ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>🎁 Мои подарки</h2>
          <p style={{ color: '#8e8e93', fontSize: '13px' }}>Инвентарь ваших подарков.</p>
        </div>
      ) : activeTab === 'profile' ? (
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>👤 Профиль</h2>
          <div style={{ background: '#1c1c1e', padding: '16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '13px', color: '#8e8e93' }}>Статус</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#3390ec', marginTop: '4px' }}>💎 Верифицированный трейдер</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>📊 Активность</h2>
          <div style={{ background: '#1c1c1e', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ color: '#8e8e93', fontSize: '13px', margin: 0 }}>История пуста.</p>
          </div>
        </div>
      )}

      {/* Модальное окно с поддержкой ссылки t.me/nft/... */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: '#1c1c1e', width: '100%', maxWidth: '340px', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>Выставить подарок</h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#8e8e93' }}>Вставьте ссылку вида t.me/nft/HangingStar-28316</p>
            
            <form onSubmit={handleCreateListing}>
              <input 
                type="text" 
                placeholder="https://t.me/nft/HangingStar-28316" 
                value={inputLink} 
                onChange={e => setInputLink(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }}
              />
              <input 
                type="number" 
                placeholder="Цена в ⭐️ Stars" 
                value={newPrice} 
                onChange={e => setNewPrice(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', marginBottom: '16px', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Отмена</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#3390ec', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Выставить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
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
              color: activeTab === tab.id ? '#3390ec' : '#8e8e93',
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
