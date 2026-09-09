const { plugin: autoEat } = require('mineflayer-auto-eat')

const LOW_HEALTH = 10
const LOW_HUNGER = 12
const ASK_COOLDOWN_MS = 60000

module.exports = (bot) => {
  let isEating = false
  let lastFoodRequest = 0

  bot.loadPlugin(autoEat)

  function hasFood() {
    const foodsByName = bot.registry?.foodsByName || {}

    return bot.inventory.items().some(item =>
      foodsByName[item.name]
    )
  }

  function askForFood() {
    const now = Date.now()

    if (now - lastFoodRequest < ASK_COOLDOWN_MS) {
      return
    }

    lastFoodRequest = now

    bot.chat(
      'Ich habe kein Essen mehr. Kann mir bitte jemand etwas zu essen geben?'
    )
  }

  bot.once('spawn', () => {
    console.log('SPAWN AutoEat')

    if (!bot.autoEat) {
      console.error('AutoEat wurde nicht geladen!')
      return
    }

    console.log('AutoEat geladen')

    // Optionen deiner Version
    bot.autoEat.options.priority = 'saturation'
    bot.autoEat.options.equipOldItem = true

    // Plugin aktivieren
    bot.autoEat.enable()
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

    if (!bot.autoEat) {
      console.error('AutoEat nicht verfügbar')
      return
    }

    if (isEating) return

    isEating = true

    try {
      await bot.autoEat.eat()

      console.log(
        `[AUTOEAT] Nahrung: ${bot.food}, Leben: ${bot.health}`
      )
    } catch (error) {
      console.log(
        '[AUTOEAT] Essen nicht möglich:',
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
    if (collector !== bot.entity) return

    if (hasFood()) {
      lastFoodRequest = 0
    }
  })
}