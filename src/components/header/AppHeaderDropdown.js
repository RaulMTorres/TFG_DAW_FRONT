import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CNavLink,
} from '@coreui/react'
import {
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {logout} from '../../utils/auth'
import { NavLink } from 'react-router-dom'


import avatar10 from './../../assets/images/avatars/10.png'
const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar10} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">
           <CNavLink to="/account" as={NavLink}>
           Cuenta
           </CNavLink>
        </CDropdownHeader>
        
        <CDropdownDivider />
        <CDropdownItem  onClick={logout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Log Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
