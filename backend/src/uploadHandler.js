import path from 'node:path'
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs'

import Busboy from "busboy";

import { logger } from "./utils.js";

const ON_UPLOADED_EVENT = 'file-uploaded'

export class UploadHandler{
  #io
  #socketId
  constructor(io, socketId){
    this.#io = io
    this.#socketId = socketId
  }
/* TODO: Implementar método para realizar o upload para um serviço em nuvem
    seguindo o mesmo fluxo, sob demanda
 */
  #handleFileBytes(filename){
    async function * handleData(data){
      for await(const item of data){
        const size = item.length
        this.#io.to(this.#socketId).emit(ON_UPLOADED_EVENT, size)
        // logger.info(`File [${filename}] got ${size} bytes to ${this.#socketId}`)
        yield item
      }
    }
    return handleData.bind(this)
  }
  
/* 
busboy.on('file') -> Arquivo chega 
-> handleFileBytes() -> imprime os bytes de arquivo e retornar os bytes 
-> createWriteStream -> com os bytes que vão sendo retornados, 
  já vai concatenando os bytes até que o arquivo esteja completo*/


  async #onFIle(name, file, info)  {
    const { filename } = info;

    const saveFileTo = path.resolve(path.dirname('./'), 'downloads', filename)
    logger.info('Uploading %s', saveFileTo)


    await pipeline(
      file,
      this.#handleFileBytes.apply(this, [ filename ]),
      createWriteStream(saveFileTo)
    )

    logger.info(`File [${filename}] finished`)
  }
  
  registerEvents(headers, onFinish){
    const busboy = Busboy({headers})

    busboy.on('file', this.#onFIle.bind(this))

    busboy.on('finish', onFinish)

    return busboy
  }
}