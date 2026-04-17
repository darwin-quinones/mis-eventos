import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventsStore } from '../../../store/events.store';
import { useAuthStore } from '../../../store/auth.store';
import { EventCard } from './EventCard';
import { EventFilters } from './EventFilters';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { EventCardSkeleton } from '../../../components/ui/Skeleton';

export const EventsPage = () => {
  const { events, pagination, isLoading, fetchEvents } = useEventsStore();
  const { isAuthenticated, user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Force refresh on mount to ensure fresh data
    fetchEvents(1, 20, debouncedSearch, status, category, true);
  }, [debouncedSearch, status, category, fetchEvents]);

  const handleClearFilters = () => {
    setStatus('');
    setCategory('');
    setSortBy('date_asc');
    setSearch('');
  };

  const filteredEvents = events;

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime();
      case 'date_desc':
        return new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime();
      case 'capacity_asc':
        return a.capacity - b.capacity;
      case 'capacity_desc':
        return b.capacity - a.capacity;
      case 'availability':
        return (b.capacity - b.current_attendees) - (a.capacity - a.current_attendees);
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Eventos Disponibles
          </h1>
          <Input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        {isAuthenticated && (user?.role === 'organizador' || user?.role === 'admin') && (
          <Link to="/events/new">
            <Button variant="primary" className="whitespace-nowrap">
              Crear Evento
            </Button>
          </Link>
        )}
      </div>

      <EventFilters
        status={status}
        category={category}
        sortBy={sortBy}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
        onSortChange={setSortBy}
        onClear={handleClearFilters}
      />

      {isLoading && events.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-12">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">
            No se encontraron eventos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchEvents(page, 20, debouncedSearch, status, category, true)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-colors
                ${page === pagination.page
                  ? 'bg-brand-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-600'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
