import { useEffect, useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import { ChevronDown, Loader2, Phone, Mail, Check, X } from "lucide-react";
import axios from "axios";
import { format, addDays } from "date-fns";
import { ro } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await axios.get(`${API}/appointments?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Eroare la încărcarea programărilor");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`${API}/appointments/${appointmentId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Programare ${newStatus === "completed" ? "finalizată" : newStatus === "cancelled" ? "anulată" : "confirmată"}!`);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Eroare la actualizarea statusului");
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  const statusOptions = [
    { value: "all", label: "Toate" },
    { value: "confirmed", label: "Confirmate" },
    { value: "completed", label: "Finalizate" },
    { value: "cancelled", label: "Anulate" }
  ];

  return (
    <div data-testid="admin-appointments">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Programări</h1>
        <p className="text-zinc-500 mt-2">Gestionează programările clienților</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ro}
              fromDate={addDays(new Date(), -30)}
              toDate={addDays(new Date(), 60)}
              className="text-white"
              data-testid="admin-calendar"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl">
                  {format(selectedDate, "EEEE, d MMMM yyyy", { locale: ro })}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {filteredAppointments.length} programări
                </p>
              </div>
              
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-zinc-800 text-white" data-testid="status-filter">
                    {statusOptions.find(s => s.value === statusFilter)?.label}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-950 border-zinc-800">
                  {statusOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className="text-white hover:bg-zinc-900 focus:bg-zinc-900"
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* List */}
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                Nu există programări pentru această zi.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {filteredAppointments.map((appointment, index) => (
                  <div 
                    key={appointment.id}
                    className="p-6"
                    data-testid={`appointment-row-${index}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-6">
                        {/* Time */}
                        <div className="text-center min-w-[60px]">
                          <p className="text-2xl font-bold">{appointment.time}</p>
                          <p className="text-xs text-zinc-500">{appointment.service_duration} min</p>
                        </div>

                        {/* Client Info */}
                        <div>
                          <h3 className="font-medium text-lg">{appointment.client_name}</h3>
                          <p className="text-zinc-400">{appointment.service_name}</p>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {appointment.client_phone}
                            </span>
                            {appointment.client_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {appointment.client_email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
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

                        {appointment.status === "confirmed" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(appointment.id, "completed")}
                              className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                              title="Marchează ca finalizat"
                              data-testid={`complete-appointment-${index}`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(appointment.id, "cancelled")}
                              className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Anulează"
                              data-testid={`cancel-appointment-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
