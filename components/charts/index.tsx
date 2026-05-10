import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import {
  VictoryChart, VictoryLine, VictoryBar, VictoryPie, VictoryAxis,
  VictoryArea, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer,
} from 'victory-native'
import { Colors, FontSize } from '@/utils/theme'
import { formatCurrency, formatMonthShort } from '@/utils'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CHART_WIDTH = SCREEN_WIDTH - 40

const darkTheme = {
  ...VictoryTheme.material,
  axis: {
    ...VictoryTheme.material.axis,
    style: {
      axis: { stroke: 'transparent' },
      grid: { stroke: Colors.bg.border, strokeDasharray: '4' },
      tickLabels: { fill: Colors.text.muted, fontSize: 10 },
    },
  },
}

// ── Portfolio Area Chart ───────────────────────────────────────
interface PortfolioChartProps {
  data: { month: string; value: number; invested: number }[]
  symbol?: string
}
export function PortfolioChart({ data, symbol = '€' }: PortfolioChartProps) {
  if (data.length < 2) return null
  const valueData = data.map((d, i) => ({ x: i, y: d.value, label: `${formatMonthShort(d.month)}\n${formatCurrency(d.value, symbol)}` }))
  const investedData = data.map((d, i) => ({ x: i, y: d.invested }))

  return (
    <VictoryChart
      width={CHART_WIDTH} height={200} theme={darkTheme}
      containerComponent={<VictoryVoronoiContainer voronoiDimension="x" />}
      padding={{ top: 10, bottom: 30, left: 50, right: 10 }}>
      <VictoryAxis
        tickFormat={(t: number) => data[t] ? formatMonthShort(data[t].month) : ''}
        tickCount={Math.min(data.length, 5)}
        style={{ tickLabels: { fill: Colors.text.muted, fontSize: 9 }, axis: { stroke: 'transparent' }, grid: { stroke: 'transparent' } }}
      />
      <VictoryAxis dependentAxis
        tickFormat={(v: number) => formatCurrency(v, symbol)}
        style={{ tickLabels: { fill: Colors.text.muted, fontSize: 9 }, axis: { stroke: 'transparent' }, grid: { stroke: Colors.bg.border, strokeDasharray: '3' } }}
      />
      <VictoryArea data={investedData} style={{ data: { fill: Colors.accent.green + '20', stroke: Colors.accent.green, strokeWidth: 1.5 } }} />
      <VictoryArea data={valueData} style={{ data: { fill: Colors.accent.blue + '25', stroke: Colors.accent.blue, strokeWidth: 2 } }}
        labelComponent={<VictoryTooltip flyoutStyle={{ fill: Colors.bg.elevated, stroke: Colors.bg.border }} style={{ fill: Colors.text.primary, fontSize: 10 }} />}
      />
    </VictoryChart>
  )
}

// ── Monthly Bar Chart ──────────────────────────────────────────
interface MonthlyBarProps {
  data: { month: string; value: number; pnl?: number }[]
  symbol?: string
}
export function MonthlyBarChart({ data, symbol = '€' }: MonthlyBarProps) {
  if (data.length === 0) return null
  const barData = data.map((d, i) => ({
    x: i, y: d.value,
    fill: (d.pnl ?? 0) >= 0 ? Colors.accent.green : Colors.accent.red,
  }))
  return (
    <VictoryChart width={CHART_WIDTH} height={180} theme={darkTheme}
      padding={{ top: 10, bottom: 30, left: 50, right: 10 }}>
      <VictoryAxis
        tickFormat={(t: number) => data[t] ? formatMonthShort(data[t].month) : ''}
        tickCount={Math.min(data.length, 5)}
        style={{ tickLabels: { fill: Colors.text.muted, fontSize: 9 }, axis: { stroke: 'transparent' }, grid: { stroke: 'transparent' } }}
      />
      <VictoryAxis dependentAxis
        tickFormat={(v: number) => formatCurrency(v, symbol)}
        style={{ tickLabels: { fill: Colors.text.muted, fontSize: 9 }, axis: { stroke: 'transparent' }, grid: { stroke: Colors.bg.border, strokeDasharray: '3' } }}
      />
      <VictoryBar data={barData}
        style={{ data: { fill: ({ datum }: any) => datum.fill, fillOpacity: 0.85 } }}
        cornerRadius={{ top: 4 }} />
    </VictoryChart>
  )
}

// ── Donut Chart ────────────────────────────────────────────────
interface DonutItem { name: string; value: number; color: string }
export function DonutChart({ data }: { data: DonutItem[] }) {
  if (data.length === 0) return null
  return (
    <View>
      <VictoryPie
        data={data.map((d) => ({ x: d.name, y: d.value }))}
        colorScale={data.map((d) => d.color)}
        width={CHART_WIDTH} height={200}
        innerRadius={60} padAngle={2} padding={40}
        style={{ labels: { fill: Colors.text.secondary, fontSize: 10 } }}
        labelRadius={({ innerRadius }: any) => (innerRadius as number) + 38}
      />
      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.name} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={styles.legendText}>{d.name} {d.value.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Investment Line Chart ──────────────────────────────────────
interface InvLineProps { data: { month: string; value: number }[]; color?: string; symbol?: string }
export function InvestmentLineChart({ data, color = Colors.accent.blue, symbol = '€' }: InvLineProps) {
  if (data.length < 2) return null
  const lineData = data.map((d, i) => ({ x: i, y: d.value }))
  return (
    <VictoryChart width={CHART_WIDTH} height={160} theme={darkTheme}
      padding={{ top: 10, bottom: 30, left: 50, right: 10 }}>
      <VictoryAxis
        tickFormat={(t: number) => data[t] ? formatMonthShort(data[t].month) : ''}
        tickCount={Math.min(data.length, 5)}
        style={{ tickLabels: { fill: Colors.text.muted, fontSize: 9 }, axis: { stroke: 'transparent' }, grid: { stroke: 'transparent' } }}
      />
      <VictoryAxis dependentAxis
        tickFormat={(v: number) => formatCurrency(v, symbol)}
        style={{ tickLabels: { fill: Colors.text.muted, fontSize: 9 }, axis: { stroke: 'transparent' }, grid: { stroke: Colors.bg.border, strokeDasharray: '3' } }}
      />
      <VictoryArea data={lineData} style={{ data: { fill: color + '25', stroke: color, strokeWidth: 2 } }} />
    </VictoryChart>
  )
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 8, marginTop: -8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.text.secondary },
})
