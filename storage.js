const { goals } = require('mineflayer-pathfinder')

const protectedItemParts = [
  '_pickaxe',
  '_axe',
  '_shovel',
  '_hoe',
  '_sword',
  '_helmet',
  '_chestplate',
  '_leggings',
  '_boots',
  'shield'
]

function shouldKeep(bot, item) {
  const isToolOrArmor = protectedItemParts.some(part =>
    item.name.includes(part)
  )

  const isFood = Boolean(bot.registry?.foodsByName?.[item.name])

  return isToolOrArmor || isFood
}

module.exports = (bot) => {
  bot.depositInventory = async () => {
    const chest = bot.findBlock({
      matching: block =>
        block.name === 'chest' || block.name === 'trapped_chest',
      maxDistance: 64
    })

    if (!chest) {
      bot.chat('Ich finde keine Truhe in der Nähe.')
      return false
    }

    try {
      bot.chat('Ich bringe die gesammelten Sachen zur Truhe...')

      await bot.pathfinder.goto(
        new goals.GoalNear(
          chest.position.x,
          chest.position.y,
          chest.position.z,
          1
        )
      )

      const currentChest = bot.blockAt(chest.position)

      if (
        !currentChest ||
        (
          currentChest.name !== 'chest' &&
          currentChest.name !== 'trapped_chest'
        )
      ) {
        bot.chat('Die Truhe ist nicht mehr da.')
        return false
      }

      const container = await bot.openChest(currentChest)

      const items = bot.inventory.items()
        .filter(item => !shouldKeep(bot, item))

      if (items.length === 0) {
        container.close()
        bot.chat('Ich habe nichts zum Einlagern.')
        return true
      }

      let stored = 0

      for (const item of items) {
        try {
          await container.deposit(item.type, null, item.count)
          stored += item.count
        } catch (error) {
          console.log(
            `Konnte ${item.name} nicht einlagern:`,
            error.message
          )
        }
      }

      container.close()
      bot.chat(`${stored} Gegenstände in der Truhe eingelagert.`)

      return true
    } catch (error) {
      console.error('Fehler beim Einlagern:', error)
      bot.chat('Ich konnte die Truhe nicht erreichen oder öffnen.')

      return false
    }
  }
}