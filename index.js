require('dotenv').config()

const mineflayer = require('mineflayer')

const requiredVariables = ['MC_HOST', 'MC_PORT', 'MC_USERNAME']

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Fehlende Einstellung in .env: ${variable}`)
  }
}

const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: Number(process.env.MC_PORT),
  username: process.env.MC_USERNAME,
  auth: process.env.MC_AUTH || 'microsoft',
  version: process.env.MC_VERSION || false
})

require('./login')(bot)
require('./chat')(bot)
require('./pathfinder')(bot)
require('./inventory')(bot)
require('./player')(bot)
require('./woodcutter')(bot)
require('./mining')(bot)
require('./storage')(bot)
require('./autoeat')(bot)
require('./home')(bot)

bot.on('error', (error) => {
  console.error('Bot-Fehler:', error)
})

bot.on('kicked', (reason) => {
  console.error('Bot wurde gekickt:', reason)
})

bot.on('end', () => {
  console.log('Verbindung beendet.')
})