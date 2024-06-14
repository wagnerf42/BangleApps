// basic directions
const LEFT = 0;
const UP = 1;
const DOWN = 2;
const RIGHT = 3;

const MAP_WIDTH = 5 * 32; // for the banglejs2
const MAP_HEIGHT = 5 * 32;

const MAIN_SCREEN = 0;
const SHEET_SCREEN = 1;
const INVENTORY_SCREEN = 2;
const INTRO_SCREEN = 3;
const DIED_SCREEN = 4;
const LEVEL_UP_SCREEN = 5;
const MERCHANT_SCREEN = 6;
const POTIONS_SCREEN = 10;
const PRAY_SCREEN = 20;

const TALENTS = [
  "Aggressive",
  "Careful",
  "Strong",
  "SwordMaster",
  "DaggerFreak",
  "MaceBrute"
];

let ANIMATE_INTERVAL = null;

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
  backlightTimeout: 60000
});

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

const FIRST_MONSTER = 13;
const FIRST_SPECIAL = 21;
const FIRST_ITEM = 27;
const FIRST_MISC = 37;
const VOID = 40;

const POTIONS = 2; // how many different potions in the game

const ROCK = 1;
// a wall tile has 15 possible configurations but only 12 possible images
// this array tells which configuration is using which image
const SHAPES = Uint8Array([0, 1, 2, 5, 1, 1, 3, 10, 2, 6, 2, 7, 4, 9, 8, 11]);

const KNIGHT = FIRST_MONSTER;

const FLOOR = 0;

const EXIT = FIRST_MISC;
const TOMBSTONE = FIRST_MISC + 1;
const FOUNTAIN = FIRST_MISC + 2;

const GOLD = FIRST_SPECIAL;
const CHEST = FIRST_ITEM - 1;
const MERCHANT = FIRST_ITEM - 2;

let h = require("heatshrink");
// contrast is set at 40
const TILES = h.decompress(atob("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"));

TILES[1] = 32;

// brightness 0, contrast 70

// types of monster stats
const MAX_HP = 0;
const DV = 1; // the higher, the harder to hit
const PV = 2; // deduce this from damages
const ATTACK = 3;
const SPEED = 4;
const DMG_DICES_NUM = 5;
const DMG_DICES = 6;
const DMG_BONUS = 7;
const REGENERATION = 8;
const XP = 9;
const POISON = 10; // five damages for every point
const MOVE_ALGORITHM = 11;

const MONSTERS = [
  "Player",
  "Newt",
  "Ant",
  "Wolf",
  "Goblin",
  "Gargoyle",
  "Spider",
  "Orc"
];
let MONSTERS_STATS = [
  new Uint16Array([10, 10, 0, 4, 6, 1, 4, 0, 100, 0, 0, 0]), // Player
  new Uint16Array([4, 10, 0, 4, 8, 1, 2, 0, 100, 100, 0, 1]), // Newt
  new Uint16Array([6, 10, 0, 8, 10, 1, 3, 0, 100, 150, 0, 1]), // Ant
  new Uint16Array([10, 10, 0, 6, 6, 1, 4, 0, 100, 400, 0, 1]), // Wolf
  new Uint16Array([8, 10, 0, 6, 7, 1, 6, 0, 90, 400, 0, 1]), // Goblin
  new Uint16Array([10, 10, 3, 6, 10, 1, 6, 0, 200, 600, 0, 1]), // Gargoyle
  new Uint16Array([12, 10, 0, 6, 6, 1, 4, 0, 100, 700, 1, 1]), // Spider
  new Uint16Array([20, 12, 1, 12, 6, 1, 8, 0, 100, 800, 0, 1]) // Orc
];

// types of item stats (on top of monster stats)
const VALUE = 9;
const HP = 10;
const SATIATION = 11;
const SLOT = 12; // which equipment slot does the item occupy
const WEAPON_CATEGORY = 13;

// weapon types
const SWORD_CATEGORY = 1;
const DAGGER_CATEGORY = 2;
const MACE_CATEGORY = 3;

// equiped positions
const LEFT_HAND = 1;
const HEAD = 2;
const GAUNTLETS = 3;
const FEET = 4;
const RIGHT_HAND = 5;
const BODY = 6;
const NECK = 7;

// stats increments for each item
const ITEMS_STATS = [
  new Uint16Array([
    0,
    0,
    0,
    2,
    0,
    0,
    0,
    0,
    0,
    200,
    0,
    0,
    RIGHT_HAND,
    DAGGER_CATEGORY
  ]), // dagger
  new Uint16Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 200, 0, 0, HEAD, 0]), // leather helmet
  new Uint16Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 200, 0, 0, GAUNTLETS, 0]), // leather gauntlet
  new Uint16Array([
    0,
    0,
    0,
    0,
    0,
    0,
    2,
    0,
    0,
    250,
    0,
    0,
    RIGHT_HAND,
    SWORD_CATEGORY
  ]), // sword
  new Uint16Array([
    0,
    0,
    0,
    0,
    0,
    1,
    -1,
    0,
    0,
    300,
    0,
    0,
    RIGHT_HAND,
    MACE_CATEGORY
  ]), // mace
  new Uint16Array([
    0,
    0,
    0,
    2,
    0,
    0,
    1,
    0,
    0,
    300,
    0,
    0,
    RIGHT_HAND,
    DAGGER_CATEGORY
  ]), // elven dagger
  new Uint16Array([0, 1, 0, 0, 0, 0, 0, 0, 0, 300, 0, 0, FEET, 0]), // leather boots
  new Uint16Array([0, 2, 0, 0, 0, 0, 0, 0, 0, 400, 0, 0, LEFT_HAND, 0]), // small shield
  new Uint16Array([0, 2, 1, 0, 0, 0, 0, 0, 0, 500, 0, 0, BODY, 0]), // leather jacket
  new Uint16Array([0, 0, 1, 0, 0, 0, 0, 0, 0, 800, 0, 0, NECK, 0]) // stone amulet
];

const ITEMS = [
  "Dagger",
  "Leather helmet",
  "Leather gauntlets",
  "Sword",
  "Mace",
  "Elven Dagger",
  "Leather boots",
  "Small shield",
  "Leather jacket",
  "Stone Amulet"
];

const SPECIAL_ITEMS = ["Gold", "Food", "Life Potion", "Poison", "Chest"];

class Creature {
  constructor(monster_type, position) {
    if (monster_type == 0) {
      // player
      this.gold = 0;
      this.level = 1;
      this.satiation = 400;
      this.piety = 1000;
      this.stats = Uint16Array(MONSTERS_STATS[monster_type]);
      this.talents = [];
      this.potions = [1, 0, 0, 0, 0, 0, 0, 0, 0];
      this.xp = 0;
      this.poison_on_blade = 0;
    } else {
      this.stats = MONSTERS_STATS[monster_type];
    }
    this.hp = this.stats[MAX_HP];
    this.position = position;
    this.monster_type = monster_type;
    this.poisoned = 0;
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
    let mod;
    if (picking) {
      mod = 1;
    } else {
      mod = -1;
    }
    for (let i = 0; i <= REGENERATION; i++) {
      this.stats[i] += mod * item.stat(i);
    }
    game.apply_weapon_talent(item, mod);
  }
  treasure() {
    // let's have a 40% change of dropping something
    if (Math.random() < 0.4) {
      return FIRST_SPECIAL + randint(0, SPECIAL_ITEMS.length - 2); // -2 because we don't drop the chest
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
      if (this.stats[MOVE_ALGORITHM] == 1) {
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
      }
      return;
    }
  }
  dies() {
    game.monsters = game.monsters.filter((m) => m.hp > 0);
    if (this.monster_type == 0) {
      game.map.set_cell(this.position, TOMBSTONE);
      game.msg("You die", "#ff6000");
    } else {
      game.map.set_cell(this.position, this.treasure());
      game.msg(this.name() + " dies");
      game.player.add_xp(this.stats[XP]);
      game.kills[this.monster_type] += 1;
    }
  }
  attack(target) {
    if (randint(1, 20) + this.stats[ATTACK] >= target.stats[DV]) {
      // attack success
      let damages = this.stats[DMG_BONUS];
      for (let i = 0; i < this.stats[DMG_DICES_NUM]; i++) {
        damages += randint(1, this.stats[DMG_DICES]);
      }
      damages -= target.stats[PV];
      if (damages < 0) {
        damages = 0;
      }
      target.hp -= damages;
      if (damages > 0) {
        target.poisoned = this.stats[POISON];
      }
      if (target.hp <= 0) {
        // we kill it
        target.dies();
      } else {
        if (target.monster_type == 0) {
          game.msg("you are hit(" + damages + ")", "#ff6000");
        } else {
          game.msg(target.name() + " hit(" + damages + ")", "#00ff00");
        }
      }
    } else {
      // attack miss
      if (target.monster_type != 0) {
        game.msg("you miss");
      } else {
        game.msg(this.name() + " misses");
      }
    }
  }
}

class Room {
  constructor(width, height, room_width, room_height) {
    if (room_width === undefined) {
      this.width = randint(3, 5);
    } else {
      this.width = room_width;
    }
    if (room_height === undefined) {
      this.height = randint(3, 5);
    } else {
      this.height = room_height;
    }
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
    while (true) {
      let x = randint(this.x + 1, this.x + this.width - 2);
      let y = randint(this.y + 1, this.y + this.height - 2);
      if (map.get_cell({ x: x, y: y }) == FLOOR) {
        return { x: x, y: y };
      }
    }
  }
}

function random_item(level, position) {
  let min_value = 50 * Math.pow(2, Math.floor(level / 2));
  let max_value = 200 * Math.pow(2, Math.floor(level / 2));
  let min_index = 0;
  let max_index = 0;
  let prec_value = 0;
  ITEMS_STATS.forEach((item, index) => {
    if (item[VALUE] <= max_value) {
      max_index = index;
    }
    if (item[VALUE] >= min_value && prec_value < min_value) {
      min_index = index;
    }
    prec_value = item[VALUE];
  });

  return new Item(randint(min_index, max_index), position);
}

class Map {
  constructor(width, height, game) {
    this.width = width;
    this.height = height;
    this.seed = E.hwRand();
    this.level = game.dungeon_level;
    this.chest_opened = false; // mark if player already tried opening the chest (if any)
    this.compute_allowed_monsters();
    E.srand(this.seed);
    this.map = new Uint16Array(width * height);
    this.map.fill(VOID);
    let rooms_number = 4;
    let rooms = [];
    for (let r = 0; r < rooms_number; r++) {
      let room = new Room(width, height);
      this.fill_room(room);
      rooms.push(room);
    }
    
    // first, place the exit somewhere not near a wall.
    // we place it first to be 100% sure it is a free space.
    let last_room = rooms[rooms.length - 1];
    this.set_cell(last_room.random_inner_position(this), EXIT);
    
    if (this.level % 2 == 0) {
      game.msg("You feel", "#00ff00");
      game.msg("something special", "#00ff00");
      let special_room = new Room(width, height, 5, 5);
      this.fill_room(special_room);
      this.fill_special_room(special_room, game.monsters);
      rooms.push(special_room);
    }
    this.generate_corridors(rooms);
    this.fill_borders();

    let first_room = rooms[0];
    game.player.position = first_room.random_free_position(this);
    this.set_cell(game.player.position, KNIGHT);
    this.generate_monsters(rooms, game.monsters);

    // now generate some loot
    let loot_position =
      rooms[randint(0, rooms.length - 1)].random_free_position(this);
    let loot = random_item(this.level, loot_position);
    game.items.push(loot);
    this.set_cell(loot_position, loot.tile());

    this.rooms = rooms;
    this.hidden_room = this.find_hidden_room();
    this.secret = null;
    if (this.hidden_room !== null) {
      this.secret = this.find_secret(this.hidden_room);
    }
  }
  fill_special_room(room, monsters) {
    let choice = randint(1, 4);
    if (choice == 1) {
      // gold and monsters
      for (let i = 0; i < 2; i++) {
        this.generate_monster(room, monsters);
        this.set_cell(room.random_inner_position(this), GOLD);
      }
    } else if (choice == 2) {
      // fountain
      this.set_cell(room.random_inner_position(this), FOUNTAIN);
    } else if (choice == 3) {
      this.set_cell(room.random_inner_position(this), MERCHANT);
      game.merchant_items = [];
      for(let i=0 ; i < ITEMS.length ; i++) {
        game.merchant_items.push(new Item(i));
      }
    } else {
      // chest
      this.set_cell({ x: room.x + 3, y: room.y + 3 }, CHEST);
    }
  }

  compute_allowed_monsters() {
    let min_xp = 30 * Math.pow(2, Math.floor(this.level / 2));
    let max_xp = 100 * Math.pow(2, Math.floor(this.level / 2));
    let min_index = 2;
    let max_index = 2;
    let prec_xp = 0;
    MONSTERS_STATS.forEach((m, i) => {
      if (i >= 1) {
        if (m[XP] <= max_xp) {
          max_index = i;
        }
        if (m[XP] >= min_xp && prec_xp < min_xp) {
          min_index = i;
        }
        prec_xp = m[XP];
      }
    });
    this.min_monster_index = min_index;
    this.max_monster_index = max_index;
  }

  find_secret(room) {
    // find where to place a secret door around hidden room
    let candidates = [];
    for (let x = room.x; x < room.x + room.width; x++) {
      let pos = { x: x, y: room.y - 1 };
      let next_pos = { x: pos.x, y: pos.y - 1 };
      let c = this.get_cell(pos);
      if (c >= ROCK && c < FIRST_MONSTER && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
      pos = { x: x, y: room.y + room.height };
      next_pos = { x: pos.x, y: pos.y + 1 };
      c = this.get_cell(pos);
      if (c >= ROCK && c < FIRST_MONSTER && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
    }
    for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
      let pos = { x: room.x - 1, y: y };
      let next_pos = { x: pos.x - 1, y: pos.y };
      let c = this.get_cell(pos);
      if (c >= ROCK && c < FIRST_MONSTER && this.get_cell(next_pos) == FLOOR) {
        candidates.push([pos, next_pos]);
      }
      pos = { x: room.x + room.width, y: y };
      next_pos = { x: pos.x + 1, y: pos.y };
      c = this.get_cell(pos);
      if (c >= ROCK && c < FIRST_MONSTER && this.get_cell(next_pos) == FLOOR) {
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
        if (map[p] == VOID || (map[p] >= ROCK && map[p] < FIRST_MONSTER)) {
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
    return tile == FLOOR || (tile != VOID && tile >= FIRST_MONSTER);
  }
  compute_border_shapes(start_x, end_x, start_y, end_y) {
    let map = this.map;
    let w = this.width;
    // now, figure the shapes to use for border tiles
    for (let y = start_y; y < end_y; y++) {
      for (let x = start_x; x < end_x; x++) {
        let p = y * w + x;
        if (map[p] < ROCK || map[p] >= FIRST_MONSTER) {
          continue;
        }
        // we can compute the border shape by looking at
        // neighbour tiles if they are filled or empty
        // we just sum the weighted bits to compute an integer
        // telling us which shape we should put
        //    1
        // 8 tile 2
        //    4
        // for example 15 is a cross and 14 is 'T'
        let border_type = 0;
        if (map[p - w] >= ROCK && map[p - w] < FIRST_MONSTER) {
          border_type += 1;
        }
        if (map[p - 1] >= ROCK && map[p - 1] < FIRST_MONSTER) {
          border_type += 8;
        }
        if (map[p + 1] >= ROCK && map[p + 1] < FIRST_MONSTER) {
          border_type += 2;
        }
        if (map[p + w] >= ROCK && map[p + w] < FIRST_MONSTER) {
          border_type += 4;
        }
        // now get the tile index
        // since some images appear twice (8 is '-' as is 2)
        // but the images are stored only once we need an extra SHAPES array
        // to get the image index 
        map[p] = ROCK + SHAPES[border_type];
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
            if (map[p + neighbours[d]] == VOID) {
              map[p + neighbours[d]] = ROCK;
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
    let monster_type = randint(this.min_monster_index, this.max_monster_index);
    monsters.push(new Creature(monster_type, monster_position));
    this.set_cell(monster_position, FIRST_MONSTER + monster_type);
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
          y: game.player.position.y + y
        };
        let content = this.get_cell(pos);
        if (content === undefined || content == VOID) {
          continue;
        }
        g.drawImage(TILES, (x + 2) * 32, (y + 2) * 32, { frame: content });
      }
    }
  }
  move(creature, new_position) {
    this.set_cell(creature.position, FLOOR);
    this.set_cell(new_position, FIRST_MONSTER + creature.monster_type);
    creature.position = new_position;
  }
}

class Item {
  constructor(type, position) {
    this.type = type;
    this.position = position;
    this.bonus = 0;
  }
  tile() {
    return FIRST_ITEM + this.type;
  }
  stat(stat_index) {
    return ITEMS_STATS[this.type][stat_index];
  }
  name() {
    if (this.bonus == 0) {
      return ITEMS[this.type];
    } else {
      return ITEMS[this.type] + " +" + this.bonus;
    }
  }
}

class Game {
  constructor() {
    this.monsters = [];
    this.merchant_items = [];
    this.kills = new Uint16Array(MONSTERS.length);
    this.items = [];
    this.player = new Creature(0);
    this.equiped = [null, null, null, null, null, null, null, null, null];
    this.screen = INTRO_SCREEN;
    TMP_IMG = h.decompress(
      atob(
        "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"
      )
    );
    this.time = 0;
    this.dungeon_level = 1;
    this.in_menu = false;
    this.locked = false; // disable input if true
    this.messages = [];
    Bangle.setLocked(false);
    let new_game = this;
    ANIMATE_INTERVAL = setInterval(() => {
      new_game.display();
    }, 1000);
  }
  apply_weapon_talent(weapon, modifier) {
    game.player.talents.find((talent) => {
      let category = null;
      if (talent == "SwordMaster") {
        category = SWORD_CATEGORY;
      } else if (talent == "DaggerFreak") {
        category = DAGGER_CATEGORY;
      } else if (talent == "MaceBrute") {
        category = MACE_CATEGORY;
      }
      if (category !== null) {
        if (weapon.stat(WEAPON_CATEGORY) == category) {
          game.player.stats[DMG_BONUS] += 1 * modifier;
          game.player.stats[ATTACK] += 2 * modifier;
        }
        return true;
      }
      return false;
    });
  }
  rest() {
    this.msg(
      "you rest" + ".".repeat((game.time / game.player.stats[SPEED]) % 3)
    );
    if (this.map.secret !== null) {
      let secret_pos = this.map.secret[1];
      if (
        this.player.position.x == secret_pos.x &&
        this.player.position.y == secret_pos.y
      ) {
        this.secret_found();
      }
    }
    this.advance_time();
    this.display();
  }
  secret_found() {
    let r = this.map.hidden_room;
    this.map.fill_room(r);
    let item_position = r.random_free_position(this.map);
    let new_item = random_item(this.dungeon_level, item_position);
    game.items.push(new_item);
    this.map.set_cell(item_position, new_item.tile());
    r.on_border((pos) => {
      this.map.set_cell(pos, ROCK);
    });
    this.map.set_cell(this.map.secret[0], FLOOR);
    this.map.compute_border_shapes(
      Math.max(0, r.x - 2),
      Math.min(this.map.width, r.x + r.width + 2),
      Math.max(0, r.y - 2),
      Math.min(this.map.height, r.y + r.height + 2)
    );
    this.msg("Secret found", "#00ff00");
    this.map.secret = null;
  }
  level_up() {
    let hp_increment = 4 + randint(1, 6);
    this.player.stats[MAX_HP] += hp_increment;
    this.player.hp += hp_increment;
    this.player.stats[ATTACK] += 1;
    this.in_menu = true;
    this.screen = LEVEL_UP_SCREEN;
    this.display();
  }
  msg(message, color) {
    // record message to be shown later.
    if (color === undefined) {
      color = "#ffffff";
    }
    this.messages.push({ msg: message, color: color });
  }
  show_msg() {
    g.setColor(0, 0, 0).fillRect(0, MAP_WIDTH, MAP_HEIGHT, g.getHeight());
    let msg = this.messages.shift();
    if (msg !== undefined) {
      g.setColor(msg.color)
        .setFont("4x6:2")
        .setFontAlign(-1, 1, 0)
        .drawString(msg.msg, 0, g.getHeight());
    }
    if (this.messages.length == 0) {
      game.locked = false;
      return;
    }

    let msg_interval = setInterval(
      (messages) => {
        let msg = messages.shift();
        if (msg === undefined) {
          clearInterval(msg_interval);
          game.locked = false;
        } else {
          g.setColor(0, 0, 0).fillRect(0, MAP_WIDTH, MAP_HEIGHT, g.getHeight());
          g.setColor(msg.color)
            .setFont("4x6:2")
            .setFontAlign(-1, 1, 0)
            .drawString(msg.msg, 0, g.getHeight());
        }
      },
      400,
      this.messages
    );
  }
  start() {
    this.map = new Map(30, 30, this);
    this.screen = MAIN_SCREEN;
    TMP_IMG = null; // let's free some memory ?
  }
  display() {
    let w = g.getWidth();
    let h = g.getHeight();
    if (this.screen == INTRO_SCREEN) {
      g.drawImage(TMP_IMG, 0, 0);
      let frame = Math.floor(getTime() / 4) % 6;
      g.setFont("4x6:2").setFontAlign(0, 0, 0);
      let name = "";
      let contribution = "";
      if (frame == 0) {
        name = "Frederic Wagner";
        contribution = "Code";
      } else if (frame == 2) {
        name = "Yann Wagner";
        contribution = "Gfx";
      } else if (frame == 4) {
        name = "DragonDePlatino";
        contribution = "Gfx";
      }
      g.setColor(0, 0, 0);
      g.drawString(name, w / 2, (h * 2) / 3);
      g.drawString(contribution, w / 2, (h * 4) / 5);
      g.setColor(1, 0, 0);
      g.drawString(name, w / 2 - 1, (h * 2) / 3 - 1);
      g.drawString(contribution, w / 2 - 1, (h * 4) / 5 - 1);
    } else if (this.screen == DIED_SCREEN) {
      g.drawImage(TMP_IMAGE, 0, 0);
      let scroll_height = game.epitaph.length * 18 + 90;
      let frame = Math.floor(getTime() * 20) % scroll_height;
      game.epitaph.forEach((s, i) => {
        let height = 90 + i * 18 - frame;
        if (height < 82) {
          g.drawString(s, w / 2, height);
        }
      });
      // game.in_menu = true;
      // E.showAlert("you died").then(() => {
      //   game = new Game();
      // });
    } else if (this.screen == POTIONS_SCREEN) {
      g.setBgColor(1, 1, 1);
      g.clear();
      let cs = h / 3; // cell side
      let sep = 4;
      g.setColor(0);
      g.fillRect(0, cs - sep, 3 * cs, cs + sep);
      g.fillRect(0, 2 * cs - sep, 3 * cs, 2 * cs + sep);
      g.fillRect(cs - sep, 0, cs + sep, 3 * cs);
      g.fillRect(2 * cs - sep, 0, 2 * cs + sep, 3 * cs);
      game.player.potions.forEach((potions_number, potion_type) => {
        if (potions_number > 0) {
          let cx = (potion_type % 3) * cs;
          let cy = Math.floor(potion_type / 3) * cs;
          g.drawImage(TILES, cx + cs / 2 - 16, cy + cs / 2 - 20, {
            frame: FIRST_SPECIAL + 2 + potion_type
          });
          g.setFont("6x8:2")
            .setFontAlign(1, 1, 0)
            .drawString("" + potions_number, cx + cs - sep, cy + cs - sep);
        }
      });
    } else if (this.screen == MERCHANT_SCREEN) {
      let rarrow = Graphics.createImage(`
   #
    #    
######        
#######
######                
    #
   #                      
      `);

      let larrow = Graphics.createImage(`
   #
  #    
 ######       
#######
 ######               
  #
   #                      
      `);
      g.setBgColor(255, 255, 255);
      g.clear();
      g.setColor(0);
      let item = game.merchant_items[0];
      let price = item.stat(VALUE);
      g.setFont("4x6:2").setFontAlign(0, -1, 0);
      g.drawString(item.name(), w/2, 4);
      g.drawString("for " + price + " gold", w/2, 22);
      g.drawImage(TILES, w/2 - 32, 40, {frame: item.tile(), scale: 2.0});
      g.drawImage(rarrow, w/2 + 45, 60, {scale:4});
      g.drawImage(larrow, w/2 - 73, 60, {scale:4});
      g.drawRect(5, 110, w/2-5, h-30);
      g.drawRect(w/2+5, 110, w-5, h-30);
      g.setFontAlign(0, 0, 0);
      g.drawString("Gold left: "+game.player.gold, w/2, h-14);
      g.setFont("6x8:2");
      g.drawString("bye", 3*w/4, (110+h-30)/2);
      if (price > this.player.gold || game.equiped[item.stat(SLOT)] !== null) {
        g.setColor(0.7, 0.7, 0.7);
      }
      g.drawString("buy", w/4, (110+h-30)/2);
    } else if (this.screen == PRAY_SCREEN) {
      g.clear();
      g.setColor(0);
      g.drawRect(w / 4, 5, (w * 3) / 4, h / 2 - 5);
      g.setFontAlign(0, 0, 0).drawString("SAVE", w / 2, h / 4);
      if (game.player.hp > 0) {
        g.drawRect(w / 4, h / 2 + 5, (w * 3) / 4, h - 5);
        g.setFontAlign(0, 0, 0).drawString("PRAY", w / 2, (3 * h) / 4);
      }
    } else if (this.screen == SHEET_SCREEN) {
      g.clear();
      let s = game.player.stats;
      let msg = "hp: " + game.player.hp + " / " + s[MAX_HP] + "\n";
      msg += "dv: " + s[DV] + "/ ";
      msg += "pv: " + s[PV] + "\n";
      msg += "attack: " + s[ATTACK] + "\n";
      msg += "speed: " + s[SPEED] + "\n";
      msg +=
        "dmg: " +
        s[DMG_DICES_NUM] +
        "D" +
        s[DMG_DICES] +
        " + " +
        s[DMG_BONUS] +
        "\n";
      msg += "regen:" + s[REGENERATION] + "\n";
      msg += "xp:" + game.player.xp + "\n";
      E.showMessage(msg);
    } else if (this.screen == LEVEL_UP_SCREEN) {
      g.clear();
      g.setColor(0, 0, 0)
        .setFont("6x8:2")
        .setFontAlign(0, 0, 0)
        .drawString("level up !\nswipe\nto\nunlock", w / 2, h / 2);
    } else if (this.screen == INVENTORY_SCREEN) {
      g.clear();
      g.setColor(0)
        .setFont("6x8:2")
        .setFontAlign(0, 0, 0)
        .drawString("Inventory", w / 2, 12);
      // draw body
      g.setColor("#b7c9e2");
      g.fillCircle(w / 2, 50, 8); // head
      g.fillEllipse((7 * w) / 16, 65, (9 * w) / 16, 130); // torso
      g.fillCircle((3 * w) / 4, 90, 8); // left hand
      g.fillCircle(w / 4, 90, 8); // right hand
      g.fillCircle((7 * w) / 16, 150, 8); // feet
      g.fillCircle((9 * w) / 16, 150, 8);
      // draw equiped items
      let positions = [
        null,
        [(3 * w) / 4, 90],
        [w / 2, 50],
        [w / 4, 122],
        [w / 2, 150],
        [w / 4, 90],
        [w / 2, 114],
        [w / 2, 82]
      ];
      for (let i = 0; i <= 7; i++) {
        let item = game.equiped[i];
        if (item !== null) {
          let item_tile = item.tile();
          let pos = positions[i];
          g.drawImage(TILES, pos[0] - 16, pos[1] - 16, { frame: item_tile });
        }
      }
      // also draw gold
      g.drawImage(TILES, w - 32, h - 32, { frame: FIRST_SPECIAL });
      g.setColor(0, 0, 0)
        .setFontAlign(1, 0, 0)
        .drawString("" + game.player.gold, w - 2, h - 40);
    } else {
      g.clear();
      this.map.display();
      this.display_stats();
      this.show_msg();
    }
    g.flip();
  }
  display_stats() {
    let hp_y =
      g.getHeight() -
      Math.round((this.player.hp * g.getHeight()) / this.player.stats[MAX_HP]);
    let satiation_y =
      g.getHeight() - Math.round((this.player.satiation * g.getHeight()) / 400);
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
    if (this.player.poison_on_blade >= 1) {
      this.player.poison_on_blade -= 1;
      if (this.player.poison_on_blade == 0) {
        this.msg("Poison wears off", "#ff6600");
        this.player.stats[POISON] = 0;
      }
    }
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
      game.msg("You starve", "#ff6600");
      this.player.hp -= 1;
    }
    // console.log("moving on", destination);
    let destination_content = this.map.get_cell(destination);
    if (destination_content >= FIRST_MONSTER && destination_content < FIRST_SPECIAL) {
      // attack
      this.attack(destination);
    } else if (destination_content == EXIT) {
      // we go down to next level
      this.dungeon_level += 1;
      E.showMessage("down we go to level " + this.dungeon_level + " ...");
      this.monsters = [];
      this.items = [];
      this.start();
    } else if (destination_content == FOUNTAIN) {
      this.in_menu = true;
      E.showPrompt("The fountain seems cool and refreshing.\n Drink ?").then(
        (d) => {
          if (d) {
            let choice = randint(0, 2);
            if (choice < 2) {
              game.msg("You feel great !", "#00ff00");
              game.player.hp = game.player.stats[MAX_HP];
              game.player.satiation = 400;
              game.player.poisoned = 0;
            } else {
              game.msg("Argh, poison !", "#ff6600");
              game.player.poisoned = 2; // TODO: level dependent ?
            }
            game.msg("The fountain dries up");
            game.map.set_cell(destination, FLOOR);
          }
          game.in_menu = false;
          game.display();
        }
      );
    } else if (destination_content == MERCHANT) {
      if (this.merchant_items.length == 0) {
        this.msg("Sorry, nothing left");
      } else {
        this.screen = MERCHANT_SCREEN;
      }
      this.display();
      return;
    } else if (destination_content == CHEST) {
      if (this.map.chest_opened == false) {
        this.map.chest_opened = true;
        if (randint(1, 100) <= 50) {
          // TODO: have a talent increasing this
          this.msg("You open the chest", "#00ff00");
          let loot = random_item(this.dungeon_level + 2, destination);
          game.items.push(loot);
          this.map.set_cell(destination, loot.tile());
        } else {
          this.msg("You fail opening", "#ff6600");
          this.msg("the chest", "#ff6600");
        }
      } else {
        this.msg("You fail again");
      }
    } else {
      // move
      let start_position = {
        x: this.player.position.x,
        y: this.player.position.y
      };
      let dropping = null;
      if (
        destination_content >= FIRST_SPECIAL &&
        destination_content < FIRST_ITEM
      ) {
        // special item
        if (destination_content == GOLD) {
          // gold
          let amount = randint(5, 10) * this.dungeon_level;
          this.player.gold += amount;
          this.msg("" + amount + " gold");
        } else if (destination_content == FIRST_SPECIAL + 1) {
          this.player.satiation += 200;
          this.player.satiation = Math.min(400, this.player.satiation);
          this.msg("Yum Yum");
        } else if (
          destination_content >= FIRST_SPECIAL + 2 &&
          destination_content <= FIRST_SPECIAL + 2 + POTIONS - 1
        ) {
          this.player.potions[destination_content - FIRST_SPECIAL - 2] += 1;
        }
      } else if (destination_content >= FIRST_ITEM) {
        // pick item
        let item_index = this.items.findIndex(
          (i) => i.position.x == destination.x && i.position.y == destination.y
        );
        let item = this.items[item_index];
        this.items.splice(item_index, item_index);
        let slot = item.stat(SLOT);
        dropping = this.equiped[slot];
        if (dropping !== null) {
          if (SLOT == RIGHT_HAND) {
            this.player.poison_on_blade = 0;
          }
          this.player.item_effect(dropping, false);
          this.msg("Dropping " + dropping.name());
          dropping.position.x = start_position.x;
          dropping.position.y = start_position.y;
          this.items.push(dropping);
        }
        this.equiped[slot] = item;
        this.msg(item.name() + " equiped");
        this.player.item_effect(item, true);
      }
      this.map.move(game.player, destination);
      if (this.map.secret != null) {
        // let's have a 30% chance of finding secrets
        let secret_pos = this.map.secret[1];
        if (destination.x == secret_pos.x && destination.y == secret_pos.y) {
          if (Math.random() < 0.3) {
            this.secret_found();
          }
        }
      }
      if (dropping !== null) {
        this.map.set_cell(start_position, dropping.tile());
      }
    }
    if (!this.in_menu) {
      this.advance_time();
      this.display();
    }
  }
  advance_time() {
    this.locked = true;
    //TODO: avoid the big loop ?
    while (true) {
      this.time += 1;
      if (this.player.piety < 1000) {
        this.player.piety += 1;
      }
      if (this.time % this.player.stats[REGENERATION] == 0) {
        this.player.hp = Math.min(
          this.player.hp + 1,
          this.player.stats[MAX_HP]
        );
      }
      if (this.time % 20 == 0) {
        if (this.player.poisoned > 0) {
          let dmg = Math.ceil(this.player.poisoned);
          this.player.hp -= dmg;
          this.player.poisoned -= 0.2 * dmg;
          this.msg("Poison hits (" + dmg + ")", "#ff6000");
          if (this.player.hp <= 0) {
            this.player.dies();
          }
        }
      }
      this.monsters.forEach((monster) => {
        if (this.time % monster.stats[SPEED] == 0) {
          monster.move();
        }
        if (this.time % monster.stats[REGENERATION] == 0) {
          monster.hp = Math.min(monster.hp + 1, monster.stats[MAX_HP]);
        }
        if (this.time % 20 == 0) {
          // every 20 turns inflict poison dmg
          if (monster.poisoned > 0) {
            let dmg = Math.ceil(monster.poisoned);
            monster.hp -= 2 * dmg;
            monster.poisoned -= 0.2 * dmg;
            this.msg(
              "Poison hit " + monster.name() + " (" + dmg + ")",
              "#00ff00"
            );
            if (monster.hp <= 0) {
              monster.dies();
            }
          }
        }
      });
      if (this.time % 300 == 0) {
        this.map.generate_monster(
          this.map.rooms[randint(0, this.map.rooms.length - 1)],
          this.monsters
        );
      }
      if (this.time % this.player.stats[SPEED] == 0) {
        return;
      }
    }
  }
}

g.setBgColor(0, 0, 0);
let game = require("Storage").readJSON("bhack.save", true);
if (game === undefined) {
  console.log("loading failed");
  game = new Game();
} else {
  console.log("loading succeeded");
  // put back all classes
  Object.setPrototypeOf(game, Game.prototype);
  Object.setPrototypeOf(game.map, Map.prototype);
  Object.setPrototypeOf(game.player, Creature.prototype);
  game.items.forEach((i) => {
    Object.setPrototypeOf(i, Item.prototype);
  });
  game.equiped.forEach((i) => {
    if (i !== null) {
      Object.setPrototypeOf(i, Item.prototype);
    }
  });
  game.monsters.forEach((m) => {
    Object.setPrototypeOf(m, Creature.prototype);
  });
  game.map.rooms.forEach((r) => {
    Object.setPrototypeOf(r, Room.prototype);
  });
  // reconvert js arrays back to native arrays
  game.map.map = Uint16Array(game.map.map);
  game.player.stats = Uint16Array(game.player.stats);
  game.kills = Uint16Array(game.kills);
  require("Storage").erase("bhack.save");
  // back to game
  game.screen = MAIN_SCREEN;
  game.locked = false;
  game.display();
}

function add_talent(talent) {
  E.showMenu();
  game.player.talents.push(talent);
  let weapon = game.equiped[RIGHT_HAND];
  if (weapon !== null) {
    game.apply_weapon_talent(weapon, 1);
  }
  if (talent == "Aggressive") {
    game.player.stats[ATTACK] += 2;
  } else if (talent == "Strong") {
    game.player.stats[DMG_BONUS] += 1;
  } else if (talent == "Careful") {
    game.player.stats[DV] += 1;
  } else {
    console.log("TODO: talent:", talent);
  }

  //TODO: factorize
  game.screen = MAIN_SCREEN;
  game.in_menu = false;
  game.advance_time();
  game.display();
}

Bangle.on("swipe", (direction_lr, direction_ud) => {
  if (game.locked) {
    return;
  }
  if (game.screen == MERCHANT_SCREEN) {
    if (game.merchant_items.length == 0) {
      return;
    }
    if (direction_lr == -1) {
      let i = game.merchant_items.pop();
      game.merchant_items.unshift(i);
      game.display();
      return;
    }
    if (direction_lr == 1) {
      let i = game.merchant_items.shift();
      game.merchant_items.push(i);
      game.display();
      return;
    }
  }
  if (game.screen == LEVEL_UP_SCREEN) {
    E.showPrompt(
      "you are now level" +
        game.player.level +
        "\n\nstats changes:\nhp: " +
        game.player.stats[MAX_HP] +
        "\nattack: " +
        game.player.stats[ATTACK],
      { title: "Level Up!", buttons: { Ok: 0 } }
    ).then(() => {
      if (
        game.player.level % 2 == 0 &&
        TALENTS.length / 3 >= game.player.level / 2
      ) {
        let talent_num = game.player.level / 2 - 1;
        let menu = [
          {
            title: TALENTS[talent_num * 3],
            onchange: add_talent.bind(null, TALENTS[talent_num * 3])
          },
          {
            title: TALENTS[talent_num * 3 + 1],
            onchange: add_talent.bind(null, TALENTS[talent_num * 3 + 1])
          },
          {
            title: TALENTS[talent_num * 3 + 2],
            onchange: add_talent.bind(null, TALENTS[talent_num * 3 + 2])
          }
        ];
        menu[""] = { title: "Choose a talent" };
        E.showMenu(menu);
      } else {
        game.screen = MAIN_SCREEN;
        game.in_menu = false;
        game.advance_time();
        game.display();
      }
    });
  } else {
    if (game.screen >= MAIN_SCREEN && game.screen <= INVENTORY_SCREEN) {
      g.setBgColor(1, 1, 1);
      if (direction_lr == -1) {
        game.screen = (game.screen + 2) % 3;
        game.display();
      } else if (direction_lr == 1) {
        game.screen = (game.screen + 1) % 3;
        game.display();
      }
    }
    if (game.screen % 10 == 0) {
      // if we are in a vertical screen
      if (direction_ud == -1) {
        game.screen = ((Math.floor(game.screen / 10) + 2) % 3) * 10;
        game.display();
      } else if (direction_ud == 1) {
        game.screen = ((Math.floor(game.screen / 10) + 1) % 3) * 10;
        game.display();
      }
    }
  }
});

Bangle.on("touch", function (button, xy) {
  if (game.locked || game.in_menu || game.screen == LEVEL_UP_SCREEN) {
    return;
  }
  if (game.screen == MERCHANT_SCREEN) {
    if (xy.y > g.getHeight()/2) {
      if (xy.x < g.getWidth()/2) {
        let item = game.merchant_items[0];
        let price = item.stat(VALUE);
        let slot = item.stat(SLOT);
        if (game.player.gold >= price && game.equiped[slot] === null) {
          game.player.gold -= price;
          let item = game.merchant_items.shift();
          if (game.merchant_items.length == 0) {
            game.screen = MAIN_SCREEN;
          }
          game.equiped[slot] = item;
          game.player.item_effect(item, true);
          game.display();
        }
        return;
      } else {
        game.screen = MAIN_SCREEN;
        game.msg("Thanks !");
        game.display();
      }
    }
    return;
  }
  if (game.screen == PRAY_SCREEN) {
    let y = Math.floor(xy.y / (g.getWidth() / 2));
    if (y == 1 && game.player.hp > 0) {
      game.screen = MAIN_SCREEN;
      if (game.player.piety < 1000) {
        game.msg("Your prayer is unheard", "#ffff00");
      } else {
        game.player.piety = 0;
        if (game.player.satiation == 0) {
          game.player.satiation = 400;
          game.msg("You are satiated", "#ffff00");
        } else {
          if (game.player.hp < game.player.stats[MAX_HP]) {
            game.player.hp = game.player.stats[MAX_HP];
            game.msg("You are healed", "#ffff00");
          }
        }
      }
      game.display();
      return;
    } else if (y == 0) {
      console.log("saving");
      game.locked = true;
      require("Storage").writeJSON("bhack.save", game);
      console.log("saved");
      load();
    }
  }
  if (game.screen == POTIONS_SCREEN) {
    if (game.player.hp == 0) {
      return;
    }
    let side = g.getWidth() / 3;
    let x = Math.floor(xy.x / side);
    let y = Math.floor(xy.y / side);
    let potion = y * 3 + x;
    if (game.player.potions[potion] != 0) {
      if (potion == 0) {
        game.player.potions[potion] -= 1;
        let old_hp = game.player.hp;
        game.player.hp += randint(1, 8);
        game.player.hp = Math.min(game.player.stats[MAX_HP], game.player.hp);
        game.msg("Healed " + (game.player.hp - old_hp));
      } else if (potion == 1) {
        let weapon = game.equiped[RIGHT_HAND];
        if (weapon !== null && ITEMS_STATS[weapon.type][WEAPON_CATEGORY] != MACE_CATEGORY) {
          game.msg("Blade poisoned", "#ffff00");
          game.player.potions[potion] -= 1;
          game.player.poison_on_blade += 5; // how many attacks it will last
          game.player.stats[POISON] = 1;
        } else {
          game.msg("You need a blade to poison");
        }
      } else {
        console.log("todo: potion", potion);
      }
      game.screen = MAIN_SCREEN;
      game.display();
    }
    return;
  }
  if (game.screen == MAIN_SCREEN && game.player.hp <= 0) {
    let head = [
      "died level" + game.player.level,
      "on level" + game.dungeon_level,
      "you killed",
      ""
    ];
    let killed = MONSTERS.map((name, index) => {
      if (game.kills[index] != 0) {
        return "" + game.kills[index] + " " + name;
      } else {
        return null;
      }
    }).filter((s) => s !== null);
    game.epitaph = head.concat(killed);
    game.screen = DIED_SCREEN;
    g.setColor(1, 1, 1);
    g.setBgColor(0, 0, 0);
    g.setFont("6x8:2");
    g.setFontAlign(0, 0, 0);
    let bottom_image = h.decompress(
      atob(
        "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"
      )
    );
    g.drawImage(bottom_image, 0, 90);
    TMP_IMAGE = h.decompress(
      atob(
        "2FagnMAH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AEEMAf4DWAH4A/AH4A/AAsMAP4BWAH4A/AH4A/AA8MAP4BWAH6ycAf4DVAH6sWAP4BVAH6w/WH4A/V36u/WH4B/WH6uoAAID/AagA/WDIB/AKwA/Vy4ADAoYD/AZyX/WDIB/AKwA/Vy4A/ACyX/V7KyDAf4DRS/6vZAH4AVS/6wbAf4DUAH6uZAH4AU4BbCAa6v/AH4ATS3yv/V+XALoQD/AaKX/V7IA/ACqX/AC/A5gB/AKqX/AC5aCAAIDLAH4AGS/4AXUQIB/AKqX/AC/MAAJcBAf4DSS/4AXLgIB/AKqX/AC6Y/AK6X/AC6Y/AK6X/AC6Y/AK6X/AC/AAAJcBAf4DSS/4AXLgIB/AKqX/AC/AAD56BAeiX/AC5aBAP4BVS/4AX4AA/ACyX/V7PMLoQD/AaKX/V7IA/ACqX/V9fMAf6v/V9wA/AAYA="
      )
    );
    ANIMATE_INTERVAL = setInterval(() => {
      game.display();
    }, 50);
    return;
  }
  if (game.screen == INTRO_SCREEN) {
    clearInterval(ANIMATE_INTERVAL);
    game.start();
    game.display();
    return;
  } else if (game.screen == DIED_SCREEN) {
    clearInterval(ANIMATE_INTERVAL);
    TMP_IMAGE = null;
    game = new Game();
    return;
  }

  if (game.screen != MAIN_SCREEN) {
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
