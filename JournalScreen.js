import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

const EMOTIONS = [
  { key: 'confident', emoji: '💪', label: 'ثقة' },
  { key: 'fear', emoji: '😨', label: 'خوف' },
  { key: 'greed', emoji: '🤑', label: 'طمع' },
  { key: 'anxiety', emoji: '😰', label: 'توتر' },
  { key: 'neutral', emoji: '😐', label: 'هادئ' },
];

export default function JournalScreen({ onBack, theme = DARK_THEME }) {
  const [trades, setTrades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('buy'); // 'buy' | 'sell'
  const [result, setResult] = useState('win'); // 'win' | 'loss' | 'breakeven'
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [emotion, setEmotion] = useState('confident');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'journal'), where('user_id', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      setTrades(list);
    });

    return () => unsub();
  }, []);

  const totalTrades = trades.length;
  const winTrades = trades.filter((t) => t.result === 'win').length;
  const winRate = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0;

  const handleSaveTrade = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('تنبيه', 'يرجى تسجيل الدخول أولاً');
    if (!symbol.trim() || !entry.trim() || !exit.trim()) {
      return Alert.alert('تنبيه', 'يرجى إدخال الزوج وسعر الدخول والخروج');
    }

    try {
      await addDoc(collection(db, 'journal'), {
        user_id: user.uid,
        symbol: symbol.trim().toUpperCase(),
        type,
        result,
        entry: entry.trim(),
        exit: exit.trim(),
        notes: notes.trim(),
        emotion,
        created_at: serverTimestamp(),
      });
      setSymbol('');
      setEntry('');
      setExit('');
      setNotes('');
      setEmotion('confident');
      setModalVisible(false);
    } catch (e) {
      Alert.alert('خطأ', 'تعذر حفظ الصفقة');
    }
  };

  const handleDeleteTrade = (id) => {
    Alert.alert('حذف الصفقة', 'هل أنت متأكد من حذف هذه الصفقة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'journal', id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>يوميات التداول</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>إجمالي الصفقات</Text>
          <Text style={styles.statVal}>{totalTrades}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>نسبة النجاح</Text>
          <Text style={[styles.statVal, { color: '#10B981' }]}>{winRate}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>الرابحة</Text>
          <Text style={[styles.statVal, { color: '#10B981' }]}>{winTrades}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {trades.length === 0 ? (
          <Text style={styles.emptyText}>لم تقم بإضافة أي صفقات بعد.</Text>
        ) : (
          trades.map((tr) => {
            const emObj = EMOTIONS.find((e) => e.key === tr.emotion) || EMOTIONS[0];
            const resLabel = tr.result === 'win' ? 'ربح' : tr.result === 'loss' ? 'خسارة' : 'تعادل';
            const resColor = tr.result === 'win' ? '#10B981' : tr.result === 'loss' ? '#EF4444' : '#9CA3AF';

            return (
              <View key={tr.id} style={styles.tradeCard}>
                <View style={styles.tradeTop}>
                  <View style={styles.symbolRow}>
                    <Text style={styles.tradeSymbol}>{tr.symbol}</Text>
                    <View style={[styles.typePill, tr.type === 'buy' ? styles.buyPill : styles.sellPill]}>
                      <Text style={{ color: tr.type === 'buy' ? '#10B981' : '#EF4444', fontSize: 11, fontWeight: '800' }}>
                        {tr.type === 'buy' ? 'شراء' : 'بيع'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteTrade(tr.id)}>
                    <Text style={styles.delTrade}>حذف</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tradeMeta}>
                  <Text style={styles.metaText}>دخول: {tr.entry}</Text>
                  <Text style={styles.metaText}>خروج: {tr.exit}</Text>
                  <Text style={[styles.metaText, { color: resColor, fontWeight: '900' }]}>{resLabel}</Text>
                </View>

                <View style={styles.emoRow}>
                  <Text style={styles.emoBadge}>
                    {emObj.emoji} {emObj.label}
                  </Text>
                </View>

                {tr.notes ? <Text style={styles.notesText}>{tr.notes}</Text> : null}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>إضافة صفقة جديدة</Text>

              <Text style={styles.label}>الزوج / الأصل</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: XAU/USD"
                placeholderTextColor="#6B7280"
                value={symbol}
                onChangeText={setSymbol}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>نوع الصفقة</Text>
              <View style={styles.choiceRow}>
                {['buy', 'sell'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.choiceBtn, type === t && styles.choiceActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={styles.choiceText}>{t === 'buy' ? 'شراء (Buy)' : 'بيع (Sell)'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>النتيجة</Text>
              <View style={styles.choiceRow}>
                {[
                  { k: 'win', l: 'ربح' },
                  { k: 'loss', l: 'خسارة' },
                  { k: 'breakeven', l: 'تعادل' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.k}
                    style={[styles.choiceBtn, result === r.k && styles.choiceActive]}
                    onPress={() => setResult(r.k)}
                  >
                    <Text style={styles.choiceText}>{r.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>سعر الدخول</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#6B7280"
                    value={entry}
                    onChangeText={setEntry}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>سعر الخروج</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#6B7280"
                    value={exit}
                    onChangeText={setExit}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.label}>كيف كان شعورك وقت الدخول؟</Text>
              <View style={styles.emoGrid}>
                {EMOTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.emoBtn, emotion === item.key && styles.emoBtnActive]}
                    onPress={() => setEmotion(item.key)}
                  >
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    <Text style={styles.emoLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>ملاحظات (اختياري)</Text>
              <TextInput
                style={styles.input}
                placeholder="سبب الدخول، الاستراتيجية..."
                placeholderTextColor="#6B7280"
                value={notes}
                onChangeText={setNotes}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTrade}>
                <Text style={styles.saveBtnText}>حفظ الصفقة</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  statsRow: { flexDirection: 'row', gap: 10, padding: 18 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(17, 28, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  statVal: { color: '#0A84FF', fontSize: 18, fontWeight: '900' },
  listContent: { paddingHorizontal: 18, paddingBottom: 100 },
  emptyText: { color: '#9CA3AF', textAlign: 'center', marginTop: 30, fontSize: 14 },
  tradeCard: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },
  tradeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  symbolRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tradeSymbol: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  typePill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  buyPill: { backgroundColor: 'rgba(16, 185, 129, 0.16)' },
  sellPill: { backgroundColor: 'rgba(239, 68, 68, 0.16)' },
  delTrade: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
  tradeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
    marginBottom: 10,
  },
  metaText: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
  emoRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  emoBadge: {
    color: '#FFF',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  notesText: { color: '#9CA3AF', fontSize: 12, marginTop: 8, textAlign: 'right' },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#0B1622',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 22,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  label: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', marginBottom: 6, textAlign: 'right' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 14,
  },
  choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  choiceBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  choiceActive: { borderColor: '#0A84FF', backgroundColor: 'rgba(10, 132, 255, 0.16)' },
  choiceText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  row2: { flexDirection: 'row', gap: 10 },
  emoGrid: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  emoBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emoBtnActive: { borderColor: '#0A84FF', backgroundColor: 'rgba(10, 132, 255, 0.16)' },
  emoLabel: { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: 2 },
  saveBtn: { backgroundColor: '#0A84FF', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  cancelBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#9CA3AF', fontSize: 13, fontWeight: '700' },
});
