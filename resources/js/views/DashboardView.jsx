import React, { useState, useEffect } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import KpiCard from '../components/dashboard/KpiCard.jsx'
import TodaysAppointments from '../components/dashboard/TodaysAppointments.jsx'
import StaffOnDuty from '../components/dashboard/StaffOnDuty.jsx'
import RevenueChart from '../components/dashboard/RevenueChart.jsx'
import QuickActions from '../components/dashboard/QuickActions.jsx'
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardView() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    // Mocking GET /v1/analytics/dashboard
    const fetchDashboardData = async () => {
      setLoading(true)
      // Simulate network latency to show off the skeleton loaders
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setData({
        kpis: [
          { title: 'Total Revenue', value: '₹45,231', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'teal' },
          { title: 'Appointments', value: '142', change: '+5.2%', trend: 'up', icon: Calendar, color: 'indigo' },
          { title: 'New Clients', value: '28', change: '-2.1%', trend: 'down', icon: Users, color: 'rose' },
          { title: 'Avg Ticket Size', value: '₹1,250', change: '+8.4%', trend: 'up', icon: TrendingUp, color: 'amber' },
        ],
        appointments: [
          { id: 1, time: '09:00 AM', customer: 'Sarah Connor', service: 'Hair Coloring', staff: 'Emma W.', status: 'completed' },
          { id: 2, time: '10:30 AM', customer: 'John Wick', service: 'Beard Trim', staff: 'Liam N.', status: 'in-progress' },
          { id: 3, time: '11:00 AM', customer: 'Ellen Ripley', service: 'Manicure', staff: 'Olivia J.', status: 'confirmed' },
          { id: 4, time: '01:00 PM', customer: 'Tony Stark', service: 'Haircut', staff: 'Emma W.', status: 'cancelled' },
          { id: 5, time: '02:30 PM', customer: 'Bruce Wayne', service: 'Facial', staff: 'Liam N.', status: 'confirmed' },
        ],
        staffOnDuty: [
          { id: 1, name: 'Emma Watson', status: 'Available' },
          { id: 2, name: 'Liam Neeson', status: 'Busy', currentCustomer: 'John Wick' },
          { id: 3, name: 'Olivia Jones', status: 'Available' },
        ],
        revenueData: Array.from({ length: 30 }).map((_, i) => ({
          date: `Oct ${i + 1}`,
          amount: Math.floor(Math.random() * 5000) + 1000
        }))
      })
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Here's what's happening at your salon today."
      />

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {(data?.kpis || Array(4).fill({})).map((kpi, idx) => (
          <KpiCard 
            key={idx}
            title={kpi.title || 'Loading...'}
            value={kpi.value || '...'}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            color={kpi.color}
            loading={loading}
            delay={idx * 0.1}
          />
        ))}
      </div>

      {/* Row 2: Appointments & Staff */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <TodaysAppointments appointments={data?.appointments} loading={loading} />
        </div>
        <div className="xl:col-span-4">
          <StaffOnDuty staff={data?.staffOnDuty} loading={loading} />
        </div>
      </div>

      {/* Row 3: Revenue Chart & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <RevenueChart data={data?.revenueData} loading={loading} />
        </div>
        <div className="xl:col-span-4">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
