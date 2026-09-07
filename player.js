module.exports = (bot) => {
  bot.getHealthSummary = () => {
    return `Ich habe ${bot.health} HP.`
  }

  bot.getExperienceSummary = () => {
    return `Mein XP-Level ist ${bot.experience.level}.`
  }

  bot.getPlayersSummary = () => {
    const players = Object.keys(bot.players)
      .filter(name => name !== bot.username)

    if (players.length === 0) {
      return 'Keine Spieler gefunden.'
    }

    return `Spieler online: ${players.join(', ')}`
  }
}