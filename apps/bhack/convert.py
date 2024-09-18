#!/usr/bin/env python3
from os import system, mkdir, chdir

TILESET = "yann"

def init():
    try:
        mkdir("nethack_3.4.3")
        chdir("nethack_3.4.3")
        if TILESET == "dawnhack":
            cmd = "convert -crop 32x32 ../dawnhack_32.bmp hack%04d.png"
        else:
            cmd = "convert -crop 32x32 ../bhack-asset-alpha1.png hack%04d.png"
        system(cmd)
        chdir("..")
    except FileExistsError:
        pass

def generate(ids, filename):
    files = ("nethack_3.4.3/hack{:0>4}.png".format(i) for i in ids)
    command = "convert " + " ".join(files) + " -append " + filename
    print(command)
    system(command)


def main():
    init()
    if TILESET == "dawnhack":
        monsters = [340, 326, 0, 20, 71, 42, 95, 113, 73]
        special_items = [786, 660, 664, 672, 667]
        items = [411, 465, 533, 423, 450, 412, 541, 525, 510, 574, 503]
        misc = [852, 856, 859, 855, 229, 52, 586, 274]
        levels = [848, 823, 830, 831, 832, 833, 834, 835, 837, 838, 839, 840, 836]
    else:
        monsters = [26, 36, 37, 13, 5, 12, 20, 28, 4]
        special_items = [34, 18, 32, 33, 18]
        items = [31, 19, 15, 3, 22, 39, 23, 11, 14, 30, 6]
        misc = [10, 18, 18, 18, 18, 18, 18, 18]
        levels = [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

    generate(monsters, "monsters.png")
    generate(special_items, "special_items.png")
    generate(items, "items.png")
    generate(misc, "misc.png")
    generate(levels, "levels.png")
    generate(levels+monsters+special_items+items+misc, "all.png")
    print("first monster:", len(levels))
    print("first special:", len(levels)+len(monsters))
    print("first item:", len(levels)+len(monsters)+len(special_items))
    print("first misc:", len(levels)+len(monsters)+len(special_items)+len(items))
    print("void:", len(levels)+len(monsters)+len(special_items)+len(items)+len(misc))


main()
