export const generateRoom = ()=>{
    const roomId = Date.now().toString(36).slice(-6);
    return roomId;
}