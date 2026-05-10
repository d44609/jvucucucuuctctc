import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '@/store'
import { StatCard, SectionHeader, EmptyState, ProgressBar, BottomSheet, PrimaryButton } from '@/components/ui'
import { PortfolioChart, DonutChart, MonthlyBarChart } from '@/components/charts'
import FormInput from '@/components/ui/FormInput'
import {
  formatCurrency, formatPercent, calcTotalPortfolio, calcTotalInvested,
  calcTotalPnL, calcTotalPnLPercent, calcPnLPercent, calcPnL, generatePortfolioHistory,
} from '@/utils'
import { ASSET_LABELS, ASSET_COLORS, RISK_COLORS, Colors, Spacing, Radius, FontSize } from '@/utils/theme'

type Tab = 'portfolio' | 'distribution' | 'performance' | 'goals' | 'simulator' | 'health'

export default function MetricsScreen() {
  const { investments, goals, settings, addGoal, deleteGoal } = useStore()
  const sym = settings.currencySymbol
  const [tab, setTab] = useState<Tab>('portfolio')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [gf, setGf] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#4f8ef7', icon: '🎯' })
  const [sf, setSf] = useState({ monthly: '500', rate: '8', years: '10', initial: '' })

  const active = investments.filter((i) => i.status === 'active')
  const total = calcTotalPortfolio(active)
  const invested = calcTotalInvested(active)
  const pnl = calcTotalPnL(active)
  const pnlPct = calcTotalPnLPercent(active)
  const history = useMemo(() => generatePortfolioHistory(active), [active])

  const byType = useMemo(() => {
    if (!total) return []
    const map: Record<string, number> = {}
    active.forEach((inv) => { map[inv.type] = (map[inv.type] || 0) + inv.currentValue })
    return Object.entries(map).map(([t, v]) => ({ name: ASSET_LABELS[t], value: +((v / total) * 100).toFixed(1), color: ASSET_COLORS[t] }))
  }, [active, total])

  const byRisk = useMemo(() => {
    if (!total) return []
    const map: Record<string, number> = {}
    active.forEach((inv) => { map[inv.risk] = (map[inv.risk] || 0) + inv.currentValue })
    const RLABELS: Record<string, string> = { low: 'Bajo', medium: 'Medio', high: 'Alto', 'very-high': 'Muy alto' }
    return Object.entries(map).map(([r, v]) => ({ name: RLABELS[r], value: +((v / total) * 100).toFixed(1), color: RISK_COLORS[r] }))
  }, [active, total])

  const ranked = useMemo(() => [...active].sort((a, b) => calcPnLPercent(b) - calcPnLPercent(a)), [active])

  const simResult = useMemo(() => {
    const monthly = Number(sf.monthly), rate = Number(sf.rate) / 100 / 12, initial = Number(sf.initial) || 0
    return [1, 5, 10, Number(sf.years)].map((yrs) => {
      let value = initial
      for (let i = 0; i < yrs * 12; i++) value = value * (1 + rate) + monthly
      return { years: yrs, value: Math.round(value), contributed: initial + monthly * yrs * 12 }
    })
  }, [sf])

  const health = useMemo(() => {
    if (active.length === 0) return { score: 0, items: [] }
    const items: { label: string; score: number; max: number; note: string }[] = []
    const types = new Set(active.map((i) => i.type)).size
    items.push({ label: 'Diversificación', score: Math.min(types * 6, 30), max: 30, note: `${types} tipos de activos` })
    const topPct = total > 0 ? (Math.max(...active.map((i) => i.currentValue)) / total) * 100 : 100
    items.push({ label: 'Concentración', score: topPct < 40 ? 25 : topPct < 60 ? 15 : 5, max: 25, note: `Mayor posición: ${topPct.toFixed(0)}%` })
    const highRisk = active.filter((i) => i.risk === 'high' || i.risk === 'very-high').length / active.length
    items.push({ label: 'Balance de riesgo', score: highRisk < 0.3 ? 25 : highRisk < 0.6 ? 15 : 5, max: 25, note: `${Math.round(highRisk * 100)}% alto riesgo` })
    const withHist = active.filter((i) => i.monthlyHistory.length > 0).length
    items.push({ label: 'Seguimiento', score: Math.round((withHist / active.length) * 20), max: 20, note: `${withHist}/${active.length} actualizados` })
    return { score: items.reduce((s, i) => s + i.score, 0), items }
  }, [active, total])

  const TABS: { id: Tab; label: string }[] = [
    { id: 'portfolio', label: 'Portfolio' }, { id: 'distribution', label: 'Distribución' },
    { id: 'performance', label: 'Rendimiento' }, { id: 'goals', label: 'Objetivos' },
    { id: 'simulator', label: 'Simulador' }, { id: 'health', label: 'Salud' },
  ]

  const saveGoal = () => {
    addGoal({ name: gf.name, targetAmount: Number(gf.targetAmount), currentAmount: Number(gf.currentAmount), deadline: gf.deadline, color: gf.color, icon: gf.icon })
    setShowGoalForm(false)
    setGf({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#4f8ef7', icon: '🎯' })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
          {TABS.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}>
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* PORTFOLIO */}
        {tab === 'portfolio' && (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Total" value={formatCurrency(total, sym)} large style={styles.statFull} />
              <StatCard label="Rentabilidad" value={formatPercent(pnlPct)} positive={pnlPct >= 0} style={styles.statHalf} />
              <StatCard label="Invertido" value={formatCurrency(invested, sym)} style={styles.statHalf} />
              <StatCard label="Ganancia" value={formatCurrency(pnl, sym)} positive={pnl >= 0} style={styles.statHalf} />
              <StatCard label="Activos" value={String(active.length)} style={styles.statHalf} />
            </View>
            {history.length > 1 && (
              <View style={styles.card}>
                <SectionHeader title="Evolución patrimonial" />
                <PortfolioChart data={history} symbol={sym} />
              </View>
            )}
            {history.length > 1 && (
              <View style={styles.card}>
                <SectionHeader title="Evolución mensual" />
                <MonthlyBarChart data={history.map((h) => ({ month: h.month, value: h.value, pnl: h.value - h.invested }))} symbol={sym} />
              </View>
            )}
            {active.length === 0 && <EmptyState icon="bar-chart-outline" title="Sin datos" description="Añade inversiones para ver métricas" />}
          </>
        )}

        {/* DISTRIBUTION */}
        {tab === 'distribution' && (
          <>
            {byType.length > 0 && <View style={styles.card}><SectionHeader title="Por tipo de activo" /><DonutChart data={byType} /></View>}
            {byRisk.length > 0 && <View style={styles.card}><SectionHeader title="Por nivel de riesgo" /><DonutChart data={byRisk} /></View>}
            {active.length > 0 && (
              <View style={styles.card}>
                <SectionHeader title="Heatmap" />
                <View style={styles.heatmap}>
                  {ranked.map((inv) => {
                    const size = total > 0 ? inv.currentValue / total : 0
                    const pct = calcPnLPercent(inv)
                    const bg = pct >= 5 ? Colors.accent.green : pct >= 0 ? '#1a9e7a' : pct >= -5 ? '#c84040' : Colors.accent.red
                    const w = Math.max(60, Math.round(size * 280))
                    return (
                      <View key={inv.id} style={[styles.heatCell, { backgroundColor: bg, width: w, height: 60 }]}>
                        <Text style={styles.heatTicker} numberOfLines={1}>{inv.ticker || inv.name.substring(0, 4)}</Text>
                        <Text style={styles.heatPct}>{formatPercent(pct)}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}
            {active.length === 0 && <EmptyState icon="pie-chart-outline" title="Sin datos" description="Añade inversiones para ver distribución" />}
          </>
        )}

        {/* PERFORMANCE */}
        {tab === 'performance' && (
          <>
            {ranked.length === 0
              ? <EmptyState icon="podium-outline" title="Sin datos" description="Añade inversiones para ver rendimiento" />
              : (
                <View style={styles.card}>
                  <SectionHeader title="Ranking de rendimiento" />
                  <View style={styles.rankList}>
                    {ranked.map((inv, i) => {
                      const pct = calcPnLPercent(inv)
                      const pos = pct >= 0
                      const col = pos ? Colors.accent.green : Colors.accent.red
                      return (
                        <View key={inv.id} style={styles.rankRow}>
                          <Text style={styles.rankNum}>{i + 1}</Text>
                          <View style={[styles.rankAvatar, { backgroundColor: (inv.color || ASSET_COLORS[inv.type]) + '22' }]}>
                            <Text style={[styles.rankAvatarText, { color: inv.color || ASSET_COLORS[inv.type] }]}>
                              {(inv.ticker || inv.name).substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.rankInfo}>
                            <Text style={styles.rankName} numberOfLines={1}>{inv.name}</Text>
                            <ProgressBar value={Math.abs(pct)} max={100} color={col} />
                          </View>
                          <View style={styles.rankRight}>
                            <Text style={[styles.rankPct, { color: col }]}>{formatPercent(pct)}</Text>
                            <Text style={[styles.rankAbs, { color: col }]}>{formatCurrency(calcPnL(inv), sym)}</Text>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              )}
          </>
        )}

        {/* GOALS */}
        {tab === 'goals' && (
          <>
            <TouchableOpacity onPress={() => setShowGoalForm(true)} style={styles.addGoalBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addGoalText}>Nuevo objetivo</Text>
            </TouchableOpacity>
            {goals.length === 0
              ? <EmptyState icon="flag-outline" title="Sin objetivos" description="Define tus metas financieras" />
              : goals.map((g) => {
                  const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
                  return (
                    <View key={g.id} style={styles.goalCard}>
                      <View style={styles.goalRow}>
                        <View style={[styles.goalIcon, { backgroundColor: g.color + '22' }]}>
                          <Text style={{ fontSize: 20 }}>{g.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.goalName}>{g.name}</Text>
                          <Text style={styles.goalSub}>{formatCurrency(g.currentAmount, sym)} de {formatCurrency(g.targetAmount, sym)}</Text>
                        </View>
                        <View style={styles.goalRight}>
                          <Text style={[styles.goalPct, { color: g.color }]}>{pct.toFixed(0)}%</Text>
                          <TouchableOpacity onPress={() => deleteGoal(g.id)}>
                            <Ionicons name="trash-outline" size={14} color={Colors.text.muted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <ProgressBar value={pct} color={g.color} />
                      {g.deadline && <Text style={styles.goalDeadline}>Hasta: {new Date(g.deadline).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</Text>}
                    </View>
                  )
                })}
          </>
        )}

        {/* SIMULATOR */}
        {tab === 'simulator' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Simulador de inversión</Text>
              <View style={styles.simGrid}>
                <FormInput label={`Capital inicial (${sym})`} placeholder="0" value={sf.initial} onChangeText={(v) => setSf((p) => ({ ...p, initial: v }))} keyboardType="numeric" />
                <FormInput label={`Aportación mensual (${sym})`} value={sf.monthly} onChangeText={(v) => setSf((p) => ({ ...p, monthly: v }))} keyboardType="numeric" />
                <FormInput label="Rentabilidad anual (%)" value={sf.rate} onChangeText={(v) => setSf((p) => ({ ...p, rate: v }))} keyboardType="numeric" />
                <FormInput label="Años" value={sf.years} onChangeText={(v) => setSf((p) => ({ ...p, years: v }))} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.simResults}>
              {simResult.map((r) => (
                <View key={r.years} style={styles.simCard}>
                  <Text style={styles.simYears}>{r.years} {r.years === 1 ? 'año' : 'años'}</Text>
                  <Text style={styles.simValue}>{formatCurrency(r.value, sym)}</Text>
                  <Text style={styles.simInterest}>+{formatCurrency(r.value - r.contributed, sym)} intereses</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* HEALTH */}
        {tab === 'health' && (
          <>
            <View style={[styles.card, styles.healthCenter]}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNum}>{health.score}</Text>
                <Text style={styles.scoreOf}>/100</Text>
              </View>
              <Text style={styles.scoreLabel}>
                {health.score >= 70 ? '¡Portfolio sano!' : health.score >= 40 ? 'Mejorable' : 'Necesita atención'}
              </Text>
            </View>
            {health.items.map((item) => (
              <View key={item.label} style={styles.healthCard}>
                <View style={styles.healthHeader}>
                  <Text style={styles.healthLabel}>{item.label}</Text>
                  <Text style={styles.healthScore}>{item.score}/{item.max}</Text>
                </View>
                <ProgressBar value={item.score} max={item.max}
                  color={item.score >= item.max * 0.7 ? Colors.accent.green : item.score >= item.max * 0.4 ? Colors.accent.amber : Colors.accent.red} />
                <Text style={styles.healthNote}>{item.note}</Text>
              </View>
            ))}
            {active.length === 0 && <EmptyState icon="heart-outline" title="Sin datos" description="Añade inversiones para calcular la salud del portfolio" />}
          </>
        )}
      </ScrollView>

      {/* Goal form */}
      <BottomSheet visible={showGoalForm} onClose={() => setShowGoalForm(false)} title="Nuevo objetivo">
        <View style={styles.goalForm}>
          <FormInput label="Nombre del objetivo" placeholder="Ej: Fondo de emergencia" value={gf.name} onChangeText={(v) => setGf((p) => ({ ...p, name: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormInput label={`Objetivo (${sym})`} value={gf.targetAmount} onChangeText={(v) => setGf((p) => ({ ...p, targetAmount: v }))} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label={`Actual (${sym})`} value={gf.currentAmount} onChangeText={(v) => setGf((p) => ({ ...p, currentAmount: v }))} keyboardType="numeric" />
            </View>
          </View>
          <FormInput label="Fecha límite (YYYY-MM-DD)" value={gf.deadline} onChangeText={(v) => setGf((p) => ({ ...p, deadline: v }))} />
          <FormInput label="Emoji" value={gf.icon} onChangeText={(v) => setGf((p) => ({ ...p, icon: v }))} />
          <PrimaryButton label="Crear objetivo" onPress={saveGoal} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  tabBar: { backgroundColor: Colors.bg.secondary, borderBottomWidth: 0.5, borderColor: Colors.bg.border },
  tabContent: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.xl, backgroundColor: Colors.bg.card, borderWidth: 0.5, borderColor: Colors.bg.border },
  tabBtnActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.secondary },
  tabTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 32, gap: Spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statFull: { width: '100%' },
  statHalf: { flex: 1, minWidth: '45%' },
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary, marginBottom: Spacing.lg },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  heatCell: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', padding: 6 },
  heatTicker: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff', textAlign: 'center' },
  heatPct: { fontSize: FontSize.xs, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  rankList: { gap: Spacing.lg },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rankNum: { fontSize: FontSize.xs, color: Colors.text.muted, width: 18, textAlign: 'right' },
  rankAvatar: { width: 30, height: 30, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  rankAvatarText: { fontSize: FontSize.xs, fontWeight: '700' },
  rankInfo: { flex: 1, gap: 4 },
  rankName: { fontSize: FontSize.sm, color: Colors.text.primary },
  rankRight: { alignItems: 'flex-end' },
  rankPct: { fontSize: FontSize.sm, fontWeight: '700' },
  rankAbs: { fontSize: FontSize.xs },
  addGoalBtn: { backgroundColor: Colors.accent.blue, borderRadius: Radius.lg, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addGoalText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  goalCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, gap: Spacing.md },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  goalIcon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  goalName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  goalSub: { fontSize: FontSize.xs, color: Colors.text.secondary, marginTop: 2 },
  goalRight: { alignItems: 'flex-end', gap: 4 },
  goalPct: { fontSize: FontSize.base, fontWeight: '700' },
  goalDeadline: { fontSize: FontSize.xs, color: Colors.text.muted },
  simGrid: { gap: Spacing.md },
  simResults: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  simCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, alignItems: 'center', gap: 4 },
  simYears: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase' },
  simValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text.primary },
  simInterest: { fontSize: FontSize.xs, color: Colors.accent.green },
  healthCenter: { alignItems: 'center', gap: Spacing.md },
  scoreCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 6, borderColor: Colors.accent.blue, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text.primary },
  scoreOf: { fontSize: FontSize.xs, color: Colors.text.muted },
  scoreLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary },
  healthCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, gap: Spacing.sm },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  healthLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  healthScore: { fontSize: FontSize.sm, color: Colors.text.secondary },
  healthNote: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  goalForm: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: Spacing.md },
})
