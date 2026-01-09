import { Building2, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#600096] to-purple-700 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/favicon-32x32.png" alt="Polar Inmobiliaria" className="w-10 h-10 brightness-0 invert" />
              <span className="text-xl font-bold">Polar Inmobiliaria</span>
            </div>
            <p className="text-purple-100 text-sm leading-relaxed">
              Raíces familiares, soluciones profesionales desde hace más de 30 años
            </p>
            <div className="space-y-3">
              <p className="text-sm font-medium text-purple-200">Seguinos en nuestras redes</p>
              <div className="flex space-x-3">
                <a 
                  href="https://www.facebook.com/POLAR.Propiedades" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-purple-200 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-purple-100">Monteagudo 563 Local 2</p>
                  <p className="text-purple-200">Tafí Viejo, Tucumán</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple-200" />
                <div className="space-y-1">
                  <a href="tel:3816625078" className="text-purple-100 hover:text-white transition-colors block">
                    381 662-5078
                  </a>
                  <a href="tel:3814018196" className="text-purple-100 hover:text-white transition-colors block">
                    381 401-8196
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Servicios</h3>
            <ul className="space-y-2 text-sm text-purple-100">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <span>Alquileres</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <span>Administración de alquileres</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <span>Contratos de alquiler</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <span>Contratos de compraventa</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <span>Tasaciones</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Horarios de Atención</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-200">Lunes - Viernes</span>
                <span className="text-purple-100">9:00 - 13:00 hs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Sábados - Domingos</span>
                <span className="text-purple-100">Cerrado</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-purple-200">
                Consultas por WhatsApp en Horario Comercial de Lun a Vier
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-400 border-opacity-30 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-purple-200">
              © 2026 Polar Inmobiliaria. Todos los derechos reservados.
            </p>
            <p className="text-sm text-purple-200">
              Desarrollado por ZetaDev
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}