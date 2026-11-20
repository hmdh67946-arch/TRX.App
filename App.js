import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import OnboardingScreen from './OnboardingScreen';
import AuthScreen from './AuthScreen';
import AssetsScreen from './AssetsScreen';
import WatchlistScreen from './WatchlistScreen';
import AlertsScreen from './AlertsScreen';
import BrokersScreen from './BrokersScreen';
import JournalScreen from './JournalScreen';
import CommunityScreen from './CommunityScreen';
import NaroAiScreen from './NaroAiScreen';
import PipCalcScreen from './PipCalcScreen';
import RiskCalcScreen from './RiskCalcScreen';
import SessionsScreen from './SessionsScreen';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import { DARK_THEME } from './theme';

const HUB_SECTIONS = [
  {
    title: 'الأسواق والتداول',
    items: [
      { key: 'assets', label: 'الأسواق والأسعار الحية' },
      { key: 'watchlist', label: 'قائمة المتابعة' },
      { key: 'alerts', label: 'تنبيهات الأسعار' },
      { key: 'journal', label: 'يوميات التداول' },
      { key: 'naro', label: 'NARO AI — التحليل الذكي' },
    ],
  },
  {
    title: 'الأدوات والمجتمع',
    items: [
      { key: 'pip', label: 'حاسبة النقاط' },
      { key: 'risk', label: 'حاسبة المخاطرة والعائد' },
      { key: 'sessions', label: 'جلسات السوق' },
      { key: 'community', label: 'مجتمع المتداولين' },
      { key: 'brokers', label: 'وكلاتنا (شركات الوساطة)' },
    ],
  },
  {
    title: 'الحساب والإعدادات',
    items: [
      { key: 'profile', label: 'الملف الشخصي' },
      { key: 'settings', label: 'الإعدادات' },
      { key: 'onboarding', label: 'جولة تعريفية للتطبيق' },
    ],
  },
];

export default function App() {
  const [screen, setScreen] = useState('hub');
  const [authMode, setAuthMode] = useState('login');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const goHub = () => setScreen('hub');

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        onNavigateAuth={(mode) => {
          setAuthMode(mode);
          setScreen('auth');
        }}
        theme={DARK_THEME}
      />
    );
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen onFinish={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'auth') {
    return (
      <AuthScreen
        initialMode={authMode}
        onBack={() => setScreen('welcome')}
        onAuthSuccess={(user, mode) => {
          setScreen(mode === 'signup' ? 'onboarding' : 'hub');
        }}
        theme={DARK_THEME}
      />
    );
  }

  if (screen === 'assets') {
    return (
      <AssetsScreen
        onBack={goHub}
        onSelectAsset={(asset) => {
          setSelectedAsset(asset);
          goHub();
        }}
        theme={DARK_THEME}
      />
    );
  }

  if (screen === 'watchlist') {
    return (
      <WatchlistScreen
        onBack={goHub}
        onOpenChart={(tvSymbol, assetName) => {
          setSelectedAsset({ name: assetName, symbol: tvSymbol, price: 'مباشر' });
          goHub();
        }}
        theme={DARK_THEME}
      />
    );
  }

  if (screen === 'alerts') {
    return <AlertsScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'brokers') {
    return <BrokersScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'journal') {
    return <JournalScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'community') {
    return <CommunityScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'naro') {
    return <NaroAiScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'pip') {
    return <PipCalcScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'risk') {
    return <RiskCalcScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'sessions') {
    return <SessionsScreen onBack={goHub} theme={DARK_THEME} />;
  }

  if (screen === 'profile') {
    return (
      <ProfileScreen
        onBack={goHub}
        onNavigate={(target) => setScreen(target)}
        onLogoutSuccess={() => setScreen('welcome')}
        theme={DARK_THEME}
      />
    );
  }

  if (screen === 'settings') {
    return <SettingsScreen onBack={() => setScreen('profile')} theme={DARK_THEME} />;
  }

  return (
    <SafeAreaView style={styles.hubContainer}>
      <ScrollView contentContainerStyle={styles.hubScroll}>
        <View style={styles.topHeader}>
          <Text style={styles.hubTitle}>TRX — مركز الشاشات</Text>
          <TouchableOpacity style={styles.authPill} onPress={() => setScreen('auth')}>
            <Text style={styles.authPillText}>الدخول / التسجيل</Text>
          </TouchableOpacity>
        </View>

        {selectedAsset && (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedText}>
              الأصل المحدد: {selectedAsset.name} ({selectedAsset.symbol}) — {selectedAsset.price}
            </Text>
          </View>
        )}

        {HUB_SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            {sec.items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.navBtn}
                activeOpacity={0.85}
                onPress={() => setScreen(item.key)}
              >
                <Text style={styles.navBtnText}>{item.label}</Text>
                <Text style={styles.arrow}>‹</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.welcomeBtn} onPress={() => setScreen('welcome')}>
          <Text style={styles.welcomeBtnText}>العودة إلى شاشة الترحيب</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hubContainer: {
    flex: 1,
    backgroundColor: DARK_THEME.bgStart,
  },
  hubScroll: {
    padding: 20,
    paddingBottom: 44,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  hubTitle: {
    color: '#FFF',
    fontSize: 21,
    fontWeight: '900',
  },
  authPill: {
    backgroundColor: 'rgba(10, 132, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  authPillText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  selectedCard: {
    backgroundColor: 'rgba(0, 191, 179, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 179, 0.35)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  selectedText: {
    color: '#00BFB3',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'right',
  },
  navBtn: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  arrow: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '700',
  },
  welcomeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  welcomeBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
});
