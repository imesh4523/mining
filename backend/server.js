import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// PostgreSQL connection (Set DATABASE_URL in environment variables)
const PG_URI = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: PG_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(client => {
    console.log('PostgreSQL successfully connected!');
    const initDb = async () => {
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            device_id VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            balance FLOAT DEFAULT 1500.00,
            active_plans JSONB DEFAULT '[]'::jsonb
          );
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(255) PRIMARY KEY,
            value TEXT NOT NULL
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS withdrawals (
            id SERIAL PRIMARY KEY,
            device_id VARCHAR(255) NOT NULL,
            amount FLOAT NOT NULL,
            currency VARCHAR(20) NOT NULL,
            wallet_address TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            payment_id VARCHAR(50) UNIQUE NOT NULL,
            order_id VARCHAR(100),
            pay_address TEXT,
            pay_amount FLOAT,
            pay_currency VARCHAR(30),
            price_amount FLOAT,
            payment_status VARCHAR(30) DEFAULT 'waiting',
            actually_paid FLOAT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);

        await client.query(`
          INSERT INTO settings (key, value)
          VALUES ('nowpayments_api_key', '')
          ON CONFLICT (key) DO NOTHING;
        `);

        await client.query(`
          INSERT INTO settings (key, value)
          VALUES ('admin_secret', $1)
          ON CONFLICT (key) DO NOTHING;
        `, [process.env.ADMIN_SECRET || '']);

        await client.query(`
          INSERT INTO settings (key, value)
          VALUES ('telegram_bot_token', '')
          ON CONFLICT (key) DO NOTHING;
        `);

        await client.query(`
          INSERT INTO settings (key, value)
          VALUES ('telegram_chat_id', '')
          ON CONFLICT (key) DO NOTHING;
        `);

        console.log('PostgreSQL schematic initialized & Settings applied.');
      } catch (err) {
        console.error('Initial DB schema sync failed:', err);
      } finally {
        client.release();
      }
    };
    initDb();
  })
  .catch(err => console.error('PostgreSQL connection error:', err));

// Routes
app.post('/api/payment/create', async (req, res) => {
  const { price_amount, pay_currency } = req.body;
  try {
    const keyResult = await pool.query("SELECT value FROM settings WHERE key = 'nowpayments_api_key'");
    const apiKey = keyResult.rows.length > 0 ? keyResult.rows[0].value : null;

    if (!apiKey) return res.status(500).json({ error: 'NOWPayments API Key not configured in DB' });

    let npCurrency = pay_currency.toLowerCase();
    if (npCurrency === 'usdt') npCurrency = 'usdtmatic'; // Use Polygon Network for USDT

    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: parseFloat(price_amount),
        price_currency: 'usd',
        pay_currency: npCurrency,
        order_id: `CRYSTAL-${Date.now()}`,
        order_description: 'For Test'
      })
    });

    const data = await response.json();
    if (data.pay_address) {
       // Save payment to local DB
       try {
         await pool.query(
           `INSERT INTO payments (payment_id, order_id, pay_address, pay_amount, pay_currency, price_amount, payment_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (payment_id) DO NOTHING`,
           [String(data.payment_id), data.order_id, data.pay_address, data.pay_amount, data.pay_currency, data.price_amount, data.payment_status || 'waiting']
         );
       } catch (dbErr) {
         console.error('Failed to save payment to DB:', dbErr.message);
       }
       res.json(data);
    } else {
       res.status(400).json({ error: 'Invalid API response', details: data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'NOWPayments Gateway failed' });
  }
});

app.post('/api/user/sync', async (req, res) => {
  const { deviceId, balance, activePlans } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'Device ID required' });

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE device_id = $1', [deviceId]);
    
    if (userResult.rows.length === 0) {
      // Create new mock user for this browser session
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      const activePlansJSON = JSON.stringify(activePlans || []);
      const initBalance = balance !== undefined ? balance : 1500.00;

      await pool.query(
        'INSERT INTO users (device_id, password, balance, active_plans) VALUES ($1, $2, $3, $4)',
        [deviceId, hashedPassword, initBalance, activePlansJSON]
      );
      res.json({ device_id: deviceId, balance: initBalance, active_plans: activePlans || [] });
    } else {
      // Update existing mock user
      let updateFields = [];
      let queryValues = [];
      let index = 1;

      if (balance !== undefined) {
         updateFields.push(`balance = $${index++}`);
         queryValues.push(balance);
      }
      if (activePlans !== undefined) {
         updateFields.push(`active_plans = $${index++}`);
         queryValues.push(JSON.stringify(activePlans));
      }

      if (updateFields.length > 0) {
         queryValues.push(deviceId);
         await pool.query(
           `UPDATE users SET ${updateFields.join(', ')} WHERE device_id = $${index}`,
           queryValues
         );
      }
      res.json({ message: 'User DB synced' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Postgres Server error' });
  }
});

app.post('/api/user/password', async (req, res) => {
  const { deviceId, currentPassword, newPassword } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE device_id = $1', [deviceId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found in Postgres' });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid current password' });

    const salt = await bcrypt.genSalt(10);
    const hashedNew = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE users SET password = $1 WHERE device_id = $2', [hashedNew, deviceId]);

    res.json({ message: 'Password updated successfully across DigitalOcean Database!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Postgres Server error' });
  }
});

app.post('/api/withdrawal/request', async (req, res) => {
  const { deviceId, amount, currency, walletAddress } = req.body;
  if (!deviceId || !amount || !currency || !walletAddress) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE device_id = $1', [deviceId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = userResult.rows[0];
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < 10) return res.status(400).json({ error: 'Minimum withdrawal amount is $10.' });
    if (withdrawAmount > user.balance) return res.status(400).json({ error: 'Insufficient wallet balance.' });

    // Deduct balance
    await pool.query('UPDATE users SET balance = balance - $1 WHERE device_id = $2', [withdrawAmount, deviceId]);

    // Record withdrawal
    await pool.query(
      'INSERT INTO withdrawals (device_id, amount, currency, wallet_address, status) VALUES ($1, $2, $3, $4, $5)',
      [deviceId, withdrawAmount, currency.toUpperCase(), walletAddress, 'pending']
    );

    const updatedUser = await pool.query('SELECT balance FROM users WHERE device_id = $1', [deviceId]);
    res.json({ message: 'Withdrawal request submitted successfully.', newBalance: updatedUser.rows[0].balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during withdrawal.' });
  }
});

app.get('/api/withdrawal/history/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM withdrawals WHERE device_id = $1 ORDER BY created_at DESC LIMIT 20',
      [deviceId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch withdrawal history.' });
  }
});

// ---- Payment Status Check ----
app.get('/api/payment/status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  try {
    const keyResult = await pool.query("SELECT value FROM settings WHERE key = 'nowpayments_api_key'");
    const apiKey = keyResult.rows[0]?.value;
    if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

    const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      headers: { 'x-api-key': apiKey }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// ---- Telegram IPN Notification ----
const sendTelegramNotification = async (message) => {
  try {
    const botResult = await pool.query("SELECT value FROM settings WHERE key = 'telegram_bot_token'");
    const chatResult = await pool.query("SELECT value FROM settings WHERE key = 'telegram_chat_id'");
    const botToken = botResult.rows[0]?.value;
    const chatId = chatResult.rows[0]?.value;
    if (!botToken || !chatId) return;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
  } catch (err) {
    console.error('Telegram notification failed:', err);
  }
};

// ---- NOWPayments Webhook ----
app.post('/api/payment/webhook', async (req, res) => {
  const { payment_status, payment_id, order_id, actually_paid, pay_currency, price_amount } = req.body;
  console.log('Webhook received:', req.body);
  res.status(200).json({ received: true });

  // Update payment status in local DB
  try {
    await pool.query(
      `UPDATE payments SET payment_status=$1, actually_paid=$2, updated_at=NOW() WHERE payment_id=$3`,
      [payment_status, parseFloat(actually_paid) || 0, String(payment_id)]
    );
  } catch (dbErr) {
    console.error('Failed to update payment in DB:', dbErr.message);
  }

  if (payment_status === 'finished' || payment_status === 'confirmed') {
    const msg = `✅ <b>Payment Confirmed!</b>\n💰 Amount: <b>${actually_paid} ${pay_currency?.toUpperCase()}</b>\n📦 Order: <b>${order_id}</b>\n🆔 Payment ID: <code>${payment_id}</code>\n💵 Original: $${price_amount} USD`;
    await sendTelegramNotification(msg);
  }
});

// ---- Admin API ----
app.get('/api/admin/users', async (req, res) => {
  const { secret } = req.query;
  const secretResult = await pool.query("SELECT value FROM settings WHERE key = 'admin_secret'");
  const adminSecret = secretResult.rows[0]?.value;
  if (secret !== adminSecret) return res.status(403).json({ error: 'Unauthorized' });
  const result = await pool.query('SELECT id, device_id, balance, active_plans FROM users ORDER BY id DESC');
  res.json(result.rows);
});

app.get('/api/admin/payments', async (req, res) => {
  const { secret } = req.query;
  const secretResult = await pool.query("SELECT value FROM settings WHERE key = 'admin_secret'");
  const adminSecret = secretResult.rows[0]?.value;
  if (secret !== adminSecret) return res.status(403).json({ error: 'Unauthorized' });

  try {
    // Read directly from local DB — no email/password needed
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 50');
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ data: [], error: 'Failed to fetch payments from DB' });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  const { secret, key, value } = req.body;
  const secretResult = await pool.query("SELECT value FROM settings WHERE key = 'admin_secret'");
  const adminSecret = secretResult.rows[0]?.value;
  if (secret !== adminSecret) return res.status(403).json({ error: 'Unauthorized' });
  await pool.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value]);
  res.json({ success: true });
});

app.get('/api/admin/settings', async (req, res) => {
  const { secret } = req.query;
  const secretResult = await pool.query("SELECT value FROM settings WHERE key = 'admin_secret'");
  const adminSecret = secretResult.rows[0]?.value;
  if (secret !== adminSecret) return res.status(403).json({ error: 'Unauthorized' });
  const result = await pool.query("SELECT key, value FROM settings WHERE key != 'admin_secret'");
  res.json(result.rows);
});

app.patch('/api/admin/user/:id/balance', async (req, res) => {
  const { secret, balance } = req.body;
  const secretResult = await pool.query("SELECT value FROM settings WHERE key = 'admin_secret'");
  const adminSecret = secretResult.rows[0]?.value;
  if (secret !== adminSecret) return res.status(403).json({ error: 'Unauthorized' });
  await pool.query('UPDATE users SET balance = $1 WHERE id = $2', [balance, req.params.id]);
  res.json({ success: true });
});

// All other routes should serve the React app's index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Crystal Backend Postgres Server running on port ${PORT}`));
