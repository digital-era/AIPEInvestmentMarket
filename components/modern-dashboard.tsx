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
import { TrendingUp, BarChart2, Activity, RefreshCw, AlertTriangle, Search, DollarSign, Building2 } from "lucide-react"

export default function ModernDashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [dateRange, setDateRange] = useState("1M")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMarketData()
      console.log("Fetched data:", data) // 用于调试数据结构
      setMarketData(data)
    } catch (err) {
      setError("无法加载市场数据，请稍后重试。")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 动态提取数据表
  const dataSheets = useMemo(() => {
    if (!marketData) return {}

    const sheets: { [key: string]: any[] } = {}
    Object.keys(marketData).forEach((key) => {
      if (Array.isArray(marketData[key])) {
        sheets[key] = marketData[key]
      }
    })
    return sheets
  }, [marketData])

  // 获取所有可用的数据表名称
  const availableSheets = useMemo(() => {
    return Object.keys(dataSheets)
  }, [dataSheets])

  // 过滤数据
  const filteredData = useMemo(() => {
    if (!dataSheets[selectedTab]) return []

    return dataSheets[selectedTab].filter((item: any) => {
      if (!searchTerm) return true

      const searchableFields = Object.values(item).join(" ").toLowerCase()
      return searchableFields.includes(searchTerm.toLowerCase())
    })
  }, [dataSheets, selectedTab, searchTerm])

  // 计算汇总统计
  const summaryStats = useMemo(() => {
    const allData = Object.values(dataSheets).flat()

    // 尝试找到数值字段进行统计
    const numericFields = ["价格", "Price", "价值", "Value", "数量", "Amount", "总额", "Total"]
    let totalValue = 0
    let positiveCount = 0
    let negativeCount = 0
    const totalItems = allData.length

    allData.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        if (numericFields.some((field) => key.includes(field))) {
          const value = Number.parseFloat(item[key])
          if (!isNaN(value)) {
            totalValue += value
            if (value > 0) positiveCount++
            if (value < 0) negativeCount++
          }
        }
      })
    })

    return {
      totalValue,
      totalItems,
      positiveCount,
      negativeCount,
      averageValue: totalItems > 0 ? totalValue / totalItems : 0,
    }
  }, [dataSheets])

  // 格式化数字
  const formatNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toFixed(2)
  }

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(value)
  }

  // 获取表格列
  const getTableColumns = (data: any[]) => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }

  // 检测数值列用于图表
  const getNumericColumns = (data: any[]) => {
    if (!data || data.length === 0) return []

    const firstItem = data[0]
    return Object.keys(firstItem).filter((key) => {
      const value = firstItem[key]
      return !isNaN(Number.parseFloat(value)) && isFinite(value)
    })
  }

  // 准备图表数据
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    const numericCols = getNumericColumns(filteredData)
    if (numericCols.length === 0) return []

    return filteredData.slice(0, 20).map((item: any, index: number) => ({
      index: index + 1,
      name: item.Name || item.名称 || item.Symbol || item.代码 || `项目${index + 1}`,
      ...numericCols.reduce((acc: any, col: string) => {
        acc[col] = Number.parseFloat(item[col]) || 0
        return acc
      }, {}),
    }))
  }, [filteredData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">加载市场数据中...</h2>
          <p className="text-gray-600">正在获取最新的投资市场信息</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 现代化头部 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    AIEP 投资市场
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">智能投资分析平台</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span>刷新数据</span>
              </Button>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                实时数据
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-red-800">
                <AlertTriangle className="w-6 h-6" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 现代化汇总卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">总数据量</CardTitle>
              <DollarSign className="h-6 w-6 text-blue-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{summaryStats.totalItems.toLocaleString()}</div>
              <p className="text-xs text-blue-200 mt-1">数据记录总数</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-emerald-100">数据表数量</CardTitle>
              <Building2 className="h-6 w-6 text-emerald-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{availableSheets.length}</div>
              <p className="text-xs text-emerald-200 mt-1">可用数据表</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">正值记录</CardTitle>
              <TrendingUp className="h-6 w-6 text-purple-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{summaryStats.positiveCount}</div>
              <p className="text-xs text-purple-200 mt-1">正数值记录</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-orange-100">平均值</CardTitle>
              <Activity className="h-6 w-6 text-orange-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{formatNumber(summaryStats.averageValue)}</div>
              <p className="text-xs text-orange-200 mt-1">数值平均值</p>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        {chartData.length > 0 && (
          <Card className="mb-8 border-0 shadow-xl bg-white/70 backdrop-blur-md">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">数据可视化</CardTitle>
                  <CardDescription className="text-gray-600">当前数据表的图表展示</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  {["柱状图", "折线图", "面积图"].map((type) => (
                    <Button key={type} variant="outline" size="sm" className="hover:bg-blue-50 border-blue-200">
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    {getNumericColumns(filteredData)
                      .slice(0, 3)
                      .map((col, index) => (
                        <Area
                          key={col}
                          type="monotone"
                          dataKey={col}
                          stroke={`hsl(${index * 120}, 70%, 50%)`}
                          fill={`hsl(${index * 120}, 70%, 50%)`}
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 数据表格区域 */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">数据详情</CardTitle>
            <CardDescription className="text-gray-600">浏览和搜索所有数据表</CardDescription>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-gray-100/50 p-1 rounded-xl">
                  {availableSheets.slice(0, 4).map((sheet) => (
                    <TabsTrigger
                      key={sheet}
                      value={sheet}
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2 font-medium"
                    >
                      {sheet}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索数据..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                    />
                  </div>

                  {availableSheets.length > 4 && (
                    <Select value={selectedTab} onValueChange={setSelectedTab}>
                      <SelectTrigger className="w-full sm:w-[200px] border-gray-200 rounded-xl">
                        <SelectValue placeholder="选择数据表" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSheets.map((sheet) => (
                          <SelectItem key={sheet} value={sheet}>
                            {sheet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </Tabs>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    {getTableColumns(filteredData).map((column) => (
                      <TableHead key={column} className="font-semibold text-gray-700 py-4">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length > 0 ? (
                    filteredData.slice(0, 50).map((item: any, index: number) => (
                      <TableRow key={index} className="hover:bg-blue-50/50 transition-colors">
                        {getTableColumns(filteredData).map((column) => (
                          <TableCell key={column} className="py-4">
                            <div className="max-w-xs truncate">
                              {typeof item[column] === "number"
                                ? item[column].toLocaleString()
                                : item[column]?.toString() || "N/A"}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={getTableColumns(filteredData).length} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium">暂无数据</p>
                          <p className="text-sm">请尝试调整搜索条件或选择其他数据表</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredData.length > 50 && (
              <div className="mt-6 text-center">
                <Badge variant="outline" className="text-gray-600">
                  显示前50条记录，共{filteredData.length}条数据
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
