import { useCallback, useState } from 'react'
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CFormInput, CButton, CAlert, CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/myComponents/Pagination'
import { cilPlus } from '@coreui/icons'


const ITEMS_PER_PAGE = 10

function WarehousesList() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouses, setSelectedWarehouses] = useState([])
  const [actionError, setActionError] = useState('')

  const fetchFn = useCallback(
    (page) => {
      const params = new URLSearchParams({ page: page - 1, size: ITEMS_PER_PAGE })
      if (searchTerm) params.append('search', searchTerm)
      return apiFetch('/api/warehouses/paged?' + params.toString())
    },
    [searchTerm]
  )

  const { data: warehouses, totalPages, currentPage, setCurrentPage, error, setError } = usePagination({
    fetchFn,
    deps: [searchTerm],
  })

  const displayError = actionError || error

  const handleSelect = (id) => {
    setSelectedWarehouses((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    setSelectedWarehouses(
      selectedWarehouses.length === warehouses.length ? [] : warehouses.map((w) => w.id)
    )
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm('¿Estás seguro de eliminar los almacenes seleccionados?')) return
    setActionError('')
    try {
      await apiFetch('/api/warehouses/delete-multiple', {
        method: 'POST',
        body: JSON.stringify(selectedWarehouses),
      })
      setSelectedWarehouses([])
      setCurrentPage(1)
    } catch (err) {
      setActionError(err.message || 'Error eliminando almacenes')
    }
  }

  const allSelected = warehouses.length > 0 && selectedWarehouses.length === warehouses.length

  return (
    <div>
      <h2>Almacenes</h2>

      {displayError && (
        <CAlert color="danger" dismissible onClose={() => { setActionError(''); setError('') }} style={{ marginBottom: '1rem' }}>
          {displayError}
        </CAlert>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <CFormInput placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
          <CTooltip content="Crear Almacén" placement="top">
            <CButton 
              onClick={() => navigate('/warehouse/create')}
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
        {selectedWarehouses.length > 0 && (
          <CButton color="danger"  variant="outline" onClick={handleDeleteSelected}>
            Eliminar seleccionados ({selectedWarehouses.length})
          </CButton>
        )}
      </div>

      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>
              <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
            </CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Ubicación</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Propietario</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {warehouses.length > 0 ? (
            warehouses.map((w) => (
              <CTableRow key={w.id}>
                <CTableDataCell>
                  <input type="checkbox" checked={selectedWarehouses.includes(w.id)} onChange={() => handleSelect(w.id)} />
                </CTableDataCell>
                <CTableDataCell>{w.name}</CTableDataCell>
                <CTableDataCell>{w.location}</CTableDataCell>
                <CTableDataCell>{w.description}</CTableDataCell>
                <CTableDataCell>{w.ownerUsername}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="dark" size="sm" disabled={selectedWarehouses.length >= 1} onClick={() => navigate('/warehouse/' + w.id)}>
                    Detalles
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={6} style={{ textAlign: 'center' }}>
                No se encontraron almacenes.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

export default WarehousesList
