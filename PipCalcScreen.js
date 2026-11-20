import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { DARK_THEME } from './theme';

const ASSETS_PIP = [
  { label: 'XAU/USD (الذهب) - Lot: $10/pip', value: 10 },
  { label: 'EUR/USD (يورو دولار) - Lot: $10/pip', value: 10 },
  { label: 'GBP/USD (باوند دولار) - Lot: $10/pip', value: 10 },
  { label: 'US30 (الداو جونز) - Lot: $1/pip', value: 1 },
  { label: 'NAS100 (ناسداك) - Lot: $1/pip', value: 1 },
  { label: 'BTC/USD (بيتكوين) - Lot: $1/pip', value: 1 },
];

const QUICK_LOTS = [0.01, 0.1, 1, 5];

export default function PipCalcScreen({ onBack, theme = DARK_THEME }) {
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0);
  const [lotText, setLotText] = useState('1.00');
  const [activeQuickLot, setActiveQuickLot] = useState(1);

  const lotSize = parseFloat(lotText) || 0;
  const standardPipVal = ASSETS_PIP[selectedAssetIdx]?.value || 0;
  const pipValue = lotSize * standardPipVal;
  const pips10 = pipValue * 10;
  const pips100 = pipValue * 100;

  const handleQuickLot = (val) => {
    setActiveQuickLot(val);
    setLotText(val.toFixed(2));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>حاسبة النقاط</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>قيمة النقطة الواحدة</Text>
          <Text style={styles.mainValue}>${pipValue.toFixed(2)}</Text>

          <View style={styles.subRow}>
            <View style={styles.subCol}>
              <Text style={styles.subLabel}>10 نقاط</Text>
              <Text style={styles.subVal}>${pips10.toFixed(2)}</Text>
            </View>
            <View style={styles.subCol}>
              <Text style={styles.subLabel}>100 نقطة</Text>
              <Text style={styles.subVal}>${pips100.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>اختر الأصل</Text>
          <View style={styles.assetList}>
            {ASSETS_PIP.map((item, idx) => {
              const selected = idx === selectedAssetIdx;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.assetPill, selected && styles.assetPillActive]}
                  onPress={() => setSelectedAssetIdx(idx)}
                >
                  <Text style={[styles.assetPillText, selected && styles.assetPillTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>حجم اللوت (Lot Size)</Text>
          <TextInput
            style={styles.lotInput}
            value={lotText}
            onChangeText={(txt) => {
              setLotText(txt);
              setActiveQuickLot(null);
            }}
            keyboardType="decimal-pad"
            placeholder="1.00"
            placeholderTextColor="#6B7280"
          />

          <View style={styles.quickRow}>
            {QUICK_LOTS.map((val) => {
              const isAct = activeQuickLot === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickBtn, isAct && styles.quickBtnActive]}
                  onPress={() => handleQuickLot(val)}
                >
                  <Text style={[styles.quickBtnText, isAct && styles.quickBtnTextActive]}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
  resultCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultLabel: { color: '#9CA3AF', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  mainValue: { color: '#10B981', fontSize: 44, fontWeight: '900' },
  subRow: { flexDirection: 'row', width: '100%', marginTop: 22 },
  subCol: { flex: 1, alignItems: 'center' },
  subLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },
  subVal: { color: '#FFF', fontSize: 19, fontWeight: '900' },
  inputCard: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 18,
  },
  label: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 10, textAlign: 'right' },
  assetList: { gap: 8 },
  assetPill: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  assetPillActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.16)',
    borderColor: '#0A84FF',
  },
  assetPillText: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', textAlign: 'left' },
  assetPillTextActive: { color: '#FFF' },
  lotInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'left',
  },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  quickBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  quickBtnText: { color: '#9CA3AF', fontWeight: '700' },
  quickBtnTextActive: { color: '#10B981' },
});
