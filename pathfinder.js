const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

module.exports = (bot) => {

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {

    const mcData = require('minecraft-data')(bot.version)

    const movements = new Movements(bot, mcData)

    bot.pathfinder.setMovements(movements)

    console.log('Pathfinder geladen')

  })

  bot.on('chat', (username, message) => {

    if (username === bot.username) return

    // !komm
    if (message === '!komm') {

      const player = bot.players[username]

      if (!player || !player.entity) {
        bot.chat('Ich kann dich nicht sehen.')
        return
      }

      bot.chat(`Ich komme zu dir, ${username}!`)

      bot.pathfinder.setGoal(
        new goals.GoalNear(
          Math.floor(player.entity.position.x),
          Math.floor(player.entity.position.y),
          Math.floor(player.entity.position.z),
          1
        )
      )
    }

    // !folge
    if (message === '!folge') {

      const player = bot.players[username]

      if (!player || !player.entity) {
        bot.chat('Ich kann dich nicht sehen.')
        return
      }

      bot.chat(`Ich folge dir, ${username}!`)

      bot.pathfinder.setGoal(
        new goals.GoalFollow(player.entity, 2),
        true
      )
    }

    // !stop
    if (message === '!stop') {

      bot.pathfinder.setGoal(null)

      bot.clearControlStates()

      bot.chat('Ich bleibe stehen.')
    }

    // !pos
    if (message === '!pos') {

      const p = bot.entity.position

      bot.chat(
        `X:${Math.floor(p.x)} Y:${Math.floor(p.y)} Z:${Math.floor(p.z)}`
      )
    }

  })

}