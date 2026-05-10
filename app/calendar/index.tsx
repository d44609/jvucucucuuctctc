import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '@/store'
import { BottomSheet, PrimaryButton, EmptyState } from '@/components/ui'
import FormInput from '@/components/ui/FormInput'
import { formatCurrency } from '@/utils'
import { Colors, Spacing, Radius, FontSize } from '@/utils/theme'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_HEADER = ['L','M','X','J','V','S','D']

const EVENT_COLORS: Record<string, string> = {
  purchase: Colors.accent.green, sale: Colors.accent.red,
  contribution: Colors.accent.blue, update: Colors.accent.purple, custom: Colors.accent.amber,
}
const EVENT_LABELS: Record<string, string> = {
  purchase: 'Compra', sale: 'Venta', contribution: 'Aportación', update: 'Actualización', custom: 'Evento',
}

export default function CalendarScreen() {
  const { investments, events, addEvent, deleteEvent, settings } = useStore()
  const sym = settings.currencySymbol
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const [f, setF] = useState({ date: today, type: 'custom', title: '', amount: '', investmentId: '', notes: '' })

  const allEvents = useMemo(() => {
    const auto = investments.map((inv) => ({
      id: `auto-${inv.id}`, date: inv.purchaseDate, type: 'purchase' as const,
      title: `Compra: ${inv.name}`, amount: inv.initialAmount, notes: '',
    }))
    const updates = investments.flatMap((inv) =>
      inv.monthlyHistory.map((h) => ({
        id: `upd-${inv.id}-${h.month}`, date: `${h.month}-01`, type: 'update' as const,
        title: `Actualización: ${inv.name}`, amount: h.currentValue, notes: h.notes,
      }))
    )
    return [...events, ...auto, ...updates]
  }, [investments, events])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7

  const eventsByDay = useMemo(() => {
    const map: Record<string, typeof allEvents> = {}
    allEvents.forEach((e) => {
      if (!e.date) return
      const [y, m, d] = e.date.split('-').map(Number)
      if (y === year && m - 1 === month) {
        const key = String(d).padStart(2, '0')
        if (!map[key]) map[key] = []
        map[key].push(e)
      }
    })
    return map
  }, [allEvents, year, month])

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1); setSelectedDay(null) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1); setSelectedDay(null) }

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : []

  const upcoming = allEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  const saveEvent = () => {
    if (!f.title || !f.date) return
    addEvent({ date: f.date, type: f.type as any, title: f.title, amount: Number(f.amount) || undefined, investmentId: f.investmentId || undefined, notes: f.notes })
    setShowForm(false)
    setF({ date: today, type: 'custom', title: '', amount: '', investmentId: '', notes: '' })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendario</Text>
          <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.grid7}>
          {DAYS_HEADER.map((d) => <Text key={d} style={styles.dayHeader}>{d}</Text>)}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid7}>
          {Array.from({ length: firstDay }).map((_, i) => <View key={`e${i}`} style={styles.dayCell} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = String(i + 1).padStart(2, '0')
            const dayEvts = eventsByDay[day] ?? []
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${day}`
            const isToday = dateStr === today
            const isSelected = selectedDay === day
            return (
              <TouchableOpacity key={day} onPress={() => setSelectedDay(isSelected ? null : day)} style={styles.dayCell} activeOpacity={0.7}>
                <View style={[styles.dayInner, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday]}>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected, isToday && !isSelected && styles.dayNumToday]}>
                    {i + 1}
                  </Text>
                  {dayEvts.length > 0 && (
                    <View style={styles.dots}>
                      {dayEvts.slice(0, 3).map((e, idx) => (
                        <View key={idx} style={[styles.dot, { backgroundColor: isSelected ? '#fff' : EVENT_COLORS[e.type] }]} />
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Selected day */}
        {selectedDay && (
          <View style={styles.selectedSection}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedTitle}>{parseInt(selectedDay)} de {MONTHS[month]}</Text>
              <TouchableOpacity onPress={() => {
                const d = `${year}-${String(month+1).padStart(2,'0')}-${selectedDay}`
                setF((p) => ({ ...p, date: d }))
                setShowForm(true)
              }} style={styles.addEventBtn}>
                <Ionicons name="add" size={14} color={Colors.accent.blue} />
                <Text style={styles.addEventText}>Añadir</Text>
              </TouchableOpacity>
            </View>
            {selectedEvents.length === 0 ? (
              <Text style={styles.noEventsText}>Sin eventos este día</Text>
            ) : (
              <View style={styles.eventList}>
                {selectedEvents.map((e) => (
                  <View key={e.id} style={styles.eventCard}>
                    <View style={[styles.eventDot, { backgroundColor: EVENT_COLORS[e.type] + '22' }]}>
                      <View style={[styles.eventDotInner, { backgroundColor: EVENT_COLORS[e.type] }]} />
                    </View>
                    <View style={styles.eventBody}>
                      <View style={styles.eventTopRow}>
                        <View style={[styles.eventBadge, { backgroundColor: EVENT_COLORS[e.type] + '22' }]}>
                          <Text style={[styles.eventBadgeText, { color: EVENT_COLORS[e.type] }]}>{EVENT_LABELS[e.type]}</Text>
                        </View>
                      </View>
                      <Text style={styles.eventTitle} numberOfLines={1}>{e.title}</Text>
                      {e.amount && <Text style={styles.eventAmount}>{formatCurrency(e.amount, sym)}</Text>}
                      {e.notes ? <Text style={styles.eventNotes}>"{e.notes}"</Text> : null}
                    </View>
                    {!e.id.startsWith('auto-') && !e.id.startsWith('upd-') && (
                      <TouchableOpacity onPress={() => deleteEvent(e.id)}>
                        <Ionicons name="trash-outline" size={14} color={Colors.text.muted} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Upcoming */}
        <View>
          <Text style={styles.sectionTitle}>Próximos eventos</Text>
          {upcoming.length === 0 ? (
            <EmptyState icon="calendar-outline" title="Sin eventos próximos" />
          ) : (
            <View style={styles.upcomingList}>
              {upcoming.map((e) => {
                const d = new Date(e.date + 'T12:00:00')
                return (
                  <View key={e.id} style={styles.upcomingCard}>
                    <View style={styles.upcomingDate}>
                      <Text style={styles.upcomingDay}>{d.getDate()}</Text>
                      <Text style={styles.upcomingMonth}>{MONTHS[d.getMonth()].substring(0, 3)}</Text>
                    </View>
                    <View style={styles.upcomingDivider} />
                    <View style={styles.upcomingBody}>
                      <Text style={styles.upcomingTitle} numberOfLines={1}>{e.title}</Text>
                      <Text style={[styles.upcomingType, { color: EVENT_COLORS[e.type] }]}>{EVENT_LABELS[e.type]}</Text>
                    </View>
                    {e.amount && <Text style={styles.upcomingAmount}>{formatCurrency(e.amount, sym)}</Text>}
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add event sheet */}
      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="Nuevo evento">
        <View style={styles.formContent}>
          <FormInput label="Título" placeholder="Descripción del evento" value={f.title} onChangeText={(v) => setF((p) => ({ ...p, title: v }))} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormInput label="Fecha (YYYY-MM-DD)" value={f.date} onChangeText={(v) => setF((p) => ({ ...p, date: v }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Tipo</Text>
              <View style={styles.typeSelect}>
                {Object.entries(EVENT_LABELS).map(([v, l]) => (
                  <TouchableOpacity key={v} onPress={() => setF((p) => ({ ...p, type: v }))}
                    style={[styles.typeChip, f.type === v && { backgroundColor: EVENT_COLORS[v] }]}>
                    <Text style={[styles.typeChipText, f.type === v && { color: '#fff' }]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <FormInput label={`Importe (${sym}) - opcional`} value={f.amount} onChangeText={(v) => setF((p) => ({ ...p, amount: v }))} keyboardType="numeric" />
          <FormInput label="Notas" value={f.notes} onChangeText={(v) => setF((p) => ({ ...p, notes: v }))} multiline numberOfLines={2} style={{ height: 60, textAlignVertical: 'top', paddingTop: 10 }} />
          <PrimaryButton label="Guardar evento" onPress={saveEvent} disabled={!f.title || !f.date} />
        </View>
      </BottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 32, gap: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text.primary },
  addBtn: { width: 40, height: 40, borderRadius: Radius.lg, backgroundColor: Colors.accent.blue, alignItems: 'center', justifyContent: 'center' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text.primary },
  grid7: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHeader: { width: `${100/7}%`, textAlign: 'center', fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: '600', paddingVertical: 6 },
  dayCell: { width: `${100/7}%`, aspectRatio: 1, padding: 2 },
  dayInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md, gap: 2 },
  daySelected: { backgroundColor: Colors.accent.blue },
  dayToday: { backgroundColor: Colors.accent.blue + '20' },
  dayNum: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: '500' },
  dayNumSelected: { color: '#fff', fontWeight: '700' },
  dayNumToday: { color: Colors.accent.blue, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  selectedSection: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.lg, gap: Spacing.md },
  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text.primary },
  addEventBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addEventText: { fontSize: FontSize.sm, color: Colors.accent.blue, fontWeight: '600' },
  noEventsText: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center', paddingVertical: Spacing.lg },
  eventList: { gap: Spacing.sm },
  eventCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  eventDot: { width: 32, height: 32, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  eventDotInner: { width: 8, height: 8, borderRadius: 4 },
  eventBody: { flex: 1, gap: 3 },
  eventTopRow: { flexDirection: 'row' },
  eventBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  eventBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  eventTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  eventAmount: { fontSize: FontSize.xs, color: Colors.text.secondary },
  eventNotes: { fontSize: FontSize.xs, color: Colors.text.muted, fontStyle: 'italic' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary, marginBottom: Spacing.md },
  upcomingList: { gap: Spacing.sm },
  upcomingCard: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  upcomingDate: { width: 36, alignItems: 'center' },
  upcomingDay: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text.primary },
  upcomingMonth: { fontSize: FontSize.xs, color: Colors.text.muted },
  upcomingDivider: { width: 1, height: 32, backgroundColor: Colors.bg.border },
  upcomingBody: { flex: 1 },
  upcomingTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  upcomingType: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 2 },
  upcomingAmount: { fontSize: FontSize.sm, color: Colors.text.secondary, fontWeight: '600' },
  formContent: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: Spacing.md },
  formLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 },
  typeSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: Radius.sm, backgroundColor: Colors.bg.elevated, borderWidth: 0.5, borderColor: Colors.bg.border },
  typeChipText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text.secondary },
})
