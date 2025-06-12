"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { fetchInvestmentData, type InvestmentData } from "@/lib/data-fetcher"

export default function AIPEDashboard() {
  const [data, setData] = useState<InvestmentData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [selectedAsset, setSelectedAsset] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const investmentData = await fetchInvestmentData()
      setData(investmentData)
    } catch (err) {
      setError("Failed to load investment data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const assets = data.Assets || []
  const timeSeries = data.TimeSeries || []
  const returns = data.Returns || []
  const risks = data.Risks || []

  const filteredAssets = useMemo(() => {
    return assets.filter((asset: any) => {
      const matchesSearch =
        asset.AssetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.AssetID?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = assetTypeFilter === "all" || asset.AssetType === assetTypeFilter
      const matchesRisk = riskFilter === "all" || asset.Risk === riskFilter

      return matchesSearch && matchesType && matchesRisk
    })
  }, [assets, searchTerm, assetTypeFilter, riskFilter])

  const filteredTimeSeries = useMemo(() => {
    if (selectedAsset === "all") return timeSeries
    return timeSeries.filter((item: any) => item.AssetID === selectedAsset)
  }, [timeSeries, selectedAsset])

  const portfolioSummary = useMemo(() => {
    if (!assets.length) return { totalValue: 0, totalChange: 0, totalChangePercent: 0, assetsCount: 0 }

    const totalValue = assets.reduce((sum: number, asset: any) => sum + (asset.CurrentPrice || 0), 0)
    const totalChange = assets.reduce((sum: number, asset: any) => sum + (asset.Change || 0), 0)
    const totalChangePercent =
      assets.length > 0
        ? assets.reduce((sum: number, asset: any) => sum + (asset.ChangePercent || 0), 0) / assets.length
        : 0

    return {
      totalValue,
      totalChange,
      totalChangePercent,
      assetsCount: assets.length,
    }
  }, [assets])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return formatCurrency(value)
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getAssetTypes = () => {
    const types = new Set(assets.map((asset: any) => asset.AssetType).filter(Boolean))
    return Array.from(types)
  }

  const getAssetIds = () => {
    const ids = new Set(assets.map((asset: any) => asset.AssetID).filter(Boolean))
    return Array.from(ids)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading AIPE Investment Market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AIPE Investment Market</h1>
                  <p className="text-sm text-gray-500">Advanced Investment Portfolio & Analytics Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={loadData} variant="outline" size="sm" className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                Live Data
              </Badge>
              <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
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
              <CardTitle className="text-sm font-medium text-blue-900">Portfolio Value</CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatLargeNumber(portfolioSummary.totalValue)}</div>
              <p className="text-xs text-blue-700 mt-1">Across {portfolioSummary.assetsCount} assets</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Change</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${portfolioSummary.totalChange >= 0 ? "text-green-900" : "text-red-600"}`}
              >
                {portfolioSummary.totalChange >= 0 ? "+" : ""}
                {formatCurrency(portfolioSummary.totalChange)}
              </div>
              <p className="text-xs text-green-700 mt-1">
                {portfolioSummary.totalChangePercent >= 0 ? "+" : ""}
                {portfolioSummary.totalChangePercent.toFixed(2)}% average
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Asset Classes</CardTitle>
              <PieChart className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{getAssetTypes().length}</div>
              <p className="text-xs text-purple-700 mt-1">{getAssetTypes().join(", ") || "No data"}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900">Market Activity</CardTitle>
              <Activity className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{timeSeries.length}</div>
              <p className="text-xs text-orange-700 mt-1">Data points available</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Price Performance</CardTitle>
                    <CardDescription>Historical price movements</CardDescription>
                  </div>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      {getAssetIds().map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={filteredTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="Date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [formatCurrency(value), "Price"]}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Volume</CardTitle>
                <CardDescription>Daily trading volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="Date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `${(value / 1e6).toFixed(0)}M`} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${(value / 1e6).toFixed(2)}M`, "Volume"]}
                    />
                    <Bar dataKey="Volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Returns</CardTitle>
                <CardDescription>Performance across different time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={returns}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="AssetID" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Return"]} />
                    <Bar dataKey="Return" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Assets</CardTitle>
            <CardDescription>Comprehensive view of your investment portfolio</CardDescription>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                <SelectTrigger className="max-w-[180px]">
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getAssetTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="max-w-[180px]">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="Low">Low Risk</SelectItem>
                  <SelectItem value="Medium">Medium Risk</SelectItem>
                  <SelectItem value="High">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Sector</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset: any, index: number) => (
                    <TableRow key={asset.AssetID || index} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.AssetName || "N/A"}</div>
                          <div className="text-sm text-gray-500">{asset.AssetID || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.AssetType || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {asset.CurrentPrice ? formatCurrency(asset.CurrentPrice) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center ${(asset.Change || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {(asset.Change || 0) >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          <span>
                            {(asset.Change || 0) >= 0 ? "+" : ""}
                            {(asset.Change || 0).toFixed(2)}
                          </span>
                          <span className="ml-1">
                            ({(asset.ChangePercent || 0) >= 0 ? "+" : ""}
                            {(asset.ChangePercent || 0).toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{asset.Volume ? `${(asset.Volume / 1e6).toFixed(2)}M` : "N/A"}</TableCell>
                      <TableCell>{asset.MarketCap ? formatLargeNumber(asset.MarketCap) : "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(asset.Risk || "")}>{asset.Risk || "N/A"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{asset.Sector || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
