import { WebSocketServer,WebSocket } from "ws";
const PORT = parseInt(process.env.PORT||"1000",10);
const wss=new WebSocketServer({port:8080});

let allSockets : Map<string,WebSocket[]>=new Map(); 
let userRoom : Map<WebSocket,string>=new Map();

wss.on("connection",function(socket){
    
    socket.on("message",(message)=>{
        try{
            const parsedMessage=JSON.parse(message as unknown as string);
            // Creating a new room
            if(parsedMessage.type==="create"){
                const roomId=parsedMessage.payload.roomId;
                const username=parsedMessage.payload.username;
                userRoom.set(socket,roomId);
                allSockets.set(roomId,[socket]);
                const socketArr=allSockets.get(roomId as string);
                socketArr?.forEach(e=>{
                    e.send(JSON.stringify({
                        status:"success",
                        payload:{
                            username:username
                        }  
                    }));
                })
            }
            // Joining an existing room
            else if(parsedMessage.type==="join"){
                const roomId=parsedMessage.payload.roomId;
                const username=parsedMessage.payload.username;
                userRoom.set(socket,roomId);
                if(allSockets.has(roomId)){
                    allSockets.get(roomId)?.push(socket);
                    const socketArr=allSockets.get(roomId as string);
                    socketArr?.forEach(e=>{
                        e.send(JSON.stringify({
                            status:"success",
                            payload:{
                                username:username
                            }  
                        }));
                    })
                }
                else{
                    socket.send(JSON.stringify({
                        status:'error'
                    }))
                }
            }
            // Sending a message to the room
            else if(parsedMessage.type==="chat"){
                const roomId=userRoom.get(socket);
                const msg=parsedMessage.payload.message.toString();
                const username=parsedMessage.payload.username.toString();
                const senderId=parsedMessage.payload.senderId;
                const socketArr=allSockets.get(roomId as string);
                socketArr?.forEach(e=>{
                    e.send(JSON.stringify({
                      status:'chat',
                      payload:{
                        message:msg,
                        username:username,
                        senderId:senderId
                      }  
                    }));
                })
            }
            else if(parsedMessage.type==='close'){
                const roomId=userRoom.get(socket);
                const senderId=parsedMessage.payload.senderId;
                const username=parsedMessage.payload.username.toString();
                const socketArr=allSockets.get(roomId as string);
                socketArr?.forEach(e=>{
                    e.send(JSON.stringify({
                      status:'close',
                      payload:{
                        senderId:senderId,
                        username:username
                      }  
                    }));
                })
            }
        }
        catch(e){
            socket.send(JSON.stringify({
                status:"error",
                payload:{
                   message:"Error occured in joining or creating room"
                }
            }))
        }    
    })

    // on connection loss removing socket from the room
    socket.on('close',()=>{
        try{
            const roomId=userRoom.get(socket);
            userRoom.delete(socket);
            console.log('Connection Removed');
            if(roomId && allSockets.has(roomId as string)){
                const socketArr=allSockets.get(roomId as string);
                if(socketArr){
                    allSockets.set(roomId,socketArr.filter(x=>x!=socket));
                    const newSocketArr=allSockets.get(roomId as string);
                }
            }

        }
        catch(e){
            
            socket.send(JSON.stringify({
                status:"error",
                payload:{
                   message:"Error occured in removing connection"
                }
            }))
        }
    })

})

