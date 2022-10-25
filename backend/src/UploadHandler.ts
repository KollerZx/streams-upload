import path from 'node:path'
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs'
import { IncomingHttpHeaders } from 'node:http';
import { Readable } from 'node:stream';

import { Server as Socket } from 'socket.io';
import Busboy, { FileInfo } from "busboy";

import { logger } from "./utils";

const ON_UPLOADED_EVENT = 'file-uploaded'

export class UploadHandler{
  
  constructor(private io: Socket, private socketId: string){}

/* TODO: Implementar método para realizar o upload para um serviço em nuvem
    seguindo o mesmo fluxo, sob demanda
 */

  private handleFileBytes(filename: string){

     async function * handleData(this: UploadHandler, data: any){
      for await(const item of data){
        const size = item.length
        this.io.to(this.socketId).emit(ON_UPLOADED_EVENT, size)
        logger.info(`File [${filename}] got ${size} bytes to ${this.socketId}`)
        yield item
      }
    }
    return handleData.bind(this)
  }
  
  private async onFIle(name: string, file: Readable, info: FileInfo)  {
    const { filename } = info;

    const saveFileTo = path.resolve(path.dirname('./'), 'downloads', filename)
    logger.info('Uploading %s', saveFileTo)


    await pipeline(
      file,
      this.handleFileBytes.apply(this, [ filename ]),
      createWriteStream(saveFileTo)
    )

    logger.info(`File [${filename}] finished`)
  }
  
  registerEvents(headers: IncomingHttpHeaders, onFinish: () => void){
    const busboy = Busboy({headers})

    busboy.on('file', this.onFIle.bind(this))

    busboy.on('finish', onFinish)

    return busboy
  }
}