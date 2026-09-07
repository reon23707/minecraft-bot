module.exports = (bot) => {
  console.log('Inventory-Modul geladen')

  bot.getInventorySummary = () => {
    const items = bot.inventory.items()

    if (items.length === 0) {
      return 'Mein Inventar ist leer.'
    }

    return items
      .map(item => `${item.name} (${item.count})`)
      .join(', ')
  }

  bot.getHeldItemSummary = () => {
    if (!bot.heldItem) {
      return 'Ich halte nichts in der Hand.'
    }

    return `Ich halte ${bot.heldItem.name} (${bot.heldItem.count}).`
  }
}