import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventCard } from './EventCard';
import type { Event } from '../../../types/event';

const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  start_datetime: '2026-05-01T10:00:00',
  end_datetime: '2026-05-01T12:00:00',
  capacity: 100,
  current_attendees: 50,
  status: 'published',
  organizer_id: 'user-1',
  created_at: '2026-04-01T00:00:00',
  updated_at: '2026-04-01T00:00:00',
  cover_image_url: null,
  category: 'tecnologia',
  tags: 'python,testing',
};

describe('EventCard Component', () => {
  it('renders event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders event description', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders event location', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('renders capacity information', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('renders event status badge', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('published')).toBeInTheDocument();
  });

  it('renders category when present', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('tecnologia')).toBeInTheDocument();
  });

  it('renders tags when present', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('#python')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
  });

  it('shows warning color when capacity is almost full', () => {
    const almostFullEvent = { ...mockEvent, current_attendees: 95 };
    const { container } = render(<EventCard event={almostFullEvent} />);
    const progressBar = container.querySelector('.bg-yellow-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('shows danger color when capacity is full', () => {
    const fullEvent = { ...mockEvent, current_attendees: 100 };
    const { container } = render(<EventCard event={fullEvent} />);
    const progressBar = container.querySelector('.bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });
});
