import { BrowserRouter,Routes,Route } from "react-router-dom";
import { Chatroom } from "./components/chatroom";
import { Landing } from "./components/landing";
import { useState } from "react";
import { Error } from "./components/error";
const App=()=>{
  const [roomId,setRoomId]=useState('');
  const [create,setCreate]=useState('');
  return <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing setRoomId={setRoomId} setCreate={setCreate}/>}/>
        <Route path="/chatroom/:roomId" element={<Chatroom roomId={roomId} create={create}/>}/>
        <Route path="*" element={<Error/>}/>
      </Routes>
    </BrowserRouter>
  </>
}

export default App;