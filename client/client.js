import * as alt from 'alt';
import * as game from 'natives';

let animDict = "weapons@pistol@stealth"
let animName = "aim_2_idle_right"

var isShieldUp = false

// ----------- Interface Functions ----------------------

alt.on('keydown', (key) => {
    if (key == 2 && alt.Player.local.hasStreamSyncedMeta("shield")){
        isShieldUp = true
        playAnim(animDict,animName,-1,50,false);
        alt.emitServer("Server:Shield:shieldUp")
        if(!game.isPedArmed(alt.Player.local.scriptID, 1)){
           game.giveWeaponToPed(alt.Player.local.scriptID, -1569615261, 0, false, true); 
        }
    }
});

alt.on('keyup', (key) => {
    if (key == 2 && alt.Player.local.hasStreamSyncedMeta("shield")){
        isShieldUp = false
        game.stopAnimTask(alt.Player.local.scriptID, animDict, animName, 1);
        alt.emitServer("Server:Shield:shieldDown")
    }
});

alt.on("streamSyncedMetaChange", (entity, key, value, oldValue)=> {
    if(key == "shield"){
        if(value == 0){
            createAndAttachShield(entity, true);
        }else if(value == 1) {
            createAndAttachShield(entity, false);
        }else{
            if(alt.Player.local == entity){
                game.stopAnimTask(alt.Player.local.scriptID, animDict, animName, 1);
            }
            removeShield(entity);
        }
    }else if(key == "shieldStatus"){
        if(value){
            shieldUpPosition(entity);
        }else{
            if(alt.Player.local == entity){
                game.stopAnimTask(alt.Player.local.scriptID, animDict, animName, 1);
            }
            shieldDownPosition(entity);
        }
    }
});

alt.onServer("Client:Shield:RemoveShieldForVehicle", () => {
    removeShield(alt.Player.local);
    game.stopAnimTask(alt.Player.local.scriptID, animDict, animName, 1);
})

alt.onServer("Client:Shield:AddShieldAfterVehicle", () => {
    if(alt.Player.local.hasStreamSyncedMeta("shield")){
        let riotshield = alt.Player.local.getStreamSyncedMeta("shield") == 0;
        createAndAttachShield(alt.Player.local, riotshield);
    }
})

// ------------- Internal Functions --------------------

alt.everyTick(() => {
    if(alt.Player.local.hasMeta("shield")){
        if(!game.isPedArmed(alt.Player.local.scriptID, 1)){
            game.disableControlAction(0,263,true);  //atack
            game.disableControlAction(0,264,true);  //atack
            game.disableControlAction(0,24,true);   //atack
            game.disableControlAction(0,140,true);  //melee light
            game.disableControlAction(0,141,true);  //melee heavy
            game.disableControlAction(0,142,true);  //melee alternate
            game.disableControlAction(0,143,true);  //melee block
        }
        game.disableControlAction(0,25,true);   //aim
        game.disableControlAction(0,257,true);   //aim
        if(isShieldUp){
            game.disableControlAction(0,22,true);   //jump
        }
    }
})

function playAnim(animDict, animName,duration,flag,lockpos){
    game.requestAnimDict(animDict);
    let interval = alt.setInterval(() => {
        if (game.hasAnimDictLoaded(animDict)) {
            alt.clearInterval(interval);
            game.taskPlayAnim(game.playerPedId(), animDict, animName, 1, 1, duration, flag, 0, lockpos, lockpos, lockpos);
        }
    }, 0);
}

function shieldUpPosition(targetPlayer){
    if(targetPlayer.hasMeta("shield")){
        var shield = targetPlayer.getMeta("shield");
        let varPos = alt.Player.local.getStreamSyncedMeta("shield") == 0 ? -0.1 : 0.13;
        game.attachEntityToEntity(shield,targetPlayer.scriptID,game.getEntityBoneIndexByName(targetPlayer.scriptID, "BONETAG_L_FOREARM"), 0.2, varPos, -0.1, 100, 1, 180, true, true, false, true, 1, true);
    }
}

function shieldDownPosition(targetPlayer){
    if(targetPlayer.hasMeta("shield")){
        var shield = targetPlayer.getMeta("shield");
        let varPos = alt.Player.local.getStreamSyncedMeta("shield") == 0 ? -0.07 : 0;
        let varPos2 = alt.Player.local.getStreamSyncedMeta("shield") == 0 ? -0.05 : -0.1;
        game.attachEntityToEntity(shield,targetPlayer.scriptID,game.getEntityBoneIndexByName(targetPlayer.scriptID, "BONETAG_L_FOREARM"), 0.2, varPos, varPos2, 100, 1, 180, true, true, false, true, 1, true);
    }
}

function createAndAttachShield(targetPlayer, riotshield){
    let objectId = riotshield ? -547381377 : 1141389967;
    if(targetPlayer == alt.Player.local){
        game.giveWeaponToPed(alt.Player.local.scriptID, -1569615261, 0, false, true);
        game.setCanPedEquipAllWeapons(alt.Player.local.scriptID, false);
        game.setCanPedEquipWeapon(alt.Player.local.scriptID,1737195953,true);
        game.setCanPedEquipWeapon(alt.Player.local.scriptID,-1569615261,true);
    }
    removeShield(targetPlayer)
    var shield = game.createObjectNoOffset(objectId,targetPlayer.pos.x,targetPlayer.pos.y,targetPlayer.pos.z+1, false, false, false);
    targetPlayer.setMeta("shield", shield);
    shieldDownPosition(targetPlayer);
}

function removeShield(targetPlayer){
    if(targetPlayer.hasMeta("shield")){
        if(targetPlayer == alt.Player.local){
            game.setCanPedEquipAllWeapons(alt.Player.local.scriptID, true);
        }
        var shield = targetPlayer.getMeta("shield");
        game.detachEntity(shield, true, true);
        game.deleteEntity(shield);
        targetPlayer.deleteMeta("shield")
    }
}