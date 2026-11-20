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
  Linking,
} from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';[span_5](start_span)[span_5](end_span)
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';[span_6](start_span)[span_6](end_span)
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

function formatUrl(type, value) {
  if (!value || !value.trim() || value === 'null') return null;[span_7](start_span)[span_7](end_span)
  const v = value.trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;[span_8](start_span)[span_8](end_span)
  if (type === 'whatsapp') return `https://wa.me/${v.replace(/\D/g, '')}`;[span_9](start_span)[span_9](end_span)
  if (type === 'telegram') return `https://t.me/${v.replace('@', '')}`;[span_10](start_span)[span_10](end_span)
  if (type === 'tiktok') return `https://www.tiktok.com/@${v.replace('@', '')}`;[span_11](start_span)[span_11](end_span)
  if (type === 'instagram') return `https://www.instagram.com/${v.replace('@', '')}`;[span_12](start_span)[span_12](end_span)
  return `https://${v}`;[span_13](start_span)[span_13](end_span)
}

export default function ProfileScreen({
  onBack,
  onNavigate,
  onLogoutSuccess,
  theme = DARK_THEME,
}) {
  const [user, setUser] = useState(auth.currentUser);
  const [fullName, setFullName] = useState('');[span_14](start_span)[span_14](end_span)
  const [planName, setPlanName] = useState('الباقة المجانية');[span_15](start_span)[span_15](end_span)
  const [daysLeft, setDaysLeft] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    telegram: null,
    whatsapp: null,
    instagram: null,
    tiktok: null,
  });

  const [editModal, setEditModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [socialModal, setSocialModal] = useState(false);

  useEffect(() => {
    let unsubProfile = null;
    let unsubSettings = null;
    let unsubSub = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {[span_16](start_span)[span_16](end_span)
      setUser(u);
      if (!u) return;

      unsubProfile = onSnapshot(doc(db, 'profiles', u.uid), (snap) => {[span_17](start_span)[span_17](end_span)
        if (snap.exists()) {
          setFullName(snap.data().full_name || u.email?.split('@')[0] || 'مستخدم');[span_18](start_span)[span_18](end_span)
        }
      });

      unsubSettings = onSnapshot(doc(db, 'settings', 'app'), (snap) => {[span_19](start_span)[span_19](end_span)
        if (snap.exists()) {
          const d = snap.data();
          setSocialLinks({
            telegram: formatUrl('telegram', d.linkTelegram),[span_20](start_span)[span_20](end_span)
            whatsapp: formatUrl('whatsapp', d.linkWhatsapp),[span_21](start_span)[span_21](end_span)
            instagram: formatUrl('instagram', d.linkInsta),[span_22](start_span)[span_22](end_span)
            tiktok: formatUrl('tiktok', d.linkTiktok),[span_23](start_span)[span_23](end_span)
          });
        }
      });

      const qSub = query(
        collection(db, 'subscriptions'),[span_24](start_span)[span_24](end_span)
        where('user_id', '==', u.uid),
        where('status', '==', 'active')
      );
      unsubSub = onSnapshot(qSub, (snap) => {
        if (!snap.empty) {
          const sub = snap.docs[0].data();
          const startDate = sub.start_date?.toDate ? sub.start_date.toDate() : new Date();[span_25](start_span)[span_25](end_span)
          const expiryDate = new Date(startDate);
          expiryDate.setDate(expiryDate.getDate() + 30);[span_26](start_span)[span_26](end_span)
          const rem = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));[span_27](start_span)[span_27](end_span)
          if (rem > 0) {
            setPlanName(sub.plan_name || 'اشتراك نشط');[span_28](start_span)[span_28](end_span)
            setDaysLeft(rem);
            return;
          }
        }
        setPlanName('الباقة المجانية');[span_29](start_span)[span_29](end_span)
        setDaysLeft(null);
      });
    });

    return () => {
      unsubAuth();
      unsubProfile && unsubProfile();
      unsubSettings && unsubSettings();
      unsubSub && unsubSub();
    };
  }, []);

  const handleSaveName = async () => {
    const clean = nameInput.trim();
    if (!clean || !user) return;
    try {
      await updateDoc(doc(db, 'profiles', user.uid), { full_name: clean });[span_30](start_span)[span_30](end_span)
      setFullName(clean);
      setEditModal(false);
      Alert.alert('تم الحفظ', 'تم تحديث الاسم بنجاح');[span_31](start_span)[span_31](end_span)
    } catch (e) {
      Alert.alert('خطأ', 'تعذر تحديث الاسم');
    }
  };

  const handleOpenSocial = async (url) => {
    if (!url) return Alert.alert('تنبيه', 'الرابط غير متوفر حالياً');
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('خطأ', 'تعذر فتح الرابط');
    }
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [[span_32](start_span)[span_32](end_span)
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'خروج',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);[span_33](start_span)[span_33](end_span)
          onLogoutSuccess && onLogoutSuccess();
        },
      },
    ]);
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'متداول';[span_34](start_span)[span_34](end_span)
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>الملف الشخصي</Text>[span_35](start_span)[span_35](end_span)
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>[span_36](start_span)[span_36](end_span)
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user?.email || '...'}</Text>

          <View style={styles.badgeRow}>
            <Text style={styles.planText}>♛ {planName}</Text>
            {daysLeft !== null && <Text style={styles.daysBadge}>متبقي {daysLeft} يوم</Text>}[span_37](start_span)[span_37](end_span)
          </View>
        </View>

        <View style={styles.listCard}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              setNameInput(displayName);
              setEditModal(true);
            }}
          >
            <Text style={styles.rowLabel}>تعديل الاسم</Text>[span_38](start_span)[span_38](end_span)
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => onNavigate && onNavigate('settings')}
          >
            <Text style={styles.rowLabel}>إعدادات التطبيق</Text>[span_39](start_span)[span_39](end_span)
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={() => setSocialModal(true)}
          >
            <Text style={styles.rowLabel}>المجتمع وروابط التواصل</Text>[span_40](start_span)[span_40](end_span)
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>[span_41](start_span)[span_41](end_span)
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>تعديل الاسم</Text>[span_42](start_span)[span_42](end_span)
            <TextInput
              style={styles.input}
              placeholder="اكتب اسمك الجديد...[span_43](start_span)"[span_43](end_span)
              placeholderTextColor="#6B7280"
              value={nameInput}
              onChangeText={setNameInput}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>إلغاء</Text>[span_44](start_span)[span_44](end_span)
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                <Text style={styles.saveText}>حفظ</Text>[span_45](start_span)[span_45](end_span)
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={socialModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>تابعنا على مواقع التواصل</Text>[span_46](start_span)[span_46](end_span)
            {[
              { key: 'telegram', label: 'قناة التلغرام' },[span_47](start_span)[span_47](end_span)
              { key: 'whatsapp', label: 'قناة الواتساب' },[span_48](start_span)[span_48](end_span)
              { key: 'instagram', label: 'حساب انستغرام' },[span_49](start_span)[span_49](end_span)
              { key: 'tiktok', label: 'حساب تيك توك' },[span_50](start_span)[span_50](end_span)
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.socialItem}
                onPress={() => handleOpenSocial(socialLinks[item.key])}
              >
                <Text style={styles.socialText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelBtn, { width: '100%', marginTop: 8 }]}
              onPress={() => setSocialModal(false)}
            >
              <Text style={styles.cancelText}>إغلاق</Text>[span_51](start_span)[span_51](end_span)
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  userCard: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#D4AF37', fontSize: 36, fontWeight: '900' },
  userName: { color: '#FFF', fontSize: 21, fontWeight: '900', marginBottom: 4 },
  userEmail: { color: '#9CA3AF', fontSize: 13, marginBottom: 14 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  planText: { color: '#D4AF37', fontSize: 13, fontWeight: '800' },
  daysBadge: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  listCard: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLabel: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  arrow: { color: '#9CA3AF', fontSize: 18, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '900' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalBox: {
    backgroundColor: '#0B1622',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: { color: '#FFF', fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  modalRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: { color: '#FFF', fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: '#0A84FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#FFF', fontWeight: '800' },
  socialItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  socialText: { color: '#FFF', fontSize: 14, fontWeight: '700', textAlign: 'right' },
});
