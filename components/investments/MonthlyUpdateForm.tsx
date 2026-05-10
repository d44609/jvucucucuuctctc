import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { BottomSheet, PrimaryButton } from '@/components/ui'
import FormInput from '@/components/ui/FormInput'
import { useStore } from '@/store'
import { getCurrentMonth, Colors, Spacing } from '@/utils/theme'

// re-export from utils
export { getCurrentMonth }

interface Props {
  visible: boolean
  onClose: () => void
  investmentId: string
  currentValue: number
  initialAmount: number
}

export default function MonthlyUpdateForm({ visible, onClose, investmentId, currentValue, initialAmount }: Props) {
  const { addMonthlyUpdate, settings } = useStore()
  const sym = settings.currencySymbol
  const [f, setF] = useState({
    month: getCurrentMonth(),
    currentValue: String(currentValue),
    invested: String(initialAmount),
    percentageChange: '',
    notes: '',
  })
  const set = (k: string, v: string) => setF((prev) => ({ ...prev, [k]: v }))

  const calcPct = () => {
    const next = Number(f.currentValue)
    if (currentValue && next) set('percentageChange', (((next - currentValue) / currentValue) * 100).toFixed(2))
  }

  const handleSave = () => {
    addMonthlyUpdate(investmentId, {
      month: f.month,
      currentValue: Number(f.currentValue),
      invested: Number(f.invested),
      percentageChange: Number(f.percentageChange),
      notes: f.notes,
    })
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Actualización mensual">
      <View style={styles.content}>
        <FormInput label="Mes (YYYY-MM)" placeholder="2024-06" value={f.month} onChangeText={(v) => set('month', v)} />
        <FormInput label={`Valor actual (${sym})`} value={f.currentValue}
          onChangeText={(v) => set('currentValue', v)} keyboardType="numeric"
          onBlur={calcPct} />
        <FormInput label={`Capital invertido acumulado (${sym})`} value={f.invested}
          onChangeText={(v) => set('invested', v)} keyboardType="numeric" />
        <FormInput label="Variación mensual (%)" value={f.percentageChange}
          onChangeText={(v) => set('percentageChange', v)} keyboardType="numeric"
          hint="Se calcula automáticamente si rellenas el valor actual." />
        <FormInput label="Notas del mes" placeholder="Observaciones..."
          value={f.notes} onChangeText={(v) => set('notes', v)}
          multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }} />
        <PrimaryButton label="Guardar actualización" onPress={handleSave} />
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, gap: Spacing.lg },
})
