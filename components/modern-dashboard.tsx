"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { fetchMarketData, type MarketData } from "@/lib/api"
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  Search,
  DollarSign,
  Building2,
  Filter,
} from "lucide-react"

export default function ModernDashboard() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("area")
  const [dateRange, setDateRange] = useState("all")
  const [assetFilter, setAssetFilter] = useState("all")

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

      // 设置默认选中的第一个标签页
      if (data && Object.keys(data).length > 0) {
        setSelectedTab(Object.keys(data)[0])
      }
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

  // 获取资产类型列表
  const assetTypes = useMemo(() => {
    if (!dataSheets[selectedTab]) return []

    const types = new Set<string>()
    dataSheets[selectedTab].forEach((item: any) => {
      const type = item["资产类型"] || item["类型"] || item["Type"] || item["AssetType"]
      if (type) types.add(type)
    })
    return Array.from(types)
  }, [dataSheets, selectedTab])

  // 过滤数据
  const filteredData = useMemo(() => {
    if (!dataSheets[selectedTab]) return []

    return dataSheets[selectedTab].filter((item: any) => {
      // 搜索过滤
      if (searchTerm) {
        const searchableFields = Object.values(item).join(" ").toLowerCase()
        if (!searchableFields.includes(searchTerm.toLowerCase())) return false
      }

      // 资产类型过滤
      if (assetFilter !== "all") {
        const itemType = item["资产类型"] || item["类型"] || item["Type"] || item["AssetType"]
        if (itemType !== assetFilter) return false
      }

      return true
    })
  }, [dataSheets, selectedTab, searchTerm, assetFilter])

  // 计算汇总统计
  const summaryStats = useMemo(() => {
    if (!selectedTab || !dataSheets[selectedTab]) {
      return {
        totalItems: 0,
        totalValue: 0,
        positiveCount: 0,
        negativeCount: 0,
        averageValue: 0,
        maxValue: 0,
        minValue: 0,
      }
    }

    const data = dataSheets[selectedTab]

    // 尝试找到价格/价值相关字段
    const valueFields = ["价格", "Price", "价值", "Value", "收盘价", "Close", "净值"]
    const changeFields = ["涨跌幅", "Change", "变化率", "涨跌", "日涨跌幅"]

    let valueField = ""
    let changeField = ""

    if (data.length > 0) {
      const firstItem = data[0]
      // 查找价值字段
      for (const field of valueFields) {
        if (firstItem[field] !== undefined) {
          valueField = field
          break
        }
      }
      // 查找变化率字段
      for (const field of changeFields) {
        if (firstItem[field] !== undefined) {
          changeField = field
          break
        }
      }
    }

    let totalValue = 0
    let positiveCount = 0
    let negativeCount = 0
    let maxValue = Number.NEGATIVE_INFINITY
    let minValue = Number.POSITIVE_INFINITY

    data.forEach((item: any) => {
      // 处理价值
      if (valueField) {
        const value = Number.parseFloat(item[valueField])
        if (!isNaN(value)) {
          totalValue += value
          maxValue = Math.max(maxValue, value)
          minValue = Math.min(minValue, value)
        }
      }

      // 处理涨跌
      if (changeField) {
        const change = Number.parseFloat(item[changeField])
        if (!isNaN(change)) {
          if (change > 0) positiveCount++
          if (change < 0) negativeCount++
        }
      }
    })

    return {
      totalItems: data.length,
      totalValue,
      positiveCount,
      negativeCount,
      averageValue: data.length > 0 ? totalValue / data.length : 0,
      maxValue: maxValue !== Number.NEGATIVE_INFINITY ? maxValue : 0,
      minValue: minValue !== Number.POSITIVE_INFINITY ? minValue : 0,
    }
  }, [dataSheets, selectedTab])

  // 格式化数字
  const formatNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toFixed(2)
  }

  // 格式化百分比
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
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

  // 获取名称字段
  const getNameField = (data: any[]) => {
    if (!data || data.length === 0) return ""

    const nameFields = ["名称", "Name", "股票名称", "基金名称", "产品名称"]
    const firstItem = data[0]

    for (const field of nameFields) {
      if (firstItem[field] !== undefined) return field
    }

    return Object.keys(firstItem)[0]
  }

  // 获取代码字段
  const getCodeField = (data: any[]) => {
    if (!data || data.length === 0) return ""

    const codeFields = ["代码", "Code", "Symbol", "股票代码", "基金代码"]
    const firstItem = data[0]

    for (const field of codeFields) {
      if (firstItem[field] !== undefined) return field
    }

    return ""
  }

  // 准备图表数据
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    const numericCols = getNumericColumns(filteredData)
    if (numericCols.length === 0) return []

    const nameField = getNameField(filteredData)
    const codeField = getCodeField(filteredData)

    return filteredData.slice(0, 20).map((item: any, index: number) => {
      const name = item[nameField] || (codeField ? item[codeField] : `项目${index + 1}`)

      const result: any = {
        name: name,
        code: codeField ? item[codeField] : "",
      }

      // 添加数值字段
      numericCols.slice(0, 5).forEach((col) => {
        result[col] = Number.parseFloat(item[col]) || 0
      })

      return result
    })
  }, [filteredData])

  // 获取图表主要数值字段
  const getMainValueField = () => {
    if (!filteredData || filteredData.length === 0) return ""

    const valueFields = ["价格", "Price", "价值", "Value", "收盘价", "Close", "净值"]
    const firstItem = filteredData[0]

    for (const field of valueFields) {
      if (firstItem[field] !== undefined) return field
    }

    const numericCols = getNumericColumns(filteredData)
    return numericCols.length > 0 ? numericCols[0] : ""
  }

  // 获取图表变化率字段
  const getChangeField = () => {
    if (!filteredData || filteredData.length === 0) return ""

    const changeFields = ["涨跌幅", "Change", "变化率", "涨跌", "日涨跌幅"]
    const firstItem = filteredData[0]

    for (const field of changeFields) {
      if (firstItem[field] !== undefined) return field
    }

    return ""
  }

  // 渲染图表
  const renderChart = () => {
    if (chartData.length === 0) return null

    const valueField = getMainValueField()
    const changeField = getChangeField()

    if (!valueField) return null

    switch (selectedChartType) {
      case "area":
        return (
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
              <Legend />
              <Area
                type="monotone"
                dataKey={valueField}
                name={valueField}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              {changeField && (
                <Area
                  type="monotone"
                  dataKey={changeField}
                  name={changeField}
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              <Legend />
              <Bar dataKey={valueField} name={valueField} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              {changeField && <Bar dataKey={changeField} name={changeField} fill="#10b981" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <Legend />
              <Line
                type="monotone"
                dataKey={valueField}
                name={valueField}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {changeField && (
                <Line
                  type="monotone"
                  dataKey={changeField}
                  name={changeField}
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

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
                    AIPE 投资市场
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

        {/* 数据表选择器 */}
        {availableSheets.length > 0 && (
          <div className="mb-8">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-100/50 p-2 rounded-xl">
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
            </Tabs>
          </div>
        )}

        {/* 现代化汇总卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">数据总量</CardTitle>
              <DollarSign className="h-6 w-6 text-blue-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{summaryStats.totalItems.toLocaleString()}</div>
              <p className="text-xs text-blue-200 mt-1">当前数据表记录数</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-emerald-100">平均值</CardTitle>
              <Building2 className="h-6 w-6 text-emerald-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{formatNumber(summaryStats.averageValue)}</div>
              <p className="text-xs text-emerald-200 mt-1">数值平均值</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-green-100">上涨数量</CardTitle>
              <TrendingUp className="h-6 w-6 text-green-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{summaryStats.positiveCount}</div>
              <p className="text-xs text-green-200 mt-1">正收益资产数量</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-red-100">下跌数量</CardTitle>
              <TrendingDown className="h-6 w-6 text-red-200" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{summaryStats.negativeCount}</div>
              <p className="text-xs text-red-200 mt-1">负收益资产数量</p>
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
                  <CardDescription className="text-gray-600">{selectedTab} - 显示前20条记录</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <Button
                    variant={selectedChartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChartType("area")}
                    className={selectedChartType !== "area" ? "hover:bg-blue-50 border-blue-200" : ""}
                  >
                    面积图
                  </Button>
                  <Button
                    variant={selectedChartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChartType("bar")}
                    className={selectedChartType !== "bar" ? "hover:bg-blue-50 border-blue-200" : ""}
                  >
                    柱状图
                  </Button>
                  <Button
                    variant={selectedChartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedChartType("line")}
                    className={selectedChartType !== "line" ? "hover:bg-blue-50 border-blue-200" : ""}
                  >
                    折线图
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">{renderChart()}</div>
            </CardContent>
          </Card>
        )}

        {/* 数据表格区域 */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">数据详情</CardTitle>
            <CardDescription className="text-gray-600">浏览和搜索数据</CardDescription>

            <div className="flex flex-col lg:flex-row gap-4 mt-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索数据..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                />
              </div>

              {assetTypes.length > 0 && (
                <Select value={assetFilter} onValueChange={setAssetFilter}>
                  <SelectTrigger className="w-full lg:w-[200px] border-gray-200 rounded-xl">
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="资产类型" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {assetTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
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
                        {getTableColumns(filteredData).map((column) => {
                          const value = item[column]
                          const isNumeric = !isNaN(Number.parseFloat(value)) && isFinite(value)
                          const isPercentage =
                            column.includes("涨跌幅") || column.includes("收益率") || column.includes("比例")

                          let displayValue = value
                          let textColor = ""

                          if (isNumeric) {
                            const numValue = Number.parseFloat(value)

                            if (isPercentage) {
                              displayValue = `${(numValue * 100).toFixed(2)}%`
                              textColor = numValue > 0 ? "text-green-600" : numValue < 0 ? "text-red-600" : ""
                            } else {
                              displayValue = numValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            }
                          }

                          return (
                            <TableCell key={column} className={`py-4 ${textColor}`}>
                              <div className="max-w-xs truncate">{displayValue?.toString() || "N/A"}</div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={getTableColumns(filteredData).length || 1} className="h-32 text-center">
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
