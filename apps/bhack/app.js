
// basic directions
const LEFT = 0;
const UP = 1;
const DOWN = 2;
const RIGHT = 3;

function randint(start, end) {
     return start + Math.floor(Math.random() * (end - start + 1));
}

function go(position, direction) {
    let destination_x = position[0];
    let destination_y = position[1];
    if (direction == LEFT) {
        destination_x -= 1;
    } else if (direction == RIGHT) {
        destination_x += 1;
    } else if (direction == UP) {
        destination_y -= 1;
    } else {
        // direction is down
        destination_y += 1;
    }
    return [destination_x, destination_y];
}

Bangle.setOptions({
    lockTimeout: 60000,
    backlightTimeout: 60000,
});

let s = require("Storage");

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

// generate a new room coordinates, not touching any existing ones 
function generate_room(rooms, width, height) {
    // while (true) {
        let room_width = randint(3, 7);
        let room_height = randint(3, 7);
        let sx = randint(1, width-1);
        let sy = randint(1, height-1);
        return [sx, sy, room_width, room_height];
        // let candidate_room = [sx, sy, room_width, room_height];
        // let touching = false;
        // for (let i = 0 ; i < rooms.length ; i++) {
        //     if (rooms_touch(rooms[i], candidate_room)) {
        //         touching = true;
        //         break;
        //     }
        // }
        // if (!touching) {
        //     return candidate_room;
        // }
    // }
}

const MONSTERS = [undefined, "Player", "Newt"];
// images are tiles numbers : 340, 326
const MONSTERS_IMAGES = [
    undefined,
    require("heatshrink").decompress(atob("kEggmqiIACgFEAAIEBBIeqB58RokzmYOBmf/AoIQBAYIVBB6AOCBAIOCGIIPCCgIPRAwJJEHAIPX/4wCAoPdJ4YPX93uGoQACB63dFIXdKoQPVFIVVAAK0BCAIPVAALPDogCBJ4wPPJIILCB4IBBB6xKBegVEJgPdBAIPTSAQGCdwVVN4oPRAAcRNwgPSE4JHBFATtEKoQPP1QLBAAbMCqqXCBwIPPgAQBAAhUFBwIPP")),
    require("heatshrink").decompress(atob("kEggmqiIAM1QPPiNEmYAKogRBB54HEJwoICB6sAqvdAgPdqoQCB6gOBFoYTBCAQPVJIYFBGIIPXCYlVB7ANEOIJPIB6CffBoYOBK4YPTBwlVWYRvGB5wOCAQJLCAIQPVNgIoBFggACB6NEEwQKCeYtEB6GqCAIAKBwIPPgAQBABQOBB54A=="))
];

const KNIGHT = 1;
const FLOOR = 848;
const NEWT = 2;

// brightness 0, contrast 70
let floor_img = require("heatshrink").decompress(atob("kEggmqiIAM1QPPiNEmYAKogRBB54OLAAIP/B/4P/B/4P/B6NEBxdEB6GqCAIAKBwIPPgAQBABQOBB54="));

class Creature {
    constructor(monster_type, x, y) {
        if (monster_type == KNIGHT) {
            this.hp = 10;
            this.ac = 10;
            this.attack_modifier = 4;
            this.speed = 6;
            this.damages = [1,6,0];
        } else if (monster_type == NEWT) {
            this.hp = 4;
            this.ac = 10;
            this.attack_modifier = 4;
            this.speed = 8;
            this.damages = [1,4,0];
        } else {
            console.log("unknown monster");
        }
        this.max_hp = this.hp;
        this.x = x;
        this.y = y;
        this.monster_type = monster_type;
    }
    name() {
        return MONSTERS[this.monster_type];
    }
    move() {
        let player_x = game.player.x;
        let player_y = game.player.y;
        let xdiff = Math.abs(player_x - this.x);
        let ydiff = Math.abs(player_y - this.y);
        if ((xdiff == 1 && ydiff == 0)||(xdiff == 0 && ydiff == 1)) {
            console.log("player_x", player_x, "player_y", player_y, "xdiff", xdiff, "ydiff", ydiff);
            // we are just beside player, attack
            this.attack(game.player, [player_x, player_y]);
        } else {
            console.log("TODO: move towards player");
        }
    }
    attack(target, position) {
        if (randint(1, 20) + this.attack_modifier >= target.ac) {
            // attack success
            let damages = this.damages[2];
            for (let i=0 ; i < this.damages[0] ; i++) {
                damages += randint(1, this.damages[1]);
            }
            target.hp -= damages;
            if (target.hp < 0) {
                // we kill it
                msg = target.name() + " killed";
                game.monsters = game.monsters.filter(m => m.hp > 0);
                game.map.set_cell(position, FLOOR);
                game.display();
            } else {
                msg = target.name() + " hit(" + damages + ")";
                if (target.monster_type == KNIGHT) {
                    game.display_hp();
                }
            }
        } else {
            // attack miss
            msg = target.name() + " missed";
        }
        g.setColor(0, 0, 0).fillRect(0, 32*5, 32*5, g.getHeight());
        g.setColor(1, 1, 1).setFont("6x8:2").setFontAlign(-1, 1, 0).drawString(msg, 0, g.getHeight());
    }
}

class Map {
    constructor(width, height, monsters, player) {
        this.width = width;
        this.height = height;
        this.seed = E.hwRand();
        E.srand(this.seed);
        this.map = new Uint16Array(width * height);
        let rooms_number = 4;
        let rooms = [];
        for (let r=0 ; r < rooms_number ; r++) {
            let room = generate_room(rooms, width, height);
            this.fill_room(room);
            rooms.push(room);
        }
        this.generate_corridors(rooms);
        let first_room = rooms[0];
        player.x = randint(first_room[0], first_room[0]+first_room[2]-1);
        player.y = randint(first_room[1], first_room[1]+first_room[3]-1);
        this.set_cell([player.x, player.y], KNIGHT);
        this.generate_monsters(rooms, monsters, player);
    }
    generate_monsters(rooms, monsters, player) {
        for (let i=0 ; i < rooms.length ; i++) {
            let room = rooms[i];
            let nx;
            if (i == 0) {
                nx = randint(room[0], room[0]+room[2]-2);
                if (nx >= player.x) {
                    nx += 1;
                }
            } else {
                nx = randint(room[0], room[0]+room[2]-1);
            }
            let ny = randint(room[1], room[1]+room[3]-1);
            monsters.push(new Creature(NEWT, nx, ny));
            this.set_cell([nx, ny], NEWT);
        }
    }
    fill_room(room) {
        for (let x=room[0]; x<room[0]+room[2]; x++) {
            for (let y=room[1]; y<room[1]+room[3] ; y++) {
                this.set_cell([x, y], FLOOR);
            }
        }
    }
    set_cell(position, content) {
        let x = position[0];
        let y = position[1];
        this.map[y*this.width + x] = content;
    }
    get_cell(position) {
        let x = position[0];
        let y = position[1];
        return this.map[y*this.width + x];
    }
    valid_position(position) {
        let x = position[0];
        let y = position[1];
        return x>=0 && x < this.width && y >= 0 && y < this.height;
    }
    generate_corridors(rooms) {
        for (let i = 0 ; i < rooms.length - 1 ; i++) {
            this.join_rooms(rooms[i], rooms[i+1]);
        }
    }
    set_hline(xmin, xmax, y, content) {
        for (let x=xmin; x <= xmax ; x++) {
            this.set_cell([x, y], content);
        }
    }
    set_vline(x, ymin, ymax, content) {
        for (let y=ymin; y <= ymax ; y++) {
            this.set_cell([x, y], content);
        }
    }
    join_rooms(r1, r2) {
        let x1 = r1[0];
        let y1 = r1[1];
        let h1 = r1[3];
        let x2 = r2[0];
        let y2 = r2[1];
        let w2 = r2[2];
        let destination_x = randint(x2, x2+w2-1);
        let start_y = randint(y1, y1+h1-1);
        if (x1 < destination_x) {
            this.set_hline(x1, destination_x, start_y, FLOOR);
        } else {
            this.set_hline(destination_x, x1, start_y, FLOOR);
        }
        if (start_y < y2) {
            this.set_vline(destination_x, start_y, y2, FLOOR);
        } else {
            this.set_vline(destination_x, y2, start_y, FLOOR);
        }
    }
    display() {
        g.setColor(0.2, 0.2, 0.2);
        g.fillRect(0, 0, 32*5, 32*5);
        for(let x=-2; x<=2; x++) {
            for(let y=-2; y<=2; y++) {
                let pos = [game.player.x+x, game.player.y+y];
                let content = this.get_cell(pos);
                if (content == FLOOR) {
                    g.drawImage(floor_img, (x+2)*32, (y+2)*32);
                } else if ((content !== undefined) && (content != 0)) {
                    g.drawImage(MONSTERS_IMAGES[content], (x+2)*32, (y+2)*32);
                }
            }
        }
    }
    move(new_position) {
        this.set_cell([game.player.x, game.player.y], FLOOR);
        this.set_cell(new_position, KNIGHT);
        game.player.x = new_position[0];
        game.player.y = new_position[1];
    }
}


class Game {
    constructor() {
        this.locked = false;
        this.monsters = [];
        this.player = new Creature(KNIGHT);
        this.map = new Map(30, 30, this.monsters, this.player);
        this.time = 0;
        Bangle.setLocked(false);
    }
    display() {
        this.map.display();
    }
    display_hp() {
        let hp_y = g.getHeight() - Math.round((this.player.hp * g.getHeight())/this.player.max_hp);
        g.setColor(0, 0, 0).fillRect(5*32, 0, g.getWidth(), g.getHeight());
        g.setColor(1, 0, 0).fillRect(5*32, hp_y, g.getWidth(), g.getHeight());
        g.setFont("4x6:2").setColor(0, 0, 0).setFontAlign(-1, 1, 0).drawString(this.player.hp, 5*32, g.getHeight());
    }
    attack(position) {
        let monster = this.monsters.find(m => m.x == position[0] && m.y == position[1]);
        this.player.attack(monster, position);
    }
    move(direction) {
        let destination = go([this.player.x, this.player.y], direction);
        if (!this.map.valid_position(destination)) {
            return;
        }
        let destination_content = this.map.get_cell(destination);
        if (destination_content == 0) {
            return;
        }
        if (destination_content < 100) {
            // attack
            this.attack(destination);
        } else {
            // move
            this.map.move(destination);
            this.display();
        }
        this.advance_time();
    }
    advance_time() {
        this.locked = true;
        while(true) {
            this.time += 1;
            this.monsters.forEach(monster => {
                if (this.time % monster.speed == 0) {
                    monster.move();
                }
            });
            if (this.time % this.player.speed == 0) {
                this.locked = false;
                return;
            }
        }
    }
}

let game = new Game();

g.setBgColor(0, 0, 0);
g.clear();
game.display();
game.display_hp();

Bangle.on('touch', function(button, xy) {
    if (game.locked) {
        console.log("locked");
        return;
    }
    let half_width = g.getWidth() / 2;
    let half_height = g.getHeight() / 2;
    let directions_amplitudes = [0, 0, 0, 0];
    directions_amplitudes[LEFT] = half_width - xy.x;
    directions_amplitudes[RIGHT] = xy.x - half_width;
    directions_amplitudes[UP] = half_height - xy.y;
    directions_amplitudes[DOWN] = xy.y - half_height;

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
        if (directions_amplitudes[direction] > directions_amplitudes[max_direction]) {
            second_max_direction = max_direction;
            max_direction = direction;
        } else if (directions_amplitudes[direction] >= directions_amplitudes[second_max_direction]) {
            second_max_direction = direction;
        }
    }
    if (directions_amplitudes[max_direction] - directions_amplitudes[second_max_direction] > 10) {
        // if there is little possible confusions between two candidate moves let's move.
        // basically we forbid diagonals of 10 pixels wide
        game.move(max_direction);
    }

});
