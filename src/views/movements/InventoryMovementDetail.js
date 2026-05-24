import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCardHeader,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CSpinner, CAlert, CRow, CCol, CCardText, CCardTitle
} from '@coreui/react'
import { apiFetch } from '../../services/api'
import { cilBasket, cilDollar, cilArrowTop, cilArrowThickToLeft, cilArrowBottom, cilLibraryBuilding, cilUser, cilNotes, cilFolderOpen, cilHome,
  cilGroup, cilCalendar} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const SummaryCard2 = ({ title, value, icon }) => (
  <CCol xs={12} sm={6} lg={4} className="mb-3 d-flex justify-content-center">
    <CCard className="shadow-sm border-0 w-100" style={{ borderRadius: '12px', maxWidth: '300px' }}>
      <CCardBody className="d-flex align-items-center p-2"> 
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            flexShrink: 0,
          }}
        >
          <CIcon icon={icon} style={{ width: '18px', height: '18px', color: '#475569' }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div 
            className="text-muted text-uppercase fw-semibold text-truncate" 
            style={{ fontSize: '9px', letterSpacing: '0.5px' }}
          >
            {title}
          </div>
          <div 
            className="fw-bold text-dark text-truncate" 
            style={{ fontSize: '13px', lineHeight: '1.2' }}
            title={value}
          >
            {value || '—'}
          </div>
        </div>
      </CCardBody>
    </CCard>
  </CCol>
)

function InventoryMovementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [movement, setMovement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/inventory-movements/' + id)
      .then((data) => setMovement(data))
      .catch((err) => setError(err.message || 'Error al cargar el movimiento'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <CSpinner color="primary" variant='grow'/>
      <p className="mt-2">Cargando movimiento...</p>
    </div>
  )

  if (error) return (
    <div className="text-center mt-5">
      <CAlert color="danger">{error}</CAlert>
      <CButton color="secondary" onClick={() => navigate(-1)}>Volver</CButton>
    </div>
  )

  if (!movement) return (
    <div className="text-center mt-5 text-danger">
      <p>No se encontró el movimiento.</p>
      <CButton color="secondary" onClick={() => navigate(-1)}>Volver</CButton>
    </div>
  )

  const isEntry = movement.movementType === 'IN'

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      

      <CCard className="mt-3 shadow-sm border-0">
      
        <CCardHeader className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="bg-light text-dark d-flex align-items-center justify-content-center fw-bold me-3" 
              style={{ 
                width: '45px', 
                height: '45px', 
                borderRadius: '10px',
                fontSize: '1.2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
            {movement.id}
          </div>
              <h3 className="fw-bold text-dark mb-1">
                {isEntry ? 'Entrada de Inventario' : 'Salida de Inventario'}
              </h3>

              < div className="d-flex gap-2"> 
              <CButton color="dark" onClick={() => navigate(-1)}>
              <CIcon icon={cilArrowThickToLeft} className="me-2" /></CButton>
              </div>
          </div>
        </CCardHeader>
        
        <CCardBody style={{ backgroundColor: '#fafafa' }}>
          
          <CRow className="mb-2 justify-content-center">
            <SummaryCard2 title="Documento de Referencia:" value={movement.referenceDocument} icon={cilFolderOpen} />
            <SummaryCard2 title="Nota:" value={movement.note} icon={cilNotes} />
            <SummaryCard2 title="Almacén:" value={movement.warehouseName} icon={cilLibraryBuilding} />
          </CRow>
          <CRow className="mb-2 justify-content-center">
            <SummaryCard2 title="Propietario" value={movement.ownerName} icon={cilGroup} />
            <SummaryCard2 title="Creado por:" value={movement.createdByName}  icon={cilUser} />
            <SummaryCard2 title="Fecha de Creación:" value={movement.createdAt} icon={cilCalendar} />
          </CRow>

          <h5 className="mt-4 mb-2 text-dark fw-bold">Detalles del Movimiento</h5>

          <CCard className="border-light shadow-sm">
            <CCardBody>
              <CTable hover responsive align="middle" bordered>
                <CTableHead color="dark">
                  <CTableRow>
                    <CTableHeaderCell>Producto</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Cantidad</CTableHeaderCell>
                    {isEntry && (
                      <>
                        <CTableHeaderCell className="text-center">Costo Unitario</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Lote</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Fecha de Vencimiento</CTableHeaderCell>
                      </>
                    )}
                    {!isEntry && (
                      <CTableHeaderCell className="text-center">Precio Unitario Venta</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {movement.details.map((d, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>{d.productName}</CTableDataCell>
                      <CTableDataCell className="text-center">{d.quantity}</CTableDataCell>
                      {isEntry && (
                        <>
                          <CTableDataCell className="text-center">{d.unitCost?.toFixed(2) || '-'}</CTableDataCell>
                          <CTableDataCell className="text-center">{d.lotNumber || '-'}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            {d.expirationDate ? new Date(d.expirationDate).toLocaleDateString() : '-'}
                          </CTableDataCell>
                        </>
                      )}
                      {!isEntry && (
                        <CTableDataCell className="text-center">
                          {d.sellPriceUnit ? '$' + d.sellPriceUnit.toFixed(2) : '-'}
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default InventoryMovementDetail
