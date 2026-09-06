const collectBlock = require('mineflayer-collectblock').plugin

module.exports = (bot) => {

  bot.loadPlugin(collectBlock)

  bot.collectWood = async () => {

    try {

      bot.chat('Alles klar, ich suche etwas Holz.')

      const logBlock = bot.findBlock({
        matching: block =>
          block &&
          block.name.includes('log'),
        maxDistance: 64
      })

      if (!logBlock) {
        bot.chat('Ich finde keinen Baum.')
        return
      }

      await bot.collectBlock.collect(logBlock)

      bot.chat('Ich habe Holz gesammelt.')

    } catch (err) {

      console.error(err)

      bot.chat('Beim Holz sammeln ist etwas schiefgelaufen.')

    }

  }

}
``