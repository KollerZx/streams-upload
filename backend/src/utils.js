import pino from 'pino'
import pretty from 'pino-pretty'


const pinoPretty = pretty({
  ignore:"pid, hostname"
})

const logger = pino(pinoPretty)



export {logger}