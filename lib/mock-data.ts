export interface InvestmentAsset {
  id: string
  name: string
  type: "Stock" | "Bond" | "ETF" | "Crypto" | "Real Estate"
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  risk: "Low" | "Medium" | "High"
  sector: string
  lastUpdated: string
}

export interface TimeSeriesData {
  date: string
  price: number
  volume: number
}

export interface PortfolioSummary {
  totalValue: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
}

export const mockAssets: InvestmentAsset[] = [
  {
    id: "1",
    name: "Apple Inc.",
    type: "Stock",
    symbol: "AAPL",
    currentPrice: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2800000000000,
    risk: "Medium",
    sector: "Technology",
    lastUpdated: "2024-01-15T16:00:00Z",
  },
  {
    id: "2",
    name: "Microsoft Corporation",
    type: "Stock",
    symbol: "MSFT",
    currentPrice: 384.52,
    change: -1.23,
    changePercent: -0.32,
    volume: 23456789,
    marketCap: 2900000000000,
    risk: "Medium",
    sector: "Technology",
    lastUpdated: "2024-01-15T16:00:00Z",
  },
  {
    id: "3",
    name: "SPDR S&P 500 ETF",
    type: "ETF",
    symbol: "SPY",
    currentPrice: 478.23,
    change: 3.45,
    changePercent: 0.73,
    volume: 67890123,
    marketCap: 450000000000,
    risk: "Low",
    sector: "Diversified",
    lastUpdated: "2024-01-15T16:00:00Z",
  },
  {
    id: "4",
    name: "Bitcoin",
    type: "Crypto",
    symbol: "BTC",
    currentPrice: 42350.67,
    change: -1250.33,
    changePercent: -2.87,
    volume: 12345678,
    marketCap: 830000000000,
    risk: "High",
    sector: "Cryptocurrency",
    lastUpdated: "2024-01-15T16:00:00Z",
  },
  {
    id: "5",
    name: "US Treasury 10Y",
    type: "Bond",
    symbol: "TNX",
    currentPrice: 4.25,
    change: 0.05,
    changePercent: 1.19,
    volume: 1234567,
    marketCap: 0,
    risk: "Low",
    sector: "Government",
    lastUpdated: "2024-01-15T16:00:00Z",
  },
]

export const mockTimeSeriesData: TimeSeriesData[] = [
  { date: "2024-01-01", price: 470.25, volume: 45000000 },
  { date: "2024-01-02", price: 472.18, volume: 42000000 },
  { date: "2024-01-03", price: 468.92, volume: 48000000 },
  { date: "2024-01-04", price: 475.33, volume: 51000000 },
  { date: "2024-01-05", price: 473.67, volume: 46000000 },
  { date: "2024-01-08", price: 476.89, volume: 49000000 },
  { date: "2024-01-09", price: 478.23, volume: 52000000 },
  { date: "2024-01-10", price: 474.56, volume: 47000000 },
  { date: "2024-01-11", price: 477.12, volume: 50000000 },
  { date: "2024-01-12", price: 479.45, volume: 53000000 },
  { date: "2024-01-15", price: 478.23, volume: 67890123 },
]

export const mockPortfolioSummary: PortfolioSummary = {
  totalValue: 1250000,
  totalReturn: 125000,
  totalReturnPercent: 11.11,
  dayChange: 15750,
  dayChangePercent: 1.28,
}
