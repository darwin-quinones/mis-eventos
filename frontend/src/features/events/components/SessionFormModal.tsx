import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';
import { showWarningAlert } from '../../../utils/alerts';
import type { Session, SessionCreate } from '../../../api/sessions.api';

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionCreate) => Promise<void>;
  session?: Session;
  eventStartDate: string;
  eventEndDate: string;
}

export const SessionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  session,
  eventStartDate,
  eventEndDate,
}: SessionFormModalProps) => {
  const [formData, setFormData] = useState<SessionCreate>({
    title: '',
    description: '',
    speaker_name: '',
    speaker_bio: '',
    speaker_photo_url: '',
    start_time: '',
    end_time: '',
    capacity: 50,
  });

  // Separate date and time states for better mobile UX
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      const startDateTime = session.start_time.slice(0, 16);
      const endDateTime = session.end_time.slice(0, 16);
      
      setStartDate(startDateTime.split('T')[0]);
      setStartTime(startDateTime.split('T')[1]);
      setEndDate(endDateTime.split('T')[0]);
      setEndTime(endDateTime.split('T')[1]);
      
      setFormData({
        title: session.title,
        description: session.description,
        speaker_name: session.speaker_name,
        speaker_bio: session.speaker_bio || '',
        speaker_photo_url: session.speaker_photo_url || '',
        start_time: startDateTime,
        end_time: endDateTime,
        capacity: session.capacity,
      });
    } else {
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setFormData({
        title: '',
        description: '',
        speaker_name: '',
        speaker_bio: '',
        speaker_photo_url: '',
        start_time: '',
        end_time: '',
        capacity: 50,
      });
    }
  }, [session, isOpen]);

  // Update formData when date/time changes
  useEffect(() => {
    if (startDate && startTime) {
      setFormData(prev => ({ ...prev, start_time: `${startDate}T${startTime}` }));
    }
  }, [startDate, startTime]);

  useEffect(() => {
    if (endDate && endTime) {
      setFormData(prev => ({ ...prev, end_time: `${endDate}T${endTime}` }));
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

    if (!formData.speaker_name.trim()) {
      newErrors.speaker_name = 'El nombre del ponente es requerido';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'La hora de inicio es requerida';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'La hora de fin es requerida';
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      const eventStart = new Date(eventStartDate);
      const eventEnd = new Date(eventEndDate);

      if (start >= end) {
        newErrors.end_time = 'La hora de fin debe ser posterior a la de inicio';
      }

      if (start < eventStart || start > eventEnd) {
        newErrors.start_time = 'La sesión debe estar dentro del horario del evento';
      }

      if (end < eventStart || end > eventEnd) {
        newErrors.end_time = 'La sesión debe estar dentro del horario del evento';
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
      const sessionData = {
        ...formData,
        start_time: formData.start_time + ':00',
        end_time: formData.end_time + ':00',
        speaker_bio: formData.speaker_bio || undefined,
        speaker_photo_url: formData.speaker_photo_url || undefined,
      };

      await onSubmit(sessionData);
      onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={session ? 'Editar Sesión' : 'Agregar Sesión'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título de la Sesión"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="Ej: Keynote: El Futuro de la IA"
        />

        <Textarea
          label="Descripción"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Describe el contenido de la sesión..."
          rows={3}
        />

        <Input
          label="Nombre del Ponente"
          type="text"
          value={formData.speaker_name}
          onChange={(e) => handleChange('speaker_name', e.target.value)}
          error={errors.speaker_name}
          placeholder="Ej: Dr. Juan Pérez"
        />

        <Textarea
          label="Biografía del Ponente (Opcional)"
          value={formData.speaker_bio}
          onChange={(e) => handleChange('speaker_bio', e.target.value)}
          placeholder="Breve biografía del ponente..."
          rows={2}
        />

        <Input
          label="Foto del Ponente (URL, Opcional)"
          type="url"
          value={formData.speaker_photo_url}
          onChange={(e) => handleChange('speaker_photo_url', e.target.value)}
          placeholder="https://ejemplo.com/foto.jpg"
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Fecha y Hora de Inicio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={errors.start_time}
                placeholder="Fecha"
              />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="Hora"
              />
            </div>
            {errors.start_time && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.start_time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Fecha y Hora de Fin
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={errors.end_time}
                placeholder="Fecha"
              />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="Hora"
              />
            </div>
            {errors.end_time && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.end_time}</p>
            )}
          </div>
        </div>

        <Input
          label="Capacidad"
          type="number"
          value={formData.capacity}
          onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
          error={errors.capacity}
          min={1}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {session ? 'Guardar Cambios' : 'Crear Sesión'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
