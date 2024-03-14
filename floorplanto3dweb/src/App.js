import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { FS_URL, checkSpeckleAuthStatus, exchangeAccessCode, getUserData, goToSpeckleAuthPage } from './Speckle/SpeckleUtils.js';
import Viewer from './Viewer/Viewer.js';

function handleResponse(outputs, viewer){
  for (let o=0; o<outputs.length; o++){
    
  }
}

function App() {

  // Set states
  const [userData, setUserData] = useState({})
  const viewerRef = useRef(null)

  // Trigger the hidden input field
  const triggerFileInput = () => {
    document.getElementById('fileInput').click()
  };

  // Logout
  // Iterate over all items in localStorage
  const SpeckleLogout = () => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      // Check if the key contains the specified string
      if (key.includes(process.env.REACT_APP_SPECKLE_NAME)) {
          // Remove the item from localStorage
          localStorage.removeItem(key)
      }
    }
    setUserData(null)
    window.location.href = process.env.REACT_APP_FRONTEND_URL
  }

  // Handle the file input change
  const handleFileChange = async (e) => {
    const files = e.target.files // Get the file from the event

    if (files.length > 0) {
      const formData = new FormData()
      
      // Append each file to 'images' key
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i])
      }
  
      const response = await fetch(FS_URL + '/ft3d', {
        method: 'POST',
        body: formData,
      });
  
      // Handle response...
      const result = await response.json();
      if (result['Response'] === "Success"){
        console.log(result["output"])
        if (Array.isArray(result["output"])){
          handleResponse(result["output"], viewerRef.current)
        }

        else {
          console.warn("Output is not an array of folder paths.")
        }
      }
    }
  }
  
  function getQueryParams() {
      return new URLSearchParams(window.location.search)
  }

  useEffect(()=>{
    async function activateNavigationGuard(location) {
      const currentPath = location;
      const query = getQueryParams()
      // Perform your "beforeEach" logic here
      console.log(`Navigating to ${currentPath}`)
      const access_code = query.get('access_code')
      console.log(`Access code : ${access_code}`)
    
      // If route contains an access code, exchange it
      if (access_code) {
        try{
          await exchangeAccessCode(access_code)
        }
    
        catch (error) {
          console.warn('Exchange failed', error)
        }
      }
    }
    
    /**
     * Checks speckle authentication status.
     * If unauthenticated, activate navigation guard which checks for access code in the window.location.href
     * Get user data and setUserData.
     */
    async function checkSpeckleAuth(){
      try {
        const authState = checkSpeckleAuthStatus()
        if (!authState){
          await activateNavigationGuard(window.location.href)
        }
        const res = await getUserData()
        setUserData(res)
      }
  
      catch (e){
        console.warn("Authentication failed.")
        SpeckleLogout()
      }
    }

    // Only create a new Viewer if one doesn't already exist
    if (!viewerRef.current) {
      try {
        const appDiv = document.getElementById("ft3d-app");
        viewerRef.current = new Viewer(appDiv);
        checkSpeckleAuth();
      } catch (e) {
        console.warn(e);
      }
    }
  }, [])

  return (
    <div className="flex flex-col w-screen h-screen place-items-center relative overflow-hidden" id='ft3d-app'>
      {/* NAV BAR START */}
      <div id='nav-bar' className='flex w-full h-18 max-h-18 bg-blue-700 p-3 justify-between'>
        { Object.keys(userData).length === 0 ? // If user data is null show login prompt
          <div className='flex flex-col place-items-center'>
            <button id='navbar-speckle-login' className='speckle-login' onClick={()=> goToSpeckleAuthPage() }>Login</button>
          </div>
          :
          <div className='flex flex-row gap-x-5 place-items-center'>
            <button id='navbar-speckle-logout' className='speckle-login' onClick={()=> SpeckleLogout() }>Logout</button>
            <div id='navbar-speckle-user' className='text-white font-medium text-2xl'> {userData.data.user.name} </div>
          </div>
          }
      </div>
      {/* NAV BAR END */}
      
      {/* ACTION BUTTONS START */}
      { Object.keys(userData).length === 0 ? // If user data is null show login prompt
      <div className='grid grid-cols-3 place-items-center w-screen h-fit absolute bottom-5'>
        <div></div>
        <div className='flex flex-col gap-y-5 place-items-center'>
          <h3>Please login to Speckle to continue</h3>
          <button id='prompt-speckle-login' className='speckle-login' onClick={()=> goToSpeckleAuthPage() }>Login</button>
        </div>
        <div></div>
      </div>
      :
      <div className='grid grid-cols-3 place-items-center w-screen h-fit absolute bottom-5'>
        <div></div>
        <div id='action-buttons-container' className='absolute left-1/2 bottom-5'>
          <button id='upload-image' className='rounded-2xl border-2 border-gray-300 bg-blue-700 py-3 px-5 w-fit text-white font-medium' onClick={triggerFileInput}>
            Upload Image
          </button>
        </div>
        <div></div>
      </div>

      }
      {/* ACTION BUTTONS END */}

      <input
        type='file'
        id='fileInput'
        style={{ display: 'none' }} // Hide the input field
        onChange={handleFileChange}
        accept="image/png, image/gif, image/jpeg" // Accept only image files
      />

    </div>
  );
}

export default App;
