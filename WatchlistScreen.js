import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

const ALL_ASSETS = [
  { name: 'الذهب', symbol: 'XAU/USD', tv: 'OANDA:XAUUSD' },
  { name: 'الفضة', symbol: 'XAG/USD', tv: 'OANDA:XAGUSD' },
  { name: 'يورو / دولار', symbol: 'EUR/USD', tv: 'FX:EURUSD' },
  { name: 'باوند / دولار', symbol: 'GBP/USD', tv: 'FX:GBPUSD' },
  { name: 'دولار / ين', symbol: 'USD/JPY', tv: 'FX:USDJPY' },
  { name: 'بيتكوين', symbol: 'BTC/USD', tv: 'BINANCE:BTCUSDT' },
  { name: 'إيثيريوم', symbol: 'ETH/USD', tv: 'BINANCE:ETHUSDT' },
  { name: 'ناسداك 100', symbol: 'NAS100', tv: 'NASDAQ:NDX' },
  { name: 'ستاندرد آند بورز', symbol: 'S&P 500', tv: 'SP:SPX' },
  { name: 'النفط (WTI)', symbol: 'USOIL', tv: 'TVC:USOIL' },
];

export default function WatchlistScreen({ onOpenChart, onBack, theme = DARK_THEME }) {
  const [watchlist, setWatchlist] = useState([]);
  const [search, setSearch] = useState('');
  const [livePrices, setLivePrices] = useState({});

  const fetchPrices = useCallback(async (symbols) => {
    if (!symbols || symbols.length === 0) return;
    const nextPrices = { ...livePrices };

    try {
      if (symbols.includes('OANDA:XAUUSD')) {
        const res = await fetch('https://api.gold-api.com/price/XAU');
        const data = await res.json();
        if (data?.price) {
          nextPrices['OANDA:XAUUSD'] = {
            price: Number(data.price).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            change: '+0.15%',
            isUp: true,
          };
        }
      }
    } catch (e) {}

    try {
      if (symbols.includes('BINANCE:BTCUSDT') || symbols.includes('BINANCE:ETHUSDT')) {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const arr = await res.json();
        if (Array.isArray(arr)) {
          ['BTCUSDT', 'ETHUSDT'].forEach((sym) => {
            const tvKey = `BINANCE:${sym}`;
            if (symbols.includes(tvKey)) {
              const coin = arr.find((c) => c.symbol === sym);
              if (coin) {
                const chg = parseFloat(coin.priceChangePercent);
                nextPrices[tvKey] = {
                  price: parseFloat(coin.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                  change: (chg > 0 ? '+' : '') + chg.toFixed(2) + '%',
                  isUp: chg >= 0,
                };
              }
            }
          });
        }
      }
    } catch (e) {}

    setLivePrices(nextPrices);
  }, [livePrices]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'profiles', user.uid), (snap) => {
      const list = snap.exists() && Array.isArray(snap.data().watchlist) ? snap.data().watchlist : [];
      setWatchlist(list);
      fetchPrices(list);
    });

    return () => unsub();
  }, [fetchPrices]);

  const term = search.trim().toLowerCase();
  const searchMatches = term
    ? ALL_ASSETS.filter(
        (a) =>
          !watchlist.includes(a.tv) &&
          (a.name.toLowerCase().includes(term) || a.symbol.toLowerCase().includes(term))
      )
    : [];

  const handleAdd = async (tvSymbol) => {
    if (watchlist.includes(tvSymbol)) return;
    const updated = [...watchlist, tvSymbol];
    setWatchlist(updated);
    setSearch('');
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'profiles', user.uid), { watchlist: updated });
      } catch (e) {}
    }
  };

  const handleRemove = async (tvSymbol) => {
    const updated = watchlist.filter((s) => s !== tvSymbol);
    setWatchlist(updated);
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'profiles', user.uid), { watchlist: updated });
      } catch (e) {}
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>قائمة المتابعة</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث لإضافة أصل (ذهب، يورو، BTC)..."
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
        />

        {term.length > 0 && (
          <View style={styles.resultsBox}>
            {searchMatches.length === 0 ? (
              <Text style={styles.noResult}>لا توجد نتائج أو الأصل مضاف مسبقاً.</Text>
            ) : (
              searchMatches.map((asset) => (
                <View key={asset.tv} style={styles.resultItem}>
                  <View>
                    <Text style={styles.resName}>{asset.name}</Text>
                    <Text style={styles.resSym}>{asset.symbol}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(asset.tv)}>
                    <Text style={styles.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {watchlist.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyStar}>☆</Text>
            <Text style={styles.emptyText}>قائمة المتابعة فارغة. ابحث في الأعلى لإضافة أصولك المفضلة.</Text>
          </View>
        ) : (
          watchlist.map((tvSym) => {
            const info = ALL_ASSETS.find((a) => a.tv === tvSym) || { name: 'أصل', symbol: tvSym };
            const pData = livePrices[tvSym] || { price: '...', change: '0.00%', isUp: true };
            return (
              <TouchableOpacity
                key={tvSym}
                style={styles.card}
                onPress={() => onOpenChart && onOpenChart(tvSym, info.name)}
              >
                <View>
                  <Text style={styles.assetName}>{info.name}</Text>
                  <Text style={styles.assetSymbol}>{info.symbol}</Text>
                </View>
                <View style={styles.rightGroup}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.price}>{pData.price}</Text>
                    <Text style={[styles.change, { color: pData.isUp ? '#10B981' : '#EF4444' }]}>
                      {pData.change}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.delBtn}
                    onPress={() => {
                      Alert.alert('حذف', 'إزالة الأصل من قائمة المتابعة؟', [
                        { text: 'إلغاء', style: 'cancel' },
                        { text: 'حذف', style: 'destructive', onPress: () => handleRemove(tvSym) },
                      ]);
                    }}
                  >
                    <Text style={styles.delText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 20, paddingTop: 14, zIndex: 20 },
  searchInput: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFF',
    fontSize: 14,
    textAlign: 'right',
  },
  resultsBox: {
    backgroundColor: '#0E1A26',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    marginTop: 8,
    padding: 8,
  },
  noResult: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', padding: 10 },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  resSym: { color: '#9CA3AF', fontSize: 11 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 132, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#0A84FF', fontSize: 18, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 40 },
  emptyBox: { alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
  emptyStar: { fontSize: 46, color: '#4B5563', marginBottom: 10 },
  emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: 'rgba(17, 28, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetName: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  assetSymbol: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  price: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  change: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  delBtn: {
    backgroundColor: 'rgba(239,68,68,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  delText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
});
