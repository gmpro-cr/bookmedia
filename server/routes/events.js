const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// Create an event
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      date,
      time,
      duration,
      location,
      isOnline,
      onlineLink,
      maxAttendees,
      bookId,
      author,
      image,
      tags,
      isFree,
      price,
      requirements
    } = req.body;

    // Validation
    if (!title || !description || !type || !category || !date || !time || !location) {
      return res.status(400).json({ 
        message: 'Title, description, type, category, date, time, and location are required' 
      });
    }

    const event = new Event({
      title,
      description,
      organizer: req.user.userId,
      type,
      category,
      date: new Date(date),
      time,
      duration: duration || 2,
      location,
      isOnline: isOnline || false,
      onlineLink: onlineLink || null,
      maxAttendees: maxAttendees || null,
      book: bookId || null,
      author: author || null,
      image: image || null,
      tags: tags || [],
      isFree: isFree !== undefined ? isFree : true,
      price: price || 0,
      requirements: requirements || null
    });

    await event.save();

    // Populate the event for response
    await event.populate('organizer', 'name avatar');
    if (bookId) {
      await event.populate('book', 'title author coverImage');
    }

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get all events with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category,
      city,
      isOnline,
      search,
      sortBy = 'date',
      order = 'asc'
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { 
      isActive: true, 
      isCancelled: false,
      date: { $gte: new Date() }
    };

    // Apply filters
    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (isOnline !== undefined) {
      query.isOnline = isOnline === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'attendees':
        sortOptions = { attendeeCount: order === 'desc' ? -1 : 1 };
        break;
      case 'created':
        sortOptions = { createdAt: order === 'desc' ? -1 : 1 };
        break;
      default:
        sortOptions = { date: order === 'asc' ? 1 : -1 };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name avatar')
      .populate('book', 'title author coverImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        hasNext: skip + events.length < totalEvents,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name avatar')
      .populate('book', 'title author coverImage')
      .populate('attendees.user', 'name avatar')
      .populate('interested', 'name avatar');

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    // Check if user owns the event
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to update this event' 
      });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'description', 'type', 'category', 'date', 'time', 'duration',
      'location', 'isOnline', 'onlineLink', 'maxAttendees', 'book', 'author',
      'image', 'tags', 'isFree', 'price', 'requirements'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();

    res.json({ 
      message: 'Event updated successfully',
      event 
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    // Check if user owns the event
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this event' 
      });
    }

    event.isActive = false;
    await event.save();

    res.json({ 
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Join event
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    if (event.isCancelled) {
      return res.status(400).json({ 
        message: 'This event has been cancelled' 
      });
    }

    await event.addAttendee(req.user.userId);

    res.json({ 
      message: 'Successfully joined the event' 
    });
  } catch (error) {
    if (error.message === 'Event is full') {
      return res.status(400).json({ 
        message: 'Event is full' 
      });
    }
    console.error('Join event error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Leave event
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    await event.removeAttendee(req.user.userId);

    res.json({ 
      message: 'Successfully left the event' 
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Mark as interested
router.post('/:id/interested', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    await event.addInterested(req.user.userId);

    res.json({ 
      message: 'Marked as interested' 
    });
  } catch (error) {
    console.error('Mark interested error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Remove interested
router.post('/:id/not-interested', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found' 
      });
    }

    await event.removeInterested(req.user.userId);

    res.json({ 
      message: 'Removed from interested' 
    });
  } catch (error) {
    console.error('Remove interested error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get events by city
router.get('/city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.getByCity(city, page, limit);

    res.json({ events });
  } catch (error) {
    console.error('Get events by city error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const events = await Event.getUpcoming(parseInt(limit));

    res.json({ events });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get events by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.getByType(type, page, limit);

    res.json({ events });
  } catch (error) {
    console.error('Get events by type error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get event types list
router.get('/types/list', async (req, res) => {
  try {
    const types = [
      'Book Fair', 'Author Meet', 'Reading Club', 'Book Launch',
      'Literary Festival', 'Workshop', 'Book Discussion', 'Poetry Reading',
      'Storytelling', 'Book Exchange', 'Library Visit', 'Other'
    ];

    res.json({ types });
  } catch (error) {
    console.error('Get event types error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

// Get event categories list
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      'Indian Literature', 'Mythology', 'Finance', 'IAS Preparation',
      'Fiction', 'Non-Fiction', 'Poetry', 'Drama', 'General', 'Children'
    ];

    res.json({ categories });
  } catch (error) {
    console.error('Get event categories error:', error);
    res.status(500).json({ 
      message: 'Server error' 
    });
  }
});

module.exports = router;
