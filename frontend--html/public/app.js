let bytesAmount = 0
const API_URL = 'http://localhost:3000'
const ON_UPLOADED_EVENT = 'file-uploaded'

/* Buscar explicação do algoritmo no stack Overflow 
  o valor retornado não é exato
*/
const formatBytes = (bytes, decimals = 2) => {
  if(bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return(
    parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  )
}

const updateStatus = (size) =>{
  const text = `Pending Bytes to Upload: <strong>${formatBytes(size)}</strong>`
  document.getElementById("size").innerHTML = text
}

const showSize = () => {
  const {files: fileElements} = document.getElementById('file')
  if(!fileElements.length) return
  const files = Array.from(fileElements)
  const {size} = files
                .reduce((prev, next) => ({ size: prev.size + next.size}), { size: 0})
  bytesAmount = size
  updateStatus(bytesAmount)
}

const updateMessage = (msg) => {
  const message = document.getElementById('msg')
  message.innerText = msg
  message.classList.add('alert', 'alert-success')

  setTimeout(() => (message.hidden = true), 3000)
}

const showMessage = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const serverMessage = urlParams.get('msg')
  if(!serverMessage) return

  updateMessage(serverMessage)
}

const configureForm = (targetUrl) => {
  const form = document.getElementById('form')
  form.action = targetUrl
}

const onload = () => {
  showMessage()

  /* Socket.io Version: 3.1.1 */
  const ioClient = io.connect(API_URL, { withCredentials: false})
  ioClient.on('connect', (msg) => {
    console.log('connected', ioClient.id)
    const targetUrl = API_URL + `?socketId=${ioClient.id}`
    configureForm(targetUrl)
  })

  ioClient.on(ON_UPLOADED_EVENT, (bytesReceived) => {
    console.log('received', bytesReceived)
    bytesAmount = bytesAmount - bytesReceived
    updateStatus(bytesAmount)
  })

  updateStatus(0)
}

window.onload = onload
window.showSize = showSize