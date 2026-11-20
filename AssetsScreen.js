import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { DARK_THEME } from './theme';

const INITIAL_ASSETS = [
  { name: 'الذهب', symbol: 'XAU/USD', tv: 'OANDA:XAUUSD', price: '0.00', change: '0.00%', isUp: true, type: 'المعادن', apiType: 'gold' },
  { name: 'الفضة', symbol: 'XAG/USD', tv: 'OANDA:XAGUSD', price: '0.00', change: '0.00%', isUp: true, type: 'المعادن', apiType: 'silver' },
  { name: 'البلاتين', symbol: 'XPT/USD', tv: 'OANDA:XPTUSD', price: '0.00', change: '0.00%', isUp: true, type: 'المعادن', apiType: 'static' },
  { name: 'يورو / دولار', symbol: 'EUR/USD', tv: 'FX:EURUSD', price: '0.00', change: '0.00%', isUp: true, type: 'العملات', apiType: 'eur' },
  { name: 'باوند / دولار', symbol: 'GBP/USD', tv: 'FX:GBPUSD', price: '0.00', change: '0.00%', isUp: true, type: 'العملات', apiType: 'gbp' },
  { name: 'دولار / ين', symbol: 'USD/JPY', tv: 'FX:USDJPY', price: '0.00', change: '0.00%', isUp: true, type: 'العملات', apiType: 'jpy' },
  { name: 'دولار / كندي', symbol: 'USD/CAD', tv: 'FX:USDCAD', price: '0.00', change: '0.00%', isUp: true, type: 'العملات', apiType: 'cad' },
  { name: 'دولار أسترالي', symbol: 'AUD/USD', tv: 'FX:AUDUSD', price: '0.00', change: '0.00%', isUp: true, type: 'العملات', apiType: 'aud' },
  { name: 'ناسداك 100', symbol: 'NAS100', tv: 'NASDAQ:NDX', price: '18,240.00', change: '-1.10%', isUp: false, type: 'المؤشرات', apiType: 'static' },
  { name: 'ستاندرد آند بورز', symbol: 'S&P 500', tv: 'SP:SPX', price: '5,200.00', change: '-0.30%', isUp: false, type: 'المؤشرات', apiType: 'static' },
  { name: 'داو جونز', symbol: 'US30', tv: 'DJ:DJI', price: '39,100.00', change: '+0.20%', isUp: true, type: 'المؤشرات', apiType: 'static' },
  { name: 'بيتكوين', symbol: 'BTC/USD', tv: 'BINANCE:BTCUSDT', price: '0.00', change: '0.00%', isUp: true, type: 'العملات الرقمية', apiType: 'BTCUSDT' },
  { name: 'إيثيريوم', symbol: 'ETH/USD', tv: 'BINANCE:ETHUSDT', price: '0.00', change: '0.00%', isUp: true, type: 'العملات الرقمية', apiType: 'ETHUSDT' },
  { name: 'سولانا', symbol: 'SOL/USD', tv: 'BINANCE:SOLUSDT', price: '0.00', change: '0.00%', isUp: true, type: 'العملات الرقمية', apiType: 'SOLUSDT' },
  { name: 'أبل', symbol: 'AAPL', tv: 'NASDAQ:AAPL', price: '175.00', change: '+0.60%', isUp: true, type: 'الأسهم', apiType: 'static' },
  { name: 'تسلا', symbol: 'TSLA', tv: 'NASDAQ:TSLA', price: '180.00', change: '-1.20%', isUp: false, type: 'الأسهم', apiType: 'static' },
  { name: 'النفط (WTI)', symbol: 'USOIL', tv: 'TVC:USOIL', price: '78.40', change: '+1.20%', isUp: true, type: 'الطاقة', apiType: 'static' },
];

export default function AssetsScreen({ onSelectAsset, onBack, theme = DARK_THEME }) {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLivePrices = useCallback(async () => {
    setLoading(true);
    try {
      const updated = [...INITIAL_ASSETS];

      try {
        const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const cryptoData = await cryptoRes.json();
        if (Array.isArray(cryptoData)) {
          updated.forEach((asset) => {
            if (['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].includes(asset.apiType)) {
              const coin = cryptoData.find((c) => c.symbol === asset.apiType);
              if (coin) {
                asset.price = parseFloat(coin.lastPrice).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });
                const chg = parseFloat(coin.priceChangePercent);
                asset.change = (chg > 0 ? '+' : '') + chg.toFixed(2) + '%';
                asset.isUp = chg >= 0;
              }
            }
          });
        }
      } catch (e) {}

      try {
        const goldRes = await fetch('https://api.gold-api.com/price/XAU');
        const goldData = await goldRes.json();
        const g = updated.find((a) => a.apiType === 'gold');
        if (g && goldData?.price) g.price = Number(goldData.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
      } catch (e) {}

      try {
        const silverRes = await fetch('https://api.gold-api.com/price/XAG');
        const silverData = await silverRes.json();
        const s = updated.find((a) => a.apiType === 'silver');
        if (s && silverData?.price) s.price = Number(silverData.price).toLocaleString('en-US', { minimumFractionDigits: 2 });
      } catch (e) {}

      try {
        const forexRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const forexData = await forexRes.json();
        if (forexData?.rates) {
          updated.forEach((asset) => {
            if (['eur', 'gbp', 'jpy', 'cad', 'aud'].includes(asset.apiType)) {
              const rate = forexData.rates[asset.apiType.toUpperCase()];
              if (rate) {
                asset.price = (1 / rate).toFixed(4);
                asset.change = 'مباشر';
                asset.isUp = true;
              }
            }
          });
        }
      } catch (e) {}

      setAssets(updated);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLivePrices();
    const timer = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(timer);
  }, [fetchLivePrices]);

  const toggleFav = (symbol) => {
    setFavorites((prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]));
  };

  const term = search.trim().toLowerCase();
  const filtered = assets.filter((a) => a.name.toLowerCase().includes(term) || a.symbol.toLowerCase().includes(term));
  const favList = term === '' ? filtered.filter((a) => favorites.includes(a.symbol)) : [];
  const otherList = term === '' ? filtered.filter((a) => !favorites.includes(a.symbol)) : filtered;
  const categories = [...new Set(otherList.map((a) => a.type))];

  const renderAssetCard = (asset) => {
    const isFav = favorites.includes(asset.symbol);
    return (
      <TouchableOpacity
        key={asset.symbol}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onSelectAsset && onSelectAsset(asset)}
      >
        <View style={styles.leftRow}>
          <TouchableOpacity style={styles.starBtn} onPress={() => toggleFav(asset.symbol)}>
            <Text style={{ color: isFav ? theme.gold : theme.textMuted, fontSize: 18 }}>{isFav ? '★' : '☆'}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetSymbol}>{asset.symbol}</Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.assetPrice}>{asset.price}</Text>
          <Text style={[styles.assetChange, { color: asset.isUp ? theme.green : theme.red }]}>{asset.change}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>اختر الأصل</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن أصل (مثال: ذهب، يورو، BTC)..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.liveBadge}>● أسعار مباشرة</Text>
        {loading && <ActivityIndicator size="small" color={theme.primaryBlue} />}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {favList.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.gold }]}>★ المفضلة</Text>
            {favList.map(renderAssetCard)}
          </View>
        )}

        {categories.map((cat) => (
          <View key={cat} style={styles.section}>
            <Text style={styles.sectionTitle}>{cat}</Text>
            {otherList.filter((a) => a.type === cat).map(renderAssetCard)}
          </View>
        ))}

        {filtered.length === 0 && <Text style={styles.emptyText}>لم يتم العثور على نتائج.</Text>}
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
  },
  title: { color: '#FFF', fontSize: 21, fontWeight: '900' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  searchWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchInput: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#FFF',
    fontSize: 15,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  liveBadge: { color: '#16B981', fontSize: 12, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 10, textAlign: 'right' },
  card: {
    backgroundColor: 'rgba(17, 28, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  starBtn: { padding: 4 },
  assetName: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  assetSymbol: { color: '#9CA3AF', fontSize: 12 },
  rightCol: { alignItems: 'flex-end' },
  assetPrice: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  assetChange: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  emptyText: { color: '#9CA3AF', textAlign: 'center', marginTop: 30, fontSize: 14 },
});
