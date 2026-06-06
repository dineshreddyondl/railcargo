import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for all origins
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

let sessionCookies = '';

app.post('/api/test-search', async (req, res) => {
  const { srcstn, dstnstn, jrnydt } = req.body;
  
  console.log('\n========================================');
  console.log('📡 API REQUEST RECEIVED');
  console.log('========================================');
  console.log(`📍 Source: ${srcstn}`);
  console.log(`📍 Destination: ${dstnstn}`);
  console.log(`📅 Date: ${jrnydt || 'today'}`);
  console.log('========================================\n');
  
  if (!srcstn || !dstnstn) {
    return res.status(400).json({ error: 'Source and destination are required' });
  }
  
  try {
    const formattedDate = jrnydt || new Date().toLocaleDateString('en-GB').replace(/\//g, '/');
    
    const formData = new URLSearchParams();
    formData.append('Optn', 'NEW_SERVICE_LIST');
    formData.append('jrnydt', formattedDate);
    formData.append('srcstn', srcstn.toUpperCase());
    formData.append('dstnstn', dstnstn.toUpperCase());
    formData.append('weight', '');
    
    console.log('📤 Forwarding to Indian Railways API...');
    
    const response = await fetch('https://www.fois.indianrail.gov.in/RailSAHAY/ParcelDataJson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36'
      },
      body: formData
    });
    
    console.log(`📥 Response Status: ${response.status}`);
    
    const data = await response.json();
    
    console.log(`✅ Found ${data.train_det?.length || 0} trains`);
    console.log('========================================\n');
    
    res.json({
      success: true,
      summary: {
        totalTrains: data.train_det?.length || 0,
        srcstn,
        dstnstn,
        date: formattedDate
      },
      fullResponse: data
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data', 
      message: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚂 BACKEND SERVER RUNNING`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🩺 Health: /api/health`);
  console.log(`🔍 Search: POST /api/test-search\n`);
});