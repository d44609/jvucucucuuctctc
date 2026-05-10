export type AssetType = 'stock' | 'etf' | 'crypto' | 'gold' | 'fund' | 'cash' | 'other'
export type RiskLevel = 'low' | 'medium' | 'high' | 'very-high'
export type InvestmentStatus = 'active' | 'sold'

export interface MonthlyUpdate {
  id: string
  month: string
  currentValue: number
  invested: number
  percentageChange: number
  notes: string
  updatedAt: string
}

export interface Investment {
  id: string
  name: string
  ticker: string
  type: AssetType
  status: InvestmentStatus
  purchaseDate: string
  initialAmount: number
  currentValue: number
  averagePrice: number
  quantity: number
  notes: string
  tags: string[]
  risk: RiskLevel
  goal: string
  color: string
  monthlyHistory: MonthlyUpdate[]
  createdAt: string
  updatedAt: string
}

export interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  color: string
  icon: string
}

export interface CalendarEvent {
  id: string
  date: string
  type: 'purchase' | 'sale' | 'contribution' | 'update' | 'custom'
  title: string
  amount?: number
  investmentId?: string
  notes: string
}

export interface AppSettings {
  currency: string
  currencySymbol: string
  showAnimations: boolean
}

export interface AppState {
  investments: Investment[]
  goals: FinancialGoal[]
  events: CalendarEvent[]
  settings: AppSettings
}
