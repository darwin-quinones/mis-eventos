import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEventsStore } from '../../../store/events.store';
import { useAuthStore } from '../../../store/auth.store';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { ShareButton } from '../../../components/ui/ShareButton';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';
import { apiClient } from '../../../api/client';
import { showConfirmDialog, showSuccessAlert, showErrorAlert, showLoadingAlert } from '../../../utils/alerts';
import { sessionsApi, type Session, type SessionCreate } from '../../../api/sessions.api';
import { SessionFormModal } from './SessionFormModal';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEvent, isLoading, fetchEvent, clearCurrentEvent } = useEventsStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>();

  useEffect(() => {
    if (id) {
      // Always force refresh on mount to get latest data (especially current_attendees)
      fetchEvent(id, true);
      loadSessions(id);
    }
    return () => clearCurrentEvent();
  }, [id, fetchEvent, clearCurrentEvent]);

  useEffect(() => {
    if (isAuthenticated && id) {
      checkRegistration();
    }
  }, [isAuthenticated, id]);

  const loadSessions = async (eventId: string) => {
    setLoadingSessions(true);
    try {
      const response = await apiClient.get(`/events/${eventId}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await apiClient.get('/users/me/events');
      const registered = response.data.some((e: any) => e.id === id);
      setIsRegistered(registered);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!id) return;

    // Check if event is full before showing confirmation
    if (isFull) {
      await showErrorAlert(
        'Evento lleno',
        'Lo sentimos, este evento ya alcanzó su capacidad máxima'
      );
      return;
    }

    const confirmed = await showConfirmDialog(
      '¿Confirmar registro?',
      `¿Estás seguro de que deseas registrarte al evento "${currentEvent?.title}"?`,
      'Sí, registrarme',
      'Cancelar'
    );

    if (!confirmed) return;

    setIsRegistering(true);
    try {
      await apiClient.post(`/events/${id}/register`);
      setIsRegistered(true);
      // Force refresh to get updated current_attendees
      await fetchEvent(id, true);
      await showSuccessAlert(
        '¡Registro exitoso!',
        'Te has registrado correctamente al evento'
      );
    } catch (error: any) {
      await showErrorAlert(
        'Error al registrarse',
        error.response?.data?.detail || 'No se pudo completar el registro'
      );
      // Force refresh in case capacity changed
      await fetchEvent(id, true);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!id) return;

    const confirmed = await showConfirmDialog(
      '¿Cancelar registro?',
      `¿Estás seguro de que deseas cancelar tu registro al evento "${currentEvent?.title}"?`,
      'Sí, cancelar',
      'No, mantener registro'
    );

    if (!confirmed) return;

    setIsRegistering(true);
    try {
      await apiClient.delete(`/events/${id}/register`);
      setIsRegistered(false);
      // Force refresh to get updated current_attendees
      await fetchEvent(id, true);
      await showSuccessAlert(
        'Registro cancelado',
        'Has cancelado tu registro al evento'
      );
    } catch (error: any) {
      await showErrorAlert(
        'Error al cancelar',
        error.response?.data?.detail || 'No se pudo cancelar el registro'
      );
      // Force refresh in case something changed
      await fetchEvent(id, true);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!id || !currentEvent) return;

    // Check if event has attendees
    if (currentEvent.current_attendees > 0) {
      const shouldCancel = await showConfirmDialog(
        'Evento con asistentes registrados',
        `Este evento tiene ${currentEvent.current_attendees} asistente(s) registrado(s). No es recomendable eliminarlo. ¿Deseas cambiar el estado a "cancelado" en su lugar?`,
        'Sí, cancelar evento',
        'No, volver'
      );

      if (shouldCancel) {
        // Change status to cancelled instead of deleting
        try {
          await apiClient.put(`/events/${id}`, { status: 'cancelled' });
          await fetchEvent(id, true);
          await showSuccessAlert(
            'Evento cancelado',
            'El evento ha sido marcado como cancelado. Los asistentes podrán ver que fue cancelado.'
          );
        } catch (error: any) {
          await showErrorAlert(
            'Error al cancelar',
            error.response?.data?.detail || 'No se pudo cancelar el evento'
          );
        }
      }
      return;
    }

    // If no attendees, allow deletion
    const confirmed = await showConfirmDialog(
      '¿Eliminar evento?',
      `¿Estás seguro de que deseas eliminar el evento "${currentEvent.title}"? Esta acción no se puede deshacer.`,
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmed) return;

    showLoadingAlert('Eliminando evento...');
    try {
      await apiClient.delete(`/events/${id}`);
      await showSuccessAlert(
        'Evento eliminado',
        'El evento ha sido eliminado correctamente'
      );
      navigate('/');
    } catch (error: any) {
      await showErrorAlert(
        'Error al eliminar',
        error.response?.data?.detail || 'No se pudo eliminar el evento'
      );
    }
  };

  const handleCreateSession = async (data: SessionCreate) => {
    if (!id) return;
    await sessionsApi.create(id, data);
    await loadSessions(id);
    await showSuccessAlert('Sesión creada', 'La sesión ha sido agregada al evento');
  };

  const handleUpdateSession = async (data: SessionCreate) => {
    if (!id || !editingSession) return;
    await sessionsApi.update(id, editingSession.id, data);
    await loadSessions(id);
    setEditingSession(undefined);
    await showSuccessAlert('Sesión actualizada', 'Los cambios han sido guardados');
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!id) return;

    const confirmed = await showConfirmDialog(
      '¿Eliminar sesión?',
      '¿Estás seguro de que deseas eliminar esta sesión?',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmed) return;

    try {
      await sessionsApi.delete(id, sessionId);
      await loadSessions(id);
      await showSuccessAlert('Sesión eliminada', 'La sesión ha sido eliminada');
    } catch (error: any) {
      await showErrorAlert(
        'Error al eliminar',
        error.response?.data?.detail || 'No se pudo eliminar la sesión'
      );
    }
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setIsSessionModalOpen(true);
  };

  const closeModal = () => {
    setIsSessionModalOpen(false);
    setEditingSession(undefined);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const capacityPercentage = (currentEvent.current_attendees / currentEvent.capacity) * 100;
  const isFull = currentEvent.current_attendees >= currentEvent.capacity;
  const canEdit = user && (user.id === currentEvent.organizer_id || user.role === 'admin');
  const canRegister = isAuthenticated && !isRegistered && !isFull && currentEvent.status === 'published' && !canEdit;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-500 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a eventos
      </button>

      {currentEvent.cover_image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl mb-8">
          <OptimizedImage
            src={currentEvent.cover_image_url}
            alt={currentEvent.title}
            className="w-full h-full object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            loading="eager"
          />
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
        <div className="mb-6">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {currentEvent.title}
              </h1>
              <Badge variant={currentEvent.status as 'draft' | 'published' | 'cancelled' | 'completed'}>{currentEvent.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <ShareButton title={currentEvent.title} url={`/events/${id}`} />
              {canEdit && (
                <>
                  <Link to={`/events/${id}/edit`}>
                    <Button variant="secondary" className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={handleDeleteEvent} className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-brand-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Inicio</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">{formatDate(currentEvent.start_datetime)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-brand-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Fin</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">{formatDate(currentEvent.end_datetime)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-brand-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Ubicación</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">{currentEvent.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-brand-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Capacidad</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {currentEvent.current_attendees} / {currentEvent.capacity} asistentes
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? 'bg-red-500' : capacityPercentage > 90 ? 'bg-yellow-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Descripción</h2>
          <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{currentEvent.description}</p>
        </div>

        {currentEvent.category && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Categoría</h3>
            <span className="inline-block px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-medium rounded-full">
              {currentEvent.category}
            </span>
          </div>
        )}

        {currentEvent.tags && currentEvent.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {currentEvent.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm rounded-lg"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Sesiones del Evento</h2>
            {canEdit && (
              <Button
                variant="primary"
                onClick={() => setIsSessionModalOpen(true)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar Sesión</span>
              </Button>
            )}
          </div>
          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                No hay sesiones programadas para este evento
              </p>
              {canEdit && (
                <Button variant="primary" onClick={() => setIsSessionModalOpen(true)}>
                  Agregar Primera Sesión
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-6 border border-neutral-200 dark:border-neutral-600"
                >
                  <div className="flex gap-4">
                    {session.speaker_photo_url && (
                      <OptimizedImage
                        src={session.speaker_photo_url}
                        alt={session.speaker_name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        sizes="64px"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {session.title}
                        </h3>
                        {canEdit && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => openEditModal(session)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400"
                              title="Editar sesión"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
                              title="Eliminar sesión"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-2">
                        {session.speaker_name}
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-3">
                        {session.description}
                      </p>
                      {session.speaker_bio && (
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm italic mb-3">
                          {session.speaker_bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {new Date(session.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(session.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Capacidad: {session.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-3">
            {canRegister && (
              <Button
                variant="primary"
                onClick={handleRegister}
                isLoading={isRegistering}
              >
                Registrarse al Evento
              </Button>
            )}
            {isRegistered && (
              <Button
                variant="danger"
                onClick={handleUnregister}
                isLoading={isRegistering}
              >
                Cancelar Registro
              </Button>
            )}
            {isFull && !isRegistered && (
              <div className="text-center py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl font-medium">
                Evento lleno
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center py-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
            <p className="text-neutral-600 dark:text-neutral-300 mb-3">
              Inicia sesión para registrarte a este evento
            </p>
            <Link to="/login">
              <Button variant="primary">Iniciar Sesión</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Session Form Modal */}
      <SessionFormModal
        isOpen={isSessionModalOpen}
        onClose={closeModal}
        onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
        session={editingSession}
        eventStartDate={currentEvent.start_datetime}
        eventEndDate={currentEvent.end_datetime}
      />
    </div>
  );
};
