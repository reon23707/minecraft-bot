const { pathfinder, Movements } = require('mineflayer-pathfinder')

module.exports = (bot) => {
  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('SPAWN')

    console.log('pathfinder:', bot.pathfinder)

    if (!bot.pathfinder) {
      console.log('Pathfinder wurde nicht geladen!')
      return
    }

    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)

    movements.canDig = false
    movements.canPlaceBlocks = false
    movements.allowParkour = false
    movements.allow1by1towers = false
    movements.maxDropDown = 2

    bot.pathfinder.setMovements(movements)

    console.log('Pathfinder geladen')
  })
}