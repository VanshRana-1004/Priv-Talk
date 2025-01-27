import * as dotenv from 'dotenv';
import { useEffect,useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Logo } from './logo';
import { toast,ToastContainer } from 'react-toastify';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface params{
  roomId : string,
  create : string
}

export function Chatroom(props : params){

  const [roomId,setRoomId]=useState(props.roomId);
  const navigate=useNavigate();
  const wsRef=useRef<WebSocket | null>(null);
  const[messages,setMessages]=useState([["Welcome!","System",'start']])
  const inputRef=useRef<string>();
  const [username,setUsername]=useState("");
  const nameRef=useRef();
  const [id,setId]=useState(Date.now());
  const containerRef=useRef(null);
  const [bp,setBp]=useState('dt');

  window.onload=()=>{
    setRoomId(localStorage.getItem('roomId'));
  }

  useEffect(()=>{
    const handleResize=()=>{
        const cur=window.innerWidth;
        if(cur<780) setBp('mp');
    }
    handleResize();
    window.addEventListener('resize',handleResize);
    return ()=>{
        window.removeEventListener('resize',handleResize);
      }
  },[]);

  useEffect(()=>{
    try{
      wsRef.current=new WebSocket(backendUrl);
      const create=(props.create=='create'?'created':'joined');
      wsRef.current.onopen=()=>{
        toast.success(`Room ${create} : `+roomId,{
          position: "top-center",
          className: "absolute ",
          autoClose: 2000,
        })
        // alert(`Room ${create} : `+roomId);
      }

      wsRef.current.onmessage=(event)=>{
        const data=JSON.parse(event.data);
        if(data.status=='success'){
          if(data.payload.username==undefined) return
          else setMessages((message)=>[...message,[`${data.payload.username} joined`,'','center']]);
        }
        else if(data.status=='error'){
          toast.error(`unable to open chat room, please refresh the page`,{
            position: "top-center",
            className: "absolute ",
            autoClose: 2000,
          })
          // alert('unable to open chat room, please refresh the page')
        }
        else if(data.status=='close'){
          if(data.payload.username==undefined) return
          else setMessages((message)=>[...message,[`${data.payload.username} leave`,'','center']]); 
        }
        else if(data.status=='chat'){
          let position='start';
          if(data.payload.senderId==id) position='end';
          setMessages((message)=>[...message,[data.payload.message,data.payload.username,position]]);
        }
      }

    }
    catch(e){
      toast.error(`server error, please refresh`,{
        position: "top-center",
        className: "absolute ",
        autoClose: 2000,
      })
      // alert('server error, please refresh');
    }

    return ()=>{
      wsRef.current?.close();
    }
  },[]);

  function sendMessage(){
    let msg='';
    if(inputRef.current){
      msg=inputRef.current.value;
      inputRef.current.value='';
    }     
    if(msg!=''){
      wsRef.current?.send(JSON.stringify({
        type:'chat',
        payload:{
          message:msg,
          username:username,
          senderId:id
        }
      }));
    }
  }

  function leaveRoom(){
    wsRef.current.send(JSON.stringify({
      type:'close',
      payload:{
        username:username
      }
    }))
    if(wsRef.current?.OPEN){
      wsRef.current.close();
      localStorage.removeItem('roomId');
      navigate('/')
    }
  }
  
  function setName(){
    let name = '';
    if(nameRef.current) name=nameRef.current.value;
    setUsername(name);   
    if(wsRef.current?.OPEN){ 
      wsRef.current.send(JSON.stringify({
        type:'join',
        payload:{
          roomId:roomId,
          username:name
        }
      }))
    }
  }

  function share(){
    navigator.clipboard.writeText(props.roomId);
    toast.success('roomId copied',{
      position: "top-center",
      className: "absolute ",
      autoClose: 2000,
    })
    // alert('roomId copied');
  }

  useEffect(()=>{
    if(containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  },[messages])

  return <div className="h-screen w-full overflow-hidden flex flex-col pt-3 px-1" style={{ backgroundImage: 'url(solidbg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <ToastContainer/>
    <div className={`flex ${bp=='mp'?'flex-col':''} justify-between items-start `}>
      <Logo/>
      {username && 
        <div className={`flex items-center justify-end self-center w-auto gap-5 ${bp=='mp'?'gap-0 justify-center':''}`}>
          <div className={`bg-purple-100 text-black rounded-xl py-1 flex text-lg justify-center w-48 ${bp=='mp'?'w-fit px-1':''} font-bold playfair-display-normal cursor-default`}>RoomId : {roomId}</div>
          <button onClick={share} className={`  w-32  bg-purple-700 cursor-pointer text-white text-md font-semibold  py-2 rounded-xl hover:bg-gray-100 hover:text-purple-700 ${bp=='mp'?'w-fit px-2':''}`}>Share</button>
          <button onClick={leaveRoom} className={`  w-32  bg-purple-700 cursor-pointer text-white text-md font-semibold  py-2 rounded-xl hover:bg-gray-100 hover:text-purple-700 ${bp=='mp'?'w-fit px-2':''}`}>Leave</button>
        </div>
      }
    </div>
    {username==''
    ?
    <div className=" flex flex-col glass-container  h-auto gap-5 px-5 py-8 shadow shadow-indigo-400 justify-around rounded-xl items-center w-auto m-auto">
      <p className='flex flex-wrap playfair-display-normal text-gray-50 text-3xl font-semibold'>Enter a name for yourself that others will see in the room.</p>
      <input ref={nameRef} type="text" placeholder="Enter Name " className="bg-purple-100 text-black rounded-xl py-2 flex text-lg text-center w-60 font-semibold placeholder-gray-900"/>
      <button onClick={setName} className="w-44  bg-purple-700 cursor-pointer text-white text-md font-semibold  py-3 rounded-xl hover:bg-gray-100 hover:text-purple-700">Continue</button>
      <button onClick={leaveRoom} className="w-44  bg-purple-950 cursor-pointer text-white text-md font-semibold  py-3 rounded-xl hover:bg-gray-100 hover:text-purple-700">Back</button>
    </div>
    :
    <div className=" h-[92%] w-full flex flex-col justify-baseline items-center font-sans font-semibold py-1 gap-2 px-5">
        <div ref={containerRef} className="glass-container shadow shadow-indigo-400 border rounded-xl flex flex-col p-4 gap-2 overflow-y-auto custom-scrollbar w-full h-full">
          {messages.map(([text,sender,position],index)=>(
            position=='center'
            ?<div key={index} className={` glass-container w-fit text-purple-800 px-4 py-1 rounded self-center animate-fadeIn flex-shrink-0`}>{text}</div>
            :<div key={index} className={` flex h-fit flex-col w-fit max-w-[90%] px-4 py-1 rounded-2xl flex-shrink-0 ${position=='start'?'rounded-bl-xs self-left animate-slideInLeft bg-gray-800 text-white':'rounded-br-xs self-end animate-slideInRight bg-white text-black'} `}>
              {position=='start' && <p className={`h-6 flex-shrink-0 text-sm self-${position}`}>{sender}</p>}
              <p className="flex flex-shrink-0 flex-wrap h-auto w-fit overflow-hidden text-lg ">{text}</p>
            </div>
          ))}
        </div>
        <div className="flex w-full h-12 gap-2">
          <input ref={inputRef} onKeyDown={(e)=>{if(e.key==="Enter"){sendMessage();}}} type="text" className="rounded flex-1 w-full bg-white text-black px-5 py-2"/>
          <button onClick={sendMessage} className={`w-32 ${bp=='mp'?'w-fit px-3':''}  bg-purple-700 cursor-pointer text-white text-md font-semibold  py-2 rounded-xl hover:bg-gray-100 hover:text-purple-700`}>Send</button>
        </div>
    </div>}
  </div>    
}