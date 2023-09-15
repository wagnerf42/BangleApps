// basic directions
const LEFT = 0;
const UP = 1;
const DOWN = 2;
const RIGHT = 3;

const MAP_WIDTH = 5 * 32;
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

const MONSTERS = [undefined, "Player", "Newt", "Ant"];
const MONSTERS_XP = new Uint16Array([0, 0, 200, 100]);

const MONSTERS_IMAGES = [
  undefined,
  // knith (img 340)
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
];

const KNIGHT = 1;
const FLOOR = 848;
const NEWT = 2;
const ANT = 3;
const EXIT = 100;
const FOOD = 101;
const GOLD = 102;
const LIFE_POTION = 103;
const TOMBSTONE = 104;
const DAGGER = 105;
const SWORD = 106;

function random_item(dungeon_level) {
  return [DAGGER, SWORD, FOOD, LIFE_POTION][randint(0, 3)];
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

function random_monster() {
  // TODO: use dungeon level
  return randint(NEWT, ANT);
}

class Creature {
  constructor(monster_type, position) {
    if (monster_type == KNIGHT) {
      this.hp = 10;
      this.ac = 10;
      this.attack_modifier = 4;
      this.speed = 6;
      this.damages = [1, 4, 0];
      this.satiation = 1000;
      this.gold = 0;
      this.level = 1;
    } else if (monster_type == NEWT) {
      this.hp = 4;
      this.ac = 10;
      this.attack_modifier = 4;
      this.speed = 8;
      this.damages = [1, 4, 0];
    } else if (monster_type == ANT) {
      this.hp = 6;
      this.ac = 10;
      this.attack_modifier = 8;
      this.speed = 10;
      this.damages = [1, 2, 0];
    } else {
      console.log("unknown monster");
    }
    this.xp = MONSTERS_XP[monster_type];
    this.max_hp = this.hp;
    this.position = position;
    this.monster_type = monster_type;
    this.regeneration = 100;
  }
  add_xp(xp) {
    let next_level_threshold = 1 << (9 + this.level);
    this.xp += xp;
    if (this.xp >= next_level_threshold) {
      // we level up
      this.level += 1;
      game.level_up();
    }
  }
  item_effect(item, picking) {
    // apply / remove effect of item on stats
    if (item == DAGGER) {
      if (picking) {
        this.attack_modifier += 2;
      } else {
        this.attack_modifier -= 2;
      }
    } else if (item == SWORD) {
      if (picking) {
        this.damages = [1, 6, 0];
      } else {
        this.damages = [1, 4, 0];
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
      this.attack(game.player);
    } else {
      if (this.monster_type <= 3) {
        if (xdiff * ydiff < 9) {
          let destination = { x: this.position.x, y: this.position.y };
          if (xdiff <= ydiff) {
            if (player_x > this.position.x) {
              destination.x += 1;
            } else {
              destination.x -= 1;
            }
          } else {
            if (player_y > this.position.y) {
              destination.y += 1;
            } else {
              destination.y -= 1;
            }
          }
          if (game.map.get_cell(destination) == FLOOR) {
            game.map.move(this, destination);
          }
        }
      } else {
        console.log("TODO: move towards player");
      }
    }
  }
  attack(target) {
    let msg;
    if (randint(1, 20) + this.attack_modifier >= target.ac) {
      // attack success
      let damages = this.damages[2];
      for (let i = 0; i < this.damages[0]; i++) {
        damages += randint(1, this.damages[1]);
      }
      target.hp -= damages;
      if (target.hp <= 0) {
        // we kill it
        game.monsters = game.monsters.filter((m) => m.hp > 0);
        if (target.monster_type == KNIGHT) {
          game.map.set_cell(target.position, TOMBSTONE);
          msg = "You die";
        } else {
          game.map.set_cell(target.position, target.treasure());
          msg = target.name() + " dies";
          this.add_xp(target.xp_value);
        }
        game.display();
      } else {
        if (target.monster_type == KNIGHT) {
          game.display_stats();
          msg = "you are hit(" + damages + ")";
        } else {
          msg = target.name() + " hit(" + damages + ")";
        }
      }
    } else {
      // attack miss
      if (target.monster_type != KNIGHT) {
        msg = "you miss";
      } else {
        msg = target.name() + " missed";
      }
    }
    game.message(msg);
  }
}

class Room {
  constructor(width, height) {
    this.width = randint(3, 5);
    this.height = randint(3, 5);
    this.x = randint(2, width - this.width - 2);
    this.y = randint(2, height - this.height - 2);
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
}

class Map {
  constructor(width, height, monsters, player) {
    this.width = width;
    this.height = height;
    this.seed = E.hwRand();
    E.srand(this.seed);
    this.map = new Uint16Array(width * height);
    console.log("creating rooms");
    let rooms_number = 4;
    let rooms = [];
    for (let r = 0; r < rooms_number; r++) {
      let room = new Room(width, height);
      this.fill_room(room);
      rooms.push(room);
    }
    console.log("creating corridors");
    this.generate_corridors(rooms);
    this.fill_borders();

    let first_room = rooms[0];
    player.position = first_room.random_free_position(this);
    this.set_cell(player.position, KNIGHT);
    let last_room = rooms[rooms.length - 1];
    this.set_cell(last_room.random_free_position(this), EXIT);
    this.generate_monsters(rooms, monsters);
    // now generate some loot
    this.set_cell(
      rooms[randint(0, rooms.length - 1)].random_free_position(this),
      random_item()
    );
  }

  // return if given position has a tile type which can be walked upon
  walkable(position) {
    if (!this.valid_position(position)) {
      return false;
    }
    let tile = this.get_cell(position);
    return tile != 0 && (tile < 200 || tile > 300);
  }
  fill_borders() {
    let map = this.map;
    let w = this.width;
    console.log("start", this.width, this.height);
    let start = getTime();
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
    let end = getTime();
    console.log("it took", end - start);
    // now, figure the shapes to use for border tiles
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        let p = y * w + x;
        if (map[p] != 200) {
          continue;
        }
        let border_type = 0;
        if (map[p - w] >= 200 && map[p - w] <= 300) {
          border_type += 1;
        }
        if (map[p - 1] >= 200 && map[p - 1] <= 300) {
          border_type += 2;
        }
        if (map[p + 1] == 200) {
          border_type += 4;
        }
        if (map[p + w] == 200) {
          border_type += 8;
        }
        map[p] = 200 + border_type;
      }
    }
    let end2 = getTime();
    console.log("it took again", end2 - end);
  }
  generate_monsters(rooms, monsters) {
    let map = this;
    rooms.forEach((r) => {
      let monster_position = r.random_free_position(map);
      let monster_type = random_monster();
      monsters.push(new Creature(monster_type, monster_position));
      this.set_cell(monster_position, monster_type);
    });
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
    this.locked = false;
    this.monsters = [];
    this.player = new Creature(KNIGHT);
    this.weapon = null;
    this.dropping = null; // item which is dropped under us will but visible only after we move
    this.screen = INTRO_SCREEN;
    this.time = 0;
    this.dungeon_level = 1;
    this.in_menu = false;
    Bangle.setLocked(false);
  }
  level_up() {
    let hp_increment = randint(1, 10);
    this.player.max_hp += hp_increment;
    this.player.hp += hp_increment;
    this.player.attack_modifier += 1;
    this.in_menu = true;
    setTimeout(() => {
      E.showPrompt(
        "hp is now " +
          this.player.max_hp +
          "\nattack is now" +
          this.player.attack_modifier,
        { title: "Level Up!", buttons: { One: 1, Two: 2 } }
      ).then(function (c) {
        console.log("you chose " + c);
        this.in_menu = false;
        game.display();
      });
    }, 1000);
    console.log("TODO: level up");
  }
  message(msg) {
    g.setColor(0, 0, 0).fillRect(0, MAP_WIDTH, MAP_HEIGHT, g.getHeight());
    g.setColor(1, 1, 1)
      .setFont("4x6:2")
      .setFontAlign(-1, 1, 0)
      .drawString(msg, 0, g.getHeight());
  }
  start() {
    this.map = new Map(30, 30, this.monsters, this.player);
    this.screen = MAIN_SCREEN;
  }
  display() {
    g.clear();
    if (this.screen == INTRO_SCREEN) {
      g.drawString("welcome", g.getWidth() / 2, g.getHeight() / 2);
    } else if (this.screen == DIED_SCREEN) {
      g.drawString("you dead", g.getWidth() / 2, g.getHeight() / 2);
    } else {
      this.map.display();
      this.display_stats();
    }
  }
  display_stats() {
    let hp_y =
      g.getHeight() -
      Math.round((this.player.hp * g.getHeight()) / this.player.max_hp);
    let satiation_y =
      g.getHeight() -
      Math.round((this.player.satiation * g.getHeight()) / 1000);
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
      (m) => m.x == position[0] && m.y == position[1]
    );
    this.player.attack(monster);
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
      this.display();
      g.setColor(0, 0, 0).fillRect(0, MAP_WIDTH, MAP_HEIGHT, g.getHeight());
    } else {
      // move
      let msg = "";
      if (this.dropping !== null) {
        this.map.set_cell(this.player.position, this.dropping);
        this.dropping = null;
      }
      if (destination_content != FLOOR) {
        // pick item
        if (destination_content == FOOD) {
          this.player.satiation = Math.min(this.player.satiation + 600, 1000);
          msg = "Yum Yum";
        } else if (destination_content == GOLD) {
          let amount = randint(1, 10);
          this.player.gold += amount;
          msg = "" + amount + " gold";
        } else if (destination_content == LIFE_POTION) {
          this.player.hp = Math.min(
            this.player.max_hp,
            this.player.hp + randint(1, 8)
          );
          msg = "You heal";
        } else if (
          destination_content == DAGGER ||
          destination_content == SWORD
        ) {
          if (destination_content == DAGGER) {
            msg = "Dagger picked";
          } else {
            msg = "Sword picked";
          }
          this.dropping = this.weapon;
          if (this.dropping !== null) {
            this.player.item_effect(this.dropping, false);
          }
          this.player.item_effect(destination_content, true);
          this.weapon = destination_content;
        }
      }

      this.map.move(game.player, destination);
      this.display();
      this.message(msg);
    }
    if (!this.in_menu) {
      this.advance_time();
    }
  }
  advance_time() {
    this.locked = true;
    while (true) {
      this.time += 1;
      if (this.time % this.player.regeneration == 0) {
        this.player.hp = Math.min(this.player.hp + 1, this.player.max_hp);
      }
      this.monsters.forEach((monster) => {
        if (this.time % monster.speed == 0) {
          monster.move();
        }
        if (this.time % monster.regeneration == 0) {
          monster.hp = Math.min(monster.hp + 1, monster.max_hp);
        }
      });
      if (this.time % this.player.speed == 0) {
        this.locked = false;
        return;
      }
    }
  }
}

g.setBgColor(0, 0, 0);
let game = new Game();
game.display();

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
    game.message("you rest" + ".".repeat((game.time / game.player.speed) % 3));
    game.advance_time();
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
