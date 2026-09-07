const collectBlock = require('mineflayer-collectblock').plugin

module.exports = (bot) => {
  bot.loadPlugin(collectBlock)

  /**
   * Heruntergefallene Items einsammeln
   */
  bot.collectDroppedItems = async () => {
    try {
      const items = Object.values(bot.entities).filter(
        entity => entity.name === 'item'
      )

      if (items.length === 0) return

      for (const item of items) {
        try {
          await bot.collectBlock.collect(item)
        } catch (err) {
          console.log(
            `Konnte Item nicht einsammeln: ${err.message}`
          )
        }
      }
    } catch (err) {
      console.error(
        'Fehler beim Einsammeln der Items:',
        err
      )
    }
  }

  /**
   * Nächsten Stamm finden
   */
  bot.findNearestLog = () => {
    return bot.findBlock({
      matching: block =>
        block &&
        block.name.endsWith('_log'),
      maxDistance: 32
    })
  }

  /**
   * Gesamten Baum scannen
   */
  bot.scanTree = (startBlock) => {
    const visited = new Set()
    const queue = [startBlock]
    const logs = []

    while (queue.length > 0) {
      const block = queue.shift()

      if (!block) continue

      const key = block.position.toString()

      if (visited.has(key)) continue

      visited.add(key)

      if (!block.name.endsWith('_log'))
        continue

      logs.push(block)

      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const next = bot.blockAt(
              block.position.offset(
                x,
                y,
                z
              )
            )

            if (next) {
              queue.push(next)
            }
          }
        }
      }
    }

    return logs
  }

  /**
   * Ganzen Baum fällen
   */
  bot.collectWood = async () => {
    try {
      const firstLog =
        bot.findNearestLog()

      if (!firstLog) {
        bot.chat(
          'Ich finde keinen Baum.'
        )
        return
      }

      bot.chat(
        'Baum wird analysiert...'
      )

      let tree =
        bot.scanTree(firstLog)

      if (tree.length === 0) {
        bot.chat(
          'Kein Baum erkannt.'
        )
        return
      }

      const maxY = Math.max(
        ...tree.map(
          block => block.position.y
        )
      )

      const minY = Math.min(
        ...tree.map(
          block => block.position.y
        )
      )

      const height = maxY - minY

      bot.chat(
        `Baum erkannt (${tree.length} Stämme, Höhe ${height})`
      )

      /*
       * Von oben nach unten abbauen.
       * Das verhindert viele Probleme bei
       * großen Spruce-, Jungle- und
       * Mangrovenbäumen.
       */
      tree.sort(
        (a, b) =>
          b.position.y -
          a.position.y
      )

      let chopped = 0

      for (const log of tree) {
        try {
          const current =
            bot.blockAt(
              log.position
            )

          if (
            !current ||
            !current.name.endsWith(
              '_log'
            )
          ) {
            continue
          }

          await bot.collectBlock.collect(
            current
          )

          chopped++

          await bot.waitForTicks(5)
        } catch (err) {
          console.log(
            `Block übersprungen: ${err.message}`
          )
        }
      }

      /*
       * Noch einmal nachsehen,
       * ob weitere Stämme übrig
       * geblieben sind.
       */
      let retries = 0

      while (retries < 3) {
        const next =
          bot.findNearestLog()

        if (!next) break

        const extraTree =
          bot.scanTree(next)

        if (
          extraTree.length === 0
        )
          break

        extraTree.sort(
          (a, b) =>
            b.position.y -
            a.position.y
        )

        for (const log of extraTree) {
          try {
            const current =
              bot.blockAt(
                log.position
              )

            if (
              !current ||
              !current.name.endsWith(
                '_log'
              )
            ) {
              continue
            }

            await bot.collectBlock.collect(
              current
            )

            chopped++

            await bot.waitForTicks(
              5
            )
          } catch {}
        }

        retries++
      }

      await bot.waitForTicks(20)

      await bot.collectDroppedItems()

      if (typeof bot.depositInventory === 'function') {
  await bot.depositInventory()
}

      bot.chat(
        `Fertig. ${chopped} Holzblöcke gesammelt.`
      )
    } catch (err) {
      console.error(err)

      bot.chat(
        'Beim Holz sammeln ist etwas schiefgelaufen.'
      )
    }
  }
}