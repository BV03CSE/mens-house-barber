import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase text-sm tracking-widest text-zinc-500 mb-4">
            MEN'S HOUSE BARBER
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Serviciile Noastre
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl">
            Descoperă gama completă de servicii premium pentru îngrijirea masculină.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 md:py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 p-8 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-8 bg-zinc-800 mb-3 w-48"></div>
                      <div className="h-4 bg-zinc-800 w-96"></div>
                    </div>
                    <div className="h-10 bg-zinc-800 w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-zinc-500 text-lg">Nu există servicii disponibile momentan.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div 
                  key={service.id}
                  className="group bg-zinc-950 border border-zinc-800 p-8 hover:border-zinc-600 transition-all"
                  data-testid={`service-item-${index}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="font-display text-2xl md:text-3xl mb-2 group-hover:text-zinc-300 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-zinc-500 mb-4">{service.description}</p>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {service.duration} minute
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-3xl font-bold">{service.price}</p>
                        <p className="text-zinc-500 text-sm">Lei</p>
                      </div>
                      <Link
                        to={`/programare?service=${service.id}`}
                        className="bg-white text-black px-6 py-3 uppercase text-xs tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
                        data-testid={`book-service-${index}`}
                      >
                        Rezervă
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-4xl font-semibold mb-6">
            Ai întrebări despre serviciile noastre?
          </h2>
          <p className="text-zinc-400 mb-8">
            Contactează-ne sau programează-te direct online.
          </p>
          <Link
            to="/programare"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 uppercase text-sm tracking-widest font-bold hover:bg-zinc-200 transition-all"
            data-testid="services-cta-btn"
          >
            Programare Online
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
