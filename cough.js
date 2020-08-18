require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const connection = require('./connection')

// initialize bot by connecting to the server
client.login(process.env.DISCORD_TOKEN)

client.on('message', msg => {
  // Find out who is making the request
  const requester = msg.author.username

  // Need to determine what type of message I got
  if (msg.content.startsWith('!cough')) {
    const coughee = msg.content.replace('!cough ', '')
    cough(requester, coughee, msg)
  } else if (msg.content.startsWith('!list')) {
    getAllCoughsByName(requester, msg)
  } else if (msg.content.startsWith('!rest')) {
    takeARest(requester, msg)
  }
})

async function takeARest (requester, msg) {
  const id = await getidByName(requester)
  const sql = 'DELETE FROM interactions WHERE cougher_id = ?'
  const resp = await connection.query(sql, id)
  if (resp === undefined || resp.warningStatus !== 0) {
    console.error(resp)
  } else {
    msg.channel.send(requester + ' took a rest')
  }
}

async function getAllCoughsByName (cougher, msg) {
  const cougherId = await checkPerson(cougher, 1)
  const sql = 'SELECT coughee_id FROM interactions where cougher_id = ?'
  const resp = await connection.query(sql, [cougherId])
  const ids = []
  resp.forEach((interaction) => {
    ids.push(interaction.coughee_id)
  })
  const names = await getNamesByIDs(ids)
  msg.channel.send(cougher + ' coughed on: ' + names.join(', ') + ' today.')
}

async function getNamesByIDs (idList) {
  const sql = 'SELECT name FROM people p WHERE p.id IN ( ' + idList.toString() + ');'
  const resp = await connection.query(sql)
  const { meta, ...ret } = resp
  const fin = []
  for (const result in ret) {
    fin.push(ret[result].name)
  }
  return fin
}

async function getNameByID (id) {
  const sql = 'SELECT name FROM people WHERE id = ?'
  const [resp] = await connection.query(sql, [id])
  return resp
}

async function checkCough (cougherId, cougheeId) {
  const sql = 'SELECT id FROM interactions WHERE cougher_id = ? AND coughee_id = ?'
  const resp = await connection.query(sql, [cougherId, cougheeId])
  if (typeof resp[0] === 'undefined') {
    return false
  } else {
    return true
  }
}

async function cough (cougher, coughee, msg) {
  const cougherId = await checkPerson(cougher, 1)
  const cougheeId = await checkPerson(coughee, 0)
  const beenCoughed = await checkCough(cougherId, cougheeId)
  // Need to check if they already have been coughed on
  if (!beenCoughed) {
    const sql = 'INSERT INTO interactions (cougher_id, coughee_id) VALUES (?, ?)'
    const ids = [cougherId, cougheeId]
    const resp = await connection.query(sql, ids)
    if (resp === undefined || resp.warningStatus !== 0) {
      console.error(resp)
      return false
    } else {
      msg.channel.send(cougher + ' coughed on ' + coughee)
    }
  } else {
    msg.channel.send(cougher + ' already coughed on ' + coughee)
  }
}

async function checkPerson (name, cancough) {
  if (await getidByName(name) === -1) {
    return insertPerson(name, cancough)
  } else {
    return await getidByName(name)
  }
}

async function insertPerson (name, cancough) {
  const sql = 'INSERT INTO people (name, cancough) VALUES (?, ?)'
  const resp = await connection.query(sql, [name, cancough])
  if (resp === undefined || resp.warningStatus !== 0) {
    console.error(resp)
    return -1
  } else {
    console.log(resp)
    return await getidByName(name)
  }
}

async function getidByName (name) {
  const sql = 'SELECT id FROM people WHERE name = ?'
  const [rows] = await connection.query(sql, [name])
  if (rows === undefined) {
    return -1
  } else {
    return rows.id
  }
}
