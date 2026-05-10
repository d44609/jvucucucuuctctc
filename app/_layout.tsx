import { useEffect } from 'react'
import { View } from 'react-native'
import { Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/utils/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.bg.primary} />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: Colors.bg.secondary,
              borderTopColor: Colors.bg.border,
              borderTopWidth: 0.5,
              height: 70,
              paddingBottom: 12,
              paddingTop: 8,
            },
            tabBarActiveTintColor: Colors.accent.blue,
            tabBarInactiveTintColor: Colors.text.muted,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
          }}>
          <Tabs.Screen name="dashboard/index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
          <Tabs.Screen name="investments/index" options={{ title: 'Portfolio', tabBarIcon: ({ color, size }) => <Ionicons name="trending-up-outline" size={size} color={color} /> }} />
          <Tabs.Screen name="investments/[id]" options={{ href: null }} />
          <Tabs.Screen name="metrics/index" options={{ title: 'Métricas', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
          <Tabs.Screen name="calendar/index" options={{ title: 'Calendario', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
          <Tabs.Screen name="settings/index" options={{ title: 'Ajustes', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
