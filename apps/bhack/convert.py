#!/usr/bin/env python3
from os import system, mkdir, chdir

def init():
    try:
        mkdir("nethack_3.4.3")
        chdir("nethack_3.4.3")
        cmd = "convert -crop 32x32 ../dawnhack_32.bmp hack%04d.png"
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
    monsters = [340, 326, 0, 20, 71, 42, 95, 73]
    generate(monsters, "monsters.png")
    special_items = [786, 660, 664, 672, 274, 586]
    generate(special_items, "special_items.png")
    items = [411, 465, 533, 423, 450, 412, 541, 525, 510, 574]
    generate(items, "items.png")
    misc = [852, 856, 859, 855, 229, 52]
    generate(misc, "misc.png")
    levels = [848, 823, 830, 831, 832, 833, 834, 835, 837, 838, 839, 840, 836]
    generate(levels, "levels.png")
    generate(levels+monsters+special_items+items+misc, "all.png")
    print("first monster:", len(levels))
    print("first special:", len(levels)+len(monsters))
    print("first item:", len(levels)+len(monsters)+len(special_items))
    print("first misc:", len(levels)+len(monsters)+len(special_items)+len(items))
    print("void:", len(levels)+len(monsters)+len(special_items)+len(items)+len(misc))


main()
