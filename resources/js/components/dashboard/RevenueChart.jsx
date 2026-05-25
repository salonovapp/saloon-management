import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

export default function RevenueChart({ data = [], loading = false }) {
  
  const chartData = useMemo(() => {
    return {
      labels: data.map(d => d.date),
      datasets: [
        {
          fill: true,
          label: 'Revenue',
          data: data.map(d => d.amount),
          borderColor: 'rgb(20, 184, 166)', // teal-500
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderColor: 'rgb(20, 184, 166)',
          pointBorderWidth: 2,
        },
      ],
    }
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y)
            }
            return label
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxTicksLimit: 7,
          color: '#94a3b8',
          font: {
            family: "'Instrument Sans', sans-serif",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: '#f1f5f9',
          drawBorder: false,
          borderDash: [5, 5]
        },
        border: { display: false },
        ticks: {
          maxTicksLimit: 5,
          color: '#94a3b8',
          font: {
            family: "'Instrument Sans', sans-serif",
            size: 11
          },
          callback: function(value) {
            return '₹' + value / 1000 + 'k'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full animate-pulse flex flex-col">
        <div className="h-5 w-32 bg-slate-100 rounded mb-8"></div>
        <div className="flex-1 w-full bg-slate-50 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Revenue Overview</h3>
          <p className="text-sm text-slate-500">Last 30 Days</p>
        </div>
      </div>
      <div className="flex-1 w-full relative min-h-[250px]">
        {data.length > 0 ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            No data available for this period.
          </div>
        )}
      </div>
    </div>
  )
}
