const mineflayer = require('mineflayer')
const { askAI } = require('./ai')

const bot = mineflayer.createBot({
  host: '127.0.0.1',
  port: 25585,
  auth: 'microsoft',
  username: 'sandro.pfueller@outlook.de'
})

require('./login')(bot)
require('./chat')(bot)
require('./pathfinder')(bot)
require('./inventory')(bot)
require('./player')(bot)
require('./woodcutter')(bot)

bot.on('error', console.log)

bot.on('kicked', console.log)

bot.on('end', () => {
  console.log('VERBINDUNG BEENDET')
})

bot.on('chat', async (username, message) => {

  if (username === bot.username) return

  if (!message.startsWith('!ki ')) return

  const frage = message.substring(4)

  try {
    console.log('BOT SEND:', line)
    bot.chat('Denke nach...')

    const antwort = await askAI(frage)

console.log('===== KI ANTWORT BEGINN =====')
console.log(antwort)
console.log('===== KI ANTWORT ENDE =====')

const cleanAnswer = antwort
  .replace(/\r/g, '')
  .replace(/\n/g, ' ')
  .trim()

const sentences = cleanAnswer
  .split(/[.!?]+/)
  .map(s => s.trim())
  .filter(s => s.length > 0)

for (const sentence of sentences) {
  console.log('BOT SEND:', line)
  bot.chat(sentence)

  await new Promise(resolve =>
    setTimeout(resolve, 1500)
  )

}

  } catch (err) {

    console.error(err)
    console.log('BOT SEND:', line)
    bot.chat('KI Fehler')

  }

})