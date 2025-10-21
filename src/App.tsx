import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Sessions from './pages/Sessions';
import Payments from './pages/Payments';
import Requests from './pages/Requests';
import Settings from './pages/Settings';
import { initializeDemoData } from './services/storage';

function App() {
  useEffect(() => {
    // İlk açılışta demo veri yükle
    initializeDemoData();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
