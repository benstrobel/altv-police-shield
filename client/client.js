import * as alt from 'alt';
import * as game from 'natives';

let animDict = "weapons@pistol@stealth"
let animName = "aim_2_idle_right"

var isShieldUp = false

alt.on('keydown', (key) => {
    if (key == 'L'.charCodeAt(0)){
        alt.emitServer("Debug");
    }
    if (key == 'G'.charCodeAt(0)){
        game.giveWeaponToPed(alt.Player.local.scriptID, 453432689, 0, false, true);
    }
});

// ----------- Interface Functions ----------------------

alt.on('keydown', (key) => {
    if (key == 2 && alt.Player.local.hasStreamSyncedMeta("shield")){
        isShieldUp = true
        playAnim(animDict,animName,-1,50,false);
        alt.emitServer("Server:Shield:shieldUp")
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
        if(value){
            createAndAttachShield(entity);
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
})

alt.onServer("Client:Shield:AddShieldAfterVehicle", () => {
    createAndAttachShield(alt.Player.local);
})

// ------------- Internal Functions --------------------

alt.everyTick(() => {
    if(alt.Player.local.hasMeta("shield")){
        game.disableControlAction(0,263,true);  //atack
        game.disableControlAction(0,264,true);  //atack
        game.disableControlAction(0,24,true);   //atack
        game.disableControlAction(0,25,true);   //aim
        game.disableControlAction(0,140,true);  //melee light
        game.disableControlAction(0,141,true);  //melee heavy
        game.disableControlAction(0,142,true);  //melee alternate
        game.disableControlAction(0,143,true);  //melee block
        if(isShieldUp){
            game.disableControlAction(0,22,true);   //jump
            game.disableControlAction(0,12,true);   //weaponwheel
            game.disableControlAction(0,13,true);   //weaponwheel
            game.disableControlAction(0,14,true);   //weaponwheel
            game.disableControlAction(0,15,true);   //weaponwheel
            game.disableControlAction(0,16,true);   //weaponwheel
            game.disableControlAction(0,17,true);   //weaponwheel
            game.disableControlAction(0,37,true);   //weaponwheel
            game.disableControlAction(0,158,true);  //weaponselect
            game.disableControlAction(0,159,true);  //weaponselect
            game.disableControlAction(0,160,true);  //weaponselect
            game.disableControlAction(0,161,true);  //weaponselect
            game.disableControlAction(0,162,true);  //weaponselect
            game.disableControlAction(0,163,true);  //weaponselect
            game.disableControlAction(0,164,true);  //weaponselect
            game.disableControlAction(0,165,true);  //weaponselect
            game.disableControlAction(0,166,true);  //weaponselect
            game.disableControlAction(0,261,true);  //weaponselect
            game.disableControlAction(0,262,true);  //weaponselect
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
        game.attachEntityToEntity(shield,targetPlayer.scriptID,game.getEntityBoneIndexByName(targetPlayer.scriptID, "BONETAG_L_FOREARM"), 0.2, 0.13, -0.1, 100, 0, 180, true, true, false, true, 1, true);
    }
}

function shieldDownPosition(targetPlayer){
    if(targetPlayer.hasMeta("shield")){
        var shield = targetPlayer.getMeta("shield");
        game.attachEntityToEntity(shield,targetPlayer.scriptID,game.getEntityBoneIndexByName(targetPlayer.scriptID, "BONETAG_L_FOREARM"), 0.2, 0, -0.1, 100, 0, 180, true, true, false, true, 1, true);
    }
}

function createAndAttachShield(targetPlayer){
    if(targetPlayer == alt.Player.local){
        game.giveWeaponToPed(alt.Player.local.scriptID, -1569615261, 0, false, true);
    }
    removeShield(targetPlayer)
    var shield = game.createObjectNoOffset(1141389967,targetPlayer.pos.x,targetPlayer.pos.y,targetPlayer.pos.z+1, false, false, false);
    targetPlayer.setMeta("shield", shield);
    shieldDownPosition(targetPlayer);
}

function removeShield(targetPlayer){
    if(targetPlayer.hasMeta("shield")){
        var shield = targetPlayer.getMeta("shield");
        game.detachEntity(shield, true, true);
        game.deleteEntity(shield);
        targetPlayer.deleteMeta("shield")
    }
}