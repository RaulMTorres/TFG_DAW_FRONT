import { CPagination, CPaginationItem } from '@coreui/react'
import { getPageRange } from "../../hooks/usePagination";
/**
 * Componente de paginación genérico y reutilizable.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const { pageNumbers, startPage, endPage } = getPageRange(currentPage, totalPages)

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <style>
        {`
          .pagination {
            --cui-pagination-active-bg: #1E293B;
            --cui-pagination-active-border-color: #1E293B;
            --cui-pagination-color: #475569;
            --cui-pagination-hover-color: #1E293B;
            --cui-pagination-border-radius: 8px;
          }
          .page-item { margin: 0 2px; }
          .page-link { border-radius: 6px !important; border: none; shadow: none; }
        `}
      </style>
      <CPagination>
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </CPaginationItem>

        {startPage > 1 && (
          <>
            <CPaginationItem onClick={() => onPageChange(1)}>1</CPaginationItem>
            {startPage > 2 && <span style={{ padding: '0 5px' }}>...</span>}
          </>
        )}

        {pageNumbers.map((num) => (
          <CPaginationItem
            key={num}
            active={currentPage === num}
            onClick={() => onPageChange(num)}
          >
            {num}
          </CPaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0 5px' }}>...</span>}
            <CPaginationItem onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </CPaginationItem>
          </>
        )}

        <CPaginationItem
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </CPaginationItem>
      </CPagination>
    </div>
  )
}

export default Pagination
