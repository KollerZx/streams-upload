import http from 'http'
import express, { json, urlencoded } from 'express'
import { Server } from 'socket.io'
import cors from 'cors'

import {routes} from './routes'
import { logger } from './utils'

/* TODO: Configurar cors */
const PORT = 3000
const app = express()

app.use(cors())
app.use(urlencoded({extended:true}))
app.use(json())
app.use(routes)

const server = http.createServer(app)

const io = new Server(server, {
  cors:{
    origin: "*",
    credentials: false
  }
})

io.on('connection', (socket) => logger.info('someone connected %s', socket.id))

server.listen(PORT, () => logger.info('server running'))

export {io}