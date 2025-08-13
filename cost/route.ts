import { NextResponse } from 'next/server'

// In a real implementation, this would track actual API usage
// For now, we'll simulate cost tracking

interface CostData {
  tokens: number
  cost: number
  monthlyLimit: number
  usagePercentage: number
}

// Simulated cost data
let costData: CostData = {
  tokens: 2500,
  cost: 0.002,
  monthlyLimit: 50000,
  usagePercentage: 5
}

// GET /api/cost - Get current cost data
export async function GET() {
  try {
    // Simulate some usage growth
    costData.tokens += Math.floor(Math.random() * 100)
    costData.cost = (costData.tokens * 0.0008) / 1000 // $0.0008 per 1K tokens
    costData.usagePercentage = (costData.tokens / costData.monthlyLimit) * 100

    return NextResponse.json(costData)
  } catch (error) {
    console.error('Failed to fetch cost data:', error)
    return NextResponse.json({ error: 'Failed to fetch cost data' }, { status: 500 })
  }
}