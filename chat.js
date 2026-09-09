const { askAI } = require('./ai')
const { goals } = require('mineflayer-pathfinder')
const MAX_CHAT_LENGTH = 240

let isThinking = false
let activeTask = null

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/, '')
    .replace(/\bzu\s+hause\b/g, 'zuhause')
    .replace(/\bnach\s+hause\b/g, 'zuhause')
}

function splitForMinecraft(text) {
  const sentences = text
    .replace(/\r?\n/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)

  const messages = []

  for (const sentence of sentences) {
    let remaining = sentence.trim()

    while (remaining.length > MAX_CHAT_LENGTH) {
      const splitAt = remaining.lastIndexOf(' ', MAX_CHAT_LENGTH)
      const index = splitAt > 0 ? splitAt : MAX_CHAT_LENGTH

      messages.push(remaining.slice(0, index).trim())
      remaining = remaining.slice(index).trim()
    }

    if (remaining) {
      messages.push(remaining)
    }
  }

  return messages
}

async function runTask(bot, name, task) {
  if (activeTask) {
    bot.chat(`Ich bin gerade beschäftigt: ${activeTask}.`)
    return
  }

  activeTask = name

  try {
    await task()
  } catch (error) {
    console.error(`Fehler bei ${name}:`, error)
    bot.chat(`Bei ${name} ist ein Fehler aufgetreten.`)
  } finally {
    activeTask = null
  }
}

module.exports = (bot) => {
  bot.on('messagestr', (message) => {
    console.log('[MSG]', message)
  })

  bot.on('chat', async (username, message) => {
    if (username === bot.username) return

    console.log(`[CHAT] ${username}: ${message}`)

    const normalizedMessage = normalizeText(message)
    const addressedMatch = message
      .trim()
      .match(/^sandro\s*,?\s*(.+)$/i)

    /*
     * Zuhause:
     * Sandro, das ist dein Zuhause
     * Sandro, das ist jetzt dein neues schönes Zuhause
     * Sandro, geh heim
     * Sandro, geh nach Hause
     */
    const directHomeCommand =
      normalizedMessage === '!home' ||
      normalizedMessage === '!heim' ||
      normalizedMessage === '!home löschen'

    if (addressedMatch || directHomeCommand) {
      const request = addressedMatch
        ? normalizeText(addressedMatch[1])
        : normalizedMessage

      const mentionsHome = /\b(zuhause|heim)\b/.test(request)

      const wantsToGoHome =
        request === '!heim' ||
        (
          mentionsHome &&
          /\b(geh|gehe|lauf|laufe|zurück|zurueck)\b/.test(request)
        )

      const wantsToDeleteHome =
        request === '!home löschen'

      const wantsToSetHome =
        request === '!home' ||
        (
          mentionsHome &&
          !wantsToGoHome &&
          !wantsToDeleteHome &&
          /\b(das ist|dein|neues|neue|hier)\b/.test(request)
        )

      if (wantsToGoHome || wantsToSetHome || wantsToDeleteHome) {
        if (!bot.home) {
          bot.chat('Mein Zuhause-Modul ist noch nicht geladen.')
          return
        }

        if (!bot.home.isAllowed(username)) {
          bot.chat('Nur mein Besitzer kann mein Zuhause ändern.')
          return
        }

        if (wantsToSetHome) {
          bot.home.set()
          return
        }

        if (wantsToDeleteHome) {
          bot.home.clear()
          return
        }

        await runTask(bot, 'Heimweg', async () => {
          await bot.home.go()
        })

        return
      }
    }

    /*
     * Direkte Befehle
     */
    if (normalizedMessage === '!ping') {
      bot.chat('Pong!')
      return
    }

    if (normalizedMessage === '!hallo') {
      bot.chat(`Hallo ${username}!`)
      return
    }

    if (normalizedMessage === '!hilfe') {
      bot.chat(
        'Befehle: !hp, !xp, !spieler, !inventar, !hand, !pos, !komm, !folge, !stop, !geh X Y Z, !mine Block, !lager, !ki Frage'
      )
      return
    }

    if (normalizedMessage === '!hp') {
      bot.chat(bot.getHealthSummary())
      return
    }

    if (normalizedMessage === '!xp') {
      bot.chat(bot.getExperienceSummary())
      return
    }

    if (normalizedMessage === '!spieler') {
      bot.chat(bot.getPlayersSummary())
      return
    }

    if (normalizedMessage === '!inventar') {
      const inventoryText = bot.getInventorySummary()

      for (const line of splitForMinecraft(inventoryText)) {
        bot.chat(line)
      }

      return
    }

    if (normalizedMessage === '!hand') {
      bot.chat(bot.getHeldItemSummary())
      return
    }

    if (normalizedMessage === '!pos') {
      const position = bot.entity.position

      bot.chat(
        `X:${Math.floor(position.x)} Y:${Math.floor(position.y)} Z:${Math.floor(position.z)}`
      )

      return
    }

    if (normalizedMessage === '!komm') {
      const player = bot.players[username]

      if (!player?.entity) {
        bot.chat('Ich kann dich nicht sehen.')
        return
      }

      const position = player.entity.position

      bot.pathfinder.setGoal(
        new goals.GoalNear(
          Math.floor(position.x),
          Math.floor(position.y),
          Math.floor(position.z),
          2
        )
      )

      bot.chat(`Ich komme zu dir, ${username}!`)
      return
    }

    if (normalizedMessage === '!folge') {
      const player = bot.players[username]

      if (!player?.entity) {
        bot.chat('Ich kann dich nicht sehen.')
        return
      }

      bot.pathfinder.setGoal(
        new goals.GoalFollow(player.entity, 2),
        true
      )

      bot.chat(`Ich folge dir, ${username}!`)
      return
    }

    if (normalizedMessage === '!stop') {
      bot.pathfinder.setGoal(null)
      bot.clearControlStates()
      bot.chat('Ich bleibe stehen.')
      return
    }

    if (normalizedMessage.startsWith('!geh ')) {
      const coordinates = message
        .slice(5)
        .trim()
        .split(/\s+/)
        .map(Number)

      if (
        coordinates.length !== 3 ||
        coordinates.some(coordinate => Number.isNaN(coordinate))
      ) {
        bot.chat('Benutzung: !geh <X> <Y> <Z>')
        return
      }

      const [x, y, z] = coordinates

      bot.pathfinder.setGoal(
        new goals.GoalNear(
          Math.floor(x),
          Math.floor(y),
          Math.floor(z),
          1
        )
      )

      bot.chat(`Ich gehe zu X:${x} Y:${y} Z:${z}.`)
      return
    }

    if (normalizedMessage.startsWith('!mine ')) {
      const blockName = message.slice(6).trim()

      if (!blockName) {
        bot.chat('Beispiel: !mine Eisenerz oder !mine iron ore')
        return
      }

      await runTask(bot, `Mining: ${blockName}`, async () => {
        await bot.mineBlock(blockName)
      })

      return
    }

    if (normalizedMessage === '!lager') {
      await runTask(bot, 'Einlagern', async () => {
        await bot.depositInventory()
      })

      return
    }

    /*
     * KI-Anfrage erkennen:
     * !ki Wie finde ich Diamanten?
     * Sandro, Wie finde ich Diamanten?
     * Bot, Wie finde ich Diamanten?
     */
    let question = null

    if (normalizedMessage.startsWith('!ki ')) {
      question = message.slice(4).trim()
    } else if (addressedMatch) {
      question = addressedMatch[1].trim()
    } else if (message.toLowerCase().startsWith('bot,')) {
      question = message.slice(4).trim()
    }

    if (!question) return

    const lowerQuestion = question.toLowerCase()

    /*
     * Natürlicher Holzauftrag:
     * Sandro, sammle Holz
     * Sandro, besorg Holz
     */
    if (
      lowerQuestion.includes('holz') &&
      ['sammel', 'suche', 'besorg', 'fäll', 'faell', 'hol']
        .some(word => lowerQuestion.includes(word))
    ) {
      if (typeof bot.collectWood !== 'function') {
        bot.chat('Meine Holzfäller-Funktion ist nicht geladen.')
        return
      }

      await runTask(bot, 'Holz sammeln', async () => {
        bot.chat('Alles klar, ich suche Holz.')
        await bot.collectWood()
      })

      return
    }

    if (isThinking) {
      bot.chat('Ich denke noch über eine andere Frage nach.')
      return
    }

    isThinking = true

    try {
      bot.chat('Denke nach...')

      const answer = await askAI(question)

      console.log('===== KI ANTWORT BEGINN =====')
      console.log(answer)
      console.log('===== KI ANTWORT ENDE =====')

for (const responseMessage of splitForMinecraft(answer)) {
  console.log('[KI SEND]', responseMessage)
  bot.chat(responseMessage)

  await new Promise(resolve =>
    setTimeout(resolve, 2000)
  )
}
    } catch (error) {
      console.error('KI-Fehler:', error)
      bot.chat('KI Fehler')
    } finally {
      isThinking = false
    }
  })
}