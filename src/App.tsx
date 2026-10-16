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
  accentColor: string;
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

      if (sellerAmountNano > 0n) {
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
      alert(`Транзакция отправлена! Вы купили ${item.name}.`);
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
      accentColor: '#ec4899',
      symbol: 'NFT',
      imageUrl: selectedNftForSale.imageUrl
    };

    setMarketItems([newItem, ...marketItems]);
    setSelectedNftForSale(null);
    setSalePriceInput('');
    setActiveTab('market');
    alert(`Ваш NFT "${selectedNftForSale.name}" выставлен на продажу за ${price} TON!`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '85px',
      color: '#f8fafc',
      background: 'linear-gradient(-45deg, #05050a, #0f0c20, #090d16, #1a0b1e, #030712)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 18s ease infinite'
    }}>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {/* Шапка */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '18px', letterSpacing: '0.5px' }}>TonVia</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>NFT Marketplace</div>
        </div>
        <TonConnectButton />
      </header>

      {/* Маркет */}
      {activeTab === 'market' && (
        <main style={{ padding: '16px' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' }}>Обзор</button>
            <button style={{ background: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}>Аренда</button>
            <button style={{ background: 'rgba(15, 23, 42, 0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}>Фильтр</button>
          </div>

          <div style={{ fontSize: '14px', fontWeight: '700', color: '#cbd5e1', marginBottom: '12px' }}>Выставленные Подарки & NFT</div>

          {marketItems.length === 0 ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.15)', padding: '40px 20px', textAlign: 'center', color: '#94a3b8', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' }}>Каталог пока пуст</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Будьте первым! Выставьте свой NFT на продажу из вкладки «Профиль».</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {marketItems.map((item) => (
                <div key={item.id} style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '18px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.37)' }}>
                  
                  <div style={{ 
                    background: 'rgba(30, 41, 59, 0.5)', 
                    border: `1px solid ${item.accentColor}44`,
                    height: '130px', 
                    borderRadius: '14px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '12px' }}>NFT</div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>{item.name}</div>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>{item.number}</div>
                  </div>

                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={loadingId === item.id}
                    style={{ 
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '10px', 
                      borderRadius: '12px', 
                      fontWeight: '700', 
                      fontSize: '13px', 
                      width: '100%', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    {loadingId === item.id ? 'Обработка...' : `${item.priceTon} TON`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Профиль */}
      {activeTab === 'profile' && (
        <main style={{ padding: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Профиль</div>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: '#94a3b8', marginBottom: '20px', wordBreak: 'break-all', backdropFilter: 'blur(10px)' }}>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Кошелек:</span>
            {userAddress ? userAddress : 'Не подключен'}
          </div>

          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
            Реальные NFT в кошельке ({userNfts.length})
          </div>

          {!userAddress ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.15)', padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', backdropFilter: 'blur(8px)' }}>
              Подключите кошелек, чтобы увидеть свои NFT.
            </div>
          ) : isLoadingNfts ? (
            <div style={{ color: '#38bdf8', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
              Загрузка NFT из блокчейна TON...
            </div>
          ) : userNfts.length === 0 ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.15)', padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', backdropFilter: 'blur(8px)' }}>
              На этом кошельке пока нет NFT или Подарков.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {userNfts.map((nft, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '18px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px', backdropFilter: 'blur(10px)' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', height: '120px', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {nft.imageUrl ? (
                      <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '12px' }}>NFT</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#f1f5f9' }}>{nft.name}</div>
                    <div style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>{nft.collectionName}</div>
                  </div>

                  <button 
                    onClick={() => setSelectedNftForSale(nft)}
                    style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Выставить на продажу
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Модалка выставления на продажу */}
          {selectedNftForSale && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100, backdropFilter: 'blur(6px)' }}>
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '320px', color: '#fff' }}>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>Продажа {selectedNftForSale.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Укажите цену продажи. Комиссия площадки (3%) будет рассчитана автоматически.</div>
                
                <input 
                  type="number" 
                  placeholder="Цена в TON (напр. 2)" 
                  value={salePriceInput}
                  onChange={(e) => setSalePriceInput(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleListItemForSale}
                    style={{ flex: 1, background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Подтвердить
                  </button>
                  <button 
                    onClick={() => setSelectedNftForSale(null)}
                    style={{ flex: 1, background: '#334155', color: '#94a3b8', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Навигация */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', padding: '12px 0', zIndex: 10 }}>
        <button onClick={() => setActiveTab('market')} style={{ background: 'none', border: 'none', color: activeTab === 'market' ? '#38bdf8' : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          Маркет
        </button>
        <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? '#38bdf8' : '#64748b', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          Профиль
        </button>
      </nav>
    </div>
  );
}
