const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let reconnectTimer = null;
let isConnecting = false;

const scheduleReconnect = () => {
    if (reconnectTimer) return;

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectDB();
    }, 5000);

    reconnectTimer.unref?.();
};

const connectDB = async () => {
    if (mongoose.connection.readyState === 1 || isConnecting) {
        return;
    }

    try {
        if (!process.env.MONGO_URI) {
            throw new Error('Missing MONGO_URI in environment variables');
        }

        isConnecting = true;
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Database connection failed');
        console.error(`Mongo URI: ${process.env.MONGO_URI || '(empty)'}`);
        console.error(error.message);
        scheduleReconnect();
    } finally {
        isConnecting = false;
    }
};

mongoose.connection.on('disconnected', () => {
    if (process.env.MONGO_URI) {
        console.error('MongoDB disconnected. Retrying connection...');
        scheduleReconnect();
    }
});

module.exports = connectDB;
