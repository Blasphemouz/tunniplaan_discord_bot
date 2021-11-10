require('dotenv').config()
const Discord = require('discord.js')
const axios = require('axios')
const puppeteer = require('puppeteer')
const screenshot = 'tunniplaan.png'

const client = new Discord.Client({ intents: ['GUILD_MESSAGES', 'GUILDS'] })

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('messageCreate', async msg => {
    switch (msg.content) {
        case "!info":
            msg.reply("!tunniplaan/!t = Selle nädala tunniplaan\n"+
                      "!tunniplaan-previous/!tp = Eelmise nädala tunniplaan\n"+
                      "!tunniplaan-next/!tn = Järgmise nädala tunniplaan")
            break
    
        case "!tunniplaan": case "!t": case "!tunniplaan-previous": case "!tp": case "!tunniplaan-next": case "!tn":
            msg.channel.send("Teie tunniplaan:")
            const tunniplaan = await getTunniplaan(msg.content)
            msg.channel.send({files: ['tunniplaan.png']})
            break;
    }

    async function getTunniplaan(msgcon){
        const browser = await puppeteer.launch({ defaultViewport: null })
        const page = await browser.newPage()
        await page.setViewport({
            width: 1920,
            height:1080
        })
        await page.goto('https://tahvel.edu.ee/#/timetable/8/generalTimetable/group')
        await page.type('#fl-input-5', 'JPTVE19')
        await page.waitForTimeout(100)
        await page.click('li.md-autocomplete-suggestion')
        await page.waitForSelector('div.layout-padding')
        switch (msgcon) {
        case '!tunniplaan-next': case '!tn':
            await page.waitForTimeout(500)
            await page.click('body > div.layout-column.flex > md-content > div > md-content > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > button:nth-child(4)')
            break

        case '!tunniplaan-previous': case '!tp':
            await page.waitForTimeout(500)
            await page.click('body > div.layout-column.flex > md-content > div > md-content > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(2) > button:nth-child(1)')
            await page.waitForSelector('div.layout-padding')
            break
        }
        await page.waitForSelector('div.layout-padding')
        const tabel = await page.$('#vTimetable')
        await page.waitForTimeout(250)
        await tabel.screenshot({ path: 'tunniplaan.png'})
        await page.close()
        await browser.close()
        console.log('See screenshot: ' + screenshot)
    }
})



client.login(process.env.CLIENT_TOKEN)