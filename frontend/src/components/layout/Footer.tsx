export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-brand-500 dark:text-brand-400 mb-3">Mis Eventos</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Plataforma de gestión de eventos para organizar y participar en eventos increíbles.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a href="/" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Eventos
                </a>
              </li>
              <li>
                <a href="/profile" className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  Mi Perfil
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Contacto</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              ¿Tienes preguntas? Contáctanos en{' '}
              <a href="mailto:info@miseventos.com" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500">
                info@miseventos.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-700 text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>&copy; {currentYear} Mis Eventos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
