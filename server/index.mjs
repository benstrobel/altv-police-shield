import * as alt from 'alt-server';

// --------------  Call these methods from your framework (serverside) --------------------

alt.on("Server:Shield:giveShield", (targetPlayer, riotshield) =>{
    let shieldType = riotshield ? 0 : 1;
    targetPlayer.setStreamSyncedMeta("shield", shieldType);
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