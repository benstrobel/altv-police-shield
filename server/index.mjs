import * as alt from 'alt-server';

var debug = false

alt.onClient("Debug", (player) => {
    if(debug){
        alt.emit("Server:Shield:removeShield", player)
        debug = false;
    }else{
        alt.emit("Server:Shield:giveShield", player)
        debug = true;
    }
})

// --------------  Call these methods from your framework (serverside) --------------------

alt.on("Server:Shield:giveShield", (targetPlayer) =>{
    targetPlayer.setStreamSyncedMeta("shield", true);
    targetPlayer.setStreamSyncedMeta("shieldStatus", false);
})

alt.on("Server:Shield:removeShield", (targetPlayer) =>{
    targetPlayer.deleteStreamSyncedMeta("shield");
    targetPlayer.deleteStreamSyncedMeta("shieldStatus");
})

// --------------- Internal methods, do not call from outside -----------------------

alt.onClient("Server:Shield:shieldUp", (player) => {
    if(player.hasStreamSyncedMeta("shield")){
        player.setStreamSyncedMeta("shieldStatus", true);
    }
})

alt.onClient("Server:Shield:shieldDown", (player) => {
    if(player.hasStreamSyncedMeta("shield")){
        player.setStreamSyncedMeta("shieldStatus", false);
    }
})

alt.on("playerEnteringVehicle", (player) => {
    if(player.hasStreamSyncedMeta("shield")){
        alt.emitClient(player,"Client:Shield:RemoveShieldForVehicle");
    }
})

alt.on("playerLeftVehicle", (player) => {
    if(player.hasStreamSyncedMeta("shield")){
        alt.emitClient(player,"Client:Shield:AddShieldAfterVehicle"); 
    }
})