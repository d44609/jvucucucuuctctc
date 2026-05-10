import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useStore } from '@/store'
import { BottomSheet, PrimaryButton, SecondaryButton } from '@/components/ui'
import { Colors, Spacing, Radius, FontSize } from '@/utils/theme'

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dólar' },
  { code: 'GBP', symbol: '£', name: 'Libra' },
  { code: 'CHF', symbol: 'Fr', name: 'Franco suizo' },
  { code: 'JPY', symbol: '¥', name: 'Yen' },
  { code: 'BTC', symbol: '₿', name: 'Bitcoin' },
]

export default function SettingsScreen() {
  const { settings, updateSettings, exportData, importData, resetData } = useStore()
  const [showCurrency, setShowCurrency] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const handleExport = async () => {
    try {
      const json = exportData()
      const path = FileSystem.documentDirectory + `investtrack-backup-${new Date().toISOString().slice(0,10)}.json`
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 })
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Exportar datos InvestTrack' })
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar los datos.')
    }
  }

  const handleReset = () => {
    resetData()
    setShowReset(false)
    Alert.alert('Hecho', 'Todos los datos han sido eliminados.')
  }

  const Row = ({ icon, iconColor = Colors.text.secondary, label, value, onPress, danger = false }: {
    icon: string; iconColor?: string; label: string; value?: string; onPress?: () => void; danger?: boolean
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.row} activeOpacity={0.7}>
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowLabel, danger && { color: Colors.accent.red }]}>{label}</Text>
        {value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />}
    </TouchableOpacity>
  )

  const Divider = () => <View style={styles.divider} />
  const Section = ({ label }: { label: string }) => <Text style={styles.sectionLabel}>{label}</Text>

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ajustes</Text>

        <Section label="Apariencia" />
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.accent.blue + '18' }]}>
              <Ionicons name="moon-outline" size={18} color={Colors.accent.blue} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>Modo oscuro</Text>
              <Text style={styles.rowValue}>Siempre activo</Text>
            </View>
            <Switch value={true} disabled thumbColor="#fff" trackColor={{ true: Colors.accent.blue }} />
          </View>
          <Divider />
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: Colors.accent.purple + '18' }]}>
              <Ionicons name="flash-outline" size={18} color={Colors.accent.purple} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>Animaciones</Text>
            </View>
            <Switch
              value={settings.showAnimations}
              onValueChange={(v) => updateSettings({ showAnimations: v })}
              thumbColor="#fff"
              trackColor={{ true: Colors.accent.blue, false: Colors.bg.border }}
            />
          </View>
        </View>

        <Section label="Moneda" />
        <View style={styles.group}>
          <Row icon="cash-outline" iconColor={Colors.accent.green}
            label="Moneda principal"
            value={`${settings.currency} (${settings.currencySymbol})`}
            onPress={() => setShowCurrency(true)} />
        </View>

        <Section label="Datos" />
        <View style={styles.group}>
          <Row icon="download-outline" iconColor={Colors.accent.blue}
            label="Exportar datos"
            value="Comparte un backup JSON"
            onPress={handleExport} />
        </View>

        <Section label="Zona de peligro" />
        <View style={styles.group}>
          <Row icon="trash-outline" iconColor={Colors.accent.red}
            label="Resetear todos los datos"
            value="Elimina toda la información"
            onPress={() => setShowReset(true)} danger />
        </View>

        <Section label="Información" />
        <View style={styles.group}>
          <Row icon="shield-checkmark-outline" iconColor={Colors.accent.green}
            label="Privacidad"
            value="100% local · Sin servidores" />
          <Divider />
          <Row icon="information-circle-outline" iconColor={Colors.text.secondary}
            label="InvestTrack"
            value="v1.0.0 · Gestión manual de inversiones"
            onPress={() => setShowAbout(true)} />
        </View>
      </ScrollView>

      {/* Currency selector */}
      <BottomSheet visible={showCurrency} onClose={() => setShowCurrency(false)} title="Moneda principal">
        <View style={styles.sheetContent}>
          {CURRENCIES.map((c) => (
            <TouchableOpacity key={c.code} onPress={() => { updateSettings({ currency: c.code, currencySymbol: c.symbol }); setShowCurrency(false) }}
              style={[styles.currencyRow, settings.currency === c.code && styles.currencyRowActive]} activeOpacity={0.7}>
              <View style={styles.currencySymbol}>
                <Text style={styles.currencySymbolText}>{c.symbol}</Text>
              </View>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyName}>{c.name}</Text>
                <Text style={styles.currencyCode}>{c.code}</Text>
              </View>
              {settings.currency === c.code && <View style={styles.currencyCheck} />}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>

      {/* Reset confirm */}
      <BottomSheet visible={showReset} onClose={() => setShowReset(false)} title="Resetear datos">
        <View style={styles.sheetContent}>
          <View style={styles.resetIcon}>
            <Ionicons name="trash-outline" size={28} color={Colors.accent.red} />
          </View>
          <Text style={styles.resetTitle}>¿Estás seguro?</Text>
          <Text style={styles.resetDesc}>Se eliminarán todas tus inversiones, objetivos y eventos. Esta acción es irreversible.</Text>
          <PrimaryButton label="Sí, eliminar todo" onPress={handleReset} danger />
          <SecondaryButton label="Cancelar" onPress={() => setShowReset(false)} />
        </View>
      </BottomSheet>

      {/* About */}
      <BottomSheet visible={showAbout} onClose={() => setShowAbout(false)} title="Acerca de InvestTrack">
        <View style={styles.sheetContent}>
          <View style={styles.aboutLogo}>
            <Text style={styles.aboutLogoText}>IT</Text>
          </View>
          <Text style={styles.aboutTitle}>InvestTrack</Text>
          <Text style={styles.aboutVersion}>Versión 1.0.0</Text>
          {[
            { icon: '🔒', t: '100% local y privado', d: 'Tus datos nunca salen del dispositivo' },
            { icon: '📊', t: 'Gestión manual', d: 'Sin APIs ni dependencias externas' },
            { icon: '💎', t: 'Diseño premium', d: 'Experiencia visual moderna' },
            { icon: '🚫', t: 'Sin publicidad', d: 'Sin tracking, sin anuncios' },
          ].map(({ icon, t, d }) => (
            <View key={t} style={styles.aboutRow}>
              <Text style={styles.aboutIcon}>{icon}</Text>
              <View>
                <Text style={styles.aboutRowTitle}>{t}</Text>
                <Text style={styles.aboutRowDesc}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
      </BottomSheet>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 32, gap: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text.primary, marginBottom: Spacing.sm },
  sectionLabel: { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing.sm },
  group: { backgroundColor: Colors.bg.card, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.bg.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  rowIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.text.primary },
  rowValue: { fontSize: FontSize.xs, color: Colors.text.muted },
  divider: { height: 0.5, backgroundColor: Colors.bg.border, marginLeft: 64 },
  sheetContent: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 36 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, backgroundColor: Colors.bg.elevated, borderWidth: 0.5, borderColor: Colors.bg.border },
  currencyRowActive: { borderColor: Colors.accent.blue, backgroundColor: Colors.accent.blue + '12' },
  currencySymbol: { width: 42, height: 42, borderRadius: Radius.md, backgroundColor: Colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  currencySymbolText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary },
  currencyInfo: { flex: 1 },
  currencyName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  currencyCode: { fontSize: FontSize.xs, color: Colors.text.muted },
  currencyCheck: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent.blue },
  resetIcon: { width: 60, height: 60, borderRadius: Radius.xl, backgroundColor: Colors.accent.red + '18', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  resetTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.primary, textAlign: 'center' },
  resetDesc: { fontSize: FontSize.base, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
  aboutLogo: { width: 80, height: 80, borderRadius: 22, backgroundColor: Colors.accent.blue, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  aboutLogoText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  aboutTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text.primary, textAlign: 'center' },
  aboutVersion: { fontSize: FontSize.sm, color: Colors.text.muted, textAlign: 'center' },
  aboutRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.bg.elevated, borderRadius: Radius.lg, padding: Spacing.md },
  aboutIcon: { fontSize: 20 },
  aboutRowTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.primary },
  aboutRowDesc: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
})
