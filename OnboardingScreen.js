import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { DARK_THEME } from './theme';

const SLIDES = [
  {
    highlight: 'تداول بخطة،',
    accent: 'لا بالتخمين.',
    desc: 'أفكار تداول بمستويات واضحة، وذكاء اصطناعي يقرأ شارتك، ويوميات تكشف لك ما ينجح فعلاً.',
    badge: 'XAU/USD • دخول 3,998.2 • هدف 4,015.4',
  },
  {
    highlight: 'ارفع صورة الشارت،',
    accent: 'و NARO AI يعطيك الصفقة.',
    desc: 'صور أي شارت من أي منصة، والذكاء الاصطناعي يحلله ويعطيك نقطة دخول، ستوب، وأهداف مع سبب التحليل.',
    badge: 'تحليل فوري لفيبوناتشي والمستويات',
  },
  {
    highlight: 'سجّل صفقاتك،',
    accent: 'وشوف تطورك.',
    desc: 'يوميات تداول متكاملة تحفظ كل صفقاتك، مشاعرك وقت الدخول، وتحسب لك نسبة نجاحك بدقة.',
    badge: 'نسبة النجاح + إحصائيات الأداء',
  },
  {
    highlight: 'كن أول من يعرف',
    accent: 'بأخبار السوق.',
    desc: 'تقويم اقتصادي مباشر يوضح لك أهم الأحداث والبيانات التي تحرك الأسواق لحظة بلحظة.',
    badge: 'متابعة القرارات والبيانات الاقتصادية',
  },
  {
    highlight: 'احمِ رأس مالك،',
    accent: 'واحسب مخاطرك.',
    desc: 'حاسبات احترافية للمخاطرة والعائد، وحاسبة النقاط، تساعدك تدخل السوق وأنت مطمئن.',
    badge: 'إدارة مخاطر وحساب حجم اللوت',
  },
  {
    highlight: 'تعلّم مع',
    accent: '+2,500 متداول.',
    desc: 'ناقش كل فكرة مع الأعضاء، وشارك ما نجح معك، وتعلّم في الأكاديمية المجانية.',
    badge: 'مجتمع تفاعلي وأكاديمية تعليمية',
  },
];

export default function OnboardingScreen({ onFinish, theme = DARK_THEME }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const handleNext = () => {
    if (!isLast) setIndex(index + 1);
    else onFinish && onFinish();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => onFinish && onFinish()}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        <View style={styles.mockCard}>
          <Text style={styles.mockText}>{slide.badge}</Text>
        </View>

        <Text style={styles.title}>{slide.highlight}</Text>
        <Text style={styles.accent}>{slide.accent}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>{isLast ? '✓' : '←'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20 },
  skipBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  center: { paddingHorizontal: 28, alignItems: 'center' },
  mockCard: {
    width: '100%',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.25)',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  mockText: { color: '#38BDF8', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900', textAlign: 'center' },
  accent: { color: '#0A84FF', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 14 },
  desc: { color: '#9CA3AF', fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 340 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 34,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)' },
  dotActive: { width: 22, backgroundColor: '#0A84FF' },
  nextBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: { color: '#FFF', fontSize: 22, fontWeight: '900' },
});
