const https = require('https');
require('dotenv').config();

const options = {
  hostname: 'football536.p.rapidapi.com',
  path: '/standings?league_id=47',
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': process.env.FOOTBALL536_KEY_1 || 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623',
    'X-RapidAPI-Host': 'football536.p.rapidapi.com'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
req.end();
