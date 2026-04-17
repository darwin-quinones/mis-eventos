import type { Event } from '../../../types/event';
import { Badge } from '../../../components/ui/Badge';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const capacityPercentage = (event.current_attendees / event.capacity) * 100;
  const isFull = event.current_attendees >= event.capacity;
  const isAlmostFull = capacityPercentage > 90;

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
      {event.cover_image_url && (
        <div className="aspect-video w-full overflow-hidden flex-shrink-0">
          <OptimizedImage
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3 gap-2">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 flex-grow">
            {event.title}
          </h3>
          <Badge variant={event.status as 'draft' | 'published' | 'cancelled' | 'completed'}>
            {event.status}
          </Badge>
        </div>

        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Fixed height container for category and tags */}
        <div className="mb-4 min-h-[60px]">
          {event.category && (
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium rounded-full">
                {event.category}
              </span>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.split(',').slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-md"
                >
                  #{tag.trim()}
                </span>
              ))}
              {event.tags.split(',').length > 3 && (
                <span className="inline-block px-2 py-0.5 text-neutral-500 dark:text-neutral-400 text-xs">
                  +{event.tags.split(',').length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-grow"></div>

        <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{formatDate(event.start_datetime)}</span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-neutral-600 dark:text-neutral-400">Capacidad</span>
            <span className={`font-medium ${isFull ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
              {event.current_attendees} / {event.capacity}
            </span>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
