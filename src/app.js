// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Set up Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ToDo');
const db = mongoose.connection;

// Define User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

// Create User model
const User = mongoose.model('user', userSchema);

app.get('/', (req, res) => {
  res.send("This is for the TO DO list");
})

// Create a new user
app.post('/createUser', async (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({
        username,
        password: hashedPassword
    });

    // Save the user to the database
    newUser.save()
    .then(savedUser => {
      console.log('User saved:', savedUser);
    })
    .catch(err => {
      console.error(err);
    });

});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check if the provided password matches the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Authentication successful
    res.json({ message: 'Login successful' });
});

// Set up server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
