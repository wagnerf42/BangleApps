// basic directions
const LEFT = 0;
const UP = 1;
const DOWN = 2;
const RIGHT = 3;

const MAP_WIDTH = 5 * 32; // for the banglejs2
const MAP_HEIGHT = 5 * 32;

const INTRO_SCREEN = 0;
const MAIN_SCREEN = 1;
const DIED_SCREEN = 2;

function randint(start, end) {
  return start + Math.floor(Math.random() * (end - start + 1));
}

function go(position, direction) {
  if (direction == LEFT) {
    return { x: position.x - 1, y: position.y };
  } else if (direction == RIGHT) {
    return { x: position.x + 1, y: position.y };
  } else if (direction == UP) {
    return { x: position.x, y: position.y - 1 };
  } else {
    // direction is down
    return { x: position.x, y: position.y + 1 };
  }
}

Bangle.setOptions({
  lockTimeout: 60000,
  backlightTimeout: 60000,
});

let h = require("heatshrink");

// // check if the intervals touch
// function coordinates_touch(x1, w1, x2, w2) {
//     if (x1 < x2-2) {
//         return !((x1+w1) < x2-1);
//     } else if (x2 < x1-2) {
//         return !((x2+w2) < x1-1);
//     } else {
//         return true;
//     }
// }

// // check if the two given rooms touch or intersect
// function rooms_touch(room1, room2) {
//     return coordinates_touch(room1[0], room1[2], room2[0], room2[2]) && coordinates_touch(room1[1], room1[3], room2[1], room2[3]);
// }


const MONSTERS_IMAGES = [
  undefined,
  // knight (img 340)
  h.decompress(
    atob(
      "kEggmqiIACgFEAAIEBBIeqB58RokzmYOBmf/AoIQBAYIVBB6AOCBAIOCGIIPCCgIPRAwJJEHAIPX/4wCAoPdJ4YPX93uGoQACB63dFIXdKoQPVFIVVAAK0BCAIPVAALPDogCBJ4wPPJIILCB4IBBB6xKBegVEJgPdBAIPTSAQGCdwVVN4oPRAAcRNwgPSE4JHBFATtEKoQPP1QLBAAbMCqqXCBwIPPgAQBAAhUFBwIPP"
    )
  ),
  // newt (img 326)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYAKogRBB54HEJwoICB6sAqvdAgPdqoQCB6gOBFoYTBCAQPVJIYFBGIIPXCYlVB7ANEOIJPIB6CffBoYOBK4YPTBwlVWYRvGB5wOCAQJLCAIQPVNgIoBFggACB6NEEwQKCeYtEB6GqCAIAKBwIPPgAQBABQOBB54A=="
    )
  ),
  // ant (img 0)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYAKogRBB54JGJwYGCB6YIDgHd93diIHCB6YRDiPu91VqoPUJAgPC7tVF4oPPNg8RFwYPTBgZtCeAgPSRgxNEK4QPQJoqMBPAQPVgH/qotBBAINDN4oPPmYsB/6zDCAYPSIgVVBgoPUohwERYYDCogPQ1QQBAA0AAYQOBB58ACAIAKBwIPP"
    )
  ),
  // wolf (img 20)
  h.decompress(atob("kEggmqiMAiIAFB4QEB1QPPiNEmcAmYACAgQOBgFECIIPPA4NEBYYSDBoIxCB6AOBAAQ1BB4YKBB6QLCCQQCDA4QPTFIX/BIQyDOYQPRCAP/FIRMBB6orB5gNBZgQPBS4gPR5inCGAILBGQQPUNAIOBdITTGB6BvCCQTPEVgIdCB6AQCNwQGBaITQDB6QOBAgSOCAAYPQUoSoFCoZ6BB5+qJYTMCGIoOCB58ACAIADJQgABBwIPPA")),
];

const KNIGHT = 1;
const FLOOR = 848;
const NEWT = 2;
const ANT = 3;
const WOLF = 4;
const EXIT = 100;
const FOOD = 101;
const GOLD = 102;
const LIFE_POTION = 103;
const TOMBSTONE = 104;
const DAGGER = 105;
const SWORD = 106;
const LEATHER_HELMET = 107;

function random_item(dungeon_level) {
  return [DAGGER, SWORD, LEATHER_HELMET, FOOD, LIFE_POTION][randint(0, 4)];
}

const MISC_IMAGES = [
  // exit (img 852)
  h.decompress(
    atob(
      "kEgggjgmYAMB63/AAQPWiIADB4YIEB6WqogvHomqB6WqB4fuBwPuB4eqB6IvBAAQwCmYHDH4gPNAYURGIIPCogICH4YPOAYQPBogPBAYIPBH4oPNMYYABB4IFDP4oPNAgICBF4oKEB6ADBAILODGIQKDB6AAEBwgAKB55vGB7IA4"
    )
  ),
  // food (img 660)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiImCmYAIogRBB6FVB4RNECAYPSBgIBBs3u913swQDB6EA/8zxAOGGIYPRAYIPBogNDqpYBBgIPR/4wBNgdV7vumfdCIIPWBoMzBwQ6BGQQPPVgQNGGAgPQxAPCCAQsCBoNVfoQPOCIQDBBAIRBBoQOB1QPRJ4WqCAWqBwwPSR4QRBB4INCZ4QPQogQCCIYNDmdEB6ApBogAEBoIFDBwIPPJQQAKGgQPOA="
    )
  ),
  // gold (img 786)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYoCmYAGogRBB54OB93/9wQCCooPTBwPdBQIVGB6YADCowPU7ovECogPUAAw/MB5YvDNoY/LB5YADNoYPXF4YTFCAIPSGAhTEOAQPSNYyvJB55rDaYgACB6NEJ4YDEAAVEB6GqCAIAKBwIPPgAQBABQOBB54A=="
    )
  ),
  // life potion (img 664)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYAKogRBB54IFJYIHFB60A/4CBB7gACB7QuCAgQPZL8Pd5gPbBwXMqpfLB5sAqvuB4PMiIQDB6wvCGAoPViIPDF5QPOCAgOEB6VECAsABwlEB6GqCAIAKBwIPPgAQBABQOBB54="
    )
  ),
  // tombstone (img 856)
  h.decompress(
    atob(
      "kEggmqiIACBggIDiOqB58RokzBQMzAAYGDogRBB54HBBQYACAwQCBB6IEBJQQ0BFIIRCAIIPSBoYADCIgPSKIIAGCAQPTohqFAoQJBB6YJBA4QFHB6gBKB6hPGfIQPVJ4wVDB6gBGB61EFAIBFX44POiIJCAAobCB6GqQ4IAKBwIPPgGqGQIAJDoQPOA"
    )
  ),
  // dagger (img 417)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYAKogRBB54OLAAIP0RAIVIB6v/9wQHB6szCBAPUCBQPVCBIPWCAYCBB7QQBqvdCAYPYCAwPZeoQPUogQIAAVEB6GqCAIAKBwIPPgAQBABQOBB54A=="
    )
  ),
  // sword (img 411)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYAKogRBB54GDAggAEB6kAB74wJB6v/CBAPVxAQIB6gQFBQgPVCAh1BB7IQCB7wAB7oQDB7ACCqoECB64zFB6dECBIABogPQ1QQBABQOBB58ACAIAKBwIPP"
    )
  ),
  // leather helmet (img 465)
  h.decompress(
    atob(
      "kEggmqiIAM1QPPiNEmYAKogRBB54OLAAIPVNooPYgFV7sz7tViIQDB6YOFB4IQDB64ODqoPXCARNCAoIPXAIIPBAgQBCB66MDCgIPYKQR2DB7LUEZ5APOCAoyDB6dEFogAGogPQ1QQBABQOBB58ACAIAKBwIPPA="
    )
  ),
];

let HORIZONTAL_BORDER_IMAGE = h.decompress(
  atob(
    "kEgghC/AD8RAD0zAAQEB///A7VEEggHWogACA4IFDA6p/fPbwHCOZgPSPbIHEf/6Def/4A=="
  )
);
let VERTICAL_BORDER_IMAGE = h.decompress(
  atob(
    "kEgwkCmf/AIdEBoQDBiIDCB+AABB4MzB4YNBAIYPZCIYABB7JNDH5oPEN5APYGIRvKB7QDDB7LfIB57//f/7//f7gA=="
  )
);
const BORDER_IMAGES = [
  // ROCK
  h.decompress(
    atob(
      "kEggmqiIADBogID1QPPiNEmczBQPdAgPdqsAAgNECIIPPBwURBwQQGB6QsCqoQEqoQCB6JLDBQJICqoKBAIQPPgFVJYoCBBgQwBB6IuDBwNENoQOBGQQPQBIItDKIIuDB6bQB7pKBVgYABBwOqB6IEBRIXdohOCFgIOBP4QPPFwItCNo4PQUA4XBB4QvCB6EzaITOEF4czB6NECAQPBGAYOCogPQ1QQBohrEJgQJBAgIPPUYIJBQ4QADBATPCB5w"
    )
  ),
  VERTICAL_BORDER_IMAGE,
  HORIZONTAL_BORDER_IMAGE,
  //  *
  // **
  h.decompress(
    atob(
      "kEgggIF1QDCokAiIDCB6oADB7oxDB4IBBB58RABYTDB50zAAURmf//4GDKIYPSogPBAAYGBB6dEAAQPBAoYGBOIYPPN5hxCB6BrFOYZxFB6BsGOI4PQNYhzFOIYPPADzvKA4IFBB6xzIB6DvKA4YPQf74A=="
    )
  ),
  HORIZONTAL_BORDER_IMAGE,
  // *
  // **
  h.decompress(
    atob(
      "kEggkz/4BEBYOqCQoPYAAwPQAAINBAAItGB6tEiIAJB6YEB/4zDmYHGB5oBCEgYACGwIFDB6InCogAEA4YPRNpZvCB6BtFOY4PTNZAPTNoxzHB55tNAAIPPM4RrIA4YPRNZAHEB6JrJBY4PLgBuOB54="
    )
  ),
  HORIZONTAL_BORDER_IMAGE,
  //  *
  // ***
  h.decompress(
    atob(
      "kEgggIF1QCEABIPPAHMRAD0zAAQEB///A7VEEggHWogACA4IFDA6p/fPbwHCOZgPSPbIHEf/6Def/4A="
    )
  ),
  VERTICAL_BORDER_IMAGE,
  VERTICAL_BORDER_IMAGE,
  // **
  //  *
  h.decompress(
    atob(
      "kEgggqn1UAiIBEB64ABB6sRAAgtBCIoDCB50zAAVEAIINEAoIDBB99EAAQRCN5APPNocz/4PFCYgPOJoYPFJogPwNoZPHP4oPNNoaPFf44PNFoavHb4wPMNoZPHB6YvCN5gPQJoTvMB5wA=="
    )
  ),
  //  *
  // **
  //  *
  h.decompress(
    atob(
      "kEgggIF1QDCokAiIDCB6oADB78R1QPBAYIPPiIAECwoPBAYQPOmYACogBBOYgFBAYIPZNoYDBB59EAAQRCB4hxDB55tDmf/B4oTEB5xNDB4ptDAYIPbOIYPPNoZvGd4gPPNoYPFf44PNFgQPGNobfEB5htDV44PTNoYPHOIYPQJoTvMB5wA="
    )
  ),

  // **
  // *
  h.decompress(
    atob(
      "kEggkRmYADogSIB58z/4BDomqB7AABB4IvLB6+qiIAEB7AqD/4KCB55vFB4dETQgPRAYQPDiIQBAAQPbN4gPYAYQMDB6JvGAYRxDB56vIJ4RxCB7JxFB7ItCeYYPPN5APEZ4YPPZ5IBCB7YDDB54"
    )
  ),

  // *
  // **
  // *
  h.decompress(
    atob(
      "kEggkz/4BDogLB1QSFB7AAGB6AABB4MzB8WqiIAEB7AqD/4KCB55vJDYYPTAYQPDiMAogACB7IDBN4gPabgYPSN4wDCJoIPRV5BvBOIYPZOIoPZFoTTFB5pvIB4jPDB57vIAIYPbAYYPPA=="
    )
  ),

  // ***
  //  *
  h.decompress(
    atob(
      "kEgghC/AD8RAAmqBAOqBIoPPmYACogBBFQYIB///BwYPZAAwPLogACAoRpDgALDB55jE/4PFPo4PLJoYPFAYQIBLogPYBQQPPNoZPIOIgPNNoaPFOJAPMJoavIOIQPUJ4xxDB56RDN5IBBB6DCDB4wDDB54="
    )
  ),

  //  *
  // ***
  //  *
  h.decompress(
    atob(
      "kEgggIF1QCEABIPPAHMRAAhPDBIoPPmYACogBBFQYIB///BwYPXAwIAGB5dEAAQFCNIYQBAAwPLMYn/B4p9HB5ZNDB4oDCBAJdEB7BxFB5htDN45xFB5ptDB4pxIB5gsCB4wtCeYYPONoavHOIYPPGAbPIAIQPQYQYPGAYYPPA=="
    )
  ),
];

// brightness 0, contrast 70
let floor_img = h.decompress(
  atob(
    "kEggmqiIAM1QPPiNEmYAKogRBB54OLAAIP/B/4P/B/4P/B6NEBxdEB6GqCAIAKBwIPPgAQBABQOBB54="
  )
);

function random_monster(dungeon_level) {
  //TODO: have a min xp and max xp requirement instead
  if (dungeon_level <= 2) {
    return randint(NEWT, ANT);
  } else {
    return randint(NEWT, WOLF);
  }
}

// types of monster stats
const MAX_HP = 0;
const AC = 1;
const ATTACK = 2;
const SPEED = 3;
const DMG_DICES_NUM = 4;
const DMG_DICES = 5;
const DMG_BONUS = 6;
const XP = 7;
const REGENERATION = 8;

const MONSTERS = [null, "Player", "Newt", "Ant", "Wolf"];
const MONSTERS_STATS = [
  null,
  new Int16Array([10, 10, 4, 6, 1, 4, 0, 0, 100]), // Player
  new Int16Array([ 4, 10, 4, 8, 1, 4, 0, 200, 100]), // Newt
  new Int16Array([ 6, 10, 8, 10, 1, 2, 0, 100, 100]), // Ant
  new Int16Array([15, 10, 6, 4, 1, 4, 0, 400, 100]), // Wolf
]

class Creature {
  constructor(monster_type, position) {
    if (monster_type == KNIGHT) {
      this.gold = 0;
      this.level = 1;
      this.satiation = 800;
      this.stats = Int16Array(MONSTERS_STATS[monster_type]);
    } else {
      this.stats = MONSTERS_STATS[monster_type];
    }
    this.hp = this.stats[MAX_HP];
    this.position = position;
    this.monster_type = monster_type;
  }
  add_xp(xp) {
    let next_level_threshold = 1 << (9 + this.level);
    this.stats[XP] += xp;
    if (this.stats[XP] >= next_level_threshold) {
      // we level up
      this.level += 1;
      game.level_up();
    }
  }
  item_effect(item, picking) {
    // apply / remove effect of item on stats
    if (item == DAGGER) {
      //TODO: factorize code
      if (picking) {
        this.stats[ATTACK] += 2;
      } else {
        this.stats[ATTACK] -= 2;
      }
    } else if (item == SWORD) {
      if (picking) {
        this.stats[DMG_DICES_NUM] = 1;
        this.stats[DMG_DICES] = 6;
        this.stats[DMG_BONUS] = 0;
      } else {
        this.stats[DMG_DICES_NUM] = 1;
        this.stats[DMG_DICES] = 4;
        this.stats[DMG_BONUS] = 0;
      }
    } else if (item == LEATHER_HELMET) {
      //TODO: factorize code
      if (picking) {
        this.stats[AC] += 1;
      } else {
        this.stats[AC] -= 1;
      }
    } else {
      console.log("unknown item taking effect", item);
    }
  }
  treasure() {
    // let's have a 40% change of dropping something
    if (Math.random() < 0.4) {
      return [FOOD, GOLD, LIFE_POTION][randint(0, 2)];
    } else {
      return FLOOR;
    }
  }
  name() {
    return MONSTERS[this.monster_type];
  }
  move() {
    let player_x = game.player.position.x;
    let player_y = game.player.position.y;
    let xdiff = Math.abs(player_x - this.position.x);
    let ydiff = Math.abs(player_y - this.position.y);
    if ((xdiff == 1 && ydiff == 0) || (xdiff == 0 && ydiff == 1)) {
      // we are just beside player, attack
      return this.attack(game.player);
    } else {
      if (this.monster_type <= WOLF) {
        if (xdiff * ydiff < 9) {
          if (xdiff != 0) {
            let destination = { x: this.position.x, y: this.position.y };
            if (player_x > this.position.x) {
              destination.x += 1;
            } else {
              destination.x -= 1;
            }
            if (game.map.get_cell(destination) == FLOOR) {
              game.map.move(this, destination);
            }
          }
          if (ydiff == 0) {
            return;
          }
          let destination = { x: this.position.x, y: this.position.y };
          if (player_y > this.position.y) {
            destination.y += 1;
          } else {
            destination.y -= 1;
          }
          if (game.map.get_cell(destination) == FLOOR) {
            game.map.move(this, destination);
          }
        }
      } else {
        console.log("TODO: move towards player");
      }
      return;
    }
  }
  attack(target) {
    if (randint(1, 20) + this.stats[ATTACK] >= target.stats[AC]) {
      // attack success
      let damages = this.stats[DMG_BONUS];
      for (let i = 0; i < this.stats[DMG_DICES_NUM]; i++) {
        damages += randint(1, this.stats[DMG_DICES]);
      }
      target.hp -= damages;
      if (target.hp <= 0) {
        // we kill it
        game.monsters = game.monsters.filter((m) => m.hp > 0);
        if (target.monster_type == KNIGHT) {
          game.map.set_cell(target.position, TOMBSTONE);
          game.msg("You die");
        } else {
          game.map.set_cell(target.position, target.treasure());
          game.msg(target.name() + " dies");
          this.add_xp(target.stats[XP]);
        }
      } else {
        if (target.monster_type == KNIGHT) {
          game.msg("you are hit(" + damages + ")");
        } else {
          game.msg(target.name() + " hit(" + damages + ")");
        }
      }
    } else {
      // attack miss
      if (target.monster_type != KNIGHT) {
        game.msg("you miss");
      } else {
        game.msg(target.name() + " missed");
      }
    }
  }
}

class Room {
  constructor(width, height) {
    this.width = randint(3, 5);
    this.height = randint(3, 5);
    this.x = randint(2, width - this.width - 2);
    this.y = randint(2, height - this.height - 2);
  }
  on_border(op) {
    for (let x = this.x - 1; x < this.x + this.width + 1; x++) {
      let pos = { x: x, y: this.y - 1 };
      op(pos);
      pos = { x: x, y: this.y + this.height };
      op(pos);
    }
    for (let y = this.y; y < this.y + this.height; y++) {
      let pos = { x: this.x - 1, y: y };
      op(pos);
      pos = { x: this.x + this.width, y: y };
      op(pos);
    }
  }
  random_x() {
    return randint(this.x, this.x + this.width - 1);
  }
  random_y() {
    return randint(this.y, this.y + this.height - 1);
  }
  random_free_position(map) {
    while (true) {
      let x = this.random_x();
      let y = this.random_y();
      if (map.get_cell({ x: x, y: y }) == FLOOR) {
        return { x: x, y: y };
      }
    }
  }
  random_inner_position(map) {
    let x = randint(this.x + 1, this.x + this.width - 2);
    let y = randint(this.y + 1, this.y + this.height - 2);
    if (map.get_cell({ x: x, y: y }) == FLOOR) {
      return { x: x, y: y };
    }
  }
}

class Map {
  constructor(width, height, monsters, player, dungeon_level) {
    this.width = width;
    this.height = height;
    this.seed = E.hwRand();
    this.level = dungeon_level;
    E.srand(this.seed);
    this.map = new Uint16Array(width * height);
    let rooms_number = 4;
    let rooms = [];
    for (let r = 0; r < rooms_number; r++) {
      let room = new Room(width, height);
      this.fill_room(room);
      rooms.push(room);
    }
    this.generate_corridors(rooms);
    this.fill_borders();

    // first, place the exit somewhere not near a wall.
    // we place it first to be 100% sure it is a free space.
    let last_room = rooms[rooms.length - 1];
    this.set_cell(last_room.random_inner_position(this), EXIT);

    let first_room = rooms[0];
    player.position = first_room.random_free_position(this);
    this.set_cell(player.position, KNIGHT);
    this.generate_monsters(rooms, monsters);

    // now generate some loot
    this.set_cell(
      rooms[randint(0, rooms.length - 1)].random_free_position(this),
      random_item()
    );

    this.rooms = rooms;
    this.hidden_room = this.find_hidden_room();
    this.secret = null;
    if (this.hidden_room !== null) {
      this.secret = this.find_secret(this.hidden_room);
    }
  }
  find_secret(room) {
    // find where to place a secret door around hidden room
    let candidates = [];
    for (let x = room.x; x < room.x + room.width; x++) {
      let pos = { x: x, y: room.y - 1 };
      let next_pos = { x: pos.x, y: pos.y - 1 };
      let c = this.get_cell(pos);
      if (c >= 200 && c < 300 && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
      pos = { x: x, y: room.y + room.height };
      next_pos = { x: pos.x, y: pos.y + 1 };
      c = this.get_cell(pos);
      if (c >= 200 && c < 300 && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
    }
    for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
      let pos = { x: room.x - 1, y: y };
      let next_pos = { x: pos.x - 1, y: pos.y };
      let c = this.get_cell(pos);
      if (c >= 200 && c < 300 && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
      pos = { x: room.x + room.width, y: y };
      next_pos = { x: pos.x + 1, y: pos.y };
      c = this.get_cell(pos);
      if (c >= 200 && c < 300 && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
    }
    return candidates[randint(0, candidates.length - 1)];
  }
  find_hidden_room() {
    //TODO: avoid having the highest leftmost one
    let target_width = 4;
    let target_height = 3;
    let map = this.map;
    // let's count the number of empty spaces above each x
    let counts = new Uint8Array(this.width);
    let p = this.width;
    for (let y = 1; y < this.height - 1; y++) {
      let good_heights = 0; // how many good heights to the left of above us
      for (let x = 1; x < this.width - 1; x++) {
        if (counts[x] >= target_height + 1) {
          good_heights += 1;
        } else {
          good_heights = 0;
        }
        if (map[p] == 0 || (map[p] >= 200 && map[p] <= 300)) {
          counts[x] += 1;
        } else {
          counts[x] = 0;
          if (map[p] == FLOOR && good_heights >= target_width) {
            let r = new Room();
            r.x = x - target_width + 1;
            r.y = y - target_height - 1;
            r.width = target_width;
            r.height = target_height;
            return r;
          }
        }
        p += 1;
      }
      p += 2;
    }
    return null;
  }
  // return if given position has a tile type which can be walked upon
  walkable(position) {
    if (!this.valid_position(position)) {
      return false;
    }
    let tile = this.get_cell(position);
    return tile != 0 && (tile < 200 || tile > 300);
  }
  compute_border_shapes(start_x, end_x, start_y, end_y) {
    let map = this.map;
    let w = this.width;
    // now, figure the shapes to use for border tiles
    for (let y = start_y; y < end_y; y++) {
      for (let x = start_x; x < end_x; x++) {
        let p = y * w + x;
        if (map[p] < 200 || map[p] >= 300) {
          continue;
        }
        let border_type = 0;
        if (map[p - w] >= 200 && map[p - w] < 300) {
          border_type += 1;
        }
        if (map[p - 1] >= 200 && map[p - 1] < 300) {
          border_type += 2;
        }
        if (map[p + 1] >= 200 && map[p + 1] < 300) {
          border_type += 4;
        }
        if (map[p + w] >= 200 && map[p + w] < 300) {
          border_type += 8;
        }
        map[p] = 200 + border_type;
      }
    }
  }
  fill_borders() {
    let map = this.map;
    let w = this.width;
    let neighbours = Int8Array([-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1]);
    // first, figure out which tiles are on the border
    for (let y = 1; y < this.height - 1; y++) {
      let p = y * w;
      for (let x = 1; x < this.width - 1; x++) {
        p += 1;
        if (map[p] == FLOOR) {
          for (let d = 0; d < 8; d++) {
            if (map[p + neighbours[d]] == 0) {
              map[p + neighbours[d]] = 200;
            }
          }
        }
      }
    }
    this.compute_border_shapes(1, this.width - 1, 1, this.height - 1);
  }
  generate_monsters(rooms, monsters) {
    let map = this;
    rooms.forEach((r) => {
      map.generate_monster(r, monsters);
    });
  }
  generate_monster(room, monsters) {
    //TODO: we need a way to fail
    let monster_position = room.random_free_position(this);
    let monster_type = random_monster(this.level);
    monsters.push(new Creature(monster_type, monster_position));
    this.set_cell(monster_position, monster_type);
  }
  fill_room(room) {
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        this.set_cell({ x: x, y: y }, FLOOR);
      }
    }
  }
  set_cell(position, content) {
    this.map[position.y * this.width + position.x] = content;
  }
  get_cell(position) {
    return this.map[position.y * this.width + position.x];
  }
  valid_position(position) {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    );
  }
  generate_corridors(rooms) {
    for (let i = 0; i < rooms.length - 1; i++) {
      this.join_rooms(rooms[i], rooms[i + 1]);
    }
  }
  set_hline(xmin, xmax, y, content) {
    for (let x = xmin; x <= xmax; x++) {
      this.set_cell({ x: x, y: y }, content);
    }
  }
  set_vline(x, ymin, ymax, content) {
    for (let y = ymin; y <= ymax; y++) {
      this.set_cell({ x: x, y: y }, content);
    }
  }
  join_rooms(r1, r2) {
    let destination_x = r2.random_x();
    let start_y = r1.random_y();
    if (r1.x < destination_x) {
      this.set_hline(r1.x, destination_x, start_y, FLOOR);
    } else {
      this.set_hline(destination_x, r1.x, start_y, FLOOR);
    }
    if (start_y < r2.y) {
      this.set_vline(destination_x, start_y, r2.y, FLOOR);
    } else {
      this.set_vline(destination_x, r2.y, start_y, FLOOR);
    }
  }
  display() {
    g.setColor(0.2, 0.2, 0.2);
    g.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        let pos = {
          x: game.player.position.x + x,
          y: game.player.position.y + y,
        };
        let content = this.get_cell(pos);
        if (content === undefined || content == 0) {
          continue;
        }
        if (content == FLOOR) {
          g.drawImage(floor_img, (x + 2) * 32, (y + 2) * 32);
        } else if (content >= 200) {
          g.drawImage(BORDER_IMAGES[content - 200], (x + 2) * 32, (y + 2) * 32);
        } else if (content >= 100) {
          g.drawImage(MISC_IMAGES[content - 100], (x + 2) * 32, (y + 2) * 32);
        } else {
          g.drawImage(MONSTERS_IMAGES[content], (x + 2) * 32, (y + 2) * 32);
        }
      }
    }
  }
  move(creature, new_position) {
    this.set_cell(creature.position, FLOOR);
    this.set_cell(new_position, creature.monster_type);
    creature.position = new_position;
  }
}

class Game {
  constructor() {
    this.monsters = [];
    this.player = new Creature(KNIGHT);
    this.weapon = null;
    this.helmet = null;
    this.dropping = null; // item which is dropped under us will but visible only after we move
    this.screen = INTRO_SCREEN;
    this.time = 0;
    this.dungeon_level = 1;
    this.display();
    this.in_menu = false;
    this.locked = false; // disable input if true
    this.message = null;
    Bangle.setLocked(false);
  }
  rest() {
    this.msg("you rest" + ".".repeat((game.time / game.player.stats[SPEED]) % 3));
    if (this.map.secret !== null) {
      let secret_pos = this.map.secret[1];
      if (
        this.player.position.x == secret_pos.x &&
        this.player.position.y == secret_pos.y
      ) {
        let r = this.map.hidden_room;
        this.map.fill_room(r);
        r.on_border((pos) => {
          this.map.set_cell(pos, 200);
        });
        this.map.set_cell(this.map.secret[0], FLOOR);
        this.map.compute_border_shapes(
          Math.max(0, r.x - 2),
          Math.min(this.map.width, r.x + r.width + 2),
          Math.max(0, r.y - 2),
          Math.min(this.map.height, r.y + r.height + 2)
        );
        this.msg("Secret found");
        this.map.secret = null;
      }
    }
    this.advance_time();
    this.display();
    this.show_msg();
  }
  level_up() {
    let hp_increment = randint(1, 10);
    let old_max_hp = this.player.stats[MAX_HP];
    let old_attack = this.player.stats[ATTACK];
    this.player.stats[MAX_HP] += hp_increment;
    this.player.hp += hp_increment;
    this.player.stats[ATTACK] += 1;
    this.in_menu = true;
    setTimeout(() => {
      E.showPrompt(
        "stats changes:\nhp: " +
          old_max_hp +
          " -> " +
          this.player.stats[MAX_HP] +
          "\nattack: " +
          old_attack +
          " -> " +
          this.player.stats[ATTACK],
        { title: "Level Up!", buttons: { One: 1, Two: 2 } }
      ).then(function (c) {
        game.in_menu = false;
        game.advance_time();
        game.display();
        game.show_msg();
      });
    }, 1000);
  }
  msg(message) {
    // record message to be shown later.
    if (this.message === null) {
      this.message = message;
    } else {
      this.message += ". " + message;
    }
  }
  show_msg() {
    g.setColor(0, 0, 0).fillRect(0, MAP_WIDTH, MAP_HEIGHT, g.getHeight());
    if (this.message === null) {
      return;
    }
    g.setColor(1, 1, 1)
      .setFont("4x6:2")
      .setFontAlign(-1, 1, 0)
      .drawString(this.message, 0, g.getHeight());
    this.message = null;
  }
  start() {
    this.map = new Map(30, 30, this.monsters, this.player, this.dungeon_level);
    this.screen = MAIN_SCREEN;
  }
  display() {
    g.clear();
    if (this.screen == INTRO_SCREEN) {
      g.drawString("welcome", g.getWidth() / 2, g.getHeight() / 2);
    } else if (this.screen == DIED_SCREEN) {
      game.in_menu = true;
      E.showAlert("you died").then(() => {
        game = new Game();
      });
      g.drawString("you dead", g.getWidth() / 2, g.getHeight() / 2);
    } else {
      this.map.display();
      this.display_stats();
    }
  }
  display_stats() {
    let hp_y =
      g.getHeight() -
      Math.round((this.player.hp * g.getHeight()) / this.player.stats[MAX_HP]);
    let satiation_y =
      g.getHeight() -
      Math.round((this.player.satiation * g.getHeight()) / 800);
    let left_width = g.getWidth() - MAP_WIDTH;
    g.setColor(0, 0, 0).fillRect(MAP_WIDTH, 0, g.getWidth(), g.getHeight());
    g.setColor(1, 0, 0).fillRect(
      MAP_WIDTH,
      hp_y,
      MAP_WIDTH + left_width / 2,
      g.getHeight()
    );
    g.setColor(0, 0, 1).fillRect(
      MAP_WIDTH + left_width / 2,
      satiation_y,
      g.getWidth(),
      g.getHeight()
    );
  }
  attack(position) {
    let monster = this.monsters.find(
      (m) => m.position.x == position.x && m.position.y == position.y
    );
    return this.player.attack(monster);
  }
  player_move(direction) {
    let destination = go(this.player.position, direction);
    if (!this.map.walkable(destination)) {
      return;
    }
    if (this.player.satiation > 0) {
      this.player.satiation -= 1;
    } else {
      this.player.hp -= 1;
    }
    let destination_content = this.map.get_cell(destination);
    if (destination_content < 100) {
      // attack
      this.attack(destination);
    } else if (destination_content == 100) {
      // we go down to next level
      this.dungeon_level += 1;
      E.showMessage("down we go to level " + this.dungeon_level + " ...");
      this.monsters = [];
      this.start();
    } else {
      // move
      if (this.dropping !== null) {
        this.map.set_cell(this.player.position, this.dropping);
        this.dropping = null;
      }
      if (destination_content != FLOOR) {
        // pick item
        if (destination_content == FOOD) {
          this.player.satiation = Math.min(this.player.satiation + 400, 800);
          this.msg("Yum Yum");
        } else if (destination_content == GOLD) {
          let amount = randint(1, 10);
          this.player.gold += amount;
          this.msg("" + amount + " gold");
        } else if (destination_content == LIFE_POTION) {
          this.player.hp = Math.min(
            this.player.stats[MAX_HP],
            this.player.hp + randint(1, 8)
          );
          this.msg("You heal");
        } else if (
          destination_content == DAGGER ||
          destination_content == SWORD
        ) {
          if (destination_content == DAGGER) {
            this.msg("Dagger picked");
          } else {
            this.msg("Sword picked");
          }
          this.dropping = this.weapon;
          if (this.dropping !== null) {
            this.player.item_effect(this.dropping, false);
          }
          this.player.item_effect(destination_content, true);
          this.weapon = destination_content;
        } else if (destination_content == LEATHER_HELMET) {
          // TODO: factorize code for all item types
          this.msg("Leather helmet picked");
          this.dropping = this.helmet;
          if (this.dropping !== null) {
            this.player.item_effect(this.dropping, false);
          }
          this.player.item_effect(destination_content, true);
          this.helmet = destination_content;
        }
      }

      this.map.move(game.player, destination);
    }
    if (!this.in_menu) {
      this.advance_time();
    }
    this.display();
    this.show_msg();
  }
  advance_time() {
    this.locked = true;
    while (true) {
      this.time += 1;
      if (this.time % this.player.stats[REGENERATION] == 0) {
        this.player.hp = Math.min(this.player.hp + 1, this.player.stats[MAX_HP]);
      }
      this.monsters.forEach((monster) => {
        if (this.time % monster.stats[SPEED] == 0) {
          monster.move();
        }
        if (this.time % monster.stats[REGENERATION] == 0) {
          monster.hp = Math.min(monster.hp + 1, monster.stats[MAX_HP]);
        }
      });
      if (this.time % 300 == 0) {
        this.map.generate_monster(
          this.map.rooms[randint(0, this.map.rooms.length - 1)],
          this.monsters
        );
      }
      if (this.time % this.player.stats[SPEED] == 0) {
        this.locked = false;
        return;
      }
    }
  }
}

g.setBgColor(0, 0, 0);
let game = new Game();

Bangle.on("touch", function (button, xy) {
  if (game.locked || game.in_menu) {
    return;
  }
  if (game.screen == MAIN_SCREEN && game.player.hp <= 0) {
    game.screen = DIED_SCREEN;
    game.display();
    return;
  }
  if (game.screen == INTRO_SCREEN) {
    game.start();
    game.display();
    return;
  } else if (game.screen == DIED_SCREEN) {
    return;
  }
  let half_width = g.getWidth() / 2;
  let half_height = g.getHeight() / 2;
  let directions_amplitudes = [0, 0, 0, 0];
  directions_amplitudes[LEFT] = half_width - xy.x;
  directions_amplitudes[RIGHT] = xy.x - half_width;
  directions_amplitudes[UP] = half_height - xy.y;
  directions_amplitudes[DOWN] = xy.y - half_height;

  if (
    Math.abs(directions_amplitudes[LEFT]) < g.getWidth() / 6 &&
    Math.abs(directions_amplitudes[DOWN]) < g.getHeight() / 6
  ) {
    // center is touched, just pass time
    game.rest();
    return;
  }

  let max_direction;
  let second_max_direction;
  if (directions_amplitudes[0] > directions_amplitudes[1]) {
    max_direction = 0;
    second_max_direction = 1;
  } else {
    max_direction = 1;
    second_max_direction = 0;
  }
  for (let direction = 2; direction < 4; direction++) {
    if (
      directions_amplitudes[direction] > directions_amplitudes[max_direction]
    ) {
      second_max_direction = max_direction;
      max_direction = direction;
    } else if (
      directions_amplitudes[direction] >=
      directions_amplitudes[second_max_direction]
    ) {
      second_max_direction = direction;
    }
  }
  if (
    directions_amplitudes[max_direction] -
      directions_amplitudes[second_max_direction] >
    10
  ) {
    // if there is little possible confusions between two candidate moves let's move.
    // basically we forbid diagonals of 10 pixels wide
    game.player_move(max_direction);
  }
});
