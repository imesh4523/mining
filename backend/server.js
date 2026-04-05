import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = 'mongodb+srv://cheak_db_user:EMpSyYpM5nkbSH67@cluster0.nsaosgn.mongodb.net/crystal_mine?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB successfully connected via Mongoose!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const planSchema = new mongoose.Schema({
  name: String,
  gpu: String,
  price: String,
  purchasePrice: Number,
  hashrate: String,
  dailyProfit: String,
  roi: String,
  activeSince: Number,
  id: Number
});

const userSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1500.00 },
  activePlans: [planSchema]
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/user/sync', async (req, res) => {
  const { deviceId, balance, activePlans } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'Device ID required' });

  try {
    let user = await User.findOne({ deviceId });
    if (!user) {
      // Create new mock user for this browser session
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt); // Default password

      user = new User({
         deviceId,
         password: hashedPassword,
         balance: balance !== undefined ? balance : 1500.00,
         activePlans: activePlans || []
      });
    } else {
      // Update existing mock user
      if (balance !== undefined) user.balance = balance;
      if (activePlans !== undefined) user.activePlans = activePlans;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/user/password', async (req, res) => {
  const { deviceId, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ deviceId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Crystal Backend Server running on port ${PORT}`));
