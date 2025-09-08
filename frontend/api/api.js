const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/users');
require('dotenv').config(); // load .env

const app = express();
app.use(express.json());

// Connect to MongoDB using env variable
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Mount route
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
