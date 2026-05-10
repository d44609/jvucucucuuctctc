import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { BottomSheet, PrimaryButton, PillSelector } from '@/components/ui'
import FormInput from '@/components/ui/FormInput'
import { useStore } from '@/store'
import { ASSET_LABELS, ASSET_COLORS, RISK_LABELS, Colors, Spacing, Radius, FontSize } from '@/utils/theme'
import type { Investment, AssetType, RiskLevel, InvestmentStatus } from '@/types'

const COLORS = ['#4f8ef7','#22d3a5','#f5a623','#9b6dff','#f7524f','#fbbf24','#06b6d4','#ec4899']
const ASSET_TYPES: AssetType[] = ['stock','etf','crypto','gold','fund','cash','other']
const RISK_LEVELS: RiskLevel[] = ['low','medium','high','very-high']

interface Props { visible: boolean; onClose: () => void; investment?: Investment }

const EMPTY = {
  name: '', ticker: '', type: 'stock' as AssetType, status: 'active' as InvestmentStatus,
  purchaseDate: new Date().toISOString().slice(0, 10),
  initialAmount: '', currentValue: '', averagePrice: '', quantity: '',
  notes: '', tags: '', goal: '', risk: 'medium' as RiskLevel, color: COLORS[0],
}

export default function InvestmentForm({ visible, onClose, investment }: Props) {
  const { addInvestment, updateInvestment } = useStore()
  const symbol = useStore((s) => s.settings.currencySymbol)
  const [f, setF] = useState(investment ? {
    ...investment,
    initialAmount: String(investment.initialAmount),
    currentValue: String(investment.currentValue),
    averagePrice: String(investment.averagePrice),
    quantity: String(investment.quantity),
    tags: investment.tags.join(', '),
  } : EMPTY)

  const set = (k: string, v: string) => setF((prev) => ({ ...prev, [k]: v }))

  const handleSave = () => {
    if (!f.name.trim()) return
    const payload = {
      name: f.name.trim(), ticker: f.ticker.trim().toUpperCase(),
      type: f.type, status: f.status, purchaseDate: f.purchaseDate,
      initialAmount: Number(f.initialAmount) || 0,
      currentValue: Number(f.currentValue) || Number(f.initialAmount) || 0,
      averagePrice: Number(f.averagePrice) || 0, quantity: Number(f.quantity) || 0,
      notes: f.notes, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
      goal: f.goal, risk: f.risk, color: f.color,
    }
    investment ? updateInvestment(investment.id, payload) : addInvestment(payload)
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={investment ? 'Editar inversión' : 'Nueva inversión'}>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.half}>
            <FormInput label={`Nombre *`} placeholder="Apple Inc." value={f.name} onChangeText={(v) => set('name', v)} />
          </View>
          <View style={styles.half}>
            <FormInput label="Ticker" placeholder="AAPL" value={f.ticker} onChangeText={(v) => set('ticker', v)} autoCapitalize="characters" />
          </View>
        </View>

        <View>
          <Text style={styles.label}>Tipo de activo</Text>
          <View style={styles.typeGrid}>
            {ASSET_TYPES.map((t) => (
              <TouchableOpacity key={t} onPress={() => set('type', t)}
                style={[styles.typeBtn, f.type === t && { backgroundColor: ASSET_COLORS[t] }]}>
                <Text style={[styles.typeBtnText, f.type === t && { color: '#fff' }]}>{ASSET_LABELS[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <FormInput label={`Capital inicial (${symbol})`} placeholder="1000" value={f.initialAmount}
              onChangeText={(v) => set('initialAmount', v)} keyboardType="numeric" />
          </View>
          <View style={styles.half}>
            <FormInput label={`Valor actual (${symbol})`} placeholder="1150" value={f.currentValue}
              onChangeText={(v) => set('currentValue', v)} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <FormInput label={`Precio medio (${symbol})`} placeholder="150.00" value={f.averagePrice}
              onChangeText={(v) => set('averagePrice', v)} keyboardType="numeric" />
          </View>
          <View style={styles.half}>
            <FormInput label="Cantidad" placeholder="10" value={f.quantity}
              onChangeText={(v) => set('quantity', v)} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <FormInput label="Fecha de compra" placeholder="YYYY-MM-DD" value={f.purchaseDate}
              onChangeText={(v) => set('purchaseDate', v)} />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.statusRow}>
              {(['active','sold'] as InvestmentStatus[]).map((s) => (
                <TouchableOpacity key={s} onPress={() => set('status', s)}
                  style={[styles.statusBtn, f.status === s && styles.statusBtnActive]}>
                  <Text style={[styles.statusText, f.status === s && styles.statusTextActive]}>
                    {s === 'active' ? 'Activo' : 'Vendido'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.label}>Riesgo</Text>
          <PillSelector
            options={RISK_LEVELS.map((r) => ({ value: r, label: RISK_LABELS[r] }))}
            value={f.risk} onChange={(v) => set('risk', v)} />
        </View>

        <View>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity key={c} onPress={() => set('color', c)}
                style={[styles.colorDot, { backgroundColor: c }, f.color === c && styles.colorDotActive]} />
            ))}
          </View>
        </View>

        <FormInput label="Objetivo" placeholder="Independencia financiera" value={f.goal} onChangeText={(v) => set('goal', v)} />
        <FormInput label="Etiquetas (separadas por comas)" placeholder="tech, dividendos" value={f.tags} onChangeText={(v) => set('tags', v)} />
        <FormInput label="Notas" placeholder="Observaciones..." value={f.notes} onChangeText={(v) => set('notes', v)} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }} />

        <PrimaryButton label={investment ? 'Guardar cambios' : 'Añadir inversión'} onPress={handleSave} />
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, gap: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  typeBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.bg.elevated, borderWidth: 0.5, borderColor: Colors.bg.border },
  typeBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text.secondary },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: { flex: 1, paddingVertical: 11, borderRadius: Radius.lg, backgroundColor: Colors.bg.elevated, borderWidth: 0.5, borderColor: Colors.bg.border, alignItems: 'center' },
  statusBtnActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
  statusText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text.secondary },
  statusTextActive: { color: '#fff' },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotActive: { borderWidth: 2.5, borderColor: '#fff' },
})
