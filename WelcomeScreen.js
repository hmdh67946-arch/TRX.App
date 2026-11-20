import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { DARK_THEME } from './theme';

export default function WelcomeScreen({ onNavigateAuth, theme = DARK_THEME }) {
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgStart} />

      {/* الهيدر: شعار TRX */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>T</Text>
          <Text style={styles.logoText}>R</Text>
          <Text style={styles.logoX}>X</Text>
        </View>
      </View>

      {/* المحتوى الرئيسي */}
      <View style={styles.heroSection}>
        <Text style={styles.companyName}>منصة التداول الذكية</Text>

        <Text style={styles.mainTitle}>
          كل الأسواق.{'\n'}
          <Text style={styles.titleHighlight}>كل صفقة بخطة.</Text>
        </Text>

        <Text style={styles.subtitle}>
          فوركس · ذهب · كريبتو · مؤشرات
        </Text>

        <View style={styles.trustBadge}>
          <Text style={styles.trustText}>★ يثق بنا +2,500 متداول حول العالم</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => onNavigateAuth && onNavigateAuth('register')}
          >
            <Text style={styles.btnPrimaryText}>ابدأ الآن</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.85}
            onPress={() => onNavigateAuth && onNavigateAuth('login')}
          >
            <Text style={styles.btnSecondaryText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgStart,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 10,
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoText: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.textMain,
      letterSpacing: 1.5,
    },
    logoX: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.green,
      letterSpacing: 1.5,
    },
    heroSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    companyName: {
      color: theme.textMuted,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 14,
      textAlign: 'center',
    },
    mainTitle: {
      fontSize: 34,
      fontWeight: '900',
      color: theme.textMain,
      lineHeight: 46,
      textAlign: 'center',
      marginBottom: 18,
    },
    titleHighlight: {
      color: theme.primaryBlue,
    },
    subtitle: {
      color: theme.textMuted,
      fontSize: 15,
      fontWeight: '500',
      marginBottom: 28,
      textAlign: 'center',
    },
    trustBadge: {
      backgroundColor: theme.glassBg,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginBottom: 36,
    },
    trustText: {
      color: theme.textMain,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
    actionsContainer: {
      width: '100%',
      maxWidth: 340,
      gap: 14,
    },
    btnPrimary: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: theme.primaryBlue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnPrimaryText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '700',
    },
    btnSecondary: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: theme.glassBg,
      borderWidth: 1,
      borderColor: theme.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnSecondaryText: {
      color: theme.textMain,
      fontSize: 17,
      fontWeight: '700',
    },
  });
