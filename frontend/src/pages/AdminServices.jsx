import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: ""
  });

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Eroare la încărcarea serviciilor");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingService(null);
    setFormData({ name: "", description: "", price: "", duration: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString()
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (service) => {
    setEditingService(service);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error("Te rugăm să completezi toate câmpurile obligatorii");
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      };

      if (editingService) {
        await axios.put(`${API}/services/${editingService.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Serviciu actualizat!");
      } else {
        await axios.post(`${API}/services`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Serviciu creat!");
      }

      setDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Eroare la salvarea serviciului");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingService) return;

    setSubmitting(true);
    try {
      await axios.delete(`${API}/services/${editingService.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Serviciu șters!");
      setDeleteDialogOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Eroare la ștergerea serviciului");
    } finally {
      setSubmitting(false);
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
    <div data-testid="admin-services">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Servicii</h1>
          <p className="text-zinc-500 mt-2">Gestionează serviciile oferite</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-white text-black hover:bg-zinc-200"
          data-testid="add-service-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Serviciu
        </Button>
      </div>

      {/* Services List */}
      <div className="bg-zinc-950 border border-zinc-800">
        {services.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Nu există servicii. Adaugă primul serviciu.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {services.map((service, index) => (
              <div 
                key={service.id}
                className={`p-6 flex items-center justify-between ${!service.active ? "opacity-50" : ""}`}
                data-testid={`service-row-${index}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg">{service.name}</h3>
                    {!service.active && (
                      <span className="text-xs uppercase tracking-wider px-2 py-1 bg-red-500/20 text-red-400">
                        Inactiv
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-sm mt-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                    <span>{service.duration} minute</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-bold">{service.price} Lei</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditDialog(service)}
                      className="p-2 text-zinc-400 hover:text-white transition-colors"
                      data-testid={`edit-service-${index}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(service)}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                      data-testid={`delete-service-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingService ? "Editează Serviciu" : "Adaugă Serviciu Nou"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm text-zinc-400 mb-2 block">
                Nume serviciu *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Tuns Clasic"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="service-name-input"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm text-zinc-400 mb-2 block">
                Descriere
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrierea serviciului"
                className="bg-transparent border-zinc-800 focus:border-white"
                data-testid="service-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm text-zinc-400 mb-2 block">
                  Preț (Lei) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50"
                  className="bg-transparent border-zinc-800 focus:border-white"
                  data-testid="service-price-input"
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm text-zinc-400 mb-2 block">
                  Durată (min) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="bg-transparent border-zinc-800 focus:border-white"
                  data-testid="service-duration-input"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-zinc-800 text-white hover:bg-zinc-900"
              >
                Anulează
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-white text-black hover:bg-zinc-200"
                data-testid="save-service-btn"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingService ? (
                  "Salvează"
                ) : (
                  "Adaugă"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Confirmă Ștergerea</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400">
            Ești sigur că vrei să ștergi serviciul "{editingService?.name}"?
          </p>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-800 text-white hover:bg-zinc-900"
            >
              Anulează
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="confirm-delete-btn"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Șterge"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
