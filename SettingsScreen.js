import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';[span_53](start_span)[span_53](end_span)
import { doc, getDoc, updateDoc } from 'firebase/firestore';[span_54](start_span)[span_54](end_span)
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

function generateBase32Secret(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';[span_55](start_span)[span_55](end_span)
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));[span_56](start_span)[span_56](end_span)
  }
  return secret;
}

export default function SettingsScreen({ onBack, theme = DARK_THEME }) {
  const [darkMode, setDarkMode] = useState(true);[span_57](start_span)[span_57](end_span)
  const [lang, setLang] = useState('ar');[span_58](start_span)[span_58](end_span)

  const [langModal, setLangModal] = useState(false);
  const [passModal, setPassModal] = useState(false);
  const [twoFaModal, setTwoFaModal] = useState(false);
  const [infoModal, setInfoModal] = useState({ visible: false, title: '', body: '' });

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'profiles', user.uid))
      .then((snap) => {
        if (snap.exists() && snap.data().twoFactorEnabled) {[span_59](start_span)[span_59](end_span)
          setTwoFaEnabled(true);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleChangePassword = async () => {
    if (!user) return;
    if (!currentPass || !newPass) return Alert.alert('تنبيه', 'يرجى ملء جميع الحقول');[span_60](start_span)[span_60](end_span)
    if (newPass.length < 6) return Alert.alert('تنبيه', 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');[span_61](start_span)[span_61](end_span)

    setSavingPass(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPass);[span_62](start_span)[span_62](end_span)
      await reauthenticateWithCredential(user, cred);[span_63](start_span)[span_63](end_span)
      await updatePassword(user, newPass);[span_64](start_span)[span_64](end_span)
      Alert.alert('تم بنجاح', 'تم تغيير كلمة المرور بنجاح');[span_65](start_span)[span_65](end_span)
      setCurrentPass('');
      setNewPass('');
      setPassModal(false);
    } catch (e) {
      Alert.alert('خطأ', e.code === 'auth/wrong-password' ? 'كلمة المرور الحالية غير صحيحة' : e.message);[span_66](start_span)[span_66](end_span)
    } finally {
      setSavingPass(false);
    }
  };

  const openTwoFa = async () => {
    if (!user) return;
    setTwoFaModal(true);
    try {
      const snap = await getDoc(doc(db, 'profiles', user.uid));[span_67](start_span)[span_67](end_span)
      const enabled = snap.exists() && Boolean(snap.data().twoFactorEnabled);[span_68](start_span)[span_68](end_span)
      setTwoFaEnabled(enabled);
      if (!enabled) {
        setSecretKey(generateBase32Secret(16));[span_69](start_span)[span_69](end_span)
        setVerifyCode('');
      }
    } catch (e) {}
  };

  const handleEnable2FA = async () => {
    if (!user) return;
    if (verifyCode.trim().length !== 6) {
      return Alert.alert('تنبيه', 'يرجى إدخال رمز مكون من 6 أرقام');[span_70](start_span)[span_70](end_span)
    }
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {[span_71](start_span)[span_71](end_span)
        twoFactorEnabled: true,
        twoFactorSecret: secretKey,
      });
      setTwoFaEnabled(true);
      setTwoFaModal(false);
      Alert.alert('تم التفعيل', 'تم تفعيل التحقق بخطوتين بنجاح');[span_72](start_span)[span_72](end_span)
    } catch (e) {
      Alert.alert('خطأ', 'تعذر تفعيل التحقق بخطوتين');
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;
    Alert.alert('إيقاف التحقق بخطوتين', 'هل أنت متأكد من إيقاف ميزة التحقق بخطوتين؟', [[span_73](start_span)[span_73](end_span)
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إيقاف',
        style: 'destructive',
        onPress: async () => {
          await updateDoc(doc(db, 'profiles', user.uid), {[span_74](start_span)[span_74](end_span)
            twoFactorEnabled: false,
            twoFactorSecret: '',
          });
          setTwoFaEnabled(false);
          setTwoFaModal(false);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</Text>[span_75](start_span)[span_75](end_span)
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.group}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{lang === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</Text>[span_76](start_span)[span_76](end_span)
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={() => setLangModal(true)}>
            <Text style={styles.rowLabel}>{lang === 'ar' ? 'لغة التطبيق' : 'App Language'}</Text>[span_77](start_span)[span_77](end_span)
            <Text style={styles.valueText}>{lang === 'ar' ? 'العربية' : 'English'} ‹</Text>[span_78](start_span)[span_78](end_span)
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <TouchableOpacity style={styles.row} onPress={() => setPassModal(true)}>
            <Text style={styles.rowLabel}>تغيير كلمة المرور</Text>[span_79](start_span)[span_79](end_span)
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={openTwoFa}>
            <Text style={styles.rowLabel}>التحقق بخطوتين (2FA)</Text>[span_80](start_span)[span_80](end_span)
            <Text style={styles.valueText}>{twoFaEnabled ? 'مفعل' : 'معطل'} ‹</Text>[span_81](start_span)[span_81](end_span)
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              setInfoModal({
                visible: true,
                title: 'الشروط والأحكام',[span_82](start_span)[span_82](end_span)
                body: 'التطبيق يقدم أدوات تحليلية ومعلوماتية فقط ولا يقدم نصائح مالية مباشرة. الاشتراكات تمنح صلاحية الوصول للمزايا المذكورة ويُمنع أي استخدام مخالف.',[span_83](start_span)[span_83](end_span)
              })
            }
          >
            <Text style={styles.rowLabel}>الشروط والأحكام</Text>[span_84](start_span)[span_84](end_span)
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, { borderBottomWidth: 0 }]}
            onPress={() =>
              setInfoModal({
                visible: true,
                title: 'سياسة الخصوصية',[span_85](start_span)[span_85](end_span)
                body: 'نستخدم بيانات حسابك لتقديم الخدمة وتأمين الحساب وتحسين التجربة، ولا نبيع بياناتك لأي طرف ثالث.',[span_86](start_span)[span_86](end_span)
              })
            }
          >
            <Text style={styles.rowLabel}>سياسة الخصوصية</Text>[span_87](start_span)[span_87](end_span)
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>TRX - الإصدار 1.0.0</Text>[span_88](start_span)[span_88](end_span)
      </ScrollView>

      <Modal visible={langModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>اختر اللغة</Text>[span_89](start_span)[span_89](end_span)
            {[
              { code: 'ar', label: 'العربية' },[span_90](start_span)[span_90](end_span)
              { code: 'en', label: 'English' },[span_91](start_span)[span_91](end_span)
            ].map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[styles.choiceItem, lang === opt.code && styles.choiceActive]}
                onPress={() => {
                  setLang(opt.code);
                  setLangModal(false);
                }}
              >
                <Text style={styles.choiceLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLangModal(false)}>
              <Text style={styles.cancelText}>إغلاق</Text>[span_92](start_span)[span_92](end_span)
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={passModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>تغيير كلمة المرور</Text>[span_93](start_span)[span_93](end_span)
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور الحالية[span_94](start_span)"[span_94](end_span)
              placeholderTextColor="#6B7280"
              secureTextEntry
              value={currentPass}
              onChangeText={setCurrentPass}
            />
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور الجديدة[span_95](start_span)"[span_95](end_span)
              placeholderTextColor="#6B7280"
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPassModal(false)}>
                <Text style={styles.cancelText}>إلغاء</Text>[span_96](start_span)[span_96](end_span)
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleChangePassword} disabled={savingPass}>
                <Text style={styles.saveText}>حفظ</Text>[span_97](start_span)[span_97](end_span)
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={twoFaModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>التحقق بخطوتين</Text>[span_98](start_span)[span_98](end_span)
            {twoFaEnabled ? (
              <>
                <Text style={styles.infoBody}>التحقق بخطوتين مفعل حالياً على حسابك.</Text>[span_99](start_span)[span_99](end_span)
                <TouchableOpacity style={styles.dangerBtn} onPress={handleDisable2FA}>
                  <Text style={{ color: '#EF4444', fontWeight: '800' }}>إيقاف التفعيل</Text>[span_100](start_span)[span_100](end_span)
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.infoBody}>
                  أدخل المفتاح السري التالي في تطبيق المصادقة ثم أدخل الرمز المكون من 6 أرقام:[span_101](start_span)[span_101](end_span)
                </Text>
                <Text style={styles.secretBox}>{secretKey}</Text>
                <TextInput
                  style={[styles.input, { textAlign: 'center', letterSpacing: 4 }]}
                  placeholder="000000[span_102](start_span)"[span_102](end_span)
                  placeholderTextColor="#6B7280"
                  maxLength={6}
                  keyboardType="number-pad"
                  value={verifyCode}
                  onChangeText={setVerifyCode}
                />
                <View style={styles.modalRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setTwoFaModal(false)}>
                    <Text style={styles.cancelText}>إلغاء</Text>[span_103](start_span)[span_103](end_span)
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleEnable2FA}>
                    <Text style={styles.saveText}>تأكيد وتفعيل</Text>[span_104](start_span)[span_104](end_span)
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={infoModal.visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{infoModal.title}</Text>
            <Text style={styles.infoBody}>{infoModal.body}</Text>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setInfoModal({ visible: false, title: '', body: '' })}
            >
              <Text style={styles.cancelText}>إغلاق</Text>[span_105](start_span)[span_105](end_span)
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
  group: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLabel: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  valueText: { color: '#9CA3AF', fontSize: 13, fontWeight: '700' },
  arrow: { color: '#9CA3AF', fontSize: 18, fontWeight: '700' },
  versionText: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalBox: {
    backgroundColor: '#0B1622',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    padding: 22,
  },
  modalTitle: { color: '#FFF', fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  choiceItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
  },
  choiceActive: { borderWidth: 1, borderColor: '#0A84FF', backgroundColor: 'rgba(10, 132, 255, 0.14)' },
  choiceLabel: { color: '#FFF', fontWeight: '700', textAlign: 'right' },
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
    marginBottom: 14,
  },
  modalRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelText: { color: '#FFF', fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: '#0A84FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  saveText: { color: '#FFF', fontWeight: '800' },
  infoBody: { color: '#9CA3AF', fontSize: 13, lineHeight: 21, textAlign: 'center', marginBottom: 14 },
  secretBox: {
    color: '#0A84FF',
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
});
