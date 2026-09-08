const autoeat = require('mineflayer-auto-eat')

const LOW_HEALTH = 10
const LOW_HUNGER = 12
const ASK_COOLDOWN_MS = 60000

module.exports = (bot) => {

  let isEating = false
  let lastFoodRequest = 0

  bot.loadPlugin (autoeat)

  function hasFood() {

    const foodsByName = bot.registry?.foodsByName || {}

    return bot.inventory
      .items()
      .some(item => foodsByName[item.name])

  }

  function askForFood() {

    const now = Date.now()

    if (now - lastFoodRequest < ASK_COOLDOWN_MS)
      return

    lastFoodRequest = now

    bot.chat(
      'Ich habe kein Essen mehr. Kann mir bitte jemand etwas zu essen geben?'
    )

  }

  bot.once('spawn', () => {

    bot.autoEat.setOpts({
      minHunger: 18,
      minHealth: 14,
      priority: 'saturation'
    })

    bot.autoEat.enableAuto()

    console.log('Auto-Eat geladen')

  })

  bot.on('health', async () => {

    const needsFood =
      bot.food <= LOW_HUNGER ||
      bot.health <= LOW_HEALTH

    if (!needsFood) return

    if (!hasFood()) {
      askForFood()
      return
    }

    if (isEating) return

    isEating = true

    try {

      await bot.autoEat.eat({
        priority: 'saturation',
        equipOldItem: true
      })

    } catch (error) {

      console.log(
        'Essen nicht möglich:',
        error.message
      )

      if (!hasFood()) {
        askForFood()
      }

    } finally {

      isEating = false

    }

  })

  bot.on('playerCollect', (collector) => {

    if (collector !== bot.entity)
      return

    if (hasFood()) {
      lastFoodRequest = 0
    }

  })

}