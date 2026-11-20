import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

export default function AuthScreen({ initialMode = 'login', onAuthSuccess, onBack, theme = DARK_THEME }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword.trim());
      onAuthSuccess && onAuthSuccess(cred.user, 'login');
    } catch (err) {
      Alert.alert('خطأ في الدخول', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول الأساسية');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword.trim());
      const user = cred.user;

      await setDoc(doc(db, 'profiles', user.uid), {
        full_name: signupName.trim(),
        email: signupEmail.trim(),
        twoFactorEnabled: false,
        created_at: new Date(),
      });

      if (referralCode.trim()) {
        try {
          const q = query(collection(db, 'profiles'), where('myReferralCode', '==', referralCode.trim()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const referrerId = snap.docs[0].id;
            if (referrerId !== user.uid) {
              await addDoc(collection(db, 'referrals'), {
                referrer_id: referrerId,
                referred_id: user.uid,
                referred_name: signupName.trim(),
                status: 'pending',
                created_at: serverTimestamp(),
              });
            }
          }
        } catch (refErr) {
          console.warn('Referral error:', refErr);
        }
      }

      onAuthSuccess && onAuthSuccess(user, 'signup');
    } catch (err) {
      Alert.alert('خطأ في التسجيل', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      Alert.alert('تم الإرسال', 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
      setResetModalVisible(false);
    } catch (err) {
      Alert.alert('خطأ', err.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→ رجوع</Text>
          </TouchableOpacity>
        )}

        <View style={styles.logoArea}>
          <View style={styles.appIcon}>
            <Text style={styles.logoPart}>T</Text>
            <Text style={styles.logoPart}>R</Text>
            <Text style={[styles.logoPart, { color: theme.green }]}>X</Text>
          </View>
          <Text style={styles.subtitle}>منصتك الأولى للتداول الذكي</Text>
        </View>

        {mode === 'login' ? (
          <View style={styles.card}>
            <Text style={styles.title}>أهلاً بك مجدداً</Text>
            <Text style={styles.desc}>سجل دخولك لمتابعة الأسواق</Text>

            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={theme.textMuted}
              value={loginEmail}
              onChangeText={setLoginEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeText}>{showPass ? 'إخفاء' : 'إظهار'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => {
                setResetEmail(loginEmail);
                setResetModalVisible(true);
              }}
            >
              <Text style={styles.forgotText}>هل نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>تسجيل الدخول</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchBtn} onPress={() => setMode('signup')}>
              <Text style={styles.switchText}>
                ليس لديك حساب؟ <Text style={styles.linkText}>سجل الآن</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>حساب جديد</Text>
            <Text style={styles.desc}>انضم إلينا وابدأ رحلتك</Text>

            <Text style={styles.label}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              placeholder="الاسم الكامل"
              placeholderTextColor={theme.textMuted}
              value={signupName}
              onChangeText={setSignupName}
            />

            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={theme.textMuted}
              value={signupEmail}
              onChangeText={setSignupEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.textMuted}
              value={signupPassword}
              onChangeText={setSignupPassword}
              secureTextEntry
            />

            <Text style={styles.label}>كود الإحالة (اختياري)</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: TRX-A1B2"
              placeholderTextColor={theme.textMuted}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.mainBtn} onPress={handleSignup} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>إنشاء الحساب</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchBtn} onPress={() => setMode('login')}>
              <Text style={styles.switchText}>
                لديك حساب بالفعل؟ <Text style={styles.linkText}>تسجيل الدخول</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={resetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>استعادة كلمة المرور</Text>
            <Text style={styles.modalDesc}>أدخل بريدك الإلكتروني لإرسال رابط الاستعادة.</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={theme.textMuted}
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResetModalVisible(false)}>
                <Text style={styles.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSendReset}>
                <Text style={styles.mainBtnText}>إرسال</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 10 },
  backText: { color: '#9CA3AF', fontSize: 14, fontWeight: '700' },
  logoArea: { alignItems: 'center', marginBottom: 24 },
  appIcon: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#0A0F18',
    borderWidth: 1.5,
    borderColor: 'rgba(10, 132, 255, 0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPart: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  subtitle: { color: '#9CA3AF', fontSize: 13, marginTop: 10, fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  desc: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  label: { color: '#EAEAEA', fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'right' },
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
    textAlign: 'left',
  },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  eyeText: { color: '#38BDF8', fontSize: 12, fontWeight: '700' },
  forgotBtn: { alignSelf: 'flex-start', marginBottom: 18 },
  forgotText: { color: '#0A84FF', fontSize: 13, fontWeight: '700' },
  mainBtn: {
    backgroundColor: '#0A84FF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  switchBtn: { marginTop: 22, alignItems: 'center' },
  switchText: { color: '#9CA3AF', fontSize: 14 },
  linkText: { color: '#0A84FF', fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#0B1622',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  modalDesc: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  cancelText: { color: '#FFF', fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
  },
});
