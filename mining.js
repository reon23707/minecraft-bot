const mcDataLoader = require('minecraft-data')
const { goals } = require('mineflayer-pathfinder')
const blockAliases = require('./block-aliases')

function normalizeBlockName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
}

module.exports = (bot) => {
  let mcData = null

  function getMcData() {
    if (!mcData) {
      mcData = mcDataLoader(bot.version)
    }

    return mcData
  }

  function resolveBlockName(input) {
    const normalized = normalizeBlockName(input)

    if (blockAliases[normalized]) {
      return blockAliases[normalized]
    }

    return normalized.replace(/\s+/g, '_')
  }

  bot.mineBlock = async (input) => {
    const data = getMcData()
    const blockName = resolveBlockName(input)
    const blockId = data.blocksByName[blockName]?.id

    if (!blockId) {
      bot.chat(`Den Block "${input}" kenne ich nicht.`)
      return false
    }

    const block = bot.findBlock({
      matching: blockId,
      maxDistance: 64
    })

    if (!block) {
      bot.chat(`Kein ${input} in meiner Nähe gefunden.`)
      return false
    }

    try {
      bot.chat(`Ich gehe zu ${input}...`)

      await bot.pathfinder.goto(
        new goals.GoalNear(
          block.position.x,
          block.position.y,
          block.position.z,
          1
        )
      )

      const currentBlock = bot.blockAt(block.position)

      if (!currentBlock || currentBlock.name !== blockName) {
        bot.chat(`${input} ist nicht mehr da.`)
        return false
      }

      if (!bot.canDigBlock(currentBlock)) {
        bot.chat(`Ich kann ${input} mit meinem Werkzeug nicht abbauen.`)
        return false
      }

      await bot.dig(currentBlock)
      await bot.waitForTicks(10)

      bot.chat(`${input} abgebaut.`)

      if (typeof bot.depositInventory === 'function') {
        await bot.depositInventory()
      }

      return true
    } catch (error) {
      console.error(`Fehler beim Abbauen von ${input}:`, error)
      bot.chat(`Ich konnte ${input} nicht abbauen.`)
      return false
    }
  }
}