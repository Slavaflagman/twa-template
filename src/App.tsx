import React, { useState, useEffect, useRef } from 'react';

interface GiftItem {
  id: string;
  name: string;
  number: string;
  priceStars: number;
  image: string;
  seller: string;
  url: string;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: number;
}

interface TransactionLog {
  id: string;
  type: 'buy' | 'list' | 'cancel';
  details: string;
  timestamp: string;
  stars: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'mygifts' | 'manual' | 'activity' | 'profile'>('market');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSort, setFilterSort] = useState<'default' | 'cheap' | 'expensive'>('default');

  // Основные состояния данных
  const [items, setItems] = useState<GiftItem[]>([]);
  const [myListings, setMyListings] = useState<GiftItem[]>([]);
  const [activityLog, setActivityLog] = useState<TransactionLog[]>([]);
  const [platformBalance, setPlatformBalance] = useState<number>(0);

  // Состояния модального окна листинга
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputLink, setInputLink] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Состояние модального окна просмотра конкретного лота
  const [selectedItem, setSelectedItem] = useState<GiftItem | null>(null);

  // Канвас для анимации фоновых частиц
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Логика покупки подарка через Stars с расчетом 3% комиссии
  const handleBuy = (item: GiftItem) => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }

    const commission = Math.round(item.priceStars * 0.03);
    const sellerGets = item.priceStars - commission;

    // Обновляем баланс платформы (накопление комиссий)
    setPlatformBalance(prev => prev + commission);

    // Добавляем запись в лог активности
    const newLog: TransactionLog = {
      id: Date.now().toString(),
      type: 'buy',
      details: `Куплен лот ${item.name} (${item.number})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stars: item.priceStars
    };
    setActivityLog(prev => [newLog, ...prev]);

    alert(
      `Сделка успешно проведена!\n\n` +
      `Лот: ${item.name} (${item.number})\n` +
      `Списано с покупателя: ${item.priceStars.toLocaleString()} Stars\n` +
      `Продавцу зачислено: ${sellerGets.toLocaleString()} Stars (97%)\n` +
      `Комиссия сервиса: ${commission.toLocaleString()} Stars (3%)\n\n` +
      `Подарок моментально передан на аккаунт покупателя.`
    );

    setItems(prev => prev.filter(i => i.id !== item.id));
    setMyListings(prev => prev.filter(i => i.id !== item.id));
    setSelectedItem(null);
  };

  // Создание листинга через ссылку t.me/nft/...
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink || !newPrice) return;

    let cleanName = 'Telegram Gift';
    let cleanNumber = '#0000';
    let imageUrl = 'https://nft.fragment.com/gift/hanging-star.webp';

    if (inputLink.includes('t.me/nft/')) {
      const parts = inputLink.split('t.me/nft/')[1].split('-');
      if (parts.length >= 2) {
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
      image: imageUrl,
      seller: 'Вы',
      url: inputLink.startsWith('http') ? inputLink : `https://t.me/nft/${inputLink}`,
      status: 'active',
      createdAt: Date.now()
    };

    setItems([newItem, ...items]);
    setMyListings([newItem, ...myListings]);

    setActivityLog(prev => [{
      id: Date.now().toString(),
      type: 'list',
      details: `Выставлен лот ${cleanName} (${cleanNumber})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stars: parseInt(newPrice)
    }, ...prev]);

    setInputLink('');
    setNewPrice('');
    setIsModalOpen(false);
  };

  // Отмена продажи и возврат подарка владельцу
  const handleCancelListing = (item: GiftItem) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    setMyListings(prev => prev.filter(i => i.id !== item.id));

    setActivityLog(prev => [{
      id: Date.now().toString(),
      type: 'cancel',
      details: `Отменен листинг ${item.name} (${item.number})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stars: item.priceStars
    }, ...prev]);

    alert(`Подарок успешно возвращен на ваш аккаунт из escrow-бота.`);
    setSelectedItem(null);
  };

  // Фильтрация и сортировка товаров
  const filteredItems = items.filter(i => {
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase()) && !i.number.includes(searchQuery)) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (filterSort === 'cheap') return a.priceStars - b.priceStars;
    if (filterSort === 'expensive') return b.priceStars - a.priceStars;
    return b.createdAt - a.createdAt;
  });

  return (
    <div style={{
      background: '#000000',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '95px',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Фоновый канвас с плавающими частицами */}
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Шапка интерфейса */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(25px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1px' }}>
              TONVIA HUB
            </div>
            <div style={{ fontSize: '10px', opacity: 0.4, letterSpacing: '0.5px' }}>
              P2P ESCROW MARKET
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Продать
          </button>
        </header>

        {/* Раздел: Маркет */}
        {activeTab === 'market' && (
          <>
            {/* Поиск и фильтры сортировки */}
            <div style={{ padding: '16px 16px 12px', display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1, background: '#111111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ opacity: 0.4, fontSize: '12px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Название или #номер..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '13px' }}
                />
              </div>

              <select 
                value={filterSort} 
                onChange={(e: any) => setFilterSort(e.target.value)}
                style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', padding: '0 12px', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="default">Новые</option>
                <option value="cheap">Дешевле</option>
                <option value="expensive">Дороже</option>
              </select>
            </div>

            {/* Сетка товаров */}
            <main style={{ padding: '0 16px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.4, fontSize: '13px' }}>
                  Маркет пока пуст.<br/>Выставьте первый подарок через кнопку выше.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)}
                      style={{
                        background: '#0a0a0a',
                        borderRadius: '18px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(255,255,255,0.12)',
                        minHeight: '210px',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', opacity: 0.3, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '6px' }}>Escrow</span>
                        <span style={{ fontSize: '11px', opacity: 0.4, fontWeight: 600 }}>{item.seller}</span>
                      </div>

                      <div style={{ textAlign: 'center', margin: '8px 0' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '75px', height: '75px', objectFit: 'contain', filter: 'grayscale(100%) brightness(1.2)' }} 
                          onError={(e)=>{
                            (e.target as HTMLImageElement).src = 'https://nft.fragment.com/gift/crystal-ball.webp';
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.name}</span>
                          <span style={{ fontSize: '11px', opacity: 0.5, fontWeight: 600 }}>{item.number}</span>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuy(item);
                          }}
                          style={{
                            width: '100%',
                            background: '#ffffff',
                            color: '#000000',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {item.priceStars.toLocaleString()} Stars
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        {/* Раздел: Мои лоты */}
        {activeTab === 'mygifts' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Мои активные листинги</h2>
            {myListings.length === 0 ? (
              <div style={{ opacity: 0.4, fontSize: '13px', textAlign: 'center', padding: '60px 0' }}>
                У вас нет выставленных на продажу подарков.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myListings.map(item => (
                  <div key={item.id} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={item.image} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain', filter: 'grayscale(100%) brightness(1.2)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.name} {item.number}</div>
                        <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>Цена: {item.priceStars.toLocaleString()} Stars</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCancelListing(item)}
                      style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Забрать назад
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Раздел: Мануал */}
        {activeTab === 'manual' && (
          <div style={{ padding: '20px', lineHeight: '1.6' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Инструкция по использованию</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px', opacity: 0.85 }}>
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px', fontSize: '13px' }}>1. Покупка подарков</div>
                Выберите понравившийся лот в каталоге, нажмите кнопку с ценой в Stars и подтвердите платеж. Звёзды спишутся со счета, 97% уйдут продавцу, 3% составят комиссию платформы, а NFT-подарок мгновенно зачислится на ваш аккаунт.
              </div>

              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px', fontSize: '13px' }}>2. Выставление на продажу</div>
                Нажмите «+ Продать», вставьте официальную ссылку на гифт из Telegram (например: <code style={{ color: '#aaa' }}>t.me/nft/HangingStar-28316</code>) и укажите стоимость в Звёздах. Лот автоматически заблокируется в боте-гаранте (Escrow) и появится в общем поиске.
              </div>

              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '6px', fontSize: '13px' }}>3. Возврат лота (Отмена)</div>
                Если вы передумали продавать гифт, перейдите во вкладку «Мои лоты» и нажмите «Забрать назад». Подарок моментально вернется из гаранта обратно на ваш личный профиль Telegram.
              </div>
            </div>
          </div>
        )}

        {/* Раздел: Активность */}
        {activeTab === 'activity' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>История транзакций</h2>
            {activityLog.length === 0 ? (
              <div style={{ opacity: 0.4, fontSize: '13px', textAlign: 'center', padding: '60px 0' }}>
                История сделок пуста.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activityLog.map(log => (
                  <div key={log.id} style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{log.details}</div>
                      <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '2px' }}>{log.timestamp}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: log.type === 'buy' ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                      {log.stars.toLocaleString()} ⭐️
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Раздел: Профиль */}
        {activeTab === 'profile' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Профиль и Баланс</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', opacity: 0.5 }}>Статус Escrow-бота</div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>Активен (Комиссия сервиса: 3%)</div>
              </div>

              <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px' }}>
                <div style={{ fontSize: '12px', opacity: 0.5 }}>Заработано на комиссиях</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>{platformBalance.toLocaleString()} ⭐️ Stars</div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно создания листинга */}
        {isModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '340px', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Выставить подарок</h3>
              <p style={{ margin: '0 0 16px', fontSize: '11px', opacity: '0.5' }}>Вставьте ссылку вида t.me/nft/HangingStar-28316</p>
              
              <form onSubmit={handleCreateListing}>
                <input 
                  type="text" 
                  placeholder="https://t.me/nft/..." 
                  value={inputLink} 
                  onChange={e => setInputLink(e.target.value)}
                  required
                  style={{ width: '100%', padding: '11px', background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', marginBottom: '10px', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
                />
                <input 
                  type="number" 
                  placeholder="Цена в Stars" 
                  value={newPrice} 
                  onChange={e => setNewPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '11px', background: '#111', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', marginBottom: '16px', boxSizing: 'border-box', outline: 'none', fontSize: '12px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Отмена</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}>Выставить</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Модальное окно подробного просмотра товара */}
        {selectedItem && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '340px', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', opacity: 0.6 }}>✕</button>
              </div>

              <img src={selectedItem.image} alt="" style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '10px 0', filter: 'grayscale(100%) brightness(1.2)' }} />
              
              <h3 style={{ margin: '8px 0 2px', fontSize: '16px', fontWeight: 700 }}>{selectedItem.name}</h3>
              <p style={{ margin: '0 0 16px', fontSize: '12px', opacity: 0.5, fontWeight: 600 }}>{selectedItem.number}</p>

              <div style={{ background: '#111', padding: '12px', borderRadius: '14px', marginBottom: '16px', textAlign: 'left', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                  <span>Продавец:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{selectedItem.seller}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6 }}>
                  <span>Гарант:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Escrow Bot (3%)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setSelectedItem(null)} 
                  style={{ flex: 1, padding: '12px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  Назад
                </button>
                <button 
                  onClick={() => handleBuy(selectedItem)} 
                  style={{ flex: 1, padding: '12px', background: '#fff', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Купить за {selectedItem.priceStars.toLocaleString()} ⭐️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Нижняя навигация */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(25px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0 18px',
          zIndex: 100,
          fontSize: '11px'
        }}>
          {[
            { id: 'market', label: 'Маркет' },
            { id: 'mygifts', label: 'Мои лоты' },
            { id: 'manual', label: 'Мануал' },
            { id: 'activity', label: 'История' },
            { id: 'profile', label: 'Профиль' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '11px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

