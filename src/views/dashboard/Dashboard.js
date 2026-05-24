import { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CRow, CCol, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBasket, cilDollar, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import { CChartDoughnut, CChartPie, CChartBar, CChartLine } from '@coreui/react-chartjs'
import { apiFetch } from '../../services/api'


const COLORS = {
  blue: '#346191', 
  green: '#6eb091', 
  orange: '#D49664', 
  red: '#C25E65', 
  purple: '#847CB5', 
  cyan: '#6BA5C2', 
  pie: [
    '#214066', 
    '#39634F', 
    '#A07335', 
    '#823F46', 
    '#5C507E', 
    '#4E6E81'  
  ],
  expiringBars: ['#823F46', '#A07335', '#39634F', '#214066'],
}


const fmt = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

const fmtInt = (n) => (typeof n === 'number' ? n.toLocaleString('es-AR') : '—')

const EmptyChart = ({ message = 'Sin datos disponibles' }) => (
  <div
    style={{
      height: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
      fontSize: '0.9rem',
    }}
  >
    {message}
  </div>
)

const SummaryCard = ({ title, value, icon, color, subtitle }) => (
  <CCol xs={12} sm={6} lg={3} className="mb-4">
    <CCard className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
      <CCardBody className="d-flex align-items-center gap-3 p-3">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: '#f1f5f9', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
            flexShrink: 0,
          }}
        >
          <CIcon icon={icon} style={{ width: 24, height: 24, color: '#475569' }} />
        </div>
        <div className="text-truncate">
          <div className="text-muted text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{title}</div>
          <div className="fw-bold fs-4 text-dark">{value}</div>
          <div className="text-muted" style={{ fontSize: '11px' }}>{subtitle}</div>
        </div>
      </CCardBody>
    </CCard>
  </CCol>
)

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    categoryStock: [],
    stockByWarehouse: [],
    productsExpiring: [],
    monthlySalesPurchases: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const endpoints = [
      '/api/reports/dashboard/summary',
      '/api/reports/dashboard/stock-by-category',
      '/api/reports/dashboard/stock-value-by-warehouse',
      '/api/reports/dashboard/products-expiring',
      '/api/reports/dashboard/monthly-sales-purchases',
    ]
    Promise.all(
      endpoints.map((ep) =>
        apiFetch(ep).catch((err) => {
          console.error('Error fetching ' + ep + ':', err)
          return null
        })
      )
    ).then(([summary, categoryStock, stockByWarehouse, productsExpiring, monthlySalesPurchases]) => {
      if (!summary) setError(true)
      setDashboardData({
        summary,
        categoryStock: categoryStock || [],
        stockByWarehouse: stockByWarehouse || [],
        productsExpiring: productsExpiring || [],
        monthlySalesPurchases,
      })
      setLoading(false)
    })
  }, [])

  if (loading)
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
        <CSpinner color="primary" />
        <span className="ms-3 text-secondary">Cargando dashboard...</span>
      </div>
    )

  if (error || !dashboardData.summary)
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <span className="text-danger">No se pudo cargar el resumen del dashboard.</span>
      </div>
    )

  const { summary, categoryStock, stockByWarehouse, productsExpiring, monthlySalesPurchases } = dashboardData


  const cards = [
    {
      title: 'Productos en Stock',
      value: fmtInt(summary.totalProductsInStock),
      subtitle: 'Variedades distintas',
      icon: cilBasket,
      color: 'info',
    },
    {
      title: 'Valor Total Inventario',
      value: '$' + fmt(summary.totalInventoryValue),
      subtitle: 'Coste acumulado',
      icon: cilDollar,
      color: 'success',
    },
    {
      title: 'Ventas del Mes',
      value: fmtInt(summary.salesThisMonth),
      subtitle: 'Movimientos de salida',
      icon: cilArrowTop,
      color: 'primary',
    },
    {
      title: 'Compras del Mes',
      value: fmtInt(summary.purchasesThisMonth),
      subtitle: 'Movimientos de entrada',
      icon: cilArrowBottom,
      color: 'warning',
    },
  ]

  // Ventas y compras — barras agrupadas por mes
  const hasMonthlyData = monthlySalesPurchases?.months?.length > 0

  // Lotes por vencer — todos los períodos (incluidos en 0 para mostrar escala)
  const expiringLabels = ['0 – 60 días', '61 – 120 días', '121 – 180 días', 'Más de 180 días']
  const expiringCounts = productsExpiring.length === 4
    ? productsExpiring.map((p) => p.count)
    : [0, 0, 0, 0]
  const allZero = expiringCounts.every((c) => c === 0)

  // Stock por almacén
  const warehouseLabels = stockByWarehouse.map((w) => w.warehouseName)
  const warehouseValues = stockByWarehouse.map((w) => w.totalValue)

  // Categorías — solo las que tienen productos
  const categoryFiltered = categoryStock.filter((c) => c.count > 0)


  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', padding: '20px' }}>
      <CRow className="mb-2">
        <SummaryCard title="Productos en Stock" value={fmtInt(summary.totalProductsInStock)} subtitle="Variedades distintas" icon={cilBasket} />
        <SummaryCard title="Valor Inventario" value={'$' + fmt(summary.totalInventoryValue)} subtitle="Coste acumulado" icon={cilDollar} />
        <SummaryCard title="Ventas del Mes" value={fmtInt(summary.salesThisMonth)} subtitle="Salidas registradas" icon={cilArrowTop} />
        <SummaryCard title="Compras del Mes" value={fmtInt(summary.purchasesThisMonth)} subtitle="Entradas registradas" icon={cilArrowBottom} />
      </CRow>

      <CRow>
        <CCol xs={12} md={8} className="mb-4">
          <CCard className="shadow-sm border-0 rounded-3 h-100">
            <CCardHeader className="bg-white border-0 fw-bold py-3 text-dark fs-5">Rendimiento Mensual</CCardHeader>
            <CCardBody>
              {!hasMonthlyData ? <EmptyChart /> : (
                <CChartLine
                  data={{
                    labels: ['jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
                    datasets: [
                      {
                        label: 'Ventas',
                        data: [2000, 4000, 5000, 3000, 7000, 7000],
                        backgroundColor: 'rgba(64, 91, 133, 0.4)', 
                        borderColor: '#1E293B',
                        fill: true,
                        tension: 0.45,
                        pointRadius: 0,
                        borderWidth: 2,
                      },
                      {
                        label: 'Compras',
                        data: [4000, 8000, 11000, 6000, 4000, 9000],
                        backgroundColor: 'rgba(57, 99, 79, 0.3)',
                        borderColor: '#3e775b',
                        fill: true,
                        tension: 0.45,
                        pointRadius: 0,
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 16 },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.dataset.label}: $${fmt(ctx.parsed.y)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (v) => '$' + fmtInt(v) },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                      x: { grid: { display: false } },
                    },
                  }}                  
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={4} className="mb-4">
          <CCard className="shadow-sm border-0 rounded-3 h-100">
            <CCardHeader className="bg-white border-0 fw-bold py-3 text-dark fs-5">Categorías</CCardHeader>
            <CCardBody>
              {categoryFiltered.length === 0 ? <EmptyChart /> : (
                <CChartDoughnut
                  data={{
                    labels: categoryFiltered.map((c) => c.categoryName),
                    datasets: [{
                      data: categoryFiltered.map((c) => c.count),
                      backgroundColor: COLORS.pie,
                      borderWidth: 3,
                      borderColor: '#ffffff',
                    }],
                  }}
                  options={{
                    cutout: '33%',
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } } }
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6} className="mb-4">
          <CCard className="shadow-sm border-0 rounded-3 h-100">
            <CCardHeader className="bg-white border-0 fw-bold py-3 text-dark fs-5">Valor de Stock por Almacén</CCardHeader>
            <CCardBody>
              {warehouseLabels.length === 0 ? <EmptyChart /> : (
                <CChartBar
                  data={{
                    labels: warehouseLabels,
                    datasets: [{
                      label: 'Valor ($)',
                      data: warehouseValues,
                      backgroundColor: warehouseLabels.map((_, i) => COLORS.pie[i % COLORS.pie.length]),
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { border: { display: false }, grid: { color: '#f0f0f0' }, ticks: { callback: (v) => '$' + fmtInt(v) } }
                    }
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} md={6} className="mb-4">
          <CCard className="shadow-sm border-0 rounded-3 h-100">
            <CCardHeader className="bg-white border-0 fw-bold py-3 text-dark fs-5">
              Estado Crítico de Lotes
            </CCardHeader>
            <CCardBody style={{ height: '350px', padding: '0px 15px 10px 15px' }} className="d-flex flex-column">
              {allZero ? (
                <EmptyChart message="No hay lotes próximos a vencer" />
              ) : (
                <CChartBar
                  data={{
                    labels: expiringLabels,
                    datasets: [{
                      label: 'Lotes',
                      data: expiringCounts,
                      backgroundColor: COLORS.expiringBars,
                      borderRadius: 6,
                      barThickness: 50,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { border: { display: false }, grid: { color: '#f0f0f0' }, ticks: { callback: (v) => '$' + fmtInt(v) } }
                    }
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
