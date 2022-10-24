import { pipeline } from 'node:stream/promises'
import { io } from './index.js'
import { UploadHandler } from './uploadHandler.js'
import { logger } from './utils.js'
export async function requestHandler(req, res){
  const {socketId} = req.query
  const headers = req.headers

  const uploadHandler = new UploadHandler(io, socketId)
  
  const onFinish = (req, res) => () => {
    res.status(303).redirect(`${req.headers.origin}?msg=Files uploaded success!`)
  }

  const busboy = uploadHandler.registerEvents(headers, onFinish(req, res))

  await pipeline(
    req,
    busboy
  )

  logger.info('Request finished with success')
} 