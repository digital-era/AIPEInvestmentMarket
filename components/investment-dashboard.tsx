"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Activity } from "lucide-react"
import { mockAssets, mockTimeSeriesData, mockPortfolioSummary } from "@/lib/mock-data"

export default function InvestmentDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")

  const filteredAssets = useMemo(() => {
    return mockAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = assetTypeFilter === "all" || asset.type === assetTypeFilter
      const matchesRisk = riskFilter === "all" || asset.risk === riskFilter

      return matchesSearch && matchesType && matchesRisk
    })
  }, [searchTerm, assetTypeFilter, riskFilter])

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
    return formatCurrency(value)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "High":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AIPE Investment Market</h1>
                  <p className="text-sm text-gray-500">Professional Investment Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Market Open
              </Badge>
              <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatLargeNumber(mockPortfolioSummary.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                +{mockPortfolioSummary.totalReturnPercent.toFixed(2)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatLargeNumber(mockPortfolioSummary.totalReturn)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockPortfolioSummary.totalReturnPercent.toFixed(2)}% total return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day Change</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${mockPortfolioSummary.dayChange >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {mockPortfolioSummary.dayChange >= 0 ? "+" : ""}
                {formatLargeNumber(mockPortfolioSummary.dayChange)}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockPortfolioSummary.dayChangePercent >= 0 ? "+" : ""}
                {mockPortfolioSummary.dayChangePercent.toFixed(2)}% today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAssets.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {new Set(mockAssets.map((a) => a.type)).size} asset classes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Price movement over the last 15 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [formatCurrency(value), "Price"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
              <CardDescription>Daily trading volume trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis tickFormatter={(value) => `${(value / 1e6).toFixed(0)}M`} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${(value / 1e6).toFixed(2)}M`, "Volume"]}
                  />
                  <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Assets</CardTitle>
            <CardDescription>Monitor and analyze your investment portfolio</CardDescription>

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
                  <SelectItem value="Stock">Stocks</SelectItem>
                  <SelectItem value="ETF">ETFs</SelectItem>
                  <SelectItem value="Bond">Bonds</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
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
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.symbol}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(asset.currentPrice)}</TableCell>
                      <TableCell>
                        <div className={`flex items-center ${asset.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {asset.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          <span>
                            {asset.change >= 0 ? "+" : ""}
                            {asset.change.toFixed(2)}
                          </span>
                          <span className="ml-1">
                            ({asset.changePercent >= 0 ? "+" : ""}
                            {asset.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{(asset.volume / 1e6).toFixed(2)}M</TableCell>
                      <TableCell>{asset.marketCap > 0 ? formatLargeNumber(asset.marketCap) : "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(asset.risk)}>{asset.risk}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{asset.sector}</TableCell>
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
