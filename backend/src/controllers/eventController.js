const Event = require("../models/Event");
const { createStaffBroadcastNotifications } = require("../utils/notificationService");

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    await createStaffBroadcastNotifications({
      title: "Festival Duty Assigned",
      message: `${event.title} has been scheduled at ${event.location}.`,
      category: "festival",
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { title, date, location, description, imageUrl, slots, registrations, collection, status } = req.body;

    if (title != null) event.title = String(title).trim();
    if (date) event.date = date;
    if (location != null) event.location = String(location).trim();
    if (description != null) event.description = String(description).trim();
    if (imageUrl != null) event.image = String(imageUrl).trim();
    if (slots != null) event.slots = Number(slots) || 0;
    if (registrations != null) event.registrations = Number(registrations) || 0;
    if (collection != null) event.collection = Number(collection) || 0;
    if (status && ["Upcoming", "Active", "Completed", "Cancelled"].includes(status)) {
      event.status = status;
    }

    await event.save();

    await createStaffBroadcastNotifications({
      title: "Festival Schedule Updated",
      message: `${event.title} schedule has been updated.`,
      category: "festival",
    });

    return res.json({ event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Upcoming", "Active", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = status;
    await event.save();

    await createStaffBroadcastNotifications({
      title: "Festival Reminder",
      message: `${event.title} is now marked as ${status.toLowerCase()}.`,
      category: "festival",
    });

    return res.json({ event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};