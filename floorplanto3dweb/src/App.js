import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [getMessage, setGetMessage] = useState({})
  useEffect(()=>{
    async function testfetch(){
      fetch('http://localhost:5000/flask/hello')
      .then(response => Promise.all([response.status, response.json()])) // Get both status and JSON data.
      .then(([status, data]) => {
          console.log("Status:", status)
          setGetMessage({ status, data }); // Update state with structured object
      })
      .catch(error => {
          console.log(error);
      });
    }

    testfetch()

  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>React + Flask Tutorial</p>
        <div>{getMessage.status === 200 ? 
          <h3>{getMessage.data.message}</h3>
          :
          <h3>LOADING</h3>}</div>
      </header>
    </div>
  );
}

export default App;
