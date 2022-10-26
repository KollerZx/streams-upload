import React, { useEffect, useState } from "react"
import { toast, Toaster } from "react-hot-toast"
import { io } from "socket.io-client"

import { api } from '../lib/api'

const socket = io('http://localhost:3000', {transports: ['websocket']})

export function Form(){
  const [bytesAmount, setBytesAmount] = useState(0)
  const [currentSocketId, setCurrentSocketId] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploadIsFinish, setUploadIsFinish] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('A user connected',socket.id)
      setCurrentSocketId(socket.id)
    })

    socket.on('disconnect', () => console.log('I am disconnected'))

    socket.on('file-uploaded', (bytesReceived:any) => {
      setBytesAmount(state => state - bytesReceived)
    })
  
    socket.on('upload-finish', (msg:string) => setUploadIsFinish(true))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('file-uploaded')
      socket.off('upload-finish')
    }
  },[])

  const formatBytes = (bytes:any, decimals = 2) => {
    if(bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
  
    return(
      parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    )
  }

  const updateSize = (files: File[]) => {
    const {size} = files
                .reduce((prev, next) => ({ size: prev.size + next.size}), { size: 0})
  
    setBytesAmount(size)
  }

  const convertFileListInArray = (filesList: FileList | null) =>{
    if(!filesList) return
    const files = Array.from(filesList)

    return files
  }

  const handleChangeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = convertFileListInArray(e.target.files)
    if(files){
      updateSize(files)
      setFiles(files)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/', files, {
        params:{
          socketId: currentSocketId
        },
        headers:{
          "Content-Type": "multipart/form-data"
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  const notify = () => toast.success('Upload Success!')
  
  useEffect(() =>{
    if(uploadIsFinish){
      notify()
      setUploadIsFinish(false)
    }
  },[uploadIsFinish])

  return(
    <div className="flex flex-col max-w-[1020px] mx-auto mt-8 p-8">
      <Toaster position="top-center"/>
      <form onSubmit={ handleSubmit}>
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300" htmlFor="multiple_files">Upload multiple files</label>
        <input className="block w-full text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
          id="multiple_files" 
          type="file" 
          multiple
          name="file"
          onChange={ handleChangeFiles }
          />
        <div className="flex gap-5 mt-5">
          <button type="submit" className="py-2 px-4 flex justify-center items-center bg-green-500 hover:bg-green-700 focus:ring-green-500 focus:ring-offset-green-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg ">
            <svg width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                <path d="M1344 1472q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm256 0q0-26-19-45t-45-19-45 19-19 45 19 45 45 19 45-19 19-45zm128-224v320q0 40-28 68t-68 28h-1472q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h427q21 56 70.5 92t110.5 36h256q61 0 110.5-36t70.5-92h427q40 0 68 28t28 68zm-325-648q-17 40-59 40h-256v448q0 26-19 45t-45 19h-256q-26 0-45-19t-19-45v-448h-256q-42 0-59-40-17-39 14-69l448-448q18-19 45-19t45 19l448 448q31 30 14 69z">
                </path>
            </svg>
            Upload
          </button>
          <button type="reset" className="py-2 px-4 flex justify-center items-center  bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg" >Reset</button>
        </div>
      </form>
      <output className="dark:text-gray-300 mt-5" id="size">
        <strong>Pending Bytes to Upload: {bytesAmount ? formatBytes(bytesAmount) : 0}</strong>  
      </output> 
  </div>
  )
}