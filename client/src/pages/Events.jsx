import React from 'react'
import { Calendar, MapPin, Clock, Users, Plus } from 'lucide-react'

const Events = () => {
  // Mock events data
  const events = [
    {
      _id: '1',
      title: 'Delhi Book Fair 2024',
      description: 'Annual book fair featuring publishers, authors, and book lovers from across India.',
      date: new Date('2024-02-15'),
      time: '10:00 AM',
      location: 'Pragati Maidan, Delhi',
      type: 'Book Fair',
      attendees: 1250,
      maxAttendees: 2000,
      image: null
    },
    {
      _id: '2',
      title: 'Mumbai Literary Festival',
      description: 'A celebration of literature with panel discussions, book launches, and author meet-and-greets.',
      date: new Date('2024-03-10'),
      time: '9:00 AM',
      location: 'NCPA, Mumbai',
      type: 'Literary Festival',
      attendees: 450,
      maxAttendees: 500,
      image: null
    },
    {
      _id: '3',
      title: 'Bangalore Book Club Meetup',
      description: 'Monthly meetup to discuss contemporary Indian literature and share book recommendations.',
      date: new Date('2024-02-20'),
      time: '6:00 PM',
      location: 'Cubbon Park, Bangalore',
      type: 'Book Club',
      attendees: 25,
      maxAttendees: 30,
      image: null
    }
  ]

  const eventTypes = ['All', 'Book Fair', 'Literary Festival', 'Book Club', 'Author Meet', 'Workshop']

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events & Meetups</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Event Types Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {eventTypes.map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === 'All' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event._id} className="card hover:shadow-lg transition-shadow cursor-pointer">
            {/* Event Image */}
            <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>

            {/* Event Details */}
            <div className="space-y-3">
              <div>
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                  {event.type}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {event.description}
                </p>
              </div>

              {/* Event Info */}
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date.toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{event.attendees}/{event.maxAttendees} attendees</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Attendance</span>
                  <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full btn-primary">
                {event.attendees >= event.maxAttendees ? 'Event Full' : 'Join Event'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Events
