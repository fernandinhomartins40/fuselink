'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { analyticsAPI, userAPI } from '@/lib/api'
import { Eye, MousePointerClick, TrendingUp, Link as LinkIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, userRes] = await Promise.all([
        analyticsAPI.getOverview(7),
        userAPI.getMe(),
      ])

      setAnalytics(analyticsRes.data.data)
      setUser(userRes.data.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your overview.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/links">
          <Button>
            <LinkIcon className="mr-2 h-4 w-4" />
            Add New Link
          </Button>
        </Link>
        <Link href={`/${user?.username}`} target="_blank">
          <Button variant="outline">View Public Page</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={formatNumber(analytics?.totalViews || 0)}
          icon={Eye}
          description="Last 7 days"
          trend="+12%"
        />
        <StatCard
          title="Total Clicks"
          value={formatNumber(analytics?.totalClicks || 0)}
          icon={MousePointerClick}
          description="Last 7 days"
          trend="+8%"
        />
        <StatCard
          title="Click Rate"
          value={`${analytics?.ctr || 0}%`}
          icon={TrendingUp}
          description="Avg. CTR"
        />
        <StatCard
          title="Unique Visitors"
          value={formatNumber(analytics?.uniqueViews || 0)}
          icon={Eye}
          description="Last 7 days"
        />
      </div>

      {/* Profile Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your FuseLink</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-3 bg-muted rounded-lg">
              <code className="text-sm">
                {typeof window !== 'undefined' && window.location.origin}/{user?.username}
              </code>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/${user?.username}`
                )
              }}
            >
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Add more links to showcase all your content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Customize your page appearance to match your brand</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Check analytics to understand your audience better</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string
  value: string
  icon: any
  description?: string
  trend?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && <span className="text-green-600 ml-2">{trend}</span>}
        </p>
      </CardContent>
    </Card>
  )
}
