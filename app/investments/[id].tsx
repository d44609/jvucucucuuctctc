import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '@/store'
import { Badge, BottomSheet, PrimaryButton, SecondaryButton } from '@/components/ui'
import { InvestmentLineChart, MonthlyBarChart } from '@/components/charts'
import InvestmentForm from '@/components/investments/InvestmentForm'
import MonthlyUpdateForm from '@/components/investments/MonthlyUpdateForm'
import { formatCurrency, formatPercent, formatDate, formatMonth, calcPnL, calcPnLPercent } from '@/utils'
import { ASSET_LABELS, ASSET_COLORS, RISK_LABELS, Colors, Spacing, Radius, FontSize } from '@/utils/theme'

export default function InvestmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { investments, deleteInvestment, settings } = useStore()
  const sym = settings.currencySymbol
  const inv = investments.find((i) => i.id === id)

  const [showEdit, setShowEdit] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [chartTab, setChartTab] = useState<'line' | 'bar'>('line')

  if (!inv) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Inversión no encontrada</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const pnl = calcPnL(inv)
  const pnlPct = calcPnLPercent(inv)
  const positive = pnl >= 0
  const pnlColor = positive ? Colors.accent.green : Colors.accent.red
  const color = inv.color || ASSET_COLORS[inv.type]

  const sortedHistory = [...inv.monthlyHistory].sort((a, b) => a.month.localeCompare(b.month))
  const chartData = sortedHistory.map((h) => ({ month: h.month, value: h.currentValue }))
  const barData = sortedHistory.map((h) => ({ month: h.month, value: h.currentValue, pnl: h.percentageChange }))

  const daysSince = Math.floor((Date.now() - new Date(inv.purchaseDate).getTime()) / 86400000)

  const handleDelete = () => {
    deleteInvestment(inv.id)
    router.back()
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.invName} numberOfLines={1}>{inv.name}</Text>
            <View style={styles.headerSub}>
              {inv.ticker ? <Text style={styles.ticker}>{inv.ticker}</Text> : null}
              <Badge color={ASSET_COLORS[inv.type]}>{ASSET_LABELS[inv.type]}</Badge>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={Colors.accent.red} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={[styles.heroCard, { borderColor: color + '44' }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Valor actual</Text>
              <Text style={styles.heroValue}>{formatCurrency(inv.currentValue, sym)}</Text>
            </View>
            <View style={[styles.pnlBadge, { backgroundColor: pnlColor + '18' }]}>
              <Ionicons name={positive ? 'trending-up' : 'trending-down'} size={14} color={pnlColor} />
              <Text style={[styles.pnlBadgeText, { color: pnlColor }]}>{formatPercent(pnlPct)}</Text>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroSub}>Invertido: <Text style={{ color: Colors.text.secondary }}>{formatCurrency(inv.initialAmount, sym)}</Text></Text>
            <Text style={[styles.heroSub, { color: pnlColor }]}>P&L: {formatCurrency(pnl, sym)}</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'calendar-outline', label: 'Compra', value: formatDate(inv.purchaseDate), color: Colors.accent.blue },
            { icon: 'time-outline', label: 'Antigüedad', value: `${daysSince} días`, color: Colors.accent.purple },
            inv.quantity > 0 ? { icon: 'cash-outline', label: 'Precio medio', value: formatCurrency(inv.averagePrice, sym), color: Colors.accent.green } : null,
            { icon: 'shield-outline', label: 'Riesgo', value: RISK_LABELS[inv.risk], color: Colors.accent.amber },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={16} color={item.color} />
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        {chartData.length > 1 && (
          <View style={styles.card}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>Evolución</Text>
              <View style={styles.tabToggle}>
                <TouchableOpacity onPress={() => setChartTab('line')} style={[styles.tabBtn, chartTab === 'line' && styles.tabBtnActive]}>
                  <Text style={[styles.tabBtnText, chartTab === 'line' && styles.tabBtnTextActive]}>Línea</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setChartTab('bar')} style={[styles.tabBtn, chartTab === 'bar' && styles.tabBtnActive]}>
                  <Text style={[styles.tabBtnText, chartTab === 'bar' && styles.tabBtnTextActive]}>Barras</Text>
                </TouchableOpacity>
              </View>
            </View>
            {chartTab === 'line'
              ? <InvestmentLineChart data={chartData} color={color} symbol={sym} />
              : <MonthlyBarChart data={barData} symbol={sym} />}
          </View>
        )}

        {/* Monthly history */}
        <View>
          <View style={styles.sectionRow}>
            <Text style={styles.cardTitle}>Historial mensual</Text>
            <TouchableOpacity onPress={() => setShowUpdate(true)} style={styles.updateBtn}>
              <Ionicons name="add" size={14} color={Colors.accent.blue} />
              <Text style={styles.updateBtnText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          {sortedHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistText}>Sin historial mensual</Text>
              <TouchableOpacity onPress={() => setShowUpdate(true)} style={styles.emptyHistBtn}>
                <Text style={styles.emptyHistBtnText}>Añadir primer registro</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.historyList}>
              {[...sortedHistory].reverse().map((h) => {
                const pos = h.percentageChange >= 0
                const hColor = pos ? Colors.accent.green : Colors.accent.red
                return (
                  <View key={h.id} style={styles.historyCard}>
                    <View style={styles.historyTop}>
                      <Text style={styles.historyMonth}>{formatMonth(h.month)}</Text>
                      <View style={styles.historyPnl}>
                        <Ionicons name={pos ? 'trending-up' : 'trending-down'} size={12} color={hColor} />
                        <Text style={[styles.historyPct, { color: hColor }]}>{formatPercent(h.percentageChange)}</Text>
                      </View>
                    </View>
                    <View style={styles.historyBottom}>
                      <Text style={styles.historySub}>Valor: <Text style={{ color: Colors.text.secondary }}>{formatCurrency(h.currentValue, sym)}</Text></Text>
                      <Text style={styles.historySub}>Invertido: <Text style={{ color: Colors.text.secondary }}>{formatCurrency(h.invested, sym)}</Text></Text>
                    </View>
                    {h.notes ? <Text style={styles.historyNotes}>"{h.notes}"</Text> : null}
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* Goal & Notes */}
        {(inv.goal || inv.notes) && (
          <View style={styles.notesSection}>
            {inv.goal && (
              <View style={styles.noteCard}>
                <Text style={styles.noteLabel}>Objetivo</Text>
                <Text style={styles.noteText}>{inv.goal}</Text>
              </View>
            )}
            {inv.notes && (
              <View style={styles.noteCard}>
                <Text style={styles.noteLabel}>Notas</Text>
                <Text style={styles.noteText}>{inv.notes}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <InvestmentForm visible={showEdit} onClose={() => setShowEdit(false)} investment={inv} />
      <MonthlyUpdateForm visible={showUpdate} onClose={() => setShowUpdate(false)}
        investmentId={inv.id} currentValue={inv.currentValue} initialAmount={inv.initialAmount} />

      {/* Delete sheet */}
      <BottomSheet visible={showDelete} onClose={() => setShowDelete(false)} title="Eliminar inversión">
        <View style={styles.deleteSheet}>
          <Text style={styles.deleteText}>
            ¿Eliminar <Text style={{ color: Colors.text.primary, fontWeight: '700' }}>{inv.name}</Text>? Esta acción no se puede deshacer.
          </Text>
          <PrimaryButton label="Eliminar" onPress={handleDelete} danger />
          <SecondaryButton label="Cancelar" onPress={() => setShowDelete(false)} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 32, gap: Spacing.lg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  notFoundText: { color: Colors.text.secondary, fontSize: FontSize.base },
  backBtn: { backgroundColor: Colors.accent.blue, paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.lg },
  backBtnText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backIcon: { width: 38, height: 38, borderRadius: Radius.lg, backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, gap: 3 },
  invName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary },
  headerSub: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ticker: { fontSize: FontSize.xs, color: Colors.text.muted, fontFamily: 'monospace' },
  editBtn: { width: 38, height: 38, borderRadius: Radius.lg, backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 38, height: 38, borderRadius: Radius.lg, backgroundColor: Colors.accent.red + '18', alignItems: 'center', justifyContent: 'center' },
  heroCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.xl, gap: Spacing.md },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 4 },
  heroValue: { fontSize: 34, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.5 },
  pnlBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.lg },
  pnlBadgeText: { fontSize: FontSize.sm, fontWeight: '700' },
  heroBottom: { flexDirection: 'row', gap: Spacing.xl },
  heroSub: { fontSize: FontSize.sm, color: Colors.text.muted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.md, gap: 5 },
  statIcon: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  tabToggle: { flexDirection: 'row', backgroundColor: Colors.bg.elevated, borderRadius: Radius.md, padding: 3 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.sm },
  tabBtnActive: { backgroundColor: Colors.accent.blue },
  tabBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text.secondary },
  tabBtnTextActive: { color: '#fff' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  updateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  updateBtnText: { fontSize: FontSize.sm, color: Colors.accent.blue, fontWeight: '600' },
  emptyHistory: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  emptyHistText: { fontSize: FontSize.sm, color: Colors.text.muted },
  emptyHistBtn: { backgroundColor: Colors.accent.blue, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.lg },
  emptyHistBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  historyList: { gap: Spacing.sm },
  historyCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, gap: 6 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyMonth: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text.primary },
  historyPnl: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyPct: { fontSize: FontSize.sm, fontWeight: '700' },
  historyBottom: { flexDirection: 'row', gap: Spacing.xl },
  historySub: { fontSize: FontSize.xs, color: Colors.text.muted },
  historyNotes: { fontSize: FontSize.xs, color: Colors.text.muted, fontStyle: 'italic' },
  notesSection: { gap: Spacing.md },
  noteCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, gap: 6 },
  noteLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  noteText: { fontSize: FontSize.base, color: Colors.text.secondary },
  deleteSheet: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 32 },
  deleteText: { fontSize: FontSize.base, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
})
