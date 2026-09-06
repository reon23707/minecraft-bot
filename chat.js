const { askAI } = require('./ai')

module.exports = (bot) => {

  bot.on('messagestr', (message) => {
    console.log('[MSG]', message)
  })

  bot.on('chat', async (username, message) => {

    if (username === bot.username) return

    console.log(`[CHAT] ${username}: ${message}`)

    let frage = null

    // Variante 1: !ki ...
    if (message.startsWith('!ki ')) {

      frage = message.substring(4).trim()

    } else {

      const lower = message.toLowerCase()

      // Variante 2: sandro, ...
      if (lower.startsWith('sandro,')) {

        frage = message.substring(7).trim()

      }

      // Variante 3: bot, ...
      else if (lower.startsWith('bot,')) {

        frage = message.substring(4).trim()

      }

    }

    if (frage) {

  const lower = frage.toLowerCase()

  // Holzaufträge erkennen
  if (
    lower.includes('holz') &&
    (
      lower.includes('hol') ||
      lower.includes('sammel') ||
      lower.includes('suche') ||
      lower.includes('besorg')
    )
  ) {

    bot.chat('Alles klar, ich suche etwas Holz.')

    if (typeof bot.collectWood === 'function') {
      await bot.collectWood()
    } else {
      bot.chat('Die Holzfäller-Funktion ist noch nicht installiert.')
    }

    return
  }

  try {

    bot.chat('Denke nach...')

    const antwort = await askAI(frage)

        console.log('===== KI ANTWORT BEGINN =====')
        console.log(antwort)
        console.log('===== KI ANTWORT ENDE =====')

        const cleanAnswer = antwort
          .replace(/\r/g, '')
          .replace(/\n/g, ' ')
          .trim()

        const sentences = cleanAnswer
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 0)

        for (const sentence of sentences) {

          bot.chat(sentence)

          await new Promise(resolve =>
            setTimeout(resolve, 1500)
          )

        }

      } catch (err) {

        console.error(err)

        bot.chat('KI Fehler')

      }

      return
    }

    // Normale Befehle

    switch (message.toLowerCase()) {

      case '!ping':
        bot.chat('Pong!')
        break

      case '!hallo':
        bot.chat(`Hallo ${username}!`)
        break

      case '!hilfe':
        bot.chat('Befehle: !ping, !hallo, !ki, sandro, ..., bot, ...')
        break

    }

  })

}