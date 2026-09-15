import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 
import Gorevler from './pages/Gorevler';
import PersonelGorevler from './pages/PersonelGorevler';
import ProtectedRoute from './components/ProtectedRoute'; 
import Layout from './components/Layout';               
import DoktorLayout from './components/DoktorLayout';   
import Dashboard from './pages/Dashboard';
import Randevular from './pages/Randevular';
import Login from './pages/Login';
import PublicHome from './pages/PublicHome'; 
import DoktorTakvim from './pages/DoktorTakvim';
import DoktorRandevular from './pages/DoktorRandevular';
import Ayarlar from './pages/Ayarlar';
import { Toaster } from 'react-hot-toast';
import Doktorlar from './pages/Doktorlar';
import Kullanicilar from './pages/Kullanicilar';
import PersonelLayout from './components/PersonelLayout';
import Hastalar from './pages/Hastalar';

function MainRoutes() {
  const { user } = useAuth(); 
  const role = Number(user?.rol);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px', fontWeight: 500 },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PublicHome />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/panel" element={
            role === 4 ? <Navigate to="/doktor/takvim" replace />
              : role === 2 ? <Navigate to="/personel/randevular" replace />
                : <Navigate to="/dashboard" replace />
          } />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[1]} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/randevular" element={<Randevular />} />
            <Route path="/ayarlar" element={<Ayarlar />} />
            <Route path="/doktorlar" element={<Doktorlar />} />
            <Route path="/kullanicilar" element={<Kullanicilar />} />
            <Route path="/hastalar" element={<Hastalar />} />
            <Route path="/gorevler" element={<Gorevler />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[4]} />}>
          <Route path="/doktor" element={<DoktorLayout />}>
            <Route path="takvim" element={<DoktorTakvim />} />
            <Route path="randevular" element={<DoktorRandevular />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[2]} />}>
          <Route path="/personel" element={<PersonelLayout />}>
            <Route path="randevular" element={<Randevular />} />
            <Route path="hastalar" element={<Hastalar />} />
            <Route path="gorevler" element={<PersonelGorevler />} />
          </Route>
        </Route>
        <Route path="*" element={
          !user ? <Navigate to="/login" replace />
            : role === 4 ? <Navigate to="/doktor/takvim" replace />
              : role === 2 ? <Navigate to="/personel/randevular" replace />
                : role === 1 ? <Navigate to="/dashboard" replace />
                  : <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <MainRoutes />
    </AuthProvider>
  );
}