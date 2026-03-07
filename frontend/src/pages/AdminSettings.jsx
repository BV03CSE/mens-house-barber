import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DAYS = [
  { key: "monday", label: "Luni" },
  { key: "tuesday", label: "Marți" },
  { key: "wednesday", label: "Miercuri" },
  { key: "thursday", label: "Joi" },
  { key: "friday", label: "Vineri" },
  { key: "saturday", label: "Sâmbătă" },
  { key: "sunday", label: "Duminică" }
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    name: "MEN'S HOUSE BARBER",
    phone: "",
    email: "",
    address: "",
    slot_duration: 30
  });
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, hoursRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/working-hours`)
      ]);

      setSettings(settingsRes.data);
      
      // Initialize working hours if empty
      if (hoursRes.data.length === 0) {
        const defaultHours = DAYS.map(day => ({
          day: day.key,
          open_time: "09:00",
          close_time: "18:00",
          is_closed: day.key === "sunday"
        }));
        setWorkingHours(defaultHours);
      } else {
        // Sort by day order
        const sortedHours = DAYS.map(day => {
          const found = hoursRes.data.find(h => h.day === day.key);
          return found || {
            day: day.key,
            open_time: "09:00",
            close_time: "18:00",
            is_closed: false
          };
        });
        setWorkingHours(sortedHours);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHour = (dayKey, field, value) => {
    setWorkingHours(prev => prev.map(h => 
      h.day === dayKey ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        axios.put(`${API}/settings`, settings, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.put(`${API}/working-hours`, workingHours, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      toast.success("Setări salvate cu succes!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Eroare la salvarea setărilor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div data-testid="admin-settings">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Setări</h1>
          <p className="text-zinc-500 mt-2">Configurează detaliile salonului</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black hover:bg-zinc-200"
          data-testid="save-settings-btn"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvează
        </Button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-zinc-950 border border-zinc-800 p-6">
          <h2 className="font-display text-xl mb-6">Informații Generale</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm text-zinc-400 mb-2 block">
                Nume Salon
              </Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="settings-name-input"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm text-zinc-400 mb-2 block">
                Telefon
              </Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="0722 123 456"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="settings-phone-input"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-zinc-400 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="contact@salon.ro"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="settings-email-input"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-sm text-zinc-400 mb-2 block">
                Adresă
              </Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Str. Exemplu, Nr. 1"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="settings-address-input"
              />
            </div>

            <div>
              <Label htmlFor="slot" className="text-sm text-zinc-400 mb-2 block">
                Interval Programări (minute)
              </Label>
              <Input
                id="slot"
                type="number"
                value={settings.slot_duration}
                onChange={(e) => setSettings({ ...settings, slot_duration: parseInt(e.target.value) })}
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="settings-slot-input"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-zinc-950 border border-zinc-800 p-6">
          <h2 className="font-display text-xl mb-6">Program de Lucru</h2>
          
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const hours = workingHours.find(h => h.day === day.key) || {
                open_time: "09:00",
                close_time: "18:00",
                is_closed: false
              };

              return (
                <div 
                  key={day.key}
                  className="flex items-center gap-6 py-3 border-b border-zinc-800 last:border-0"
                  data-testid={`working-hours-${day.key}`}
                >
                  <div className="w-24">
                    <span className="font-medium">{day.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hours.is_closed}
                      onCheckedChange={(checked) => updateWorkingHour(day.key, "is_closed", !checked)}
                      data-testid={`switch-${day.key}`}
                    />
                    <span className="text-sm text-zinc-500">
                      {hours.is_closed ? "Închis" : "Deschis"}
                    </span>
                  </div>

                  {!hours.is_closed && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hours.open_time}
                        onChange={(e) => updateWorkingHour(day.key, "open_time", e.target.value)}
                        className="bg-transparent border-zinc-800 focus:border-white w-32"
                        data-testid={`open-time-${day.key}`}
                      />
                      <span className="text-zinc-500">-</span>
                      <Input
                        type="time"
                        value={hours.close_time}
                        onChange={(e) => updateWorkingHour(day.key, "close_time", e.target.value)}
                        className="bg-transparent border-zinc-800 focus:border-white w-32"
                        data-testid={`close-time-${day.key}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
