import * as Toast from '@radix-ui/react-toast';
import { X } from 'phosphor-react';

export function ToastUpload(){
  return(
    <Toast.Provider>
    <Toast.Root>
      <Toast.Title />
      <Toast.Description className="flex gap-5 items-center justify-between p-4 mt-5 mb-4 w-full max-w-xs text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
        <span>Upload Success</span>
        <Toast.Close asChild className='self-start'>
          <X size={16}/>
        </Toast.Close>
      </Toast.Description>
      <Toast.Action altText='Upload success' />
      
    </Toast.Root>

    <Toast.Viewport />
  </Toast.Provider>
  )
}