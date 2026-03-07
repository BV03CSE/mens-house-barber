import { useEffect, useState } from "react";
import { Calendar, Users, Layers, TrendingUp, Loader2 } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const [statsRes, appointmentsRes] = await Promise.all([
        axios.get(`${API}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/appointments?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setTodayAppointments(appointmentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Programări Azi",
      value: stats?.today_appointments || 0,
      icon: Calendar,
      color: "text-white"
    },
    {
      title: "Programări Luna Aceasta",
      value: stats?.month_appointments || 0,
      icon: Users,
      color: "text-white"
    },
    {
      title: "Servicii Active",
      value: stats?.services_count || 0,
      icon: Layers,
      color: "text-white"
    },
    {
      title: "Venit Luna Aceasta",
      value: `${stats?.month_revenue || 0} Lei`,
      icon: TrendingUp,
      color: "text-white"
    }
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 mt-2">Bine ai revenit la MEN'S HOUSE BARBER</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-zinc-950 border border-zinc-800 p-6"
              data-testid={`stat-card-${index}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-zinc-500 text-sm mb-2">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <div className="bg-zinc-950 border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="font-display text-xl">Programări pentru Astăzi</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: ro })}
          </p>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Nu există programări pentru astăzi.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {todayAppointments.map((appointment, index) => (
              <div 
                key={appointment.id}
                className="p-6 flex items-center justify-between"
                data-testid={`today-appointment-${index}`}
              >
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{appointment.time}</p>
                  </div>
                  <div>
                    <p className="font-medium">{appointment.client_name}</p>
                    <p className="text-zinc-500 text-sm">{appointment.service_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{appointment.service_price} Lei</p>
                  <span className={`text-xs uppercase tracking-wider px-2 py-1 inline-block mt-1 ${
                    appointment.status === "confirmed" 
                      ? "bg-green-500/20 text-green-400"
                      : appointment.status === "completed"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {appointment.status === "confirmed" ? "Confirmat" : 
                     appointment.status === "completed" ? "Finalizat" : "Anulat"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
