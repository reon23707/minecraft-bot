module.exports = (bot) => {

  console.log('Inventory-Modul geladen')

  bot.on('chat', (username, message) => {

    if (username === bot.username) return

    // Inventar anzeigen
    if (message === '!inventar') {

      const items = bot.inventory.items()

      if (items.length === 0) {
        bot.chat('Mein Inventar ist leer.')
        return
      }

      const text = items
        .map(item => `${item.name} (${item.count})`)
        .join(', ')

      bot.chat(text)
    }

    // Gegenstand in der Hand anzeigen
    if (message === '!hand') {

      const item = bot.heldItem

      if (!item) {
        bot.chat('Ich halte nichts in der Hand.')
        return
      }

      bot.chat(`Ich halte ${item.name} (${item.count}).`)
    }

  })

}