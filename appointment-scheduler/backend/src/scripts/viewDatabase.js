import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

dotenv.config();

const viewDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB successfully!');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in the database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Get all users
    console.log('\nUsers:');
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach(user => {
        console.log(`
User ID: ${user._id}
Name: ${user.name}
Email: ${user.email}
Created At: ${user.createdAt}
Google Calendar Integration: ${user.googleAccessToken ? 'Enabled' : 'Disabled'}
        `);
      });
    }

    // Get all appointments
    console.log('\nAppointments:');
    const appointments = await Appointment.find({});
    if (appointments.length === 0) {
      console.log('No appointments found');
    } else {
      appointments.forEach(appointment => {
        console.log(`
Appointment ID: ${appointment._id}
Title: ${appointment.title}
Date: ${appointment.date}
Time: ${appointment.startTime} - ${appointment.endTime}
Attendee: ${appointment.attendee.name} (${appointment.attendee.email})
Creator: ${appointment.creator}
Google Calendar Event ID: ${appointment.googleCalendarEventId || 'Not synced'}
Created At: ${appointment.createdAt}
        `);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
viewDatabase(); 