const axios = require('axios')
const botName = process.env.BOT_NAME || 'Sandro'

async function askAI(question) {

  try {

    const response = await axios.post(
      'http://127.0.0.1:11434/api/generate',
      {
        model: 'qwen3:8b',
        stream: false,
        prompt: `
Du bist ${botName}, ein hilfreicher Minecraft-Bot auf einem deutschen Minecraft-Server.

Regeln:
- Alle Fragen beziehen sich auf Minecraft.
- Antworte ausschließlich auf Deutsch.
- Antworte kurz und verständlich.
- Maximal 5 kurze Sätze.
- Keine Erklärungen zur echten Welt.
- Wenn nach Häusern, Werkzeugen, Erzen, Dorfbewohnern, Mobs, Redstone oder Farming gefragt wird, immer Minecraft meinen.
- Verwende keine Einleitung wie "Als KI".
- Sprich direkt mit dem Spieler.

Frage:
${question}
`
      }
    )

    return response.data.response.trim()

  } catch (err) {

    console.error('KI Fehler:', err.message)

    return 'Ich kann gerade nicht nachdenken.'
  }

}

module.exports = { askAI }