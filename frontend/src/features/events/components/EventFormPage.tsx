import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore } from '../../../store/events.store';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { showWarningAlert, showSuccessAlert } from '../../../utils/alerts';

export const EventFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEvent, isLoading, fetchEvent, createEvent, updateEvent } = useEventsStore();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    capacity: 50,
    status: 'published',  // Cambiado de 'draft' a 'published' por defecto
    cover_image_url: '',
    category: '',
    tags: '',
  });

  // Separate date and time states for better mobile UX
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchEvent(id);
    }
  }, [isEditMode, id, fetchEvent]);

  useEffect(() => {
    if (isEditMode && currentEvent) {
      const startDateTime = currentEvent.start_datetime.slice(0, 16);
      const endDateTime = currentEvent.end_datetime.slice(0, 16);
      
      setStartDate(startDateTime.split('T')[0]);
      setStartTime(startDateTime.split('T')[1]);
      setEndDate(endDateTime.split('T')[0]);
      setEndTime(endDateTime.split('T')[1]);
      
      setFormData({
        title: currentEvent.title,
        description: currentEvent.description,
        location: currentEvent.location,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        capacity: currentEvent.capacity,
        status: currentEvent.status,
        cover_image_url: currentEvent.cover_image_url || '',
        category: currentEvent.category || '',
        tags: currentEvent.tags || '',
      });
    }
  }, [isEditMode, currentEvent]);

  // Update formData when date/time changes
  useEffect(() => {
    if (startDate && startTime) {
      setFormData(prev => ({ ...prev, start_datetime: `${startDate}T${startTime}` }));
    }
  }, [startDate, startTime]);

  useEffect(() => {
    if (endDate && endTime) {
      setFormData(prev => ({ ...prev, end_datetime: `${endDate}T${endTime}` }));
    }
  }, [endDate, endTime]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData.start_datetime) {
      newErrors.start_datetime = 'La fecha de inicio es requerida';
    }

    if (!formData.end_datetime) {
      newErrors.end_datetime = 'La fecha de fin es requerida';
    }

    if (formData.start_datetime && formData.end_datetime) {
      const start = new Date(formData.start_datetime);
      const end = new Date(formData.end_datetime);
      
      if (start >= end) {
        newErrors.end_datetime = 'La fecha de fin debe ser posterior a la de inicio';
      } else {
        // Validate minimum duration of 30 minutes
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        if (durationMinutes < 30) {
          newErrors.end_datetime = 'El evento debe durar al menos 30 minutos';
        }
      }
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'La capacidad debe ser al menos 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // datetime-local format is "YYYY-MM-DDTHH:mm"
      // Append seconds to make it a valid ISO format (no timezone conversion)
      const eventData = {
        ...formData,
        start_datetime: formData.start_datetime + ':00',
        end_datetime: formData.end_datetime + ':00',
        cover_image_url: formData.cover_image_url || null,
      };

      if (isEditMode && id) {
        await updateEvent(id, eventData);
        await showSuccessAlert(
          'Evento actualizado',
          'Los cambios se han guardado correctamente'
        );
      } else {
        await createEvent(eventData);
        await showSuccessAlert(
          'Evento creado',
          'El evento se ha creado exitosamente'
        );
      }

      navigate('/');
    } catch (error: any) {
      await showWarningAlert(
        'No se pudo guardar',
        error.response?.data?.detail || 'Verifica los datos e intenta nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-500 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          {isEditMode ? 'Editar Evento' : 'Crear Nuevo Evento'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Título del Evento"
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="Ej: Conferencia de Tecnología 2024"
          />

          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            placeholder="Describe el evento, agenda, temas a tratar..."
            rows={6}
          />

          <Input
            label="Ubicación"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            error={errors.location}
            placeholder="Ej: Centro de Convenciones, Sala Principal"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Fecha y Hora de Inicio
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  error={errors.start_datetime}
                  placeholder="Fecha"
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="Hora"
                />
              </div>
              {errors.start_datetime && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.start_datetime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Fecha y Hora de Fin
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  error={errors.end_datetime}
                  placeholder="Fecha"
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Hora"
                />
              </div>
              {errors.end_datetime && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.end_datetime}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Capacidad"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
              error={errors.capacity}
              min={1}
            />

            <Input
              label="URL de Imagen de Portada (Opcional)"
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => handleChange('cover_image_url', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Estado del Evento
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              >
                <option value="published">Publicado (visible para todos)</option>
                <option value="draft">Borrador (solo tú lo ves)</option>
                <option value="cancelled">Cancelado</option>
                <option value="completed">Completado</option>
              </select>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Solo los eventos publicados son visibles públicamente
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="border border-neutral-300 dark:border-neutral-600 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              >
                <option value="">Sin categoría</option>
                <option value="tecnologia">Tecnología</option>
                <option value="deportes">Deportes</option>
                <option value="arte">Arte y Cultura</option>
                <option value="musica">Música</option>
                <option value="educacion">Educación</option>
                <option value="negocios">Negocios</option>
                <option value="salud">Salud y Bienestar</option>
                <option value="gastronomia">Gastronomía</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Tags (separados por comas)"
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="conferencia, networking, gratis"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="flex-1"
            >
              {isEditMode ? 'Guardar Cambios' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
