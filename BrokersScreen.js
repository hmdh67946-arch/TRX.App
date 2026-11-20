import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DARK_THEME } from './theme';

export default function BrokersScreen({ onBack, theme = DARK_THEME }) {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrokers = async () => {
      try {
        const q = query(collection(db, 'brokers'), orderBy('created_at', 'desc'));
        const snap = await getDocs(q);
        const items = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setBrokers(items);
      } catch (err) {
        console.warn('Brokers load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBrokers();
  }, []);

  const openLink = async (url) => {
    if (!url || !url.trim()) {
      Alert.alert('تنبيه', 'رابط الحساب غير متوفر حالياً');
      return;
    }
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    try {
      await Linking.openURL(finalUrl);
    } catch (e) {
      Alert.alert('خطأ', 'تعذر فتح الرابط.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>وكلاتنا</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introBox}>
          <Text style={styles.introText}>
            نحن نتعاون مع أفضل شركات الوساطة العالمية المرخصة والخاضعة للرقابة المالية، لضمان أمان أموالك وسرعة تنفيذ صفقاتك.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primaryBlue} style={{ marginTop: 30 }} />
        ) : brokers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>لم يتم إضافة أي وكالات حتى الآن.</Text>
          </View>
        ) : (
          brokers.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoLetter}>{(b.name || 'B').charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brokerName}>{b.name}</Text>
                  <Text style={styles.brokerDesc}>شريك تداول معتمد. يمكنك فتح حسابك الآن والاستفادة من المزايا.</Text>
                </View>
              </View>

              <View style={styles.tagsRow}>
                {b.spread ? (
                  <View style={[styles.tag, { borderColor: 'rgba(22,185,129,0.35)' }]}>
                    <Text style={{ color: '#16B981', fontSize: 12, fontWeight: '700' }}>السبريد: {b.spread}</Text>
                  </View>
                ) : null}
                {b.minDeposit ? (
                  <View style={[styles.tag, { borderColor: 'rgba(214,173,85,0.35)' }]}>
                    <Text style={{ color: '#D6AD55', fontSize: 12, fontWeight: '700' }}>أقل إيداع: {b.minDeposit}</Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity style={styles.openBtn} onPress={() => openLink(b.link)}>
                <Text style={styles.openBtnText}>فتح حساب الآن</Text>
              </TouchableOpacity>
            </View>
          ))
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
  introBox: {
    backgroundColor: 'rgba(10,132,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(10,132,255,0.25)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  introText: { color: '#EAEAEA', fontSize: 13, lineHeight: 20, textAlign: 'right' },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  card: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  brokerName: { color: '#FFF', fontSize: 17, fontWeight: '900', marginBottom: 4, textAlign: 'right' },
  brokerDesc: { color: '#9CA3AF', fontSize: 12, lineHeight: 18, textAlign: 'right' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  openBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  openBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
