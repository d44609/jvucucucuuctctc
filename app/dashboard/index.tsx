import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '@/store'
import { StatCard, SectionHeader, EmptyState, ProgressBar, ColorDot } from '@/components/ui'
import { PortfolioChart, DonutChart } from '@/components/charts'
import InvestmentCard from '@/components/investments/InvestmentCard'
import InvestmentForm from '@/components/investments/InvestmentForm'
import {
  formatCurrency, formatPercent, calcTotalPortfolio, calcTotalInvested,
  calcTotalPnL, calcTotalPnLPercent, calcPnLPercent, generatePortfolioHistory,
} from '@/utils'
import { ASSET_LABELS, ASSET_COLORS, Colors, Spacing, Radius, FontSize } from '@/utils/theme'

export default function Dashboard() {
  const { investments, goals, settings } = useStore()
  const sym = settings.currencySymbol
  const [showForm, setShowForm] = useState(false)

  const active = investments.filter((i) => i.status === 'active')
  const total = calcTotalPortfolio(active)
  const invested = calcTotalInvested(active)
  const pnl = calcTotalPnL(active)
  const pnlPct = calcTotalPnLPercent(active)
  const positive = pnl >= 0

  const history = useMemo(() => generatePortfolioHistory(active), [active])

  const sorted = [...active].sort((a, b) => calcPnLPercent(b) - calcPnLPercent(a))
  const best = sorted.slice(0, 3)
  const worst = sorted.slice(-3).reverse()

  const distribution = useMemo(() => {
    if (!total) return []
    const map: Record<string, number> = {}
    active.forEach((inv) => { map[inv.type] = (map[inv.type] || 0) + inv.currentValue })
    return Object.entries(map).map(([type, val]) => ({
      name: ASSET_LABELS[type], value: +((val / total) * 100).toFixed(1), color: ASSET_COLORS[type],
    }))
  }, [active, total])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Portfolio total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, sym)}</Text>
            <View style={styles.pnlRow}>
              <Ionicons name={positive ? 'trending-up' : 'trending-down'} size={15} color={positive ? Colors.accent.green : Colors.accent.red} />
              <Text style={[styles.pnlPct, { color: positive ? Colors.accent.green : Colors.accent.red }]}>
                {' '}{formatPercent(pnlPct)} ({formatCurrency(pnl, sym)})
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Invertido" value={formatCurrency(invested, sym)} style={styles.statCard} />
          <StatCard label="Activos" value={String(active.length)} sub="inversiones" style={styles.statCard} />
        </View>

        {/* Portfolio chart */}
        {history.length > 1 && (
          <View style={styles.card}>
            <SectionHeader title="Evolución del patrimonio" />
            <PortfolioChart data={history} symbol={sym} />
          </View>
        )}

        {/* Best / Worst */}
        {active.length > 0 && (
          <View style={styles.twoCol}>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.miniTitle}>Mejores</Text>
              {best.map((inv) => (
                <View key={inv.id} style={styles.rankRow}>
                  <ColorDot color={inv.color || ASSET_COLORS[inv.type]} size={7} />
                  <Text style={styles.rankName} numberOfLines={1}>{inv.name}</Text>
                  <Text style={styles.rankPct}>{formatPercent(calcPnLPercent(inv))}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.miniTitle}>Peores</Text>
              {worst.map((inv) => (
                <View key={inv.id} style={styles.rankRow}>
                  <ColorDot color={inv.color || ASSET_COLORS[inv.type]} size={7} />
                  <Text style={styles.rankName} numberOfLines={1}>{inv.name}</Text>
                  <Text style={[styles.rankPct, { color: Colors.accent.red }]}>{formatPercent(calcPnLPercent(inv))}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Distribution */}
        {distribution.length > 0 && (
          <View style={styles.card}>
            <SectionHeader title="Distribución" />
            <DonutChart data={distribution} />
          </View>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <View>
            <SectionHeader title="Objetivos" />
            {goals.map((g) => {
              const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
              return (
                <View key={g.id} style={[styles.card, { marginBottom: Spacing.md }]}>
                  <View style={styles.goalRow}>
                    <View style={[styles.goalIcon, { backgroundColor: g.color + '22' }]}>
                      <Text style={{ fontSize: 18 }}>{g.icon || '🎯'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.goalName}>{g.name}</Text>
                      <Text style={styles.goalSub}>{formatCurrency(g.currentAmount, sym)} / {formatCurrency(g.targetAmount, sym)}</Text>
                    </View>
                    <Text style={styles.goalPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <ProgressBar value={pct} color={g.color} />
                </View>
              )
            })}
          </View>
        )}

        {/* Recent investments */}
        <SectionHeader title="Inversiones recientes"
          action={<TouchableOpacity onPress={() => setShowForm(true)}><Text style={styles.actionLink}>+ Añadir</Text></TouchableOpacity>} />
        {active.length === 0 ? (
          <EmptyState icon="flash-outline" title="Sin inversiones aún" description="Empieza añadiendo tu primera inversión"
            action={<TouchableOpacity onPress={() => setShowForm(true)} style={styles.emptyBtn}><Text style={styles.emptyBtnText}>Añadir inversión</Text></TouchableOpacity>} />
        ) : (
          <View style={styles.list}>
            {active.slice(0, 5).map((inv) => <InvestmentCard key={inv.id} investment={inv} />)}
          </View>
        )}
      </ScrollView>

      <InvestmentForm visible={showForm} onClose={() => setShowForm(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 32, gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLabel: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 2 },
  totalValue: { fontSize: 36, fontWeight: '800', color: Colors.text.primary, letterSpacing: -1 },
  pnlRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pnlPct: { fontSize: FontSize.base, fontWeight: '600' },
  addBtn: { width: 44, height: 44, borderRadius: Radius.lg, backgroundColor: Colors.accent.blue, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: { flex: 1 },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg },
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  miniTitle: { fontSize: FontSize.xs, color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600', marginBottom: Spacing.md },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  rankName: { flex: 1, fontSize: FontSize.xs, color: Colors.text.primary },
  rankPct: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.accent.green },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  goalIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  goalSub: { fontSize: FontSize.xs, color: Colors.text.secondary },
  goalPct: { fontSize: FontSize.base, fontWeight: '700', color: Colors.accent.blue },
  actionLink: { fontSize: FontSize.sm, color: Colors.accent.blue },
  list: { gap: Spacing.md },
  emptyBtn: { backgroundColor: Colors.accent.blue, paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.lg },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
})
