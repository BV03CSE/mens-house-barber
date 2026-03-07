import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Check, Clock, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { ro } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    client_email: ""
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
        
        // Check if service is pre-selected from URL
        const serviceId = searchParams.get("service");
        if (serviceId) {
          const service = response.data.find(s => s.id === serviceId);
          if (service) {
            setSelectedService(service);
            setStep(2);
          }
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Eroare la încărcarea serviciilor");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [searchParams]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;
    
    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await axios.get(`${API}/appointments/available-slots?date=${dateStr}`);
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_phone) {
      toast.error("Te rugăm să completezi numele și telefonul");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/appointments`, {
        service_id: selectedService.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        ...formData
      });
      
      toast.success("Programare confirmată cu succes!");
      setStep(5); // Success step
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(error.response?.data?.detail || "Eroare la crearea programării");
    } finally {
      setSubmitting(false);
    }
  };

  const disabledDays = (date) => {
    return isBefore(date, startOfToday());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="uppercase text-sm tracking-widest text-zinc-500 mb-4">
            Programare Online
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">
            Rezervă o Programare
          </h1>
        </div>

        {/* Progress Steps */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s 
                      ? "bg-white text-black" 
                      : "bg-zinc-900 text-zinc-500"
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-px mx-2 ${step > s ? "bg-white" : "bg-zinc-800"}`}></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-4" data-testid="booking-step-1">
            <h2 className="text-xl font-medium mb-6">Alege Serviciul</h2>
            {services.map((service, index) => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep(2);
                }}
                className={`w-full text-left p-6 border transition-all ${
                  selectedService?.id === service.id
                    ? "border-white bg-zinc-900"
                    : "border-zinc-800 hover:border-zinc-600"
                }`}
                data-testid={`booking-service-${index}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-xl mb-1">{service.name}</h3>
                    <p className="text-zinc-500 text-sm">{service.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      {service.duration} minute
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{service.price} Lei</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <div data-testid="booking-step-2">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-medium">Alege Data</h2>
            </div>
            
            <div className="bg-zinc-950 border border-zinc-800 p-6 inline-block">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  if (date) setStep(3);
                }}
                disabled={disabledDays}
                locale={ro}
                fromDate={startOfToday()}
                toDate={addDays(new Date(), 60)}
                className="text-white"
                data-testid="booking-calendar"
              />
            </div>

            {/* Selected Service Summary */}
            <div className="mt-8 p-4 bg-zinc-950 border border-zinc-800">
              <p className="text-sm text-zinc-500 mb-1">Serviciu selectat:</p>
              <p className="font-display text-lg">{selectedService?.name}</p>
              <p className="text-zinc-400">{selectedService?.price} Lei · {selectedService?.duration} min</p>
            </div>
          </div>
        )}

        {/* Step 3: Select Time */}
        {step === 3 && (
          <div data-testid="booking-step-3">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setStep(2)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-medium">Alege Ora</h2>
            </div>

            <p className="text-zinc-400 mb-6">
              {selectedDate && format(selectedDate, "EEEE, d MMMM yyyy", { locale: ro })}
            </p>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800">
                <p className="text-zinc-500">Nu există locuri disponibile pentru această zi.</p>
                <button
                  onClick={() => setStep(2)}
                  className="text-white underline mt-4 text-sm"
                >
                  Alege altă dată
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedTime(slot);
                      setStep(4);
                    }}
                    className={`py-3 px-4 border text-center transition-all ${
                      selectedTime === slot
                        ? "border-white bg-white text-black"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                    data-testid={`time-slot-${slot}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Contact Details */}
        {step === 4 && (
          <div data-testid="booking-step-4">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setStep(3)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-medium">Datele Tale</h2>
            </div>

            {/* Booking Summary */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 mb-8">
              <h3 className="font-display text-lg mb-4">Sumar Programare</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Serviciu:</span>
                  <span>{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data:</span>
                  <span>{selectedDate && format(selectedDate, "d MMMM yyyy", { locale: ro })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ora:</span>
                  <span>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Durată:</span>
                  <span>{selectedService?.duration} minute</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{selectedService?.price} Lei</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-sm text-zinc-400 mb-2 block">
                  Nume complet *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Ion Popescu"
                  className="bg-transparent border-zinc-800 focus:border-white"
                  required
                  data-testid="booking-name-input"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm text-zinc-400 mb-2 block">
                  Telefon *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="0722 123 456"
                  className="bg-transparent border-zinc-800 focus:border-white"
                  required
                  data-testid="booking-phone-input"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-zinc-400 mb-2 block">
                  Email (opțional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  placeholder="email@exemplu.com"
                  className="bg-transparent border-zinc-800 focus:border-white"
                  data-testid="booking-email-input"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black hover:bg-zinc-200 py-6 uppercase tracking-widest font-bold"
                data-testid="booking-submit-btn"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirmă Programarea
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center py-12" data-testid="booking-success">
            <div className="w-20 h-20 bg-white text-black flex items-center justify-center mx-auto mb-8">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Programare Confirmată!
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Îți mulțumim pentru programare. Te așteptăm la MEN'S HOUSE BARBER!
            </p>

            <div className="bg-zinc-950 border border-zinc-800 p-6 max-w-md mx-auto mb-8 text-left">
              <h3 className="font-display text-lg mb-4">Detalii Programare</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Serviciu:</span>
                  <span>{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data:</span>
                  <span>{selectedDate && format(selectedDate, "d MMMM yyyy", { locale: ro })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ora:</span>
                  <span>{selectedTime}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="text-zinc-400 hover:text-white underline text-sm"
              data-testid="booking-back-home"
            >
              Înapoi la pagina principală
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
