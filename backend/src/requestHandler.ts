import { Request, Response } from 'express'
import { pipeline } from 'node:stream/promises'

import { io } from './index'
import { UploadHandler } from './UploadHandler'
import { logger } from './utils'

export async function requestHandler(req: Request, res: Response){
  const {socketId} = req.query
  const headers = req.headers

  const uploadHandler = new UploadHandler(io, String(socketId))
  
  const onFinish = (req: Request, res: Response) => () => {
    io.to(String(socketId)).emit('upload-finish', 'Files uploaded success!')
    res.status(200).end()
  }

  const busboy = uploadHandler.registerEvents(headers, onFinish(req, res))

  await pipeline(
    req,
    busboy
  )

  logger.info('Request finished with success')
} 