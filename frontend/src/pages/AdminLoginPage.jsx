import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// MH Logo SVG Component
const MHLogo = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#000000" stroke="#FFFFFF" strokeWidth="2"/>
    <text x="50" y="42" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="bold" fontFamily="serif">M/H</text>
    <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">MEN'S HOUSE</text>
    <text x="50" y="70" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="2">BARBER</text>
  </svg>
);

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const response = await axios.get(`${API}/auth/check-setup`);
      setIsSetup(response.data.setup_complete);
    } catch (error) {
      console.error("Error checking setup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error("Te rugăm să completezi toate câmpurile");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = isSetup ? "/auth/login" : "/auth/setup";
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      localStorage.setItem("admin_token", response.data.token);
      toast.success(isSetup ? "Autentificare reușită!" : "Cont admin creat cu succes!");
      navigate("/admin");
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.detail || "Eroare la autentificare");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MHLogo size={80} />
          </div>
          <p className="text-zinc-500 text-sm mt-4">
            {isSetup ? "Panou Administrare" : "Configurare Inițială"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-zinc-950 border border-zinc-800 p-8">
          <h2 className="font-display text-xl mb-6">
            {isSetup ? "Autentificare" : "Creează Cont Admin"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-sm text-zinc-400 mb-2 block">
                Utilizator
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="admin-username-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-zinc-400 mb-2 block">
                Parolă
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="admin-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black hover:bg-zinc-200 py-6 uppercase tracking-widest font-bold"
              data-testid="admin-login-btn"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSetup ? (
                "Autentificare"
              ) : (
                "Creează Contul"
              )}
            </Button>
          </form>

          {!isSetup && (
            <p className="text-zinc-500 text-xs mt-6 text-center">
              Aceasta este prima configurare. Creează un cont de administrator pentru a accesa panoul de control.
            </p>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">
            ← Înapoi la site
          </a>
        </div>
      </div>
    </div>
  );
}
