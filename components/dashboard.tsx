"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { fetchMarketData, type MarketData } from "@/lib/api"
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  Activity,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Search,
} from "lucide-react"

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assetTypeFilter, setAssetTypeFilter] = useState("all")
  const [selectedTab, setSelectedTab] = useState("stocks")
  const [dateRange, setDateRange] = useState("1M")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMarketData()
      setMarketData(data)
    } catch (err) {
      setError("Failed to load market data. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Extract data sheets
  const stocks = useMemo(() => marketData?.Stocks || [], [marketData])
  const indices = useMemo(() => marketData?.Indices || [], [marketData])
  const bonds = useMemo(() => marketData?.Bonds || [], [marketData])
  const timeSeries = useMemo(() => marketData?.TimeSeries || [], [marketData])
  const sectors = useMemo(() => marketData?.Sectors || [], [marketData])

  // Filter assets based on search and type
  const filteredAssets = useMemo(() => {
    let assets: any[] = []

    switch (selectedTab) {
      case "stocks":
        assets = stocks
        break
      case "indices":
        assets = indices
        break
      case "bonds":
        assets = bonds
        break
      case "sectors":
        assets = sectors
        break
      default:
        assets = stocks
    }

    return assets.filter((asset) => {
      const matchesSearch =
        asset.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.Symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.Ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ""

      const matchesType = assetTypeFilter === "all" || asset.Type === assetTypeFilter

      return matchesSearch && matchesType
    })
  }, [stocks, indices, bonds, sectors, selectedTab, searchTerm, assetTypeFilter])

  // Filter time series data based on selected asset and date range
  const filteredTimeSeries = useMemo(() => {
    if (!timeSeries.length) return []

    // Get the most recent date in the data
    const dates = timeSeries.map((item) => new Date(item.Date))
    const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())))

    // Calculate the start date based on the selected range
    let startDate = new Date(maxDate)
    switch (dateRange) {
      case "1W":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "1M":
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "3M":
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case "6M":
        startDate.setMonth(startDate.getMonth() - 6)
        break
      case "1Y":
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case "YTD":
        startDate = new Date(maxDate.getFullYear(), 0, 1) // January 1st of current year
        break
      default:
        startDate.setMonth(startDate.getMonth() - 1) // Default to 1 month
    }

    // Filter time series data by date range
    return timeSeries
      .filter((item) => new Date(item.Date) >= startDate && new Date(item.Date) <= maxDate)
      .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
  }, [timeSeries, dateRange])

  // Calculate market summary
  const marketSummary = useMemo(() => {
    if (!stocks.length && !indices.length)
      return {
        totalMarketCap: 0,
        averageChange: 0,
        positiveAssets: 0,
        negativeAssets: 0,
      }

    const allAssets = [...stocks, ...indices]
    const totalMarketCap = allAssets.reduce((sum, asset) => sum + (asset.MarketCap || 0), 0)

    const changes = allAssets.map((asset) => asset.ChangePercent || 0)
    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length

    const positiveAssets = allAssets.filter((asset) => (asset.ChangePercent || 0) > 0).length
    const negativeAssets = allAssets.filter((asset) => (asset.ChangePercent || 0) < 0).length

    return {
      totalMarketCap,
      averageChange,
      positiveAssets,
      negativeAssets,
    }
  }, [stocks, indices])

  // Get unique asset types for filter
  const assetTypes = useMemo(() => {
    const types = new Set<string>()

    switch (selectedTab) {
      case "stocks":
        stocks.forEach((stock) => stock.Type && types.add(stock.Type))
        break
      case "indices":
        indices.forEach((index) => index.Type && types.add(index.Type))
        break
      case "bonds":
        bonds.forEach((bond) => bond.Type && types.add(bond.Type))
        break
      default:
        stocks.forEach((stock) => stock.Type && types.add(stock.Type))
    }

    return Array.from(types)
  }, [stocks, indices, bonds, selectedTab])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(value)
  }

  // Format large numbers
  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `¥${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `¥${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `¥${(value / 1e6).toFixed(2)}M`
    return formatCurrency(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-700">Loading market data...</h2>
          <p className="text-gray-500">Please wait while we fetch the latest information</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">China Market Dashboard</h1>
                  <p className="text-sm text-gray-500">Investment Market Analytics Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={loadData} variant="outline" size="sm" className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </Button>
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                Market {new Date().getHours() >= 9 && new Date().getHours() < 15 ? "Open" : "Closed"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Market Cap</CardTitle>
              <PieChart className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatLargeNumber(marketSummary.totalMarketCap)}</div>
              <p className="text-xs text-blue-700 mt-1">Combined market capitalization</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Market Sentiment</CardTitle>
              <Activity className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${marketSummary.averageChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {marketSummary.averageChange >= 0 ? "+" : ""}
                {marketSummary.averageChange.toFixed(2)}%
              </div>
              <p className="text-xs text-green-700 mt-1">Average change across all assets</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">Gainers</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{marketSummary.positiveAssets}</div>
              <p className="text-xs text-emerald-700 mt-1">Assets with positive returns</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Losers</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{marketSummary.negativeAssets}</div>
              <p className="text-xs text-red-700 mt-1">Assets with negative returns</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle>Market Performance</CardTitle>
                <CardDescription>Historical price movements</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                {["1W", "1M", "3M", "6M", "1Y", "YTD"].map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              {filteredTimeSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="Date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [value.toFixed(2), "Price"]}
                    />
                    <Area type="monotone" dataKey="Price" stroke="#3b82f6" fill="url(#colorPrice)" strokeWidth={2} />
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No time series data available for the selected period</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Asset Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Market Assets</CardTitle>
            <CardDescription>Comprehensive view of the Chinese investment market</CardDescription>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="indices">Indices</TabsTrigger>
                <TabsTrigger value="bonds">Bonds</TabsTrigger>
                <TabsTrigger value="sectors">Sectors</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {assetTypes.length > 0 && (
                  <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Asset Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {assetTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Change</TableHead>
                    {selectedTab === "stocks" && <TableHead>Market Cap</TableHead>}
                    {selectedTab === "stocks" && <TableHead>P/E Ratio</TableHead>}
                    {selectedTab === "bonds" && <TableHead>Yield</TableHead>}
                    {selectedTab === "bonds" && <TableHead>Maturity</TableHead>}
                    {selectedTab === "sectors" && <TableHead>Companies</TableHead>}
                    {selectedTab === "sectors" && <TableHead>Performance</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset, index) => (
                      <TableRow key={asset.Symbol || asset.Ticker || index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{asset.Name}</TableCell>
                        <TableCell>{asset.Symbol || asset.Ticker}</TableCell>
                        <TableCell>{asset.Price?.toFixed(2) || "N/A"}</TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center ${(asset.ChangePercent || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {(asset.ChangePercent || 0) >= 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            <span>
                              {(asset.ChangePercent || 0) >= 0 ? "+" : ""}
                              {(asset.ChangePercent || 0).toFixed(2)}%
                            </span>
                          </div>
                        </TableCell>
                        {selectedTab === "stocks" && (
                          <TableCell>{asset.MarketCap ? formatLargeNumber(asset.MarketCap) : "N/A"}</TableCell>
                        )}
                        {selectedTab === "stocks" && <TableCell>{asset.PE ? asset.PE.toFixed(2) : "N/A"}</TableCell>}
                        {selectedTab === "bonds" && (
                          <TableCell>{asset.Yield ? `${asset.Yield.toFixed(2)}%` : "N/A"}</TableCell>
                        )}
                        {selectedTab === "bonds" && <TableCell>{asset.Maturity || "N/A"}</TableCell>}
                        {selectedTab === "sectors" && <TableCell>{asset.Companies || "N/A"}</TableCell>}
                        {selectedTab === "sectors" && (
                          <TableCell>
                            <div
                              className={`flex items-center ${(asset.Performance || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {(asset.Performance || 0) >= 0 ? "+" : ""}
                              {(asset.Performance || 0).toFixed(2)}%
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search className="w-8 h-8 mb-2 opacity-20" />
                          <p>No assets found matching your filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
