import React, { ReactNode } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView,
  Modal, Pressable, ViewStyle, TextStyle,
} from 'react-native'
import { Colors, Spacing, Radius, FontSize } from '@/utils/theme'
import { Ionicons } from '@expo/vector-icons'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// ── Card ───────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>
}

// ── Stat Card ──────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
  style?: ViewStyle
  large?: boolean
}
export function StatCard({ label, value, sub, positive, style, large }: StatCardProps) {
  const valueColor =
    positive === true ? Colors.accent.green :
    positive === false ? Colors.accent.red :
    Colors.text.primary
  return (
    <Card style={[styles.statCard, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor, fontSize: large ? FontSize.xxl : FontSize.xl }]}>{value}</Text>
      {sub && (
        <View style={styles.statSub}>
          {positive === true && <Ionicons name="trending-up" size={11} color={Colors.accent.green} />}
          {positive === false && <Ionicons name="trending-down" size={11} color={Colors.accent.red} />}
          <Text style={[styles.statSubText, { color: positive === true ? Colors.accent.green : positive === false ? Colors.accent.red : Colors.text.secondary }]}>
            {' '}{sub}
          </Text>
        </View>
      )}
    </Card>
  )
}

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ children, color = Colors.accent.blue }: { children: ReactNode; color?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{children as string}</Text>
    </View>
  )
}

// ── Progress Bar ───────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = Colors.accent.blue }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  )
}

// ── Section Header ─────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  )
}

// ── Empty State ────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description?: string; action?: ReactNode
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as any} size={44} color={Colors.text.muted} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDesc}>{description}</Text>}
      {action && <View style={{ marginTop: Spacing.lg }}>{action}</View>}
    </View>
  )
}

// ── Bottom Sheet Modal ─────────────────────────────────────────
export function BottomSheet({ visible, onClose, title, children }: {
  visible: boolean; onClose: () => void; title?: string; children: ReactNode
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={styles.sheetContainer}>
        <View style={styles.sheetHandle} />
        {title && (
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
        <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.82 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    </Modal>
  )
}

// ── Primary Button ─────────────────────────────────────────────
export function PrimaryButton({ label, onPress, disabled, danger }: {
  label: string; onPress: () => void; disabled?: boolean; danger?: boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled}
      style={[styles.primaryBtn, { backgroundColor: danger ? Colors.accent.red : Colors.accent.blue }, disabled && { opacity: 0.5 }]}
      activeOpacity={0.8}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  )
}

// ── Secondary Button ───────────────────────────────────────────
export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.secondaryBtn} activeOpacity={0.8}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  )
}

// ── Color Dot ──────────────────────────────────────────────────
export function ColorDot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
}

// ── Input ──────────────────────────────────────────────────────
export { default as FormInput } from './FormInput'

// ── Pill Selector ──────────────────────────────────────────────
export function PillSelector<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.pillRow}>
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)}
          style={[styles.pill, value === opt.value && styles.pillActive]}>
          <Text style={[styles.pillText, value === opt.value && styles.pillTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.bg.border,
  },
  statCard: { padding: Spacing.lg, gap: Spacing.xs },
  statLabel: { fontSize: FontSize.xs, color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '500' },
  statValue: { fontWeight: '700' },
  statSub: { flexDirection: 'row', alignItems: 'center' },
  statSubText: { fontSize: FontSize.xs },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  progressBg: { height: 5, backgroundColor: Colors.bg.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: Spacing.xl },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary, marginTop: Spacing.md },
  emptyDesc: { fontSize: FontSize.base, color: Colors.text.secondary, marginTop: Spacing.xs, textAlign: 'center' },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetContainer: {
    backgroundColor: Colors.bg.secondary,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 0.5,
    borderColor: Colors.bg.border,
    paddingTop: Spacing.sm,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.bg.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, borderBottomWidth: 0.5, borderColor: Colors.bg.border },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary },
  primaryBtn: { borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.base },
  secondaryBtn: { borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', backgroundColor: Colors.bg.elevated, borderWidth: 0.5, borderColor: Colors.bg.border },
  secondaryBtnText: { color: Colors.text.primary, fontWeight: '600', fontSize: FontSize.base },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, backgroundColor: Colors.bg.elevated, borderWidth: 0.5, borderColor: Colors.bg.border },
  pillActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
  pillText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text.secondary },
  pillTextActive: { color: '#fff' },
})
