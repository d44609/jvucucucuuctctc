import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '@/store'
import { EmptyState, PillSelector } from '@/components/ui'
import InvestmentCard from '@/components/investments/InvestmentCard'
import InvestmentForm from '@/components/investments/InvestmentForm'
import { formatCurrency, calcTotalPortfolio, calcTotalPnL, calcPnLPercent } from '@/utils'
import { ASSET_LABELS, ASSET_COLORS, Colors, Spacing, Radius, FontSize } from '@/utils/theme'
import type { AssetType } from '@/types'

type SortKey = 'value' | 'pnl' | 'name' | 'date'
type FilterType = AssetType | 'all'

export default function InvestmentsScreen() {
  const { investments, settings } = useStore()
  const sym = settings.currencySymbol
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortKey>('value')
  const [statusFilter, setStatusFilter] = useState<'active' | 'sold' | 'all'>('active')
  const [showFilters, setShowFilters] = useState(false)

  const active = investments.filter((i) => i.status === 'active')
  const total = calcTotalPortfolio(active)
  const pnl = calcTotalPnL(active)

  const filtered = useMemo(() => {
    let list = investments
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter)
    if (filter !== 'all') list = list.filter((i) => i.type === filter)
    if (search) list = list.filter((i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.ticker.toLowerCase().includes(search.toLowerCase())
    )
    switch (sort) {
      case 'value': return [...list].sort((a, b) => b.currentValue - a.currentValue)
      case 'pnl': return [...list].sort((a, b) => calcPnLPercent(b) - calcPnLPercent(a))
      case 'name': return [...list].sort((a, b) => a.name.localeCompare(b.name))
      case 'date': return [...list].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
      default: return list
    }
  }, [investments, statusFilter, filter, search, sort])

  const typeOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todo' },
    ...(['stock','etf','crypto','gold','fund','cash','other'] as AssetType[]).map((t) => ({
      value: t, label: ASSET_LABELS[t],
    })),
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.iconBtn}>
              <Ionicons name="options-outline" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Valor total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(total, sym)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Ganancias</Text>
            <Text style={[styles.summaryValue, { color: pnl >= 0 ? Colors.accent.green : Colors.accent.red }]}>
              {formatCurrency(pnl, sym)}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.text.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar inversión..."
            placeholderTextColor={Colors.text.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersBox}>
            <Text style={styles.filterLabel}>Estado</Text>
            <PillSelector
              options={[{value:'active',label:'Activos'},{value:'sold',label:'Vendidos'},{value:'all',label:'Todos'}]}
              value={statusFilter} onChange={setStatusFilter} />
            <Text style={[styles.filterLabel, { marginTop: Spacing.md }]}>Ordenar por</Text>
            <PillSelector
              options={[{value:'value',label:'Valor'},{value:'pnl',label:'Rendimiento'},{value:'name',label:'Nombre'},{value:'date',label:'Fecha'}]}
              value={sort} onChange={setSort} />
          </View>
        )}

        {/* Type filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
          {typeOptions.map(({ value, label }) => (
            <TouchableOpacity key={value} onPress={() => setFilter(value)}
              style={[styles.chip, filter === value && styles.chipActive]}>
              <Text style={[styles.chipText, filter === value && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="trending-up-outline"
            title={investments.length === 0 ? 'Sin inversiones' : 'Sin resultados'}
            description={investments.length === 0 ? 'Añade tu primera inversión' : 'Prueba con otros filtros'}
            action={investments.length === 0 ? (
              <TouchableOpacity onPress={() => setShowForm(true)} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Añadir inversión</Text>
              </TouchableOpacity>
            ) : undefined}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((inv) => <InvestmentCard key={inv.id} investment={inv} />)}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text.primary },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: Radius.lg, backgroundColor: Colors.bg.card, borderWidth: 0.5, borderColor: Colors.bg.border, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: Radius.lg, backgroundColor: Colors.accent.blue, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: Spacing.md },
  summaryCard: { flex: 1, backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.md },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: 13, color: Colors.text.primary, fontSize: FontSize.base },
  filtersBox: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg },
  filterLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.sm },
  chipsScroll: { marginHorizontal: -Spacing.xl },
  chipsContent: { paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.xl, backgroundColor: Colors.bg.card, borderWidth: 0.5, borderColor: Colors.bg.border },
  chipActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
  chipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text.secondary },
  chipTextActive: { color: '#fff' },
  list: { gap: Spacing.md },
  emptyBtn: { backgroundColor: Colors.accent.blue, paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.lg },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
})
