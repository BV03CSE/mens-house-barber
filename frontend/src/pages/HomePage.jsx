import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Clock, Scissors, Star } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API}/services`);
        setServices(response.data.slice(0, 4));
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
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1593702233354-259d1f794ed1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxiYXJiZXIlMjBjdXR0aW5nJTIwaGFpciUyMG1lbiUyMGhhaXJjdXQlMjBiZWFyZCUyMHRyaW0lMjBibGFjayUyMGFuZCUyMHdoaXRlfGVufDB8fHx8MTc3MjkwODU5M3ww&ixlib=rb-4.1.0&q=85')`
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="uppercase text-sm tracking-[0.3em] text-zinc-400 mb-6 animate-fade-in">
            Barber Shop Premium
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 animate-slide-up">
            MEN'S HOUSE
            <span className="block text-zinc-500">BARBER</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto mb-12 animate-slide-up stagger-2">
            Experiența premium în îngrijirea masculină. Unde tradiția întâlnește eleganța modernă.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-3">
            <Link
              to="/programare"
              className="bg-white text-black px-8 py-4 uppercase text-sm tracking-widest font-bold hover:bg-zinc-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
              data-testid="hero-book-btn"
            >
              Rezervă Acum
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/servicii"
              className="border border-white/20 px-8 py-4 uppercase text-sm tracking-widest font-medium hover:bg-white hover:text-black transition-all"
              data-testid="hero-services-btn"
            >
              Vezi Serviciile
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 px-6 md:px-12 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl mb-3">Expertiză</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Frizeri cu experiență și pasiune pentru arta bărbieritului tradițional.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl mb-3">Calitate Premium</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Produse de calitate superioară pentru rezultate impecabile.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl mb-3">Punctualitate</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Respectăm timpul tău. Programări eficiente fără așteptare.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <p className="uppercase text-sm tracking-widest text-zinc-500 mb-4">Ce oferim</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
                Serviciile Noastre
              </h2>
            </div>
            <Link 
              to="/servicii"
              className="text-zinc-400 hover:text-white flex items-center gap-2 mt-6 md:mt-0 text-sm uppercase tracking-wider transition-colors"
              data-testid="home-services-link"
            >
              Vezi toate serviciile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 p-6 animate-pulse">
                  <div className="h-6 bg-zinc-800 mb-3 w-3/4"></div>
                  <div className="h-4 bg-zinc-800 mb-6 w-full"></div>
                  <div className="h-8 bg-zinc-800 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <div 
                  key={service.id}
                  className="service-card bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-600 transition-all"
                  data-testid={`service-card-${index}`}
                >
                  <h3 className="font-display text-xl mb-2">{service.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{service.description}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{service.price} Lei</p>
                      <p className="text-xs text-zinc-500">{service.duration} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-6">
            Pregătit pentru o schimbare?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Fă-ți o programare acum și experimentează diferența MEN'S HOUSE BARBER.
          </p>
          <Link
            to="/programare"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 uppercase text-sm tracking-widest font-bold hover:bg-zinc-200 transition-all hover:-translate-y-1"
            data-testid="cta-book-btn"
          >
            Programează-te Acum
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Gallery/Image Section */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div 
              className="aspect-[4/3] bg-cover bg-center border border-zinc-800"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1599011176306-4a96f1516d4d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwxfHxiYXJiZXIlMjBjdXR0aW5nJTIwaGFpciUyMG1lbiUyMGhhaXJjdXQlMjBiZWFyZCUyMHRyaW0lMjBibGFjayUyMGFuZCUyMHdoaXRlfGVufDB8fHx8MTc3MjkwODU5M3ww&ixlib=rb-4.1.0&q=85')`
              }}
            ></div>
            <div 
              className="aspect-[4/3] bg-cover bg-center border border-zinc-800"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1628099003488-98aa1c9405e3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxiYXJiZXIlMjBjdXR0aW5nJTIwaGFpciUyMG1lbiUyMGhhaXJjdXQlMjBiZWFyZCUyMHRyaW0lMjBibGFjayUyMGFuZCUyMHdoaXRlfGVufDB8fHx8MTc3MjkwODU5M3ww&ixlib=rb-4.1.0&q=85')`
              }}
            ></div>
          </div>
        </div>
      </section>
    </div>
  );
}
