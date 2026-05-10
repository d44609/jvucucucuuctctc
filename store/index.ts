import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'
import type { Investment, FinancialGoal, CalendarEvent, MonthlyUpdate, AppSettings } from '@/types'

const defaultSettings: AppSettings = {
  currency: 'EUR',
  currencySymbol: '€',
  showAnimations: true,
}

interface Store {
  investments: Investment[]
  goals: FinancialGoal[]
  events: CalendarEvent[]
  settings: AppSettings

  addInvestment: (inv: Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'monthlyHistory'>) => void
  updateInvestment: (id: string, updates: Partial<Investment>) => void
  deleteInvestment: (id: string) => void
  addMonthlyUpdate: (investmentId: string, update: Omit<MonthlyUpdate, 'id' | 'updatedAt'>) => void

  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void
  deleteGoal: (id: string) => void

  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  deleteEvent: (id: string) => void

  updateSettings: (s: Partial<AppSettings>) => void
  exportData: () => string
  importData: (json: string) => void
  resetData: () => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      investments: [],
      goals: [],
      events: [],
      settings: defaultSettings,

      addInvestment: (inv) => {
        const now = new Date().toISOString()
        set((s) => ({
          investments: [...s.investments, { ...inv, id: uuidv4(), monthlyHistory: [], createdAt: now, updatedAt: now }],
        }))
      },

      updateInvestment: (id, updates) =>
        set((s) => ({
          investments: s.investments.map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          ),
        })),

      deleteInvestment: (id) =>
        set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),

      addMonthlyUpdate: (investmentId, update) => {
        const entry: MonthlyUpdate = { ...update, id: uuidv4(), updatedAt: new Date().toISOString() }
        set((s) => ({
          investments: s.investments.map((inv) => {
            if (inv.id !== investmentId) return inv
            const existing = inv.monthlyHistory.findIndex((h) => h.month === update.month)
            const history =
              existing >= 0
                ? inv.monthlyHistory.map((h, i) => (i === existing ? entry : h))
                : [...inv.monthlyHistory, entry].sort((a, b) => a.month.localeCompare(b.month))
            return { ...inv, monthlyHistory: history, currentValue: update.currentValue, updatedAt: new Date().toISOString() }
          }),
        }))
      },

      addGoal: (goal) => set((s) => ({ goals: [...s.goals, { ...goal, id: uuidv4() }] })),
      updateGoal: (id, updates) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addEvent: (event) => set((s) => ({ events: [...s.events, { ...event, id: uuidv4() }] })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      exportData: () => {
        const { investments, goals, events, settings } = get()
        return JSON.stringify({ investments, goals, events, settings }, null, 2)
      },

      importData: (json) => {
        const data = JSON.parse(json)
        set({
          investments: data.investments ?? [],
          goals: data.goals ?? [],
          events: data.events ?? [],
          settings: { ...defaultSettings, ...(data.settings ?? {}) },
        })
      },

      resetData: () =>
        set({ investments: [], goals: [], events: [], settings: defaultSettings }),
    }),
    {
      name: 'investtrack-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
