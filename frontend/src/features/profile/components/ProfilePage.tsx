import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { apiClient } from '../../../api/client';
import type { Event } from '../../../types/event';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { showWarningAlert } from '../../../utils/alerts';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnregistering, setIsUnregistering] = useState<string | null>(null);

  const isAsistente = user?.role === 'asistente';

  useEffect(() => {
    if (isAsistente) {
      loadRegisteredEvents();
    } else {
      loadMyEvents();
    }
  }, [isAsistente]);

  const loadRegisteredEvents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users/me/events');
      setRegisteredEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyEvents = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/events', {
        params: { page: 1, size: 100 }
      });
      const userEvents = response.data.items.filter((event: Event) => event.organizer_id === user?.id);
      setMyEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async (eventId: string) => {
    setIsUnregistering(eventId);
    try {
      await apiClient.delete(`/events/${eventId}/register`);
      setRegisteredEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error: any) {
      await showWarningAlert(
        'No se pudo cancelar',
        error.response?.data?.detail || 'Error al cancelar registro'
      );
    } finally {
      setIsUnregistering(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Mi Perfil</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bienvenido, {user?.full_name}
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Información Personal</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Nombre</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{user?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Email</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Rol</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
              user?.role === 'admin' 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                : user?.role === 'organizador'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
            }`}>
              {user?.role === 'admin' ? 'Administrador' : user?.role === 'organizador' ? 'Organizador' : 'Asistente'}
            </span>
          </div>
        </div>
      </div>

      {isAsistente ? (
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Mis Eventos Registrados ({registeredEvents.length})
          </h2>

          {registeredEvents.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-12 text-center">
              <svg
                className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                No estás registrado en ningún evento
              </p>
              <Link to="/">
                <Button variant="primary">Explorar Eventos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6" style={{ gridAutoRows: '1fr' }}>
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {event.cover_image_url && (
                    <div className="h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/events/${event.id}`}
                          className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                        >
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-1">
                            {event.title}
                          </h3>
                        </Link>
                        <Badge variant={event.status as 'draft' | 'published' | 'cancelled' | 'completed'}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="secondary" className="text-sm px-4 py-2 whitespace-nowrap">
                            Ver Detalles
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          onClick={() => handleUnregister(event.id)}
                          isLoading={isUnregistering === event.id}
                          className="text-sm px-4 py-2 whitespace-nowrap"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="mt-auto space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">{formatDate(event.start_datetime)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Mis Eventos Creados ({myEvents.length})
          </h2>

          {myEvents.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-12 text-center">
              <svg
                className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                No has creado ningún evento todavía
              </p>
              <Link to="/events/new">
                <Button variant="primary">Crear Evento</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6" style={{ gridAutoRows: '1fr' }}>
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {event.cover_image_url && (
                    <div className="h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/events/${event.id}`}
                          className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                        >
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-1">
                            {event.title}
                          </h3>
                        </Link>
                        <Badge variant={event.status as 'draft' | 'published' | 'cancelled' | 'completed'}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={`/events/${event.id}`}>
                          <Button variant="secondary" className="text-sm px-4 py-2 whitespace-nowrap">
                            Ver Detalles
                          </Button>
                        </Link>
                        <Link to={`/events/${event.id}/edit`}>
                          <Button variant="ghost" className="text-sm px-4 py-2 whitespace-nowrap">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                      {event.description}
                    </p>

                    <div className="mt-auto space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="truncate">{formatDate(event.start_datetime)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
