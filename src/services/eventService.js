// src/services/eventService.js
import api from './api';

export const eventService = {
  async getMyEvents(params = {}) {
    try {
      const response = await api.get('/events/my-events', { params });
      return response.data.events;
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error.response?.data || { error: 'Failed to fetch events' };
    }
  },

  async getDiscoverEvents(params = {}) {
    try {
      const response = await api.get('/events/discover', { params });
      return response.data.events;
    } catch (error) {
      console.error('Error fetching discover events:', error);
      throw error.response?.data || { error: 'Failed to fetch discover events' };
    }
  },

  async getEventById(eventId) {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data.event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error.response?.data || { error: 'Failed to fetch event details' };
    }
  },

  async createEvent(eventData) {
    try {
      const payload = {
        title: eventData.title,
        description: eventData.description || '',
        sportId: eventData.sportId,
        eventType: eventData.eventType || 'practice',
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        venue: eventData.venue,
        latitude: eventData.location?.latitude,
        longitude: eventData.location?.longitude,
        maxParticipants: eventData.maxParticipants,
        minParticipants: eventData.minParticipants,
        skillLevelMin: eventData.skillLevelRange?.min,
        skillLevelMax: eventData.skillLevelRange?.max,
        entryFee: eventData.entryFee,
        registrationDeadline: eventData.registrationDeadline,
        tags: eventData.tags?.map(tag => ({
          name: tag.name,
          color: tag.color
        }))
      };

      const response = await api.post('/events', payload);
      return response.data.event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error.response?.data || { error: 'Failed to create event' };
    }
  },

  async updateEvent(eventId, updates) {
    try {
      const response = await api.put(`/events/${eventId}`, updates);
      return response.data.event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error.response?.data || { error: 'Failed to update event' };
    }
  },

  async deleteEvent(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error.response?.data || { error: 'Failed to delete event' };
    }
  },

  async joinEvent(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error.response?.data || { error: 'Failed to join event' };
    }
  },

  async leaveEvent(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Error leaving event:', error);
      throw error.response?.data || { error: 'Failed to leave event' };
    }
  },

  async getEventsForDateRange(startDate, endDate) {
    try {
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      return await this.getMyEvents(params);
    } catch (error) {
      console.error('Error fetching events for date range:', error);
      throw error;
    }
  },

  async getEventsForDate(date) {
    try {
      const params = {
        date: date.toISOString()
      };
      return await this.getMyEvents(params);
    } catch (error) {
      console.error('Error fetching events for date:', error);
      throw error;
    }
  }
};