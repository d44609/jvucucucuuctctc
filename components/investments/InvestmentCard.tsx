import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { Investment } from '@/types'
import { formatCurrency, formatPercent, calcPnL, calcPnLPercent } from '@/utils'
import { ASSET_LABELS, ASSET_COLORS, Colors, Spacing, Radius, FontSize } from '@/utils/theme'
import { Badge, ColorDot } from '@/components/ui'
import { useStore } from '@/store'

export default function InvestmentCard({ investment, compact }: { investment: Investment; compact?: boolean }) {
  const router = useRouter()
  const symbol = useStore((s) => s.settings.currencySymbol)
  const pnl = calcPnL(investment)
  const pnlPct = calcPnLPercent(investment)
  const positive = pnl >= 0
  const color = investment.color || ASSET_COLORS[investment.type]
  const pnlColor = positive ? Colors.accent.green : Colors.accent.red

  if (compact) {
    return (
      <TouchableOpacity onPress={() => router.push(`/investments/${investment.id}`)} style={styles.compactCard} activeOpacity={0.75}>
        <ColorDot color={color} size={9} />
        <View style={styles.compactBody}>
          <Text style={styles.compactName} numberOfLines={1}>{investment.name}</Text>
          <Text style={styles.compactSub}>{investment.ticker || ASSET_LABELS[investment.type]}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactValue}>{formatCurrency(investment.currentValue, symbol)}</Text>
          <Text style={[styles.compactPct, { color: pnlColor }]}>{formatPercent(pnlPct)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={() => router.push(`/investments/${investment.id}`)} style={styles.card} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
          <Text style={[styles.avatarText, { color }]}>
            {(investment.ticker || investment.name).substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.name} numberOfLines={1}>{investment.name}</Text>
          <View style={styles.headerSub}>
            {investment.ticker ? <Text style={styles.ticker}>{investment.ticker}</Text> : null}
            <Badge color={ASSET_COLORS[investment.type]}>{ASSET_LABELS[investment.type]}</Badge>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Valor</Text>
          <Text style={styles.statValue}>{formatCurrency(investment.currentValue, symbol)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Invertido</Text>
          <Text style={[styles.statValue, { color: Colors.text.secondary }]}>{formatCurrency(investment.initialAmount, symbol)}</Text>
        </View>
        <View style={[styles.stat, { alignItems: 'flex-end' }]}>
          <Text style={styles.statLabel}>Rendimiento</Text>
          <View style={styles.pnlRow}>
            <Ionicons name={positive ? 'trending-up' : 'trending-down'} size={12} color={pnlColor} />
            <Text style={[styles.pnlPct, { color: pnlColor }]}>{formatPercent(pnlPct)}</Text>
          </View>
          <Text style={[styles.pnlAbs, { color: pnlColor }]}>{formatCurrency(pnl, symbol)}</Text>
        </View>
      </View>

      {investment.tags.length > 0 && (
        <View style={styles.tags}>
          {investment.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, gap: Spacing.md },
  compactCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.sm, fontWeight: '700' },
  headerBody: { flex: 1, gap: 3 },
  headerSub: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { fontSize: FontSize.base, fontWeight: '600', color: Colors.text.primary },
  ticker: { fontSize: FontSize.xs, color: Colors.text.muted, fontFamily: 'monospace' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { gap: 3 },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  pnlRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pnlPct: { fontSize: FontSize.sm, fontWeight: '700' },
  pnlAbs: { fontSize: FontSize.xs },
  tags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  tag: { backgroundColor: Colors.bg.elevated, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: FontSize.xs, color: Colors.text.muted },
  compactBody: { flex: 1 },
  compactName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  compactSub: { fontSize: FontSize.xs, color: Colors.text.muted },
  compactRight: { alignItems: 'flex-end' },
  compactValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  compactPct: { fontSize: FontSize.xs, fontWeight: '600' },
})
