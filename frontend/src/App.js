import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { InstallPWA } from "./components/InstallPWA";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import BookingPage from "./pages/BookingPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServices from "./pages/AdminServices";
import AdminAppointments from "./pages/AdminAppointments";
import AdminSettings from "./pages/AdminSettings";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import "./App.css";

function App() {
  return (
    <div className="App bg-black min-h-screen">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="servicii" element={<ServicesPage />} />
            <Route path="programare" element={<BookingPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="servicii" element={<AdminServices />} />
            <Route path="programari" element={<AdminAppointments />} />
            <Route path="setari" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
      <InstallPWA />
    </div>
  );
}

export default App;
