import { BrowserRouter,Routes,Route } from "react-router-dom";
import { Chatroom } from "./components/chatroom";
import { Landing } from "./components/landing";
import { Error } from "./components/error"
import { useState } from "react";

const App=()=>{
  const [roomId,setRoomId]=useState('');
  const [create,setCreate]=useState('');
  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing setRoomId={setRoomId} setCreate={setCreate}/>}/>
        <Route path="/chatroom" element={<Chatroom roomId={roomId} create={create}/>}/>
        <Route path="*" element={<Error/>}/>
      </Routes>
    </BrowserRouter>
  </>
}

export default App;