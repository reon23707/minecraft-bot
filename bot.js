const mineflayer = require('mineflayer')

const { pathfinder, goals } = require('mineflayer-pathfinder')

const bot = mineflayer.createBot({
  host: '127.0.0.1',
  port: 25585,
  auth: 'microsoft',
  username: 'sandro.pfueller@outlook.de'
})

bot.loadPlugin(pathfinder)

bot.on('login', () => {
  console.log('LOGIN')
})

bot.on('spawn', () => {
  console.log('SPAWN')

  setTimeout(() => {
    console.log('Sende Testnachricht...')
    bot.chat('Hallo zusammen!')
  }, 5000)
})

bot.once('spawn', () => {
console.log('Bot ist erfolgreich verbunden!')

const goal = new goals.GoalBlock(
100,
64,
100
)

bot.pathfinder.setGoal(goal)
})

bot.on('messagestr', msg => {
  console.log('[MSG]', msg)
})

bot.on('chat', (username, message) => {
  console.log(`[CHAT] ${username}: ${message}`)
})

bot.on('error', err => {
  console.log('ERROR:', err)
})

bot.on('kicked', reason => {
  console.log('KICKED:', reason)
})

bot.on('end', () => {
  console.log('VERBINDUNG BEENDET')
})

bot.once('spawn', () => {

  const pos = bot.entity.position

  console.log(pos)

  bot.pathfinder.setGoal(
    new goals.GoalNear(
      pos.x + 5,
      pos.y,
      pos.z + 5,
      1
    )
  )
})