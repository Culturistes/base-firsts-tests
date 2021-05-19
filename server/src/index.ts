import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import OwnRoom from './rooms/OwnRoom'

const port = Number(process.env.PORT) || 2567
const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const gameServer = new Server({
    server,
})

app.use('/colyseus', monitor())

gameServer.define("chat", OwnRoom)

gameServer.listen(port)
console.log(`Listening on ws://localhost:${port}`)