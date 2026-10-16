import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

const TONAPI_KEY = import.meta.env.VITE_TONAPI_KEY || 'AEQCRGHJRIRVMSIAAAAE25N35EUASWLNDYE7PGQF6YFXIQUC2R7CJ3KHJY2EBPU6FNXBV6Y';
const ADMIN_WALLET = 'UQC1CJmdKh2aOAj2Y0BPQUrGqtAnsGl755F5813SE-9ZBNG0';

interface RealNFT {
  address: string;
  name: string;
  imageUrl: string;
  collectionName?: string;
}

interface MarketItem {
  id: string;
  name: string;
  number: string;
  priceTon: number;
  sellerAddress: string;
  symbol: string;
  imageUrl?: string;
}

export default function App() {
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<'market' | 'profile'>('market');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [userNfts, setUserNfts] = useState<RealNFT[]>([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState<boolean>(false);

  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [selectedNftForSale, setSelectedNftForSale] = useState<RealNFT | null>(null);
  const [salePriceInput, setSalePriceInput] = useState<string>('');

  useEffect(() => {
    if (!userAddress) {
      setUserNfts([]);
      return;
    }

    const fetchUserNfts = async () => {
      setIsLoadingNfts(true);
      try {
        const response = await fetch(`https://tonapi.io/v2/accounts/${userAddress}/nfts?limit=50&offset=0`, {
          headers: {
            'Authorization': `Bearer ${TONAPI_KEY}`
          }
        });
        const data = await response.json();

        if (data && data.nft_items) {
          const formattedNfts: RealNFT[] = data.nft_items.map((item: any) => {
            const image = item.metadata?.image || item.previews?.[1]?.url || '';
            const name = item.metadata?.name || `NFT #${item.index}`;
            const collection = item.collection?.name || 'TON NFT';
            return {
              address: item.address,
              name,
              imageUrl: image,
              collectionName: collection
            };
          });
          setUserNfts(formattedNfts);
        }
      } catch (error) {
        console.error('Ошибка загрузки NFT из TonAPI:', error);
      } finally {
        setIsLoadingNfts(false);
      }
    };

    fetchUserNfts();
  }, [userAddress]);

  const handleBuyItem = async (item: MarketItem) => {
    if (!userAddress) {
      alert('Сначала подключите кошелек!');
      return;
    }

    try {
      setLoadingId(item.id);

      const totalPriceNano = BigInt(Math.floor(item.priceTon * 1000000000));
      const adminFeeNano = (totalPriceNano * BigInt(3)) / BigInt(100);
      const sellerAmountNano = totalPriceNano - adminFeeNano;

      const messages: any[] = [];

      if (sellerAmountNano > 0n && item.sellerAddress !== 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c') {
        messages.push({
          address: item.sellerAddress,
          amount: sellerAmountNano.toString(),
        });
      }

      messages.push({
        address: ADMIN_WALLET,
        amount: adminFeeNano.toString(),
      });

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages,
      };

      await tonConnectUI.sendTransaction(transaction);
      alert(`Транзакция отправлена! Вы приобрели ${item.name}`);
    } catch (e) {
      console.error(e);
      alert('Ошибка оплаты или отмена транзакции.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleListItemForSale = () => {
    if (!selectedNftForSale) return;
    const price = parseFloat(salePriceInput);
    if (isNaN(price) || price <= 0) {
      alert('Введите корректную цену в TON');
      return;
    }

    const newItem: MarketItem = {
      id: Date.now().toString(),
      name: selectedNftForSale.name,
      number: '#NFT',
      priceTon: price,
      sellerAddress: userAddress,
      symbol: 'NFT',
      imageUrl: selectedNftForSale.imageUrl
    };

    setMarketItems([newItem, ...marketItems]);
    setSelectedNftForSale(null);
    setSalePriceInput('');
    setActiveTab('market');
    alert(`Ваш NFT "${selectedNftForSale.name}" выставлен на продажу!`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      paddingBottom: '90px',
      color: '#f5f5f7',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes floatBubble {
          0% { transform: translateY(0px) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.5; }
          100% { transform: translateY(0px) scale(1); opacity: 0.2; }
        }
      `}</style>

      {/* Белые плавающие пузырьки на черном фоне */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', filter: 'blur(20px)', animation: 'floatBubble 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '45%', right: '10%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', filter: 'blur(30px)', animation: 'floatBubble 12s ease-in-out infinite 2s', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(25px)', animation: 'floatBubble 10s ease-in-out infinite 4s', pointerEvents: 'none' }} />

      {/* Шапка в стиле Apple Glass */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(20, 20, 22, 0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(180deg, #ffffff 0%, #a1a1a6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', color: '#000' }}>V</div>
          <div>
            <div style={{ fontWeight: '700', color: '#fff', fontSize: '17px', letterSpacing: '-0.3px' }}>TonVia</div>
            <div style={{ fontSize: '10px', color: '#86868b', fontWeight: '500' }}>Marketplace</div>
          </div>
        </div>
        <TonConnectButton />
      </header>

      {/* Маркет */}
      {activeTab === 'market' && (
        <main style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
          
          {/* Промо-баннер Apple Style */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.04)', 
            borderRadius: '22px', 
            padding: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            marginBottom: '20px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>P2P Marketplace</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f5f5f7', lineHeight: '1.25', marginBottom: '8px', letterSpacing: '-0.4px' }}>Торговля Telegram Gifts & NFT</div>
            <div style={{ fontSize: '13px', color: '#a1a1a6', lineHeight: '1.4', marginBottom: '16px' }}>Безопасные транзакции в TON. Комиссия сервиса 3%.</div>
            <button onClick={() => setActiveTab('profile')} style={{ background: '#f5f5f7', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '980px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Продать свой NFT
            </button>
          </div>

          <div style={{ fontSize: '16px', fontWeight: '700', color: '#f5f5f7', marginBottom: '14px', letterSpacing: '-0.3px' }}>
            Доступные NFT
          </div>

          {marketItems.length === 0 ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)', padding: '40px 20px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#f5f5f7', marginBottom: '6px' }}>Каталог пуст</div>
              <div style={{ fontSize: '12px', color: '#86868b', maxWidth: '240px', margin: '0 auto' }}>Подключите кошелек и выставите свои предметы из вкладки «Профиль».</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {marketItems.map((item) => (
                <div key={item.id} style={{ 
                  background: 'rgba(255, 255, 255, 0.04)', 
                  borderRadius: '20px', 
                  padding: '12px', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    height: '130px', 
                    borderRadius: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: '#86868b', fontSize: '12px' }}>NFT</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#f5f5f7' }}>{item.name}</div>
                    <div style={{ color: '#86868b', fontSize: '11px' }}>{item.number}</div>
                  </div>

                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={loadingId === item.id}
                    style={{ 
                      background: '#0071e3', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '10px', 
                      borderRadius: '12px', 
                      fontWeight: '600', 
                      fontSize: '13px', 
                      width: '100%', 
                      cursor: 'pointer'
                    }}
                  >
                    {loadingId === item.id ? '...' : `${item.priceTon} TON`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Профиль */}
      {activeTab === 'profile' && (
        <main style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#fff', letterSpacing: '-0.4px' }}>Профиль</div>
          
          {/* Плашка аналитики Apple Style */}
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '18px', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px', backdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: '11px', color: '#86868b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px' }}>Подключенный кошелек</div>
            <div style={{ fontSize: '12px', color: '#0071e3', fontWeight: '600', wordBreak: 'break-all', marginBottom: '16px' }}>
              {userAddress ? userAddress : 'Не подключен'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#86868b' }}>NFT предметов</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{userNfts.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#86868b' }}>Статус</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: userAddress ? '#30d158' : '#ff453a' }}>{userAddress ? 'Подключен' : 'Отключен'}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px', color: '#f5f5f7', letterSpacing: '-0.3px' }}>
            Предметы в кошельке ({userNfts.length})
          </div>

          {!userAddress ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)', padding: '36px 20px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>Подключите кошелек</div>
              <div style={{ fontSize: '12px', color: '#86868b' }}>Нажмите «Connect Wallet» вверху.</div>
            </div>
          ) : isLoadingNfts ? (
            <div style={{ color: '#0071e3', fontSize: '13px', textAlign: 'center', padding: '30px', fontWeight: '500' }}>
              Загрузка предметов из TON...
            </div>
          ) : userNfts.length === 0 ? (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)', padding: '36px 20px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>NFT не найдены</div>
              <div style={{ fontSize: '12px', color: '#86868b' }}>На этом кошельке нет подарков или NFT.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {userNfts.map((nft, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '20px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(20px)' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', height: '120px', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {nft.imageUrl ? (
                      <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: '#86868b', fontSize: '12px' }}>NFT</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#f5f5f7' }}>{nft.name}</div>
                    <div style={{ color: '#0071e3', fontSize: '11px', fontWeight: '500' }}>{nft.collectionName}</div>
                  </div>

                  <button 
                    onClick={() => setSelectedNftForSale(nft)}
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Выставить
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Модалка выставления Apple Modal */}
          {selectedNftForSale && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100, backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)' }}>
              <div style={{ background: 'rgba(30, 30, 32, 0.9)', border: '1px solid rgba(255,255,255,0.12)', padding: '22px', borderRadius: '24px', width: '100%', maxWidth: '320px', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                <div style={{ fontWeight: '700', fontSize: '17px', marginBottom: '6px', letterSpacing: '-0.3px' }}>Продажа {selectedNftForSale.name}</div>
                <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '16px', lineHeight: '1.4' }}>Укажите цену в TON. Комиссия сервиса 3% удерживается с покупателя.</div>
                
                <input 
                  type="number" 
                  placeholder="Цена в TON" 
                  value={salePriceInput}
                  onChange={(e) => setSalePriceInput(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleListItemForSale}
                    style={{ flex: 1, background: '#0071e3', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Подтвердить
                  </button>
                  <button 
                    onClick={() => setSelectedNftForSale(null)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.08)', color: '#a1a1a6', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Нижнее меню Apple Glass */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(20, 20, 22, 0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', padding: '14px 0', zIndex: 20 }}>
        <button onClick={() => setActiveTab('market')} style={{ background: 'none', border: 'none', color: activeTab === 'market' ? '#fff' : '#86868b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          Маркет
        </button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#fff' : '#86868b', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          Профиль
        </button>
      </nav>
    </div>
  );
}
