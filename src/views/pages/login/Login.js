import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilChevronDoubleDown, cilChevronBottom } from '@coreui/icons'
import { login } from '../../../utils/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="overflow-hidden" style={{ height: '100vh', position: 'relative' }}>
      
      
      <div 
        className={`d-flex flex-column align-items-center justify-content-center text-white`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          zIndex: 1050,
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
          transform: showLogin ? 'translateY(-100%)' : 'translateY(0)'
        }}
      >
       
        <img 
          src="src\assets\brand\milogo.png" 
          alt="Logo" 
          style={{ width: '520px', marginBottom: '20px' }} 
        />
      
        <div 
          className='text-center'
          onClick={() => setShowLogin(true)}
          style={{ 
            cursor: 'pointer', 
            marginTop: '60px',
            animation: 'bounce 3s infinite'
          }}
        >
          
          <CIcon icon={cilChevronBottom} size="xxl" title="Entrar" />
          <p className="text-uppercase small mt-2 justify-content-center" style={{ letterSpacing: '3px'}}>Entrar</p>
        </div>
      </div>
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={8}>
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                      <h1>Login</h1>
                      <p className="text-body-secondary">Inicia sesión en tu cuenta</p>
                      {error && <p style={{ color: 'red' }}>{error}</p>}
                      
                      <CInputGroup className="mb-3">
                        <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                        <CFormInput
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                      </CInputGroup>

                      <CInputGroup className="mb-4">
                        <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />
                      </CInputGroup>

                      <CRow className="align-items-center">
                        <CCol xs={6}>
                          <CButton type="submit" color="dark" className="px-4" disabled={loading}>
                            {loading ? <><CSpinner size="sm" className="me-2" />Entrando...</> : 'Login'}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-right">
                          <Link to="/forgot-password" style={{ textDecoration: 'none' }} className="btn btn-link px-0">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>

                <CCard className="text-white bg-dark py-5" style={{ width: '44%' }}>
                  <CCardBody className="text-center">
                    <div>
                      <h2>Registro</h2>
                      <h5>----------------------------------</h5>
                      <p>Si aún no tienes una cuenta, puedes crear una en menos de 2 minutos.</p>
                      <Link to="/register">
                        <CButton style = {{backgroundColor:"#FFDB58", color:"black"}} className="mt-3" active>
                          ¡Regístrate ahora!
                        </CButton>
                      </Link>
                    </div>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-10px);}
          60% {transform: translateY(-5px);}
        }
      `}</style>
    </div>
  )
}

export default Login