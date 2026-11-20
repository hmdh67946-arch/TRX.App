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
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

const MAX_ALERTS = 5;

export default function AlertsScreen({ onBack, theme = DARK_THEME }) {
  const [alerts, setAlerts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [asset, setAsset] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('above'); // 'above' | 'below'

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'price_alerts'),
      where('user_id', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setAlerts(list);
    });

    return () => unsub();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('تنبيه', 'يرجى تسجيل الدخول أولاً');
      return;
    }
    if (alerts.length >= MAX_ALERTS) {
      Alert.alert('الحد الأقصى', `لقد وصلت للحد الأقصى (${MAX_ALERTS} تنبيهات).`);
      return;
    }
    const numPrice = parseFloat(price);
    if (!asset.trim() || isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الأصل وسعر صحيح.');
      return;
    }

    try {
      await addDoc(collection(db, 'price_alerts'), {
        user_id: user.uid,
        asset: asset.trim().toUpperCase(),
        target_price: numPrice,
        condition,
        status: 'active',
        created_at: serverTimestamp(),
      });
      setAsset('');
      setPrice('');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('خطأ', 'تعذر حفظ التنبيه.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('حذف التنبيه', 'هل أنت متأكد من حذف هذا التنبيه؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'price_alerts', id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0B192C' }]}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <Text style={styles.btnText}>→</Text>
          </TouchableOpacity>
        )}
        <View style={styles.centerTitle}>
          <Text style={styles.title}>تنبيهات الأسعار</Text>
          <Text style={styles.subtitle}>
            {alerts.length}/{MAX_ALERTS} تنبيهات مستخدمة
          </Text>
        </View>
        <TouchableOpacity style={[styles.iconBtn, styles.plusBtn]} onPress={() => setModalVisible(true)}>
          <Text style={[styles.btnText, { color: '#38BDF8' }]}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {alerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>لا توجد تنبيهات</Text>
            <Text style={styles.emptyDesc}>اضغط أدناه لإنشاء أول تنبيه سعر.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.createBtnText}>+ إنشاء تنبيه</Text>
            </TouchableOpacity>
          </View>
        ) : (
          alerts.map((item) => (
            <View key={item.id} style={styles.alertCard}>
              <View>
                <Text style={styles.alertAsset}>{item.asset}</Text>
                <Text style={styles.alertCond}>
                  عندما يصبح السعر{' '}
                  <Text style={{ color: '#38BDF8', fontWeight: '800' }}>
                    {item.condition === 'above' ? 'أعلى من' : 'أقل من'}
                  </Text>{' '}
                  {item.target_price}
                </Text>
              </View>
              <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.delText}>حذف</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>تنبيه سعر جديد</Text>

            <Text style={styles.label}>الأصل</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: XAU/USD"
              placeholderTextColor="#6B7280"
              value={asset}
              onChangeText={setAsset}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>السعر</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: 4700"
              placeholderTextColor="#6B7280"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View style={styles.condRow}>
              <TouchableOpacity
                style={[styles.condBtn, condition === 'below' && styles.condActive]}
                onPress={() => setCondition('below')}
              >
                <Text style={styles.condText}>أقل من</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.condBtn, condition === 'above' && styles.condActive]}
                onPress={() => setCondition('above')}
              >
                <Text style={styles.condText}>أعلى من</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleSave}>
              <Text style={styles.createBtnText}>إنشاء تنبيه</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelLinkText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBtn: { borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)' },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  centerTitle: { alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  subtitle: { color: '#8FA3B8', fontSize: 12, marginTop: 2 },
  content: { padding: 20, paddingBottom: 40 },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  emptyDesc: { color: '#8FA3B8', fontSize: 14, marginBottom: 22, textAlign: 'center' },
  createBtn: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  createBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  alertCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertAsset: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 4 },
  alertCond: { color: '#8FA3B8', fontSize: 13 },
  delBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  delText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0B192C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetTitle: { color: '#FFF', fontSize: 19, fontWeight: '900', textAlign: 'center', marginBottom: 18 },
  label: { color: '#FFF', fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'right' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 16,
  },
  condRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  condBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  condActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)' },
  condText: { color: '#FFF', fontWeight: '700' },
  cancelLink: { marginTop: 14, alignItems: 'center', paddingVertical: 8 },
  cancelLinkText: { color: '#8FA3B8', fontSize: 14, fontWeight: '700' },
});
