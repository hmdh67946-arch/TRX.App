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

export default function RiskCalcScreen({ onBack, theme = DARK_THEME }) {
  const [lotText, setLotText] = useState('0.02');
  const [balanceText, setBalanceText] = useState('100');
  const [slPipsText, setSlPipsText] = useState('50');
  const [tpPipsText, setTpPipsText] = useState('100');
  const [pipValText, setPipValText] = useState('10');

  const lotSize = parseFloat(lotText) || 0;
  const balance = parseFloat(balanceText) || 0;
  const slPips = parseFloat(slPipsText) || 0;
  const tpPips = parseFloat(tpPipsText) || 0;
  const pipValue = parseFloat(pipValText) || 0;

  const riskAmount = lotSize > 0 && slPips > 0 && pipValue > 0 ? lotSize * slPips * pipValue : 0;
  const riskPercent = balance > 0 ? (riskAmount / balance) * 100 : 0;
  const rewardAmount = lotSize * tpPips * pipValue;
  const rrRatio = slPips > 0 ? tpPips / slPips : 0;

  const totalPips = slPips + tpPips;
  const riskFlex = totalPips > 0 ? slPips / totalPips : 0.5;
  const rewardFlex = totalPips > 0 ? tpPips / totalPips : 0.5;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <Text style={styles.title}>المخاطرة والعائد</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.resultCard}>
          <Text style={styles.label}>حجم العقد (اللوت)</Text>
          <TextInput
            style={styles.lotInput}
            value={lotText}
            onChangeText={setLotText}
            keyboardType="decimal-pad"
            placeholder="0.02"
            placeholderTextColor="#6B7280"
          />

          <View style={styles.rrBar}>
            <View style={{ flex: Math.max(riskFlex, 0.05), backgroundColor: '#EF4444' }} />
            <View style={{ flex: Math.max(rewardFlex, 0.05), backgroundColor: '#10B981' }} />
          </View>

          <Text style={styles.rrText}>نسبة العائد للمخاطرة (R:R) = 1:{rrRatio.toFixed(2)}</Text>

          <View style={styles.summaryRow}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Text style={styles.smallLabel}>المخاطرة (الخسارة)</Text>
              <Text style={[styles.bigVal, { color: '#EF4444' }]}>${riskAmount.toFixed(2)}</Text>
              <Text style={styles.pctText}>{riskPercent.toFixed(2)}% من الرصيد</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.smallLabel}>العائد (الربح)</Text>
              <Text style={[styles.bigVal, { color: '#10B981' }]}>${rewardAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.fieldLabel}>رصيد الحساب ($)</Text>
          <TextInput
            style={styles.input}
            value={balanceText}
            onChangeText={setBalanceText}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>وقف الخسارة (نقاط)</Text>
          <TextInput
            style={styles.input}
            value={slPipsText}
            onChangeText={setSlPipsText}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>الهدف (نقاط)</Text>
          <TextInput
            style={styles.input}
            value={tpPipsText}
            onChangeText={setTpPipsText}
            keyboardType="decimal-pad"
          />

          <Text style={styles.fieldLabel}>قيمة النقطة للوت الواحد</Text>
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            value={pipValText}
            onChangeText={setPipValText}
            keyboardType="decimal-pad"
          />
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
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.25)',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  lotInput: {
    width: 150,
    textAlign: 'center',
    fontSize: 38,
    fontWeight: '900',
    color: '#0A84FF',
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
    paddingVertical: 4,
    marginBottom: 18,
  },
  rrBar: {
    flexDirection: 'row',
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  rrText: { color: '#9CA3AF', fontSize: 14, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', width: '100%', marginTop: 22 },
  smallLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  bigVal: { fontSize: 22, fontWeight: '900' },
  pctText: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  inputCard: {
    backgroundColor: 'rgba(17, 28, 39, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 18,
  },
  fieldLabel: { color: '#FFF', fontSize: 13, fontWeight: '700', marginBottom: 8, textAlign: 'right' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
  },
});
