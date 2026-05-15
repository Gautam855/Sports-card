const dot = require('dotenv').config({path: '.env.local'})
const { FOOTBALL_APISPORTS_KEY } = process.env

fetch('https://v1.basketball.api-sports.io/games?date=2024-05-15', {
  headers: {
    'x-apisports-key': FOOTBALL_APISPORTS_KEY
  }
}).then(r => r.json()).then(console.log).catch(console.error)
