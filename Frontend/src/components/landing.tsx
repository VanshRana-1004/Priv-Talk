import * as dotenv from 'dotenv';
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { generateRoom } from "../../utils/generate";
import { Logo } from './logo';
import { toast,ToastContainer } from 'react-toastify';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface params{
    setRoomId : (x : string)=>void,
    setCreate : (x : string)=>void
}

export function Landing(props : params){
    
    const wsRef=useRef<WebSocket | null>(null);
    const inputRef=useRef();
    const navigate=useNavigate();
    const [refresh,setRefesh]=useState(false);
    const [info,setInfo]=useState(true);
    const [box,setBox]=useState(true);
    const [bp,setBp]=useState(1200);
    const [curh,setCurh]=useState('');
    const [curw,setCurw]=useState('');
    

    useEffect(()=>{
        const handleResize=()=>{
            const curw=window.innerWidth;
            const curh=window.innerHeight;
            setCurh(curh.toString());
            setCurw(curw.toString());
            if(curw<780) setBp(780);
            else if(curw<1100) setBp(1100);
            else setBp(1200);
        }
        handleResize();
        window.addEventListener('resize',handleResize);
        return ()=>{
            window.removeEventListener('resize',handleResize);
        }
    },[bp]);

    useEffect(()=>{
        setTimeout(()=>{
            setInfo(false);
        },1000);
        setTimeout(()=>{
            setBox(false);
        },500);
        try{
            wsRef.current=new WebSocket(backendUrl);
            wsRef.current.onopen=()=>{
            }
        }catch(e){
            setRefesh(!refresh);
        }
        return ()=>{
            wsRef.current?.close();
        }
    },[refresh]);
    
    function joinRoom(){
        if(wsRef.current?.readyState === WebSocket.CLOSED){
            toast.error(`Server is not listening, please refresh!`,{
                position: "top-center",
                className: "absolute ",
                autoClose: 2000,
            })
            // alert('Server is not listening, please refresh!')
            setRefesh(!refresh)
            return;
        }
        let roomId='';
        if(inputRef && inputRef.current) roomId=inputRef.current.value;
        if(roomId==''){
            toast.error(`roomId can't be empty`,{
                position: "top-center",
                className: "absolute ",
                autoClose: 2000,
            })
            // alert("roomId can't be empty");
            return;
        }
        if(wsRef.current?.readyState === WebSocket.OPEN){
            wsRef.current?.send(JSON.stringify({
                type:'join',
                payload : {
                    roomId:roomId
                }
            }));
            wsRef.current.onmessage=(event)=>{
                const parsedData=JSON.parse(event.data);
                if(parsedData.status=='error'){
                    toast.error(`Either invalid roomId or room closed`,{
                        position: "top-center",
                        className: "absolute ",
                        autoClose: 2000,
                    })
                    // alert('Either invalid roomId or room closed');
                    return;
                }
                else if(parsedData.status=='success'){
                    props.setCreate('join');
                    props.setRoomId(roomId);
                    localStorage.setItem('roomId',roomId);
                    navigate('/chatroom');
                }
            }
        }        
    }

    function createRoom(){
        if(wsRef.current?.readyState === WebSocket.CLOSED){
            toast.error(`Server is not listening, please refresh!`,{
                position: "top-center",
                className: "absolute ",
                autoClose: 2000,
            })
            // alert('Server is not listening, please refresh!')
            setRefesh(!refresh)
            return;
        }
        const roomId=generateRoom();
        if(wsRef.current?.readyState === WebSocket.OPEN){
            wsRef.current?.send(JSON.stringify({
                type:'create',
                payload:{
                    roomId:roomId
                }
            }))
            wsRef.current.onmessage=(event)=>{
                const parsedData=JSON.parse(event.data);
                if(parsedData.status=='error'){
                    toast.error(`unable to create room please refresh`,{
                        position: "top-center",
                        className: "absolute ",
                        autoClose: 2000,
                    })
                    // alert('unable to create room please refresh');
                    return;
                }
                else if(parsedData.status=='success'){
                    props.setCreate('create');
                    props.setRoomId(roomId);
                    localStorage.setItem('roomId',roomId);
                    navigate('/chatroom');
                }
            }        
        }
    }

    const style='playfair-display-normal text-gray-200  font-semibold flex flex-wrap w-[520px]';

    return <div className={`w-[100%] h-[100%] ${bp==1200?'flex py-5 pb-2 px-24 pl-12':'flex flex-col py-10 px-6'} `} 
            style={{ backgroundImage: `${bp==1200?'url(landing.png)':'url(solidbg.png)'}`, backgroundSize: 'cover', backgroundPosition: 'center',width:`${curw}px`,height:`${curh}px`,backgroundRepeat: 'repeat' }}>
        <ToastContainer/>        
        <div className={`${bp==1200?'w-2/3':'w-full '} flex justify-baseline items-start`}>
            <Logo/>
        </div>

        {bp>=1100
        ?
        <div className={`flex flex-1 flex-col pt-16  gap-14 items-center`}>
            <div className='flex flex-col'>
                <p className={`${style} text-4xl ${info?'opacity-0':'opacity-100'} duration-1000`}>Create, share chat rooms, and enjoy private, history-free conversations.</p>
            </div>
            <div className={`${box?'opacity-0':'opacity-100'} h-auto  py-10 gap-10 px-15 duration-1000 flex flex-col glass-container shadow shadow-indigo-400  rounded-xl items-center`}>
                <p className={`playwrite-in-bold text-gray-50 font-semibold animate-text text-2xl h-14`}>Your chat room awaits!</p>
                <input ref={inputRef} type="text" placeholder="Enter roomId" className={`bg-purple-100 text-black rounded-xl py-3 text-xl flex  text-center w-60 font-semibold placeholder-gray-900`}/>
                <button onClick={joinRoom} className={` w-44  bg-purple-700 cursor-pointer text-white font-semibold  py-3 text-xl rounded-xl hover:bg-gray-100 hover:text-purple-700`}>Join Room</button>
                <button onClick={createRoom} className={` w-44  bg-purple-950 cursor-pointer text-white font-semibold  py-3 text-xl rounded-xl hover:bg-gray-100 hover:text-purple-700`}>Create Room</button>
            </div>
        </div>
        :
        <div className={`flex flex-1 flex-col pt-24  gap-14 items-center`}>
            <div className='flex flex-col'>
                <p className={`${style} text-5xl ${info?'opacity-0':'opacity-100'} duration-1000`}>Create, share chat rooms, and enjoy private, history-free conversations.</p>
            </div>
            <div className={`${box?'opacity-0':'opacity-100'} h-[540px] p-24  justify-between  duration-1000 flex flex-col glass-container shadow shadow-indigo-400  rounded-xl items-center`}>
                <p className={`playwrite-in-bold text-gray-50 font-semibold animate-text text-2xl h-14`}>Your chat room awaits!</p>
                <input ref={inputRef} type="text" placeholder="Enter roomId" className={`bg-purple-100 text-black rounded-xl py-3 text-xl flex  text-center w-60 font-semibold placeholder-gray-900`}/>
                <button onClick={joinRoom} className={` w-44  bg-purple-700 cursor-pointer text-white font-semibold  py-3 text-xl rounded-xl hover:bg-gray-100 hover:text-purple-700`}>Join Room</button>
                <button onClick={createRoom} className={` w-44  bg-purple-950 cursor-pointer text-white font-semibold  py-3 text-xl rounded-xl hover:bg-gray-100 hover:text-purple-700`}>Create Room</button>
            </div>
        </div>
        }
    </div>
}