import {BrowserRouter, Routes, Route} from 'react-router-dom'
import IndexPage from './views/IndexPage'
import LoginPage from './views/LoginPage'
import RegisterPage from './views/RegisterPage'
import PacienteDashboard from './views/DasboardPacientePage'
import MedicoDashboard from './views/DashboardDoctorPage'


export default function AppRouter() {
  return (
    <BrowserRouter>
        <Routes>
            <Route 
                path='/' 
                element={<IndexPage />}
            />
            <Route 
                path='/login' 
                element={<LoginPage />}
            />
            <Route 
                path='/register' 
                element={<RegisterPage/>}
            />
            <Route 
                path='/paciente' 
                element={<PacienteDashboard/>}
            />
            <Route 
                path='/medico' 
                element={<MedicoDashboard/>}
            />
            
        </Routes>
    </BrowserRouter>
  )
}
