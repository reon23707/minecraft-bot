module.exports = (bot) => {

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    // Leben
    if (message === '!hp') {
      bot.chat(`Ich habe ${bot.health} HP`)
    }

    // Erfahrung
    if (message === '!xp') {
      bot.chat(`Mein XP-Level ist ${bot.experience.level}`)
    }

    // Spieler in der Nähe
    if (message === '!spieler') {
      const players = Object.keys(bot.players)
        .filter(name => name !== bot.username)

      if (players.length === 0) {
        bot.chat('Keine Spieler gefunden.')
      } else {
        bot.chat(`Spieler online: ${players.join(', ')}`)
      }
    }
  })

}