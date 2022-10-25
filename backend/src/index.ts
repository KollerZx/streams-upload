import http from 'http'
import express from 'express'
import { Server } from 'socket.io'

import {routes} from './routes'
import { logger } from './utils'

/* TODO: Configurar cors */
const PORT = 3000
const app = express()

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