import {io} from 'socket.io-client'
const url = 'http://localhost:3333'
export const socket = io(url, { transports: ['websocket', 'pooling']} )