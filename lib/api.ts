export interface MarketData {
  [key: string]: any[]
}

export async function fetchMarketData(): Promise<MarketData> {
  const response = await fetch(
    "https://raw.githubusercontent.com/digital-era/AIEPMarketData/main/data/AIEPMarketData11.json",
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch market data: ${response.status}`)
  }

  return await response.json()
}
