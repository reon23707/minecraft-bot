const fs = require('fs')
const path = require('path')
const { goals } = require('mineflayer-pathfinder')

const homeFile = path.join(__dirname, 'home.json')
const owner = process.env.BOT_OWNER?.toLowerCase()

function loadHome() {
  if (!fs.existsSync(homeFile)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(homeFile, 'utf8'))
  } catch (error) {
    console.error('home.json konnte nicht gelesen werden:', error)
    return null
  }
}

module.exports = (bot) => {
  let isGoingHome = false

  bot.home = {
    isAllowed(username) {
      return !owner || username.toLowerCase() === owner
    },

    set() {
      const position = bot.entity.position

      const home = {
        x: Math.floor(position.x),
        y: Math.floor(position.y),
        z: Math.floor(position.z),
        dimension: bot.game?.dimension || null
      }

      fs.writeFileSync(
        homeFile,
        JSON.stringify(home, null, 2),
        'utf8'
      )

      bot.chat(
        `Zuhause gesetzt: X:${home.x} Y:${home.y} Z:${home.z}`
      )
    },

    clear() {
      if (fs.existsSync(homeFile)) {
        fs.unlinkSync(homeFile)
      }

      bot.chat('Mein Zuhause wurde gelöscht.')
    },

    async go() {
      const home = loadHome()

      if (!home) {
        bot.chat('Mein Zuhause ist noch nicht gesetzt.')
        return false
      }

      if (
        home.dimension &&
        bot.game?.dimension &&
        home.dimension !== bot.game.dimension
      ) {
        bot.chat('Mein Zuhause liegt in einer anderen Dimension.')
        return false
      }

      if (isGoingHome) {
        bot.chat('Ich bin bereits auf dem Weg nach Hause.')
        return false
      }

      isGoingHome = true

      try {
        bot.chat('Ich gehe nach Hause.')

        await bot.pathfinder.goto(
          new goals.GoalNear(home.x, home.y, home.z, 2)
        )

        bot.chat('Ich bin zu Hause.')
        return true
      } catch (error) {
        console.error('Heimweg fehlgeschlagen:', error)
        bot.chat('Ich konnte mein Zuhause nicht erreichen.')
        return false
      } finally {
        isGoingHome = false
      }
    }
  }
}