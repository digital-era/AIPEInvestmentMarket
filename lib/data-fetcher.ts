export interface InvestmentData {
  [sheetName: string]: any[]
}

export async function fetchInvestmentData(): Promise<InvestmentData> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/digital-era/AIPEMarketData/main/data/AIEPMarketData.json",
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching investment data:", error)
    // Return mock data as fallback
    return getMockData()
  }
}

function getMockData(): InvestmentData {
  return {
    Assets: [
      {
        AssetID: "AAPL",
        AssetName: "Apple Inc.",
        AssetType: "Stock",
        Sector: "Technology",
        CurrentPrice: 175.43,
        PreviousClose: 173.28,
        Change: 2.15,
        ChangePercent: 1.24,
        Volume: 45678900,
        MarketCap: 2800000000000,
        Risk: "Medium",
        LastUpdated: "2024-01-15T16:00:00Z",
      },
      {
        AssetID: "MSFT",
        AssetName: "Microsoft Corporation",
        AssetType: "Stock",
        Sector: "Technology",
        CurrentPrice: 384.52,
        PreviousClose: 385.75,
        Change: -1.23,
        ChangePercent: -0.32,
        Volume: 23456789,
        MarketCap: 2900000000000,
        Risk: "Medium",
        LastUpdated: "2024-01-15T16:00:00Z",
      },
      {
        AssetID: "SPY",
        AssetName: "SPDR S&P 500 ETF",
        AssetType: "ETF",
        Sector: "Diversified",
        CurrentPrice: 478.23,
        PreviousClose: 474.78,
        Change: 3.45,
        ChangePercent: 0.73,
        Volume: 67890123,
        MarketCap: 450000000000,
        Risk: "Low",
        LastUpdated: "2024-01-15T16:00:00Z",
      },
    ],
    TimeSeries: [
      { Date: "2024-01-01", AssetID: "SPY", Price: 470.25, Volume: 45000000 },
      { Date: "2024-01-02", AssetID: "SPY", Price: 472.18, Volume: 42000000 },
      { Date: "2024-01-03", AssetID: "SPY", Price: 468.92, Volume: 48000000 },
      { Date: "2024-01-04", AssetID: "SPY", Price: 475.33, Volume: 51000000 },
      { Date: "2024-01-05", AssetID: "SPY", Price: 473.67, Volume: 46000000 },
      { Date: "2024-01-08", AssetID: "SPY", Price: 476.89, Volume: 49000000 },
      { Date: "2024-01-09", AssetID: "SPY", Price: 478.23, Volume: 52000000 },
    ],
    Returns: [
      { AssetID: "AAPL", Period: "1D", Return: 1.24 },
      { AssetID: "AAPL", Period: "1W", Return: 3.45 },
      { AssetID: "AAPL", Period: "1M", Return: 8.92 },
      { AssetID: "AAPL", Period: "YTD", Return: 12.34 },
    ],
    Risks: [
      { AssetID: "AAPL", VaR: 2.5, Beta: 1.2, Volatility: 0.25 },
      { AssetID: "MSFT", VaR: 2.1, Beta: 0.9, Volatility: 0.22 },
      { AssetID: "SPY", VaR: 1.8, Beta: 1.0, Volatility: 0.18 },
    ],
  }
}
