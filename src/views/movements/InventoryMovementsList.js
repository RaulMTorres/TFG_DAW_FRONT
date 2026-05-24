import { useCallback, useEffect, useState } from 'react'
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CFormInput, CFormSelect, CButton, CAlert,CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/myComponents/Pagination'
import { cilPlus } from '@coreui/icons'
const ITEMS_PER_PAGE = 10

function InventoryMovementList() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState([])
  const [referenceDocument, setReferenceDocument] = useState('')
  const [movementType, setMovementType] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [selectedMovements, setSelectedMovements] = useState([])
  const [actionError, setActionError] = useState('')

  const fetchFn = useCallback(
    (page) => {
      const params = new URLSearchParams({ page: page - 1, size: ITEMS_PER_PAGE })
      if (referenceDocument) params.append('reference', referenceDocument)
      if (movementType) params.append('movementType', movementType)
      if (warehouseId) params.append('warehouseId', warehouseId)
      return apiFetch('/api/inventory-movements/paged?' + params.toString())
    },
    [referenceDocument, movementType, warehouseId]
  )

  const { data: movements, totalPages, currentPage, setCurrentPage, error, setError } = usePagination({
    fetchFn,
    deps: [referenceDocument, movementType, warehouseId],
  })

  useEffect(() => {
    apiFetch('/api/warehouses')
      .then((data) => setWarehouses(data || []))
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    setSelectedMovements([])
  }, [movements])

  const displayError = actionError || error

  const handleSelect = (id) => {
    setSelectedMovements((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    setSelectedMovements(
      selectedMovements.length === movements.length ? [] : movements.map((m) => m.id)
    )
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm('¿Estás seguro de eliminar los movimientos seleccionados?')) return
    setActionError('')
    try {
      await apiFetch('/api/inventory-movements/delete-multiple', {
        method: 'POST',
        body: JSON.stringify(selectedMovements),
      })
      setSelectedMovements([])
      setCurrentPage(1)
    } catch (err) {
      setActionError(err.message || 'Error eliminando movimientos')
    }
  }

  const allSelected = movements.length > 0 && selectedMovements.length === movements.length

  return (
    <div>
      <h2>Movimientos de Inventario</h2>

      {displayError && (
        <CAlert color="danger" dismissible onClose={() => { setActionError(''); setError('') }} style={{ marginBottom: '1rem' }}>
          {displayError}
        </CAlert>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <CFormInput placeholder="Buscar por referencia..." value={referenceDocument} onChange={(e) => setReferenceDocument(e.target.value)} />
        <CFormSelect value={movementType} onChange={(e) => setMovementType(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="IN">Entrada</option>
          <option value="OUT">Salida</option>
        </CFormSelect>
        <CFormSelect value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
          <option value="">Todos los almacenes</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </CFormSelect>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
          <CTooltip content="Crear Movimiento" placement="top">
            <CButton 
              onClick={() => navigate('/movement/create')}
              className="p-0 border-0 shadow-none"
              style={{ 
                background: 'none', 
                outline: 'none',
                boxShadow: 'none' 
              }}
            >
              <div className=" text-dark d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '100px',
                  fontSize: '1.2rem',
                  boxShadow: '0 10px 10pX rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  backgroundColor: '#4f5b6d5f'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <CIcon icon={cilPlus} size="xl"/>
              </div>
            </CButton>
          </CTooltip>
        {selectedMovements.length > 0 && (
          <CButton color="danger" variant='outline' size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionados ({selectedMovements.length})
          </CButton>
        )}
      </div>

      <CTable hover className="mt-3">
        <CTableHead color="white">
          <CTableRow>
            <CTableHeaderCell>
              <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
            </CTableHeaderCell>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Tipo</CTableHeaderCell>
            <CTableHeaderCell>Documento Ref.</CTableHeaderCell>
            <CTableHeaderCell>Almacén</CTableHeaderCell>
            <CTableHeaderCell>Creado por</CTableHeaderCell>
            <CTableHeaderCell>Fecha</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {movements.length > 0 ? (
            movements.map((m) => (
              <CTableRow key={m.id}>
                <CTableDataCell>
                  <input type="checkbox" checked={selectedMovements.includes(m.id)} onChange={() => handleSelect(m.id)} />
                </CTableDataCell>
                <CTableDataCell>{m.id}</CTableDataCell>
                <CTableDataCell>{m.movementType}</CTableDataCell>
                <CTableDataCell>{m.referenceDocument}</CTableDataCell>
                <CTableDataCell>{m.warehouseName || '-'}</CTableDataCell>
                <CTableDataCell>{m.createdByName || '-'}</CTableDataCell>
                <CTableDataCell>{new Date(m.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="dark" size="sm" disabled={selectedMovements.length >= 1} onClick={() => navigate('/movement/' + m.id)}>
                    Ver detalles
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={8} style={{ textAlign: 'center' }}>
                No se encontraron movimientos.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

export default InventoryMovementList
