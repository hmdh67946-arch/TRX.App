import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DARK_THEME } from './theme';

const ASSETS_LIST = ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD', 'DJI', 'IXIC', 'XBR/USD', 'XAG/USD'];[span_49](start_span)[span_49](end_span)
const TIMEFRAMES = ['1min', '5min', '15min', '1h', '4h', '1day'];[span_50](start_span)[span_50](end_span)

function mapSymbol(symbol = '') {
  const s = symbol.toUpperCase().trim();
  if (s === 'DJI') return 'US30';[span_51](start_span)[span_51](end_span)
  if (s === 'IXIC') return 'NDX';[span_52](start_span)[span_52](end_span)
  return s.replace('/', '');[span_53](start_span)[span_53](end_span)
}

export default function NaroAiScreen({ onBack, theme = DARK_THEME }) {
  const [asset, setAsset] = useState('XAU/USD');[span_54](start_span)[span_54](end_span)
  const [timeframe, setTimeframe] = useState('15min');[span_55](start_span)[span_55](end_span)
  const [openAiKey, setOpenAiKey] = useState('');
  const [marketApiKey, setMarketApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [livePrice, setLivePrice] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'app'));[span_56](start_span)[span_56](end_span)
        if (snap.exists()) {
          const d = snap.data();
          setOpenAiKey(d.openaiKey || '');[span_57](start_span)[span_57](end_span)
          setMarketApiKey(d.twelveKey || '');[span_58](start_span)[span_58](end_span)
        }
      } catch (e) {}
    };
    loadSettings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchPrice = async (sym) => {
    if (!marketApiKey) return null;
    try {
      const res = await fetch(`https://api.twelvedata.com/price?symbol=${mapSymbol(sym)}&apikey=${marketApiKey}`);[span_59](start_span)[span_59](end_span)
      const data = await res.json();
      return data?.price ? parseFloat(data.price) : null;
    } catch (e) {
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!openAiKey) {
      Alert.alert('تنبيه', 'لم يتم العثور على مفتاح الـ AI في قاعدة البيانات.');[span_60](start_span)[span_60](end_span)
      return;
    }

    setLoading(true);
    setSeconds(0);
    setAnalysis(null);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);[span_61](start_span)[span_61](end_span)

    try {
      const priceVal = await fetchPrice(asset);
      setLivePrice(priceVal);

      const prompt = `حلل الأصل ${asset} على الفريم ${timeframe} (السعر الحالي: ${priceVal || 'غير متوفر'}) وفق استراتيجية الاتجاه العام ومستويات فيبوناتشي (50%, 61.8%, 78.6%). أرجع JSON فقط بالحقول: pair, timeframe, trend, type, entry, sl_pips, reason.`;[span_62](start_span)[span_62](end_span)

      const res = await fetch('https://api.openai.com/v1/chat/completions', {[span_63](start_span)[span_63](end_span)
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.0,
        }),
      });

      const json = await res.json();
      const rawContent = json?.choices?.[0]?.message?.content;
      if (rawContent) {
        setAnalysis(JSON.parse(rawContent));
      } else {
        Alert.alert('خطأ', 'تعذر إتمام التحليل حالياً.');[span_64](start_span)[span_64](end_span)
      }
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الاتصال بخدمة التحليل.');[span_65](start_span)[span_65](end_span)
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>NARO AI</Text>[span_66](start_span)[span_66](end_span)
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>الزوج / الأصل</Text>[span_67](start_span)[span_67](end_span)
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {ASSETS_LIST.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, asset === item && styles.chipActive]}
              onPress={() => setAsset(item)}
            >
              <Text style={[styles.chipText, asset === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>الفريم الزمني</Text>[span_68](start_span)[span_68](end_span)
        <View style={styles.tfGrid}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.tfBtn, timeframe === tf && styles.chipActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.chipText, timeframe === tf && styles.chipTextActive]}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} disabled={loading}>
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.btnText}>جاري التحليل... {seconds}s</Text>[span_69](start_span)[span_69](end_span)
            </View>
          ) : (
            <Text style={styles.btnText}>تحليل الشارت الآن</Text>[span_70](start_span)[span_70](end_span)
          )}
        </TouchableOpacity>

        {analysis && (
          <View style={styles.resultBox}>
            {livePrice ? (
              <Text style={styles.livePriceText}>السعر الحالي: {livePrice}</Text>[span_71](start_span)[span_71](end_span)
            ) : null}
            <Text style={styles.resRow}>الزوج: {analysis.pair || asset}</Text>[span_72](start_span)[span_72](end_span)
            <Text style={styles.resRow}>الاتجاه: {analysis.trend || '---'}</Text>[span_73](start_span)[span_73](end_span)
            <Text style={styles.resRow}>نوع الأمر: {analysis.type || '---'}</Text>[span_74](start_span)[span_74](end_span)
            <Text style={styles.resRow}>سعر الدخول: {analysis.entry || '---'}</Text>[span_75](start_span)[span_75](end_span)
            <Text style={styles.resRow}>وقف الخسارة (نقاط): {analysis.sl_pips || '---'}</Text>[span_76](start_span)[span_76](end_span)
            <Text style={styles.reasonText}>{analysis.reason || ''}</Text>[span_77](start_span)[span_77](end_span)
          </View>
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
  content: { padding: 20, paddingBottom: 40 },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  chipScroll: { marginBottom: 18 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginLeft: 8,
  },
  chipActive: { backgroundColor: 'rgba(10, 132, 255, 0.18)', borderColor: '#0A84FF' },
  chipText: { color: '#9CA3AF', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#FFF' },
  tfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 22 },
  tfBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  analyzeBtn: {
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 22,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  resultBox: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  livePriceText: { color: '#10B981', fontSize: 16, fontWeight: '900', textAlign: 'right' },
  resRow: { color: '#FFF', fontSize: 14, fontWeight: '700', textAlign: 'right' },
  reasonText: { color: '#9CA3AF', fontSize: 13, lineHeight: 21, marginTop: 8, textAlign: 'right' },
});
