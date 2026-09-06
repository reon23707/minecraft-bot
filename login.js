module.exports = (bot) => {

  bot.on('login', () => {
    console.log('LOGIN')
  })

  bot.on('spawn', () => {
    console.log('SPAWN')

    setTimeout(() => {
      bot.chat('Hallo zusammen!')
    }, 5000)

    console.log('Bot ist erfolgreich verbunden!')
  })

}