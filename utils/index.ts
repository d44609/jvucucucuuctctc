import type { Investment } from '@/types'

export function formatCurrency(value: number, symbol = '€'): string {
  const abs = Math.abs(value)
  let formatted: string
  if (abs >= 1_000_000) formatted = (abs / 1_000_000).toFixed(2) + 'M'
  else if (abs >= 1_000) formatted = (abs / 1_000).toFixed(1) + 'K'
  else formatted = abs.toFixed(2)
  return (value < 0 ? '-' : '') + symbol + formatted
}

export function formatPercent(value: number, decimals = 2): string {
  return (value >= 0 ? '+' : '') + value.toFixed(decimals) + '%'
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return dateStr }
}

export function formatMonth(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('es-ES', {
      month: 'short', year: 'numeric',
    })
  } catch { return monthStr }
}

export function formatMonthShort(monthStr: string): string {
  try {
    const [year, month] = monthStr.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('es-ES', { month: 'short' })
  } catch { return monthStr }
}

export function getCurrentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function calcPnL(inv: Investment): number {
  return inv.currentValue - inv.initialAmount
}

export function calcPnLPercent(inv: Investment): number {
  if (inv.initialAmount === 0) return 0
  return ((inv.currentValue - inv.initialAmount) / inv.initialAmount) * 100
}

export function calcTotalPortfolio(investments: Investment[]): number {
  return investments.filter((i) => i.status === 'active').reduce((s, i) => s + i.currentValue, 0)
}

export function calcTotalInvested(investments: Investment[]): number {
  return investments.filter((i) => i.status === 'active').reduce((s, i) => s + i.initialAmount, 0)
}

export function calcTotalPnL(investments: Investment[]): number {
  return investments.filter((i) => i.status === 'active').reduce((s, i) => s + calcPnL(i), 0)
}

export function calcTotalPnLPercent(investments: Investment[]): number {
  const invested = calcTotalInvested(investments)
  if (invested === 0) return 0
  return (calcTotalPnL(investments) / invested) * 100
}

export function generatePortfolioHistory(
  investments: Investment[]
): { month: string; value: number; invested: number }[] {
  const active = investments.filter((i) => i.status === 'active')
  const allMonths = new Set<string>()
  active.forEach((inv) => inv.monthlyHistory.forEach((h) => allMonths.add(h.month)))
  if (allMonths.size === 0) return []
  const sorted = Array.from(allMonths).sort()
  return sorted.map((month) => {
    let value = 0
    let invested = 0
    active.forEach((inv) => {
      const entry = [...inv.monthlyHistory].reverse().find((h) => h.month <= month)
      if (entry) { value += entry.currentValue; invested += entry.invested }
      else if (inv.purchaseDate.substring(0, 7) <= month) {
        value += inv.initialAmount; invested += inv.initialAmount
      }
    })
    return { month, value, invested }
  })
}
