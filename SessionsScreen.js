import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { DARK_THEME } from './theme';

const SESSIONS_CONFIG = [
  { id: 'sydney', name: 'سيدني (الآسيوية)', schedule: '2:00 ص - 11:00 ص', tz: 'Australia/Sydney', city: 'Sydney', start: 2, end: 11 },
  { id: 'tokyo', name: 'طوكيو (الآسيوية)', schedule: '2:00 ص - 11:00 ص', tz: 'Asia/Tokyo', city: 'Tokyo', start: 2, end: 11 },
  { id: 'london', name: 'لندن (الأوروبية)', schedule: '11:00 ص - 8:00 م', tz: 'Europe/London', city: 'London', start: 11, end: 20 },
  { id: 'ny', name: 'نيويورك (الأمريكية)', schedule: '4:00 م - 1:00 ص', tz: 'America/New_York', city: 'New_York', start: 16, end: 1 },
];

function format12Hour(dateObj) {
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export default function SessionsScreen({ onBack, theme = DARK_THEME }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const baghdadDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Baghdad' }));
  const baghdadHour = baghdadDate.getHours();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>جلسات السوق</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.clockCard}>
          <Text style={styles.clockLabel}>توقيت بغداد الحالي</Text>
          <Text style={styles.clockValue}>{format12Hour(baghdadDate)}</Text>
        </View>

        {SESSIONS_CONFIG.map((s) => {
          const cityDate = new Date(now.toLocaleString('en-US', { timeZone: s.tz }));
          const isOpen = s.start < s.end
            ? baghdadHour >= s.start && baghdadHour < s.end
            : baghdadHour >= s.start || baghdadHour < s.end;

          return (
            <View key={s.id} style={[styles.sessionCard, isOpen && styles.sessionOpen]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionName}>{s.name}</Text>
                <Text style={styles.sessionSched}>{s.schedule}</Text>
                <Text style={styles.sessionLocal}>
                  توقيت {s.city}: {format12Hour(cityDate)}
                </Text>
              </View>
              <View style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                <Text style={[styles.badgeText, { color: isOpen ? '#10B981' : '#9CA3AF' }]}>
                  {isOpen ? '● مفتوح' : '○ مغلق'}
                </Text>
              </View>
            </View>
          );
        })}
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
  clockCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.28)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  clockLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  clockValue: { color: '#0A84FF', fontSize: 36, fontWeight: '900' },
  sessionCard: {
    backgroundColor: 'rgba(17, 28, 39, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sessionOpen: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  sessionName: { color: '#FFF', fontSize: 17, fontWeight: '900', marginBottom: 4, textAlign: 'right' },
  sessionSched: { color: '#0A84FF', fontSize: 12, fontWeight: '700', marginBottom: 4, textAlign: 'right' },
  sessionLocal: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeOpen: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeClosed: { backgroundColor: 'rgba(255,255,255,0.05)' },
  badgeText: { fontSize: 12, fontWeight: '800' },
});
