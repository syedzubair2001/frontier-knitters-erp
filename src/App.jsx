import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Masters from './pages/Masters';
import Orders from './pages/Orders';
import ModulePage from './pages/ModulePage';
import { seedDefaultAdmin } from './auth';
import './index.css';

export default function App() {
  useEffect(() => { seedDefaultAdmin(); }, []);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/masters" element={<Masters />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/module/:key" element={<ModulePage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}