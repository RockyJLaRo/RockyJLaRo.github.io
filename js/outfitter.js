/*global $ */
/*jslint devel: true, browser: true, indent: 2, white: true, plusplus: true, bitwise: true, vars: true, ass: true */

$(function () {
    'use strict';
    var
        //shared variables for MediaWiki:Outfiter/Template.js and MediaWiki:Outfiter.js START
        loading_img = 'https://static.wikia.nocookie.net/tibia/en/images/8/81/Outfiter_Loading.gif',
        error_img = 'https://static.wikia.nocookie.net/tibia/en/images/f/f6/Outfiter_Error.png',

        // ---------------------------------------------------------------------------
        // DATA: Mounts (index = mount id). Keep in sync with Template:MountLink.
        // Append new mounts at the end. Index comments (//0, //5, ...) mark every 5 ids.
        // Also update outfiter_sprites_mount_standing / _walking / _colourisable / special delays if needed.
        // ---------------------------------------------------------------------------
        outfiter_mount_names = [
            //0
            'None', 'Widow_Queen', 'Racing_Bird', 'War_Bear', 'Black_Sheep_(Mount)',
            //5
            'Midnight_Panther_(Mount)', 'Draptor_(Mount)', 'Titanica', 'Tin_Lizzard', 'Blazebringer',
            //10
            'Rapid_Boar', 'Stampor_(Mount)', 'Undead_Cavebear_(Mount)', 'Crystal_Wolf_(Mount)', 'Dromedary_(Mount)',
            //15
            'Kingly_Deer', 'Donkey_(Mount)', 'Scorpion_King', 'Tamed_Panda', 'Tiger_Slug',
            //20
            'Uniwheel', 'Rented_Horse_(A)', 'Rented_Horse_(B)', 'Rented_Horse_(C)', 'Armoured_War_Horse',
            //25
            'War_Horse', 'Lady_Bug', 'Manta_Ray_(Mount)', 'Shadow_Draptor', 'Gnarlhound_(Mount)',
            //30
            'Dragonling_(Mount)', 'Magma_Crawler_(Mount)', 'Ironblight_(Mount)', 'Crimson_Ray', 'Steelbeak',
            //35
            'Water_Buffalo_(Mount)', 'Tombstinger', 'Platesaurian', 'Ursagrodon', 'The_Hellgrip',
            //40
            'Noble_Lion_(Mount', 'Desert_King', 'Shock_Head_(Mount)', 'Walker_(Mount)', 'Azudocus',
            //45
            'Carpacosaurus', 'Death_Crawler', 'Flamesteed', 'Jade_Lion', 'Jade_Pincer',
            //50
            'Nethersteed', 'Tempest', 'Winter_King', 'Blackpelt', 'Shadow_Hart',
            //55
            'Black_Stag', 'Emperor_Deer', 'Flying_Divan', 'Magic_Carpet', 'Floating_Kashmir',
            //60
            'Doombringer', 'Tundra_Rambler', 'Highland_Yak', 'Glacier_Vagabond', 'Golden_Dragonfly',
            //65
            'Steel_Bee', 'Copper_Fly', 'Hailstorm_Fury', 'Poisonbane', 'Siegebreaker',
            //70
            'Woodland_Prince', 'Glooth_Glider', 'Ringtail_Waccoon', 'Night_Waccoon', 'Emerald_Waccoon',
            //75
            'Flitterkatzen', 'Venompaw', 'Batcat', 'Sea_Devil', 'Coralripper',
            //80
            'Plumfish', 'Gorongra', 'Noctungra', 'Silverneck', 'Rented_Horse_(Recruiter)',
            //85
            'Slagsnare', 'Nightstinger', 'Razorcreep', 'Rift_Runner', 'Nightdweller',
            //90
            'Frostflare', 'Cinderhoof', 'Bloodcurl', 'Leafscuttler', 'Mouldpincer',
            //95
            'Sparkion_(Mount)', 'Swamp_Snapper', 'Mould_Shell', 'Reed_Lurker', 'Neon_Sparkid',
            //100[]
            'Vortexion', 'Ivory_Fang', 'Shadow_Claw', 'Snow_Pelt', 'Stone_Rhino_(Mount)',
            //105
            'Arctic_Unicorn', 'Blazing_Unicorn', 'Prismatic_Unicorn', 'Cranium_Spider', 'Cave_Tarantula',
            //110
            'Gloom_Widow', 'Mole_(Mount)', 'Marsh_Toad', 'Sanguine_Frog', 'Toxic_Toad',
            //115
            'Fleeting_Knowledge', 'Ebony_Tiger', 'Feral_Tiger', 'Jungle_Tiger', 'Tawny_Owl',
            //120
            'Snowy_Owl', 'Boreal_Owl', 'Lacewing_Moth', 'Hibernal_Moth', 'Cold_Percht_Sleigh',
            //125
            'Bright_Percht_Sleigh', 'Dark_Percht_Sleigh', 'Festive_Snowman', 'Muffled_Snowman', 'Caped_Snowman',
            //130
            'Rabbit_Rickshaw', 'Bunny_Dray', 'Cony_Cart', 'Nightmarish_Crocovile', 'River_Crocovile',
            //135
            'Swamp_Crocovile', 'Cerberus_Champion', 'Jousting_Eagle', 'Gryphon_(Mount)', 'Battle_Badger',
            //140
            'Ether_Badger', 'Zaoan_Badger', 'Blue_Rolling_Barrel', 'Green_Rolling_Barrel', 'Red_Rolling_Barrel',
            //145
            'Antelope', 'Haze', 'Snow_Strider', 'Dusk_Pryer', 'Dawn_Strayer',
            //150
            'Cold_Percht_Sleigh_Variant', 'Bright_Percht_Sleigh_Variant', 'Dark_Percht_Sleigh_Variant', 'Finished_Cold_Percht_Sleigh', 'Finished_Bright_Percht_Sleigh',
            //155
            'Finished_Dark_Percht_Sleigh', 'Benevolent_Coral_Rhea', 'Benevolent_Eventide_Nandu', 'Benevolent_Savanna_Ostrich', 'Coral_Rhea',
            //160
            'Eventide_Nandu', 'Savanna_Ostrich', 'Phantasmal_Jade', 'White_Lion', 'Cunning_Hyaena',
            //165
            'Scruffy_Hyaena', 'Voracious_Hyaena', 'Krakoloss', 'Festive_Mammoth', 'Holiday_Mammoth',
            //170
            'Merry_Mammoth', 'Void_Watcher', 'Rune_Watcher', 'Rift_Watcher', 'Dandelion',
            //175
            'Hyacinth', 'Peony', 'Singeing_Steed', 'Shellodon', 'Phant',
            //180
            'Rustwurm', 'Bogwurm', 'Gloomwurm', 'Emerald_Raven', 'Mystic_Raven',
            //185
            'Radiant_Raven', 'Gloothomotive', 'Dreadhare', 'Ember_Saurian', 'Emerald_Sphinx',
            //190
            'Floating_Augur', 'Floating_Sage', 'Floating_Scholar', 'Gold_Sphinx', 'Jackalope',
            //195
            'Jungle_Saurian', 'Lagoon_Saurian', 'Shadow_Sphinx', 'Wolpertinger', 'Topaz_Shrine',
            //200
            'Jade_Shrine', 'Obsidian_Shrine', 'Poppy_Ibex', 'Mint_Ibex', 'Cinnamon_Ibex',
            //205
            'Giant_Beaver', 'Ripptor', 'Parade_Horse', 'Jousting_Horse', 'Tourney_Horse',
            //210
            'Mutated_Abomination', 'Brass_Speckled_Koi', 'Ink_Spotted_Koi', 'Tangerine_Flecked_Koi', 'Frostbringer',
            //215
            'Winterstride', 'Icebreacher', 'Boisterous_Bull', 'Obstinate_Ox', 'Surly_Steer',
            //220
            'Foxmouse_(Mount)', 'Spirit_of_Purity', 'Darkfire_Devourer', 'Corpsefire_Skull', 'Magma_Skull',
            //225
            'Doom_Skull', 'Mystic_Jaguar_(Mount)', 'Gorgon_Hydra', 'Dawnbringer_Pegasus', 'Wrathfire_Pegasus',
            //230
            'Skybreaker_Pegasus', 'Glacier_Wyrm', 'Bog_Tyrant', 'Crimson_Fang', 'Pegasus',
            //235
            'Bumblebee', 'Primal_Demonosaur', 'Pallbearer', 'Hell_Demonosaur', 'Alpha_Demonosaur',
            //240
            'Night_Locust', 'Leaf_Locust', 'Pearl_Locust', 'Satin_Moth', 'Corpse_Phoenix',
            //245
            'Death_Phoenix', 'Soul_Phoenix', 'Gloom_Maw_(Mount)', 'Battle_Werewolf', 'Battlefrazzle',
            //250
            'Tidal_Seawater_Predator', 'Ashen_Coast_Predator', 'Crimson_Bay_Predator', 'Flame_Bear', 'Guardian_Lion',
            //255
            'Reliable_Ram', 'Vampiric_Hound', 'Night_Hound', 'Infernal_Hound', 'Djinntaur',
            //260
            'Radiant_Nimbus_(Mount)', 'Jaracal_(Mount)', 'Landsailer'
            //265

            //270

            //275

            //280

            //285

            //290

            //295

            //300

        ],

        // ---------------------------------------------------------------------------
        // DATA: Creatures (index = creature id). Currently separate from outfits/mounts;
        // selecting a creature clears outfit+mount and vice versa.
        // Append new creatures at the end. Add irregular sprite counts to
        // outfiter_sprites_creature_standing / _walking when needed.
        // Sprite sheets are loaded from Outfiter:Creature/<Name> (same pattern as mounts).
        // ---------------------------------------------------------------------------
        outfiter_creature_names = [
            //0
            'None', 'Orc_Warlord', 'War_Wolf', 'Orc_Rider', 'Orc',
            //5
            'Orc_Shaman', 'Orc_Warrior', 'Orc_Berserker', 'Necromancer', 'Butterfly_(Yellow)',
            //10
            'Massive_Water_Elemental', 'Black_Sheep', 'Sheep', 'Troll', 'Bear',
            //15
            'Bonelord', 'Ghoul', 'Slime', 'Quara_Predator', 'Rat',
            //20
            'Cyclops', 'Minotaur_Mage', 'Minotaur_Archer', 'Minotaur', 'Rotworm',
            //25
            'Wolf', 'Snake', 'Minotaur_Guard', 'Spider', 'Deer',
            //30
            'Dog', 'Skeleton', 'Dragon', 'Demon', 'Poison_Spider',
            //35
            'Demon_Skeleton', 'Giant_Spider', 'Dragon_Lord', 'Fire_Devil', 'Lion',
            //40
            'Polar_Bear', 'Scorpion', 'Wasp', 'Bug', 'Quara_Constrictor',
            //45
            'Quara_Hydromancer', 'Ghost', 'Fire_Elemental', 'Orc_Spearman', 'Green_Djinn',
            //50
            'Winter_Wolf', 'Frost_Troll', 'Witch', 'Behemoth', 'Cave_Rat',
            //55
            'Monk', 'Priestess', 'Orc_Leader', 'Pig', 'Goblin',
            //60
            'Elf', 'Elf_Arcanist', 'Elf_Scout', 'Mummy', 'Dwarf_Geomancer',
            //65
            'Stone_Golem', 'Vampire', 'Dwarf', 'Dwarf_Guard', 'Dwarf_Soldier',
            //70
            'Quara_Mantassin', 'Hero', 'Rabbit', 'Swamp_Troll', 'Quara_Pincher',
            //75
            'Banshee', 'Ancient_Scarab', 'Blue_Djinn', 'Cobra', 'Larva',
            //80
            'Scarab', 'Undead_Pharaoh_(A)', 'Undead_Pharaoh_(B)', 'Pirate_Marauder', 'Hyaena',
            //85
            'Gargoyle', 'Pirate_Cutthroat', 'Pirate_Buccaneer', 'Pirate_Corsair', 'Lich',
            //90
            'Crypt_Shambler', 'Bonebeast', 'Deathslicer', 'Efreet', 'Marid',
            //95
            'Badger', 'Skunk', 'Elder_Bonelord', 'Gazer', 'Yeti',
            //100
            'Chicken', 'Crab', 'Lizard_Templar', 'Lizard_Sentinel', 'Lizard_Snakecharmer',
            //105
            'Kongra', 'Merlkin', 'Sibang', 'Crocodile', 'Carniphila_(A)',
            //110
            'Hydra', 'Bat', 'Panda', 'Centipede', 'Tiger',
            //115
            'Carrion_Worm', 'Enlightened_of_the_Cult', 'Pirate_Skeleton', 'Pirate_Ghost', 'Tortoise',
            //120
            'Thornback_Tortoise', 'Mammoth', 'Blood_Crab', 'Elephant', 'Flamingo',
            //125
            'Butterfly_(Purple)', 'Dworc_Voodoomaster', 'Dworc_Fleshhunter', 'Dworc_Venomsniper', 'Parrot',
            //130
            'Terror_Bird', 'Tarantula', 'Serpent_Spawn', 'Spit_Nettle', 'Toad',
            //135
            'Seagull', 'Green_Frog', 'Dark_Monk', 'Butterfly_(Blue)', 'Butterfly_(Red)',
            //140
            'Ferumbras', 'Hand_of_Cursed_Fate', 'Undead_Dragon', 'Lost_Soul', 'Betrayed_Wraith',
            //145
            'Dark_Torturer', 'Spectre', 'Destroyer', 'Diabolic_Imp', 'Defiler',
            //150
            'Wyvern', 'Hellhound', 'Phantasm', 'Massive_Fire_Elemental', 'Hellfire_Fighter',
            //155
            'Juggernaut', 'Nightmare', 'Blightwalker', 'Plaguesmith', 'Frost_Dragon',
            //160
            'Chakoya_Tribewarden', 'Penguin', 'Braindeath', 'Frost_Giant', 'Husky',
            //165
            'Chakoya_Toolshaper', 'Chakoya_Windcaller', 'Ice_Golem', 'Silver_Rabbit', 'Crystal_Spider',
            //170
            'Frost_Giantess', 'Customer_Support', 'Dragon_Hatchling', 'Dragon_Lord_Hatchling', 'Squirrel',
            //175
            'Sea_Serpent', 'Cat', 'Cyclops_Smith', 'Cyclops_Drone', 'Troll_Champion',
            //180
            'Island_Troll', 'Frost_Dragon_Hatchling', 'Cockroach', 'Massive_Earth_Elemental', 'Water_Elemental',
            //185
            'The_Count', 'Massive_Energy_Elemental', 'Wyrm', 'The_Mutated_Pumpkin', 'Energy_Elemental',
            //190
            'Wisp', 'Rotworm_Queen', 'Goblin_Assassin', 'Goblin_Scavenger', 'Skeleton_Warrior',
            //195
            'Bog_Raider', 'Grim_Reaper', 'Earth_Elemental', 'Community_Manager', 'Black_Turtle',
            //200
            'Worker_Golem', 'Mutated_Rat', 'Undead_Gladiator', 'Mutated_Bat', 'Werewolf',
            //205
            'Azerus', 'Haunted_Treeling', 'Zombie', 'Vampire_Bride', 'Gozzler',
            //210
            'Acid_Blob', 'Death_Blob', 'Mercury_Blob', 'Young_Sea_Serpent', 'Mutated_Tiger',
            //215
            'Green_Shade', 'Nightstalker', 'Nightmare_Scion', 'Hellspawn', 'Mutated_Human',
            //220
            'War_Golem', 'Medusa', 'Queen_Eloise', 'King_Tibianus', 'Clay_Guardian',
            //225
            'Draken_Warmaster', 'Lizard_High_Guard', 'Lizard_Legionnaire', 'Lizard_Dragon_Priest', 'Draken_Spellweaver',
            //230
            'Gnarlhound', 'Orc_Marauder', 'Lizard_Zaogun', 'Lizard_Chosen', 'Eternal_Guardian',
            //235
            'Terramite', 'Wailing_Widow', 'Lancer_Beetle', 'Insect_Swarm', 'Sandcrawler',
            //240
            'Ghastly_Dragon', 'Brimstone_Bug', 'Spawn_of_Devovorga', 'Devovorga_(Immune)', 'Souleater',
            //245
            'Snake_God_Essence', 'Draken_Abomination', 'Killer_Caiman', 'Irahsae', 'Teneshpar',
            //250
            'Chikhaton', 'Draken_Elite', 'Anmothra', 'Lizard_Abomination', 'Devovorga',
            //255
            'Boar', 'Stampor', 'Draptor', 'Crustacea_Gigantica', 'Undead_Cavebear',
            //260
            'Midnight_Panther', 'Crystal_Wolf', 'Wild_Horse', 'Mad_Mage', 'Iron_Servant',
            //265
            'Golden_Servant', 'Diamond_Servant', 'Sandstone_Scorpion', 'Donkey', 'White_Deer',
            //270
            'Insectoid_Scout', 'Dromedary', 'Slug', 'Yielothax', 'Shaburak_Lord',
            //275
            'Askarak_Lord', 'Bog_Frog', 'Deepling_Scout', 'Thornfire_Wolf', 'Raging_Mage',
            //280
            'Shaburak_Demon', 'Shaburak_Prince', 'Askarak_Prince', 'Askarak_Demon', 'Energized_Raging_Mage',
            //285
            'Feverish_Citizen', 'Shadow_Draptor', 'Horse', 'Horse_(A)', 'Horse_(B)',
            //290
            'Horse_(C)', 'Deepling_Warrior', 'Deepling_Guard', 'Deepling_Spellsinger', 'Jaul',
            //295
            'Obujos', 'Tanjis', 'Ladybug', 'Manta_Ray', 'Calamary',
            //300
            'Jellyfish', 'Shark', 'Northern_Pike', 'Fish', 'Crawler',
            //305 - Still need to add Base64 for the ones below.
            'Spidris', 'Kollos', 'Floor_Blob', 'Swarmer', 'Spitter',
            //310
            'Waspoid', 'Poodle', 'Deepling_Worker', 'Wild_Dog', 'Stone_Devourer',
            //315
            'Armadile', 'Humongous_Fungus', 'Weeper', 'Orewalker', 'Lava_Golem',
            //320
            'Magma_Crawler', 'Enslaved_Dwarf', 'Abyssador', 'Lost_Berserker', 'Cliff_Strider',
            //325
            'Ironblight', 'Hideous_Fungus', 'Deathstrike', 'Gnomevil', 'Dragonling',
            //330
            'Crystal_Golem', 'Vulcongra', 'Wiggler', 'Crystalcrusher', 'Humorless_Fungus',
            //335
            'Water_Buffalo', 'Drillworm', 'Emerald_Damselfly', 'Salamander', 'Marsh_Stalker',
            //340
            'Pigeon', 'Swampling', 'Lost_Husher', 'Lost_Basher', 'Lost_Thrower',
            //345
            'Rafzan', 'Yellow_Paper_Man', 'Hamster', 'Rorc', 'Shadow_Pupil',
            //350
            'Blood_Hand', 'Blood_Priest', 'Vicious_Manbat', 'Vampire_Viscount', 'Nightfiend',
            //355
            'The_Pale_Count', 'Gravedigger', 'White_Shade', 'Elder_Wyrm', 'Tyrn',
            //360
            'The_Welter', 'White_Pale', 'Shlorg', 'Tarnished_Spirit', 'Leaf_Golem',
            //365
            'Murderous_Ghost', 'Forest_Fury', 'Roaring_Lion', 'Wilting_Leaf_Golem', 'Shock_Head',
            //370
            'Sight_of_Surrender', 'Guzzlemaw', 'Silencer', 'Choking_Fear', 'Terrorsleep',
            //375
            'Retching_Horror', 'Shimmying_Butterfly', 'Demon_Outcast', 'Gaz\'haragoth', 'Shiversleep',
            //380
            'Feversleep', 'Frazzlemaw', 'Mawhawk', 'Wounded_Cave_Draptor', 'Glooth_Golem',
            //385
            'Metal_Gargoyle', 'Blood_Beast', 'Rustheap_Golem', 'Glooth_Anemone', 'Walker',
            //390
            'Moohtant', 'Minotaur_Amazon', 'Execowtioner', 'Mooh\'tah Warrior', 'Minotaur_Hunter',
            //395
            'Worm_Priestess', 'Glooth_Blob', 'Rot_Elemental', 'Devourer', 'Seacrest_Serpent',
            //400
            'Deep_Terror', 'Glooth_Horror', 'Professor_Maxxen', 'Glooth_Bomb', 'Tentacle_(A)',
            //405
            'Tainted_Soul', 'Redeemed_Soul', 'Gloom_Wolf', 'Omnivora', 'Werebear',
            //410
            'Wereboar', 'Werebadger', 'Ghost_Wolf', 'Feroxa', 'Ferumbras_Soul_Splinter',
            //415
            'Ascending_Ferumbras', 'Vexclaw', 'Grimeleech', 'Hellflayer', 'Ogre_Brute',
            //420
            'Ogre_Savage', 'Ogre_Shaman', 'Clomp', 'Sparkion', 'Breach_Brood',
            //425
            'Reality_Reaver', 'Dread_Intruder', 'Giant_Spider_Red_Eyes', 'Giant_Spider_Yellow_Eyes', 'Giant_Spider_Blue_Eyes',
            //430
            'Giant_Spider_Black_Eyes', 'Giant_Spider_Green_Eyes', 'Wolf_(Nostalgia)', 'Bear_(Nostalgia)', 'Bug_(Nostalgia)',
            //435
            'Pig_(Nostalgia)', 'Spider_(Nostalgia)', 'Wasp_(Nostalgia)', 'Bonelord_(Nostalgia)', 'Black_Dragon',
            //440
            'Zorvorax_(A)', 'Shaper_Matriarch', 'Orclops_Doomhauler', 'Stone_Rhino', 'Dragonking_Zyrtarch',
            //445
            'The_Last_Lore_Keeper', 'Lloyd', 'The_Freezing_Time_Guardian', 'The_Blazing_Time_Guardian', 'The_Time_Guardian',
            //450
            'Putrid_Mummy', 'Pooka', 'Twisted_Pooka', 'The_Source_Of_Corruption', 'Boogy',
            //455
            'Pixie', 'The_False_God', 'Misguided_Shadow', 'Liqour_Spirit', 'The_Unarmored_Voidborn',
            //460
            'Leiden', 'Nymph', 'Barkless_Devotee', 'Skullfrost', 'Emberwing',
            //465
            'Grovebeast', 'Thundergiant', 'Minotaur_Idol', 'The_Sandking', 'Fox',
            //470
            'Werefox', 'Sharpclaw', 'Stonerefiner', 'Deepworm', 'Diremaw',
            //475
            'Tunnel_Tyrant', 'Cave_Devourer', 'Chasm_Spawn', 'Black_Vixen', 'Bloodback',
            //480
            'Shadowpelt', 'Lava_Lurker', 'Last_Planegazer', 'The_Baron_From_Below', 'The_Count_Of_The_Core',
            //485
            'The_Duke_Of_The_Depths', 'Mole', 'Ancient_Spawn_Of_Morgathla', 'Animated_Feather', 'Flying_Book',
            //490
            'Ink_Blob', 'Knowledge_Elemental', 'Biting_Book', 'Librarian', 'Deathling_Scout',
            //495
            'Brokul', 'Thawing_Dragon_Lord', 'Preceptor_Lazare', 'Zorvorax_(B)', 'Deathling_Spellsinger',
            //500
            'Malofur_Mangrinder', 'Plagueroot', 'Thanatursus', 'Arachnophobica', 'Maxxenius',
            //505
            'Alptramun', 'The_Nightmare_Beast', 'Lacewing_Moth', 'Hibernal_Moth', 'Burning_Man',
            //510
            'Baleful_Bunny', 'Bonny_Bunny', 'Animated_Snowman', 'Percht_Disguise', 'Cart_Packed_With_Gold',
            //515
            'Adult_Goanna', 'Young_Goanna', 'Urmahlullu_the_Immaculate', 'Scarlett_Etzel', 'Ogre_Ruffian',
            //520
            'Ogre_Rowdy', 'Ogre_Sage', 'Ugly_Monster', 'Gryphon', 'King_Zelos',
            //525
            'Cow', 'Roast_Pork', 'King_Chuck', 'The_Great_Schnitzel', 'Rampaging_Beer_Elemental',
            //530
            'The_Pale_Worm', 'Greed_Worm', 'The_Fear_Feaster', 'The_Unwelcome', 'The_Dread_Maiden',
            //535
            'White_Lion', 'Planedweller', 'Bony_Sea_Devil', 'Cloak_of_Terror', 'Many_Faces',
            //540
            'Branchy_Crawler', 'Brachiodemon', 'Goshnar\'s_Cruelty', 'Goshnar\'s_Greed', 'Goshnar\'s_Spite',
            //545
            'Goshnar\'s_Malice', 'Goshnar\'s_Hatred', 'Goshnar\'s_Megalomania_(A)', 'Rotten_Golem', 'Infernal_Demon',
            //550
            'Turbulent_Elemental', 'Courage_Leech', 'Goshnar\'s_Megalomania_(B)', 'Exotic_Cave_Spider', 'Mossmasher',
            //555
            'Snowbash', 'Sandscourge', 'Bladespark', 'Exotic_Bat', 'Ratmiral_Blackwhiskers',
            //560
            'The_Abomination', 'Lavaworm', 'Varnished_Diremaw', 'Streaked_Devourer', 'Eyeless_Devourer',
            //565
            'Blemished_Spawn', 'Afflicted_Strider', 'Lavafungus', 'The_Brainstealer', 'The_Mega_Magmaoid',
            //570
            'Lava_Elemental', 'Phant', 'Carnisylvan_Sapling', 'Murmillion', 'Scissorion',
            //575
            'Hoodinion', 'Mearidion', 'Domestikion', 'Uninvited', 'Unexpected',
            //580
            'Unwanted', 'Unsolicited', 'Lucky_Dragon', 'Morshabaal', 'Lord_Retro',
            //585
            'Parder', 'Jungle_Moa', 'Two-headed_Turtle', 'Naga_Boss_(A)', 'Naga_Boss_(B)',
            //590
            'Timira_the_Many-headed', 'Sulphider', 'Sulphur_Spouter', 'Gore_Horn', 'Sabretooth',
            //595
            'Emerald_Tortoise', 'Undertaker', 'Nighthunter', 'Hulking_Prehemoth', 'Stalking_Stalk',
            //600
            'Fungosaurus', 'Mantosaurus', 'Headpecker', 'Noxious_Ripptor', 'Gorerilla',
            //605
            'Shrieking_Cry-stal', 'Mercurial_Menace', 'Foam_Stalker', 'Makara', 'The_Primal_Menace',
            //610
            'Plunder_Patriarch', 'The_End_of_Days', 'Blue_Mutagen', 'Yellow_Mutagen', 'Purple_Mutagen',
            //615
            'Iks_Aucar', 'Iks_Chuka', 'Iks_Pututu', 'Iks_Ahpututu', 'Ahau',
            //620
            'Cursed_Ape', 'Avatar_of_Steel', 'Avatar_of_Light', 'Avatar_of_Storm', 'Avatar_of_Nature',
            //625
            'The_Monster', 'Crape_man', 'Liodile', 'Boar_man', 'Harpy',
            //630
            'Carnivostrich', 'Rhindeer', 'Mycobiontic_Beetle', 'Meandering_Mushroom', 'Darklight_Construct',
            //635
            'Converter', 'Darklight_Matter', 'Oozing_Corpus', 'Oozing_Carcass', 'Darklight_Emitter',
            //640
            'Bloodjaw', 'White_Tiger', 'Bloated_Man-maggot', 'Rotten_Man-maggot', 'Walking_Pillar',
            //645
            'Wandering_Pillar', 'Sopping_Carcass', 'Sopping_Corpus', 'Darklight_Source', 'Darklight_Striker',
            //650
            'Murcion', 'Ichgahal', 'Chagorz', 'Vemiath', 'Echo_Of_Ichgahal_/_Murcion',
            //655
            'Echo_Of_Chagorz_/_Vemiath', 'Bakragore', 'Albino_Dragon', 'Ragged_Rabid_Wolf', 'The_Rest_of_Ratha',
            //660
            'Ship_(White)', 'Ship_(Red)', 'Ship_(Yellow)', 'Ship_(Green)', 'Ship_(Blue)',
            //665
            'Ship_(Black)', 'Storm', 'Fryclops', 'Atab', 'Iks_Yapunac',
            //670
            'The_Draccoon', 'Dragolisk', 'Wardragon', 'Mitmah_Scout', 'Mitmah_Seer',
            //675
            'Mega_Dragon', 'Mitmah_Vanguard', 'Bulltaur_Brute', 'Bulltaur_Alchemist', 'Bulltaur_Forgepriest',
            //680
            'Mystic_Jaguar', 'Chocolate_Blob', 'Honey_Elemental', 'Wafer_Paper_Butterfly', 'Gingerbread_Man',
            //685
            'Candy_Horror', 'Quara_Looter', 'Candy_Floss_Elemental', 'Truffle', 'Truffle_Cook',
            //690
            'Truffle_Worker', 'Sugar_Cube', 'Fruit_Drop', 'Mint_Drop', 'Sugar_Cube_Worker',
            //695
            'Cream_Blob', 'Quara_Plunderer', 'Quara_Raider', 'Rootthing_Nutshell', 'Rootthing_Amber_Shaper',
            //700
            'Rootthing_Bug_Tracker', 'Sugar_Daddy_/_Mommy', 'The_Rootkraken', 'Blightling', 'Grove_Guardian',
            //705
            'Carniphila_(B)', 'Carniphila_(C)', 'Common_Beetle', 'Blight_Bug', 'Thorn_Lily',
            //710
            'Rampant_Barrier', 'Herd_Weevil', 'Spellreaper_Inferniarch', 'Hellhunter_Inferniarch', 'Brinebrute_Inferniarch',
            //715
            'Sineater_Inferniarch', 'Broodrider_Inferniarch', 'Gorger_Inferniarch', 'Arbaziloth_(E)', 'Arbaziloth_(D)',
            //720
            'Arbaziloth_(C)', 'Arbaziloth_(B)', 'Arbaziloth_(A)', 'Rotrender_(B)', 'Imp',
            //725
            'Omniphant', 'Moonhunter', 'Merudri', 'Avatar_of_Balance', 'Rotrender_(A)',
            //730
            'Rotrender_(C)', 'Spirit_Elemental', 'Vampiric_Essence', 'Bluebeak', 'Norcferatu_Nightweaver',
            //735
            'Norcferatu_Heartless', 'Dworc_Shadowstalker', 'Orclops_Bloodbreaker', 'Varg', 'Hawk_Hopper',
            //740
            'Lion_Hydra', 'Vladrukh', 'Gloom_Maw', 'Vampire_Bat', 'Norcferatu_Abomination',
            //745
            'Eldritch_Dragon_Lord', 'The_Gravedigger', 'Ice_Horror', 'Dragon_Ancestor', 'Cyclursus',
            //750
            'Crypt_Fiend', 'Walking_Dread', 'Crypt_Construct', 'Haunted_Hunter', 'Creepy_Crawler',
            //755
            'Night_Harpy', 'Court_Warlock', 'Roaming_Dread', 'Crypt_Mage', 'Stag',
            //760
            'Imperial', 'Herald_of_Fire', 'Storm_(B)', 'Moonstone_Excavator', 'Mimar_Haffar',
            //765
            'Phosphorus_(A)', 'Moonstone_Overseer', 'Maior_Domus_(A)', 'Maior_Domus_(B)', 'Phosphorus_(B)',
            //770
            'Radiant_Warden', 'Radiant_Templar', 'Radiant_Paragon', 'Radiant_Inquisitor', 'Radiant_Zealot',
            //775
            'Radiant_Acolyte', 'Moonspawn_Blightspitter', 'Moonspawn_Oozecrown', 'Moonspawn_Juggernaut'
            //780

            //785

            //790

            //795

            //800

            //805

            //810

            //815

            //820

            //825

            //830

            //835

            //840

            //845

            //850

            //855

            //860

            //865

            //870

            //875

            //880

            //885

            //890

            //895

            //900

            //905

            //910

            //915

            //920

            //925

            //930

            //935

            //940

            //945

            //950

            //955

            //960

            //965

            //970

            //975

            //980

            //985

            //990

            //995

            //1000

        ],

        // ---------------------------------------------------------------------------
        // DATA: Outfits 0-99. DO NOT append here past id 99 — use outfiter_names200.
        // Keep in sync with Template:OutfiterLink. Names use underscores (spaces in UI).
        // Also update outfiter_sprites_standing/_walking, special delays, and the
        // outfiter_u/m/a/f/no_ride/no_floor_move name maps when an outfit has exceptions.
        // ---------------------------------------------------------------------------
        outfiter_names0 = [
            //0
            'Citizen', 'Hunter', 'Mage', 'Knight', 'Nobleman',
            //5
            'Summoner', 'Warrior', 'Barbarian', 'Druid', 'Wizard',
            //10
            'Oriental', 'Pirate', 'Assassin', 'Beggar', 'Shaman',
            //15
            'Norseman', 'Jester', 'Brotherhood', 'Nightmare', 'Demon_Hunter',
            //20
            'Yalaharian', 'Newly_Wed', 'Warmaster', 'Wayfarer', 'Afflicted',
            //25
            'Elementalist', 'Deepling', 'Insectoid', 'Entrepreneur', 'Crystal_Warlord',
            //30
            'Soil_Guardian', 'Demon_Outfit', 'Cave_Explorer', 'Dream_Warden', 'Jersey',
            //35
            'Glooth_Engineer', 'Beastmaster', 'Champion', 'Conjurer', 'Chaos_Acolyte',
            //40
            'Ranger', 'Death_Herald', 'Ceremonial_Garb', 'Puppeteer', 'Spirit_Caller',
            //45
            'Evoker', 'Seaweaver', 'Recruiter', 'Sea_Dog', 'Royal_Pumpkin',
            //50
            'Rift_Warrior', 'Winter_Warden', 'Philosopher', 'Arena_Champion', 'Lupine_Warden',
            //55
            'Retro_Warrior', 'Retro_Summoner', 'Retro_Nobleman', 'Retro_Mage', 'Retro_Knight',
            //60
            'Retro_Hunter', 'Retro_Citizen', 'Festive_Outfit', 'Grove_Keeper', 'Pharaoh',
            //65
            'Trophy_Hunter', 'Herbalist', 'Sun_Priest', 'Makeshift_Warrior', 'Siege_Master',
            //70
            'Mercenary', 'Discoverer', 'Battle_Mage', 'Sinister_Archer', 'Pumpkin_Mummy',
            //75
            'Dream_Warrior', 'Percht_Raider', 'Owl_Keeper', 'Guidon_Bearer', 'Lion_of_War',
            //80
            'Veteran_Paladin', 'Void_Master', 'Golden_Outfit', 'Hand_of_the_Inquisition', 'Breezy_Garb',
            //85
            'Orcsoberfest_Garb', 'Poltergeist', 'Falconer', 'Herder', 'Trailblazer',
            //90
            'Dragon_Slayer', 'Revenant', 'Jouster', 'Moth_Cape', 'Rascoohan',
            //95
            'Merry_Garb', 'Rune_Master', 'Forest_Warden', 'Citizen_of_Issavi', 'Royal_Bounacean_Advisor'
            //DO NOT ADD MORE OUTFITS HERE, GO TO outfiter_names200
        ],
        // ---------------------------------------------------------------------------
        // DATA: Outfits 100-199 (mostly non-player / NPC / special). Index = id.
        // Id 105 is reserved as 'None' (outfiter_outfit_none_id). Keep Template:OutfiterLink in sync.
        // ---------------------------------------------------------------------------
        outfiter_names100 = [
            //100
            'Frog', 'Elf', 'Dwarf', 'Archdemon', 'CM',
            //105
            'None', 'Barbarian_(A)', 'Barbarian_(B)', 'Barbarian_(C)', 'Barbarian_(D)',
            //110
            'Gnome', 'Corym_(A)', 'Corym_(B)', 'Corym_(C)', 'Cultist',
            //115
            'Demon_Hellfire', 'Demon_Ram_(A)', 'Destroyer_from_Beyond', 'Galvanic_Terror', 'Pit_Demon',
            //120
            'Faun', 'Orclops_Ravager', 'Shaper', 'The_First_Dragon', 'Falcon_(A)',
            //125
            'Falcon_(B)', 'True_Asura', 'Squid', 'Book', 'Guardian_of_Tales',
            //130
            'Demon_Ram_(B)', 'Dreamelf', 'Spectre_(A)', 'Spectre_(B)', 'Carnivora',
            //135
            'Hireling_Banker', 'Hireling_Trader', 'Hireling_Cook', 'Hireling_Steward', 'Hireling_Servant',
            //140
            'Cobra_Mercenary', 'Issavi_Villager', 'Energy_Wisp', 'Lamassu', 'Sphinx',
            //145
            'Manticore', 'Lich_Knight_(A)', 'Lich_Knight_(B)', 'Lich_Knight_(C)', 'Orger',
            //150
            'Lost_Soul', 'Phantom', 'Lion_(A)', 'Lion_(B)', 'Werehyaena',
            //155
            'Werelion', 'Pirat', 'Raccoon', 'Tyrant', 'Girtablilu',
            //160
            'Bashmu', 'Carnisylvan', 'Chimera', 'Naga_(A)', 'Naga_(B)',
            //170
            'Naga_(C)', 'Naga_(D)', 'Gnome_Female', 'Scientist', 'Weretiger',
            //180
            'Werecrocodile', 'Werepanther', 'Merudri', 'Crusader', 'Wyrmling',
            //185
            'Headwalker', 'Shell_Drake', 'Sugar_Fairy', 'Silverfrost', 'Iceplume'
            //190

            //195

            //200

            //205

            //210

            //215

            //220

            //225

            //230

            //235

            //240

            //245

            //250

        ],
        // ---------------------------------------------------------------------------
        // DATA: Outfits 200+. Append new player outfits here (next free id after last entry).
        // Keep Template:OutfiterLink in sync. Use underscores in names; UI replaces them with spaces.
        // ---------------------------------------------------------------------------
        outfiter_names200 = [
            //200
            'Dragon_Knight', 'Arbalester', 'Royal_Costume', 'Formal_Dress', 'Ghost_Blade',
            //205
            'Nordic_Chieftain', 'Fire-Fighter', 'Fencer', 'Shadowlotus_Disciple', 'Ancient_Aucar',
            //210
            'Frost_Tracer', 'Armoured_Archer', 'Decaying_Defender', 'Darklight_Evoker', 'Flamefury_Mage',
            //215
            'Draccoon_Herald', 'Doom_Knight', 'Celestial_Avenger', 'Blade_Dancer', 'Rootwalker',
            //220
            'Beekeeper', 'Fiend_Slayer', 'Field_Surgeon', 'Monk', 'Winged_Druid',
            //225
            'Martial_Artist', 'Necromancer', 'Illuminator', 'Bat_Knight', 'Feral_Trapper',
            //230
            'Phoenix_Evoker', 'Aerial_Disciple', 'Vampire_Noble', 'Moon_Guardian', 'Illuminated_Warrior',
            //235
            'Captains'
            //240

            //245

            //250

        ],
        //outfits with irregular amount of sprites, regular is 1 standing, 8 walking
        outfiter_sprites_standing = {
            Chaos_Acolyte: 8,
            Evoker: 8,
            Battle_Mage: 8,
            Lion_of_War: 8,
            Veteran_Paladin: 8,
            Void_Master: 8,
            Squid: 8,
            Book: 8,
            Guardian_of_Tales: 8,
            'Spectre_(A)': 8,
            'Spectre_(B)': 8,
            Hireling_Banker: 13,
            Hireling_Trader: 11,
            Hireling_Cook: 11,
            Hireling_Steward: 12,
            Hireling_Servant: 5, //pingpong
            Golden_Outfit: 8,
            Energy_Wisp: 8,
            Trailblazer: 8,
            Lost_Soul: 8,
            Revenant: 8,
            Rune_Master: 8,
            Tyrant: 8,
            Ghost_Blade: 8,
            'Fire-Fighter': 8,
            Armoured_Archer: 8,
            Decaying_Defender: 8,
            Darklight_Evoker: 8,
            Frost_Tracer: 8,
            Flamefury_Mage: 8,
            Celestial_Avenger: 8,
            Blade_Dancer: 8,
            Beekeeper: 8,
            Merudri: 8,
            Winged_Druid: 8,
            Necromancer: 8,
            Bat_Knight: 8,
            Phoenix_Evoker: 8,
            Aerial_Disciple: 8
        },
        outfiter_sprites_walking = {
            //None: 2,
            Gnome_Female: 2,
            'Corym_(C)': 2,
            Hireling_Banker: 13,
            Hireling_Trader: 11,
            Hireling_Cook: 11,
            Hireling_Steward: 12,
            Hireling_Servant: 5 //pingpong
        },

        // Creature irregular sprite counts (default: 1 standing, 8 walking — same as mounts)
        // Kept for backwards compatibility; prefer outfiter_creature_props when available.
        outfiter_sprites_creature_standing = {
            // e.g. SomeCreature: 8,
            Ghost: 8,
            Fire_Elemental: 8,
            Bonelord: 8,
            Elder_Bonelord: 8,
            Bat: 8,
            'Butterfly_(Yellow)': 8,
            'Butterfly_(Purple)': 8,
            Parrot: 8,
            Spit_Nettle: 8,
            Seagull: 8,
            'Butterfly_(Blue)': 8,
            'Butterfly_(Red)': 8,
            Wyvern: 8,
            Wisp: 8,
            Rotworm_Queen: 8,
            Mutated_Bat: 8,
            Acid_Blob: 8,
            Death_Blob: 8,
            Mercury_Blob: 8,
            Insect_Swarm: 8,
            Anmothra: 8,
            Jellyfish: 8,
            Lava_Golem: 8,
            Pigeon: 8,
            Tarnished_Spirit: 8,
            Murderous_Ghost: 8,
            Shimmying_Butterfly: 8,
            Glooth_Bomb: 12,
            Tainted_Soul: 8,
            Redeemed_Soul: 8,
            Ascending_Ferumbras: 8,
            The_Freezing_Time_Guardian: 8,
            The_Blazing_Time_Guardian: 8,
            The_Time_Guardian: 8,
            The_Source_Of_Corruption: 8,
            Pixie: 8,
            Misguided_Shadow: 8,
            Skullfrost: 8,
            Emberwing: 8,
            Grovebeast: 8,
            Thundergiant: 8,
            Lava_Lurker: 8,
            Animated_Feather: 8,
            Flying_Book: 8,
            Ink_Blob: 8,
            Knowledge_Elemental: 8,
            Librarian: 8,
            Alptramun: 8,
            Burning_Man: 8,
            King_Zelos: 8,
            The_Great_Schnitzel: 8,
            The_Fear_Feaster: 8,
            The_Dread_Maiden: 8,
            Cloak_of_Terror: 8,
            'Goshnar\'s_Greed': 8,
            'Goshnar\'s_Spite': 8,
            'Goshnar\'s_Hatred': 8,
            Mossmasher: 8,
            Snowbash: 8,
            Sandscourge: 8,
            Bladespark: 8,
            Exotic_Bat: 8,
            Lavaworm: 8,
            Sulphur_Spouter: 8,
            Nighthunter: 8,
            Mercurial_Menace: 8,
            Foam_Stalker: 8,
            The_End_of_Days: 8,
            Blue_Mutagen: 8,
            Yellow_Mutagen: 8,
            Purple_Mutagen: 8,
            Avatar_of_Steel: 8,
            Avatar_of_Light: 8,
            Avatar_of_Storm: 8,
            Avatar_of_Nature: 8,
            Darklight_Construct: 8,
            Converter: 8,
            Darklight_Matter: 8,
            Darklight_Emitter: 8,
            White_Tiger: 8,
            'Bloated_Man-maggot': 8,
            'Rotten_Man-maggot': 8,
            Walking_Pillar: 8,
            Wandering_Pillar: 8,
            Darklight_Source: 8,
            Darklight_Striker: 8,
            'Ship_(White)': 8,
            'Ship_(Red)': 8,
            'Ship_(Yellow)': 8,
            'Ship_(Green)': 8,
            'Ship_(Blue)': 8,
            'Ship_(Black)': 8,
            'Storm_(A)': 8,
            Chocolate_Blob: 8,
            Wafer_Paper_Butterfly: 8,
            The_Rootkraken: 8,
            Rampant_Barrier: 8,
            Omniphant: 8,
            Moonhunter: 8,
            Avatar_of_Balance: 8,
            Vampiric_Essence: 8,
            Norcferatu_Nightweaver: 8,
            Varg: 8,
            Vampire_Bat: 8,
            The_Gravedigger: 8,
            Herald_of_Fire: 8,
            'Storm_(B)': 8,
            'Phosphorus_(A)': 8,
            'Phosphorus_(B)': 8
        },
        outfiter_sprites_creature_walking = {
            // e.g. SomeCreature: 2,
            Massive_Water_Elemental: 2,
            Orc_Warlord: 2,
            Quara_Predator: 2,
            Quara_Constrictor: 2,
            Frost_Troll: 2,
            Orc_Leader: 2,
            Hero: 2,
            Quara_Pincher: 2,
            Banshee: 2,
            'Undead_Pharaoh_(A)': 2,
            'Undead_Pharaoh_(B)': 2,
            Gargoyle: 2,
            Pirate_Buccaneer: 2,
            Pirate_Corsair: 2,
            Deathslicer: 2,
            Marid: 2,
            Enlightened_of_the_Cult: 2,
            Terror_Bird: 2,
            Serpent_Spawn: 2,
            Toad: 2,
            Hand_of_Cursed_Fate: 2,
            Betrayed_Wraith: 2,
            Dark_Torturer: 2,
            Spectre: 2,
            Destroyer: 4,
            Defiler: 2,
            Hellhound: 2,
            Massive_Fire_Elemental: 2,
            Hellfire_Fighter: 2,
            Juggernaut: 2,
            Nightmare: 2,
            Blightwalker: 2,
            Plaguesmith: 2,
            Frost_Dragon: 2,
            Braindeath: 2,
            Crystal_Spider: 2,
            Customer_Support: 2,
            Sea_Serpent: 2,
            The_Count: 2,
            Massive_Energy_Elemental: 4,
            Wyrm: 2,
            The_Mutated_Pumpkin: 4,
            Energy_Elemental: 4,
            Grim_Reaper: 2,
            Community_Manager: 2,
            Black_Turtle: 2,
            Worker_Golem: 2,
            Mutated_Rat: 3,
            Werewolf: 2,
            Vampire_Bride: 2,
            Mutated_Tiger: 2,
            Green_Shade: 3,
            Nightmare_Scion: 2,
            Hellspawn: 2,
            War_Golem: 2,
            Medusa: 2,
            Queen_Eloise: 2,
            King_Tibianus: 2,
            Clay_Guardian: 3,
            Draken_Warmaster: 2,
            Lizard_High_Guard: 2,
            Lizard_Dragon_Priest: 2,
            Lizard_Zaogun: 2,
            Lizard_Chosen: 2,
            Eternal_Guardian: 2,
            Lancer_Beetle: 2,
            Brimstone_Bug: 2,
            Spawn_of_Devovorga: 2,
            'Devovorga_(Immune)': 2,
            Souleater: 2,
            Snake_God_Essence: 2,
            Draken_Abomination: 2,
            Killer_Caiman: 2,
            Irahsae: 2,
            Teneshpar: 2,
            Chikhaton: 2,
            Draken_Elite: 2,
            Lizard_Abomination: 2,
            Devovorga: 2,
            Mad_Mage: 2,
            Golden_Servant: 2,
            Diamond_Servant: 2,
            Shaburak_Lord: 2,
            Askarak_Lord: 2,
            Thornfire_Wolf: 2,
            Raging_Mage: 2,
            Shaburak_Demon: 2,
            Shaburak_Prince: 2,
            Askarak_Prince: 2,
            Askarak_Demon: 2,
            Energized_Raging_Mage: 2,
            Shadow_Draptor: 2,
            Horse: 2,
            Deepling_Guard: 2,
            Jaul: 2,
            Obujos: 2,
            Tanjis: 2,
            Shark: 2,
            Crawler: 2,
            Kollos: 2,
            Floor_Blob: 2,
            Spitter: 2,
            Wild_Dog: 2,
            Humongous_Fungus: 2,
            Weeper: 2,
            Orewalker: 2,
            Enslaved_Dwarf: 2,
            Abyssador: 2,
            Lost_Berserker: 2,
            Cliff_Strider: 2,
            Hideous_Fungus: 2,
            Deathstrike: 2,
            Gnomevil: 2,
            Vulcongra: 2,
            Wiggler: 2,
            Humorless_Fungus: 2,
            Drillworm: 2,
            Lost_Husher: 2,
            Lost_Basher: 2,
            Lost_Thrower: 2,
            Yellow_Paper_Man: 2,
            Hamster: 2,
            Shadow_Pupil: 2,
            Vicious_Manbat: 2,
            Vampire_Viscount: 2,
            Nightfiend: 2,
            White_Shade: 3,
            Elder_Wyrm: 2,
            Tyrn: 2,
            Shlorg: 2,
            Forest_Fury: 2,
            Silencer: 2,
            Terrorsleep: 2,
            Retching_Horror: 2,
            Demon_Outcast: 2,
            'Gaz\'haragoth': 2,
            Shiversleep: 2,
            Feversleep: 2,
            Frazzlemaw: 2,
            Glooth_Golem: 2,
            Metal_Gargoyle: 2,
            Blood_Beast: 2,
            Glooth_Anemone: 2,
            Minotaur_Amazon: 2,
            Minotaur_Hunter: 2,
            Worm_Priestess: 2,
            Glooth_Blob: 5,
            Devourer: 2,
            Glooth_Bomb: 3,
            Giant_Spider_Red_Eyes: 2,
            Giant_Spider_Yellow_Eyes: 2,
            Giant_Spider_Blue_Eyes: 2,
            Giant_Spider_Black_Eyes: 2,
            Giant_Spider_Green_Eyes: 2,
            'Wolf_(Nostalgia)': 2,
            'Bear_(Nostalgia)': 2,
            'Bug_(Nostalgia)': 2,
            'Pig_(Nostalgia)': 2,
            'Spider_(Nostalgia)': 2,
            'Wasp_(Nostalgia)': 2,
            'Bonelord_(Nostalgia)': 2,
            Ancient_Spawn_Of_Morgathla: 2,
            Sugar_Cube_Worker: 4
        },

        // ---------------------------------------------------------------------------
        // DATA: Per-creature properties (animation, addons, colourisation).
        // Optional keys — any omitted key falls back to defaults via
        // outfiter_creature_get_props(). Legacy standing/walking maps still apply
        // when standing/walking are not set here.
        //
        // Keys:
        //   standing          – standing frame count (default 1)
        //   walking           – walking frame count (default 8)
        //   standing_delay    – ms between standing frames (number; default derived)
        //   walking_delay     – ms between walking frames (number; default derived)
        //   standing_delays   – optional per-frame ms array (overrides standing_delay)
        //   walking_delays    – optional per-frame ms array (overrides walking_delay)
        //   colourisable      – true if sprite has colour-mask columns (default false)
        //   addon1 / addon2   – true if that addon layer exists in the sheet (default false)
        //   exclusive_addons  – true if addon1 and addon2 cannot both be on (default false)
        //
        // Sprite sheet layout (256px wide, height = rows * 64):
        //   columns per direction = colourisable ? 2 : 1  (base [+ mask])
        //   rows per frame        = (addon1||addon2) ? 3 : 1  (base, addon1, addon2)
        //   total rows            = standing_frames + walking_frames * rows_per_frame
        // Height is taken from the loaded image (canvas is resized on load).
        // ---------------------------------------------------------------------------
        outfiter_creature_props = {
            // Examples (uncomment / extend as creatures are added):
            // Massive_Water_Elemental: { walking: 2, walking_delay: 250 },
            // SomeCreature: {
            //   standing: 4, walking: 6,
            //   standing_delay: 500, walking_delay: 120,
            //   colourisable: true, addon1: true, addon2: true, exclusive_addons: true
            // },
            Rafzan: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            'Naga_Boss_(A)': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            'Naga_Boss_(B)': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            'Timira_the_Many-headed': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            'Sugar_Daddy_/_Mommy': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            'Spellreaper_Inferniarch': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            'Hellhunter_Inferniarch': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            'Brinebrute_Inferniarch': {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            Merudri: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            Moonstone_Excavator: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            Mimar_Haffar: {
                standing: 8, walking: 8,
                standing_delay: 100, walking_delay: 300,
                addon1: true, addon2: false,
            },
            Moonstone_Overseer: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            Radiant_Warden: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            Radiant_Templar: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            Radiant_Paragon: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            Radiant_Inquisitor: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
            Radiant_Zealot: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: false,
            },
            Radiant_Acolyte: {
                standing: 1, walking: 8,
                walking_delay: 300,
                addon1: true, addon2: true,
            },
        },

        //outfits with different frame delays for some sprites
        outfiter_special_delays_standing = {
            //First frame of Special Delays must be adjusted so that all delays sum to 4000ms
            Lion_of_War: [3100, 100, 300, 100, 100, 100, 100, 100],
            Veteran_Paladin: [3100, 100, 300, 100, 100, 100, 100, 100],
            Hireling_Banker: [2000, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            Hireling_Trader: [1000, 100, 300, 100, 100, 100, 100, 100, 1000, 100, 100],
            Hireling_Cook: [2000, 100, 300, 100, 100, 100, 100, 100, 100, 200, 100],
            Hireling_Steward: [1000, 100, 100, 100, 200, 100, 100, 100, 1000, 100, 300, 100],
            Hireling_Servant: [2000, 100, 100, 100, 2000, 100, 100, 100], //pingpong
            Aerial_Disciple: [500, 200, 200, 200, 200, 200, 200, 200]
        },
        outfiter_special_delays_moving = {
            Hireling_Banker: [2000, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            Hireling_Trader: [1000, 100, 300, 100, 100, 100, 100, 100, 1000, 100, 100],
            Hireling_Cook: [2000, 100, 300, 100, 100, 100, 100, 100, 100, 200, 100],
            Hireling_Steward: [1000, 100, 100, 100, 200, 100, 100, 100, 1000, 100, 300, 100],
            Hireling_Servant: [2000, 100, 100, 100, 2000, 100, 100, 100] //pingpong
        },
        outfiter_special_delays_mount_standing = {
            Copper_Fly: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
            Glooth_Glider: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
            Golden_Dragonfly: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
            Steel_Bee: [70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
            Jousting_Eagle: [3100, 100, 100, 200, 200, 100, 100, 100],
            Cerberus_Champion: [2900, 100, 100, 100, 500, 100, 100, 100],
            Dawnbringer_Pegasus: [3300, 100, 100, 100, 100, 100, 100, 100],
            Wrathfire_Pegasus: [3300, 100, 100, 100, 100, 100, 100, 100],
            Skybreaker_Pegasus: [3300, 100, 100, 100, 100, 100, 100, 100],
            Night_Locust: [325, 100, 100, 100, 100, 325, 100, 100],
            Leaf_Locust: [325, 100, 100, 100, 100, 325, 100, 100],
            Pearl_Locust: [325, 100, 100, 100, 100, 325, 100, 100],
            Pegasus: [3300, 100, 100, 100, 100, 100, 100, 100],
            Battle_Werewolf: [1200, 100, 100, 100, 100, 2200, 100, 100]
        },
        //outfits that use ping-pong animation. ping-pong animation means 5 unique sprites, middle ones repeat backwards (1-2-3-4-5-4-3-2)
        outfiter_pingpong_animation = {
            Hireling_Servant: true
        },
        //outfits limited to height 4096
        outfiter_4096h = {
            Chaos_Acolyte: true,
            Evoker: true
        },
        //mounts with irregular amount of sprites, regular is 1 standing, 8 walking
        outfiter_sprites_mount_standing = {
            Flying_Divan: 8,
            Magic_Carpet: 8,
            Floating_Kashmir: 8,
            Copper_Fly: 10,
            Flamesteed: 8,
            Glooth_Glider: 10,
            Golden_Dragonfly: 10,
            Nethersteed: 8,
            Steel_Bee: 10,
            Tempest: 8,
            Flitterkatzen: 8,
            Venompaw: 8,
            Batcat: 8,
            Sea_Devil: 8,
            Coralripper: 8,
            Plumfish: 8,
            Nightdweller: 8,
            Frostflare: 8,
            Cinderhoof: 8,
            Fleeting_Knowledge: 8,
            Cerberus_Champion: 8,
            Jousting_Eagle: 8,
            Haze: 8,
            Snow_Strider: 8,
            Dusk_Pryer: 8,
            Dawn_Strayer: 8,
            Phantasmal_Jade: 8,
            Void_Watcher: 8,
            Rune_Watcher: 8,
            Rift_Watcher: 8,
            Singeing_Steed: 8,
            Emerald_Raven: 8,
            Mystic_Raven: 8,
            Radiant_Raven: 8,
            Gloothomotive: 8,
            Floating_Augur: 8,
            Floating_Sage: 8,
            Floating_Scholar: 8,
            Brass_Speckled_Koi: 8,
            Ink_Spotted_Koi: 8,
            Tangerine_Flecked_Koi: 8,
            Spirit_of_Purity: 8,
            Darkfire_Devourer: 8,
            Corpsefire_Skull: 8,
            Magma_Skull: 8,
            Doom_Skull: 8,
            Gorgon_Hydra: 8,
            Dawnbringer_Pegasus: 8,
            Wrathfire_Pegasus: 8,
            Skybreaker_Pegasus: 8,
            Pegasus: 8,
            Night_Locust: 8,
            Leaf_Locust: 8,
            Pearl_Locust: 8,
            Corpse_Phoenix: 8,
            Death_Phoenix: 8,
            Soul_Phoenix: 8,
            Battle_Werewolf: 8,
            Flame_Bear: 8,
            'Radiant_Nimbus_(Mount)': 8,
            Djinntaur: 8
        },
        outfiter_sprites_mount_walking = {
        },
        //mounts that are colourisable
        outfiter_mount_colourisable = {
            Krakoloss: true,
            Shellodon: true,
            Mutated_Abomination: true,
            Gorgon_Hydra: true,
            Primal_Demonosaur: true,
            Hell_Demonosaur: true,
            Alpha_Demonosaur: true,
            'Gloom_Maw_(Mount)': true,
            Guardian_Lion: true,
            Landsailer: true
        },
        //image names with _Female suffix for female
        outfiter_f_suffix_inames = {
            Dreamelf: true,
            Hireling_Trader: true,
            Hireling_Banker: true,
            Hireling_Cook: true,
            Hireling_Steward: true,
            Hireling_Servant: true,
            Issavi_Villager: true,
            Merudri: true
        },
        //no female
        outfiter_u_names = {
            Archdemon: true,
            'Barbarian_(A)': true,
            'Barbarian_(B)': true,
            'Barbarian_(C)': true,
            'Barbarian_(D)': true,
            CM: true,
            'Corym_(A)': true,
            'Corym_(B)': true,
            'Corym_(C)': true,
            Cultist: true,
            Dwarf: true,
            Elf: true,
            Frog: true,
            Demon_Hellfire: true,
            'Demon_Ram_(A)': true,
            Destroyer_from_Beyond: true,
            Galvanic_Terror: true,
            Pit_Demon: true,
            Faun: true,
            Orclops_Ravager: true,
            Shaper: true,
            The_First_Dragon: true,
            'Falcon_(A)': true,
            'Falcon_(B)': true,
            True_Asura: true,
            Squid: true,
            Book: true,
            Guardian_of_Tales: true,
            'Demon_Ram_(B)': true,
            'Spectre_(A)': true,
            'Spectre_(B)': true,
            Carnivora: true,
            Cobra_Mercenary: true,
            Lamassu: true,
            Sphinx: true,
            Manticore: true,
            'Lich_Knight_(A)': true,
            'Lich_Knight_(B)': true,
            'Lich_Knight_(C)': true,
            Energy_Wisp: true,
            Orger: true,
            Lost_Soul: true,
            Phantom: true,
            'Lion_(A)': true,
            'Lion_(B)': true,
            Werehyaena: true,
            Werelion: true,
            Pirat: true,
            Raccoon: true,
            Tyrant: true,
            Bashmu: true,
            Girtablilu: true,
            Carnisylvan: true,
            Chimera: true,
            'Naga_(A)': true,
            'Naga_(B)': true,
            'Naga_(C)': true,
            'Naga_(D)': true,
            Gnome: true,
            Gnome_Female: true,
            Scientist: true,
            Weretiger: true,
            Werecrocodile: true,
            Werepanther: true,
            Crusader: true,
            Wyrmling: true,
            Headwalker: true,
            'Shell_Drake': true,
            Sugar_Fairy: true,
            Silverfrost: true,
            Iceplume: true,
            None: true
        },
        //no mount
        outfiter_m_names = {
            Archdemon: true,
            'Barbarian_(A)': true,
            'Barbarian_(B)': true,
            'Barbarian_(C)': true,
            'Barbarian_(D)': true,
            'Corym_(A)': true,
            'Corym_(B)': true,
            'Corym_(C)': true,
            Cultist: true,
            Dwarf: true,
            Elf: true,
            Frog: true,
            Gnome: true,
            Gnome_Female: true,
            Demon_Hellfire: true,
            'Demon_Ram_(A)': true,
            Destroyer_from_Beyond: true,
            Galvanic_Terror: true,
            Pit_Demon: true,
            Faun: true,
            Orclops_Ravager: true,
            Shaper: true,
            The_First_Dragon: true,
            'Falcon_(A)': true,
            'Falcon_(B)': true,
            True_Asura: true,
            Squid: true,
            Book: true,
            Guardian_of_Tales: true,
            'Demon_Ram_(B)': true,
            Dreamelf: true,
            'Spectre_(A)': true,
            'Spectre_(B)': true,
            Carnivora: true,
            Hireling_Banker: true,
            Hireling_Trader: true,
            Hireling_Cook: true,
            Hireling_Steward: true,
            Hireling_Servant: true,
            Cobra_Mercenary: true,
            Issavi_Villager: true,
            Lamassu: true,
            Sphinx: true,
            Manticore: true,
            'Lich_Knight_(A)': true,
            'Lich_Knight_(B)': true,
            'Lich_Knight_(C)': true,
            Energy_Wisp: true,
            Orger: true,
            Lost_Soul: true,
            Phantom: true,
            'Lion_(A)': true,
            'Lion_(B)': true,
            Werehyaena: true,
            Werelion: true,
            Pirat: true,
            Raccoon: true,
            Tyrant: true,
            Girtablilu: true,
            Bashmu: true,
            Carnisylvan: true,
            Chimera: true,
            'Naga_(A)': true,
            'Naga_(B)': true,
            'Naga_(C)': true,
            'Naga_(D)': true,
            Scientist: true,
            Weretiger: true,
            Werecrocodile: true,
            Werepanther: true,
            Merudri: true,
            Crusader: true,
            Wyrmling: true,
            Headwalker: true,
            'Shell_Drake': true,
            Sugar_Fairy: true,
            Silverfrost: true,
            Iceplume: true
        },
        //no addon
        outfiter_a_names = {
            Archdemon: true,
            'Barbarian_(A)': true,
            'Barbarian_(B)': true,
            'Barbarian_(C)': true,
            'Barbarian_(D)': true,
            CM: true,
            'Corym_(A)': true,
            'Corym_(B)': true,
            'Corym_(C)': true,
            Cultist: true,
            Dwarf: true,
            Elf: true,
            Frog: true,
            Gnome: true,
            Gnome_Female: true,
            Jersey: true,
            Newly_Wed: true,
            None: true,
            Retro_Warrior: true,
            Retro_Summoner: true,
            Retro_Nobleman: true,
            Retro_Mage: true,
            Retro_Knight: true,
            Retro_Hunter: true,
            Retro_Citizen: true,
            Faun: true,
            Orclops_Ravager: true,
            Shaper: true,
            Squid: true,
            Book: true,
            'Spectre_(A)': true,
            'Spectre_(B)': true,
            Hireling_Banker: true,
            Hireling_Trader: true,
            Hireling_Cook: true,
            Hireling_Steward: true,
            Hireling_Servant: true,
            Lamassu: true,
            Manticore: true,
            Energy_Wisp: true,
            Lost_Soul: true,
            Phantom: true,
            Werehyaena: true,
            Scientist: true,
            Werecrocodile: true,
            Headwalker: true,
            Silverfrost: true,
            Iceplume: true
        },
        //no ride frame
        outfiter_no_ride_names = {
            Archdemon: true,
            'Barbarian_(A)': true,
            'Barbarian_(B)': true,
            'Barbarian_(C)': true,
            'Barbarian_(D)': true,
            'Corym_(A)': true,
            'Corym_(B)': true,
            'Corym_(C)': true,
            Cultist: true,
            Dwarf: true,
            Elf: true,
            Frog: true,
            Gnome: true,
            Gnome_Female: true,
            None: true,
            Demon_Hellfire: true,
            'Demon_Ram_(A)': true,
            Destroyer_from_Beyond: true,
            Galvanic_Terror: true,
            Pit_Demon: true,
            Faun: true,
            Orclops_Ravager: true,
            Shaper: true,
            'Falcon_(A)': true,
            'Falcon_(B)': true,
            True_Asura: true,
            Squid: true,
            Book: true,
            Guardian_of_Tales: true,
            'Demon_Ram_(B)': true,
            Dreamelf: true,
            'Spectre_(A)': true,
            'Spectre_(B)': true,
            Carnivora: true,
            Hireling_Banker: true,
            Hireling_Trader: true,
            Hireling_Cook: true,
            Hireling_Steward: true,
            Hireling_Servant: true,
            Cobra_Mercenary: true,
            Issavi_Villager: true,
            Lamassu: true,
            Sphinx: true,
            Manticore: true,
            'Lich_Knight_(A)': true,
            'Lich_Knight_(B)': true,
            'Lich_Knight_(C)': true,
            Energy_Wisp: true,
            Orger: true,
            Lost_Soul: true,
            Phantom: true,
            'Lion_(A)': true,
            'Lion_(B)': true,
            Werehyaena: true,
            Werelion: true,
            Pirat: true,
            Raccoon: true,
            Tyrant: true,
            Girtablilu: true,
            Bashmu: true,
            Carnisylvan: true,
            Chimera: true,
            'Naga_(A)': true,
            'Naga_(B)': true,
            'Naga_(C)': true,
            'Naga_(D)': true,
            Scientist: true,
            Weretiger: true,
            Werecrocodile: true,
            Werepanther: true,
            Merudri: true,
            Crusader: true,
            Wyrmling: true,
            Headwalker: true,
            'Shell_Drake': true,
            Sugar_Fairy: true,
            Silverfrost: true,
            Iceplume: true
        },
        //outfits with no floor movement
        outfiter_no_floor_move_names = {
            Hireling_Banker: true,
            Hireling_Cook: true,
            Hireling_Servant: true,
            Hireling_Steward: true,
            Hireling_Trader: true
        },
        //shared variables for MediaWiki:Outfiter/Template.js and MediaWiki:Outfiter.js END

        //outfits with one addon
        outfiter_o_names = {
            Yalaharian: true
        },
        //outfits not on the main list
        //automatically generated below
        //outfiter_names_extra = [105, 103, 106, 107, 108, 109, 160, 128, 161, 134, 162, 104, 140, 111, 112, 113, 114, 115, 116, 130, 117, 131, 102, 142, 101, 124, 125, 120, 100, 118, 159, 110, 167, 129, 135, 137, 139, 138, 136, 141, 143, 146, 147, 148, 152, 153, 150, 145, 163, 164, 165, 166, 149, 121, 151, 156, 119, 157, 173, 122, 132, 133, 144, 127, 123, 126, 158, 154, 155],
        //outfits with separator on list
        outfiter_separator = { None: true },
        //mounts with separator on list
        outfiter_mount_separator = {},
        //creatures with separator on list
        outfiter_creature_separator = {},
        //names for female
        outfiter_f_names = {
            Nobleman: 'Noblewoman',
            Retro_Nobleman: 'Retro_Noblewoman',
            Norseman: 'Norsewoman'
        },
        //combine outfit names preserving indexes/ids
        outfiter_names = outfiter_names0;
    if (outfiter_names100.length) {
        outfiter_names.length = 100;
        outfiter_names = outfiter_names.concat(outfiter_names100);
    }
    if (outfiter_names200.length) {
        outfiter_names.length = 200;
        outfiter_names = outfiter_names.concat(outfiter_names200);
    }
    //automatically create list of 'Other' outfits
    var ii, outfiter_names_extra = [105],
        outfiter_names100_sorted = outfiter_names100.slice().sort();
    for (ii = 0; ii < outfiter_names100.length; ii++) {
        if (outfiter_names100_sorted[ii] == 'None') { continue; }
        outfiter_names_extra.push(100 + outfiter_names100.indexOf(outfiter_names100_sorted[ii]));
    }

    $('#outfiter_container').html(
        '<div class="outfiter">' +
        // Mounts Selector
        '<div class="outer_border radio_list_wrap mselector">' +
        '<div class="div2_no_padding">' +
        '<div class="div2_title">Mounts</div>' +
        '<div class="radio_list_cont">' +
        '<div class="radio_list_out radio_mounts">' +
        '<input type="text" size="15" class="dark_input omsearch" placeholder="Search" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // Creatures Selector
        '<div class="outer_border radio_list_wrap cselector">' +
        '<div class="div2_no_padding">' +
        '<div class="div2_title">Creatures</div>' +
        '<div class="radio_list_cont">' +
        '<div class="radio_list_out radio_creatures">' +
        '<input type="text" size="15" class="dark_input omsearch" placeholder="Search" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // Outfits Selector
        '<div class="outer_border radio_list_wrap oselector">' +
        '<div class="div2_no_padding">' +
        '<div class="div2_title">Outfits & Others</div>' +
        '<div class="radio_list_cont">' +
        '<div class="radio_list_out radio_outfits">' +
        '<input type="text" size="15" class="dark_input omsearch" placeholder="Search" />' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // Viewer
        '<div class="outer_border viewer">' +
        '<div class="div2">' +
        '<div class="div2_title">TibiaWiki Outfitter</div>' +
        '<div class="omain_wrap">' +
        '<div class="omain_wrap_left">' +
        '<div class="omain_cont_left">' +
        '<div class="divtitle">Preview:</div>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk animate" /><span class="darkchk_in"></span>Animate' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk sanim" /><span class="darkchk_in"></span>Standing Animation' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" checked="checked" class="darkchk show_outfit" /><span class="darkchk_in"></span>Show Outfit' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk floor" /><span class="darkchk_in"></span>Show Floor' +
        '</label>' +
        '</div>' +
        '<div class="omain_cont_left">' +
        '<div class="divtitle">Extra:</div>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk soft" /><span class="darkchk_in"></span>Soft Image' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk hpbar" /><span class="darkchk_in"></span>HP Bar' +
        '</label>' +
        // advanced options toggle
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk show_advanced" /><span class="darkchk_in"></span>Show Advanced Options' +
        '</label>' +
        // hidden until Show advanced options is checked
        '<div class="save_advanced_opts">' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk anistep" /><span class="darkchk_in"></span>Animation Steps' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk template_code" /><span class="darkchk_in"></span>Template Code' +
        '</label>' +
        '<div class="divtitle" style="margin-top:8px;">Save as: <span class="help_q help_save" tabindex="0" role="button" aria-label="Help" data-help="APNG: animated PNG (high quality). GIF: widely supported animation. 4x Rotate: one file walking South, East, North, West (1.6s each). All Addons: four rotating files — none, Addon 1, Addon 2, and both (Addon 3). Names look like Outfit_Name_Gender or Outfit_Name_Gender_Addon_#."></span></div>' +
        '<label class="divcheck">' +
        '<input type="radio" name="radio_save_format" class="darkrad save_format_apng" value="apng" /><span class="darkrad_in"></span>APNG' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="radio" name="radio_save_format" class="darkrad save_format_gif" value="gif" checked="checked" /><span class="darkrad_in"></span>GIF' +
        '</label>' +
        '<label class="divcheck rotate4x_wrap">' +
        '<input type="checkbox" class="darkchk rotate4x" /><span class="darkchk_in"></span><span class="help_label">4x Rotate</span><span class="help_q help_rotate4x" tabindex="0" role="button" aria-label="Help" data-help="One animated file that walks through all four directions (South, East, North, West), 1.6 seconds per facing. Uses the current outfit, gender, addons, and mount."></span>' +
        '</label>' +
        '<label class="divcheck rotate4x_wrap all_addons_wrap">' +
        '<input type="checkbox" class="darkchk all_addons" /><span class="darkchk_in"></span><span class="help_label">All Addons</span><span class="help_q help_all_addons" tabindex="0" role="button" aria-label="Help" data-help="Downloads four individual rotating files, one for each outfit variant: No Addons, Addon 1, Addon 2, and Both Addons (Addon 3). Every file includes a full animation cycle for all four directions."></span>' +
        '</label>' +
        '</div>' +
        // default label is Download GIF; switches to Download when advanced is on
        '<button type="button" class="nbutton download_image" title="Download the currently displayed options in the outfitter.">Download GIF</button>' +
        '</div>' +
        '<div class="omain_cont_left">' +
        '<div class="divtitle">Configure:</div>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk addon1" /><span class="darkchk_in"></span>Addon 1' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk addon2" /><span class="darkchk_in"></span>Addon 2' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk female" /><span class="darkchk_in"></span>Female' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk show_mount" /><span class="darkchk_in"></span>Mount' +
        '</label>' +
        '<label class="divcheck">' +
        '<input type="checkbox" class="darkchk show_creature" /><span class="darkchk_in"></span>Creature' +
        '</label>' +
        '</div>' +
        '</div>' +
        '<div class="omain_wrap_right">' +
        '<div class="omain_cont_right">' +
        '<div class="body_main_div">' +
        '<button type="button" class="zoom_btn zoomout" title="Zoom Out" aria-label="Zoom Out"></button>' +
        '<button type="button" class="zoom_btn zoomreset" title="Reset View" aria-label="Reset View"></button>' +
        '<button type="button" class="zoom_btn zoomin" title="Zoom In" aria-label="Zoom In"></button>' +
        '<img class="body_main" width="128" height="128" src="' + encodeURI(loading_img) + '" alt="" />' +
        '<button class="leftb tleftb facingp"></button>' +
        '<button class="rightb trightb facingm"></button>' +
        '</div>' +
        '<div class="oitem_select_cont">' +
        '<button class="leftb outfitm"></button>' +
        '<button class="rightb outfitp"></button>' +
        '<div class="oitem_select_name outfit_name"></div>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="oitem_select_cont">' +
        '<button class="leftb mountm"></button>' +
        '<button class="rightb mountp"></button>' +
        '<div class="oitem_select_name mount_name"></div>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="oitem_select_cont">' +
        '<button class="leftb creaturem"></button>' +
        '<button class="rightb creaturep"></button>' +
        '<div class="oitem_select_name creature_name"></div>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="colourise_cont">' +
        '<div class="colourise_title">Colourise:</div>' +
        '<div class="colourise_btns">' +
        '<button type="button" class="nbutton colourise_copy">Copy to Mount</button>' +
        '<button type="button" class="nbutton colourise_random" title="Randomise Head, Primary, Secondary and Detail colours for the selected target (Outfit or Mount)">Random Colours</button>' +
        '<button type="button" class="nbutton random_outfit" title="Pick a random outfit (gender and addons are also randomised when available)">Random Outfit</button>' +
        '</div>' +
        '<label class="colourise_item">' +
        '<input type="radio" name="radio_colourise" class="darkrad" value="outfit" checked="checked" /><span class="darkrad_in"></span><div class="t">Outfit</div>' +
        '</label><label class="colourise_item">' +
        '<input type="radio" name="radio_colourise" class="darkrad" value="mount" /><span class="darkrad_in"></span><div class="t">Mount</div>' +
        '</label>' +
        '<div class="clear"></div>' +
        '</div>' +
        '<div class="colors_cont">' +
        '<button class="color_tab cb_1 sel"><span class="color_tab_in outer_border_no_bottom">Head</span></button>' +
        '<button class="color_tab cb_2"><span class="color_tab_in outer_border_no_bottom">Primary</span></button>' +
        '<button class="color_tab cb_3"><span class="color_tab_in outer_border_no_bottom">Secondary</span></button>' +
        '<button class="color_tab cb_4"><span class="color_tab_in outer_border_no_bottom">Detail</span></button>' +
        '<div class="clear"></div>' +
        '<div class="dcolor_table_out outer_border">' +
        '<div class="dcolor_table">' +
        '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="charn_cont">' +
        '<div class="charn_row">' +
        '<span class="charn_title">Enter Name:</span>' +
        '<input type="text" size="30" value="" class="dark_input charn" placeholder="Name" />' +
        '<button type="button" class="nbutton clear_name">Clear Name</button>' +
        '<button type="button" class="nbutton use_name">Use Name</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="clear"></div>' +
        '<div class="url_input_cont">' +
        '<span class="url_input_text">Link:&nbsp;</span>' +
        '<span class="url_input_out">' +
        '<input type="text" value="" readonly="readonly" class="dark_input url_input" />' +
        '</span>' +
        '<button type="button" class="copy_btn copy_url" title="Copy" aria-label="Copy link"></button>' +
        '</div>' +
        '<div class="template_code_code_cont"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        // full-width animation steps panel under selectors + viewer
        '<div class="outer_border anistep_panel">' +
        '<div class="div2">' +
        '<div class="div2_title">Animation Steps</div>' +
        '<div class="anistep_step_cont"></div>' +
        '</div>' +
        '</div>' +
        '<div class="hide hide_canvas">' +
        '<input type="hidden" value="0" class="show_outfit_prev" />' +
        '<input type="hidden" value="0" class="outfit" />' +
        '<input type="hidden" value="0" class="mount" />' +
        '<input type="hidden" value="0" class="show_mount_prev" />' +
        '<input type="hidden" value="0" class="creature" />' +
        '<input type="hidden" value="0" class="show_creature_prev" />' +
        '<input type="hidden" value="2" class="facing" />' +
        '<input type="hidden" value="0" class="c1" />' +
        '<input type="hidden" value="0" class="c2" />' +
        '<input type="hidden" value="0" class="c3" />' +
        '<input type="hidden" value="0" class="c4" />' +
        '<input type="hidden" value="0" class="mc1" />' +
        '<input type="hidden" value="0" class="mc2" />' +
        '<input type="hidden" value="0" class="mc3" />' +
        '<input type="hidden" value="0" class="mc4" />' +

        '<img class="floor_image" alt="floor_image" src="" />' +
        '<img class="letters_image" alt="letters_image" src="" />' +
        '<img class="hp_bar" alt="hp_bar" src="" />' +

        '<div>' +
        '<canvas class="canvas_work" width="64" height="64"></canvas>' +
        '<canvas class="canvas_zoom" width="64" height="64"></canvas>' +
        '</div>' +

        '<img class="main_image" src="" alt="main_image" />' +
        '<img class="mount_image" src="" alt="mount_image" />' +
        '<img class="creature_image" src="" alt="creature_image" />' +

        '<div>' +
        '<canvas class="canvas_main" width="512" height="6144"></canvas>' +
        '<canvas class="canvas_mount" width="256" height="1152"></canvas>' +
        '<canvas class="canvas_creature" width="256" height="2176"></canvas>' +
        '</div>' +

        '</div>' +
        '</div>'
    );
    $('div.outfiter').each(function () {
        var
            $this_main = $(this),
            browsers_base = 'Firefox/Chrome/Opera/Safari/Edge',
            browsers_apng = 'Firefox/Chrome/Opera/Safari/Edge',
            outfiter_mount_names_extra = [],
            outfiter_mount_names_sorted = [],
            outfiter_creature_names_extra = [],
            outfiter_creature_names_sorted = [],
            outfiter_names_sorted = [],
            outfiter_color_t = [
                [255, 255, 255], [255, 212, 191], [255, 233, 191], [255, 255, 191], [233, 255, 191], [212, 255, 191], [191, 255, 191], [191, 255, 212], [191, 255, 233], [191, 255, 255], [191, 233, 255], [191, 212, 255], [191, 191, 255], [212, 191, 255], [233, 191, 255], [255, 191, 255], [255, 191, 233], [255, 191, 212], [255, 191, 191],
                [218, 218, 218], [191, 159, 143], [191, 175, 143], [191, 191, 143], [175, 191, 143], [159, 191, 143], [143, 191, 143], [143, 191, 159], [143, 191, 175], [143, 191, 191], [143, 175, 191], [143, 159, 191], [143, 143, 191], [159, 143, 191], [175, 143, 191], [191, 143, 191], [191, 143, 175], [191, 143, 159], [191, 143, 143],
                [182, 182, 181], [191, 127, 95], [191, 159, 95], [191, 191, 95], [159, 191, 95], [127, 191, 95], [95, 191, 95], [95, 191, 127], [95, 191, 159], [95, 191, 191], [95, 159, 191], [95, 127, 191], [95, 95, 191], [127, 95, 191], [159, 95, 191], [191, 95, 191], [191, 95, 159], [191, 95, 127], [191, 95, 95],
                [145, 145, 144], [191, 106, 63], [191, 148, 63], [191, 191, 63], [148, 191, 63], [106, 191, 63], [63, 191, 63], [63, 191, 106], [63, 191, 148], [63, 191, 191], [63, 148, 191], [63, 106, 191], [63, 63, 191], [106, 63, 191], [148, 63, 191], [191, 63, 191], [191, 63, 148], [191, 63, 106], [191, 63, 63],
                [109, 109, 109], [255, 85, 0], [255, 170, 0], [255, 255, 0], [170, 255, 0], [84, 255, 0], [0, 255, 0], [0, 255, 84], [0, 255, 170], [0, 255, 255], [0, 169, 255], [0, 85, 255], [0, 0, 255], [85, 0, 255], [169, 0, 255], [254, 0, 255], [255, 0, 170], [255, 0, 85], [255, 0, 0],
                [72, 72, 68], [191, 63, 0], [191, 127, 0], [191, 191, 0], [127, 191, 0], [63, 191, 0], [0, 191, 0], [0, 191, 63], [0, 191, 127], [0, 191, 191], [0, 127, 191], [0, 63, 191], [0, 0, 191], [63, 0, 191], [127, 0, 191], [191, 0, 191], [191, 0, 127], [191, 0, 63], [191, 0, 0],
                [36, 36, 36], [127, 42, 0], [127, 85, 0], [127, 127, 0], [85, 127, 0], [42, 127, 0], [0, 127, 0], [0, 127, 42], [0, 127, 85], [0, 127, 127], [0, 84, 127], [0, 42, 127], [0, 0, 127], [42, 0, 127], [84, 0, 127], [127, 0, 127], [127, 0, 85], [127, 0, 42], [127, 0, 0]
            ],
            outfiter_outfit_none_id = (function () {
                var ret;
                outfiter_names.some(function (v, i) {
                    if (v === 'None') { ret = i; return true; }
                });
                return ret;
            }()),

            outfiter_GET = {},
            outfiter_aframes,
            outfiter_bake_silent = false, // true while baking download frames — keep preview frozen
            outfiter_images_loaded = [false, false, false],
            outfiter_atime,
            outfiter_acurrent = 0,
            //Default Zoom Level (1-4)
            outfiter_zoom = 2,
            outfiter_base_w = 128,
            outfiter_base_h = 128,
            outfiter_zoom_min = 1,
            outfiter_zoom_max = 4,
            outfiter_pan_x = 0,
            outfiter_pan_y = 0,
            outfiter_dragging = false,
            outfiter_drag_start_x = 0,
            outfiter_drag_start_y = 0,
            outfiter_pan_start_x = 0,
            outfiter_pan_start_y = 0,
            //default outfiter options
            outfiter_def = {
                outfit: 0, addon1: false, addon2: false, female: false, facing: 2,
                c1: 0, c2: 0, c3: 0, c4: 0,
                soft: false, animate: false, sanim: false,
                hpbar: false, charn: '',
                mount: 0,
                creature: 0,
                mc1: 0, mc2: 0, mc3: 0, mc4: 0,
                floor: false
            },
            outfiter_def_template = {
                outfit: 0, addon1: false, addon2: false, female: false, facing: 2,
                c1: 0, c2: 0, c3: 0, c4: 0,
                soft: false, animate: false, sanim: false,
                hpbar: false, charn: '',
                mount: 0,
                creature: 0,
                mc1: 0, mc2: 0, mc3: 0, mc4: 0,
                floor: false
            },
            //long name and short name options that can be used
            outfiter_opt_names = {
                outfit: 'o', addon1: 'a1', addon2: 'a2', female: 'fm', facing: 'f',
                c1: 'c1', c2: 'c2', c3: 'c3', c4: 'c4',
                soft: 's', animate: 'a', sanim: 'sa',
                hpbar: 'h', charn: 'n',
                mount: 'm', creature: 'cr',
                mc1: 'mc1', mc2: 'mc2', mc3: 'mc3', mc4: 'mc4',
                floor: 'fl'
            },
            outfiter_opt_namesr = {
                o: 'outfit', a1: 'addon1', a2: 'addon2', fm: 'female', f: 'facing',
                c1: 'c1', c2: 'c2', c3: 'c3', c4: 'c4',
                s: 'soft', a: 'animate', sa: 'sanim',
                h: 'hpbar', n: 'charn',
                m: 'mount', cr: 'creature',
                mc1: 'mc1', mc2: 'mc2', mc3: 'mc3', mc4: 'mc4',
                fl: 'floor'
            },
            //floor
            floor_move_per_frame = 8, //has to be a factor of floor_spr_w and floor_spr_h
            floor_spr_w = 128, //has to be a multiple of floor_move_per_frame
            floor_spr_h = 64, //has to be a multiple of floor_move_per_frame
            floor_offset_x = 16, //left
            floor_offset_y = 16, //top
            floor_offset_y_bottom = 15, //bottom
            floor_w = 318 / 2,
            floor_h = (128 / 2) + floor_offset_y + floor_offset_y_bottom,
            outfiter_title = '', //fix for wikia
            //APNG support
            outfiter_apng_supported,
            ogebi = function (classname, all) { return $this_main.find(all === 1 ? classname : '.' + classname); },
            //canvases
            $canvas_main = ogebi('canvas_main'),
            $canvas_mount = ogebi('canvas_mount'),
            $canvas_creature = ogebi('canvas_creature'),
            $canvas_work = ogebi('canvas_work'),
            $canvas_zoom = ogebi('canvas_zoom'),
            canvas_main = $canvas_main[0],
            canvas_mount = $canvas_mount[0],
            canvas_creature = $canvas_creature[0],
            canvas_work = $canvas_work[0],
            canvas_zoom = $canvas_zoom[0],
            //map values depending on key/value.
            empty_string_maps_to = {
                addon1: true,
                addon2: true,
                female: true,
                soft: true,
                animate: true,
                sanim: true,
                hpbar: true,
                floor: true
            },
            map_GET_values = function (key, value) {
                if (value === '') {
                    if (empty_string_maps_to.hasOwnProperty(key)) {
                        return empty_string_maps_to[key];
                    }
                }
                return decodeURIComponent(decodeURI(value));
            },
            //get options from url "search"
            outfiter_get_get = function () {
                var
                    i, key, assign, array = window.location.search.substring(1).split(/&|;/);
                //URLs can be like either "sample.html?test1=hi&test2=bye" or "sample.html?test1=hi;test2=bye"
                for (i = 0; i < array.length; i++) {
                    if (array[i] !== '') {
                        assign = array[i].indexOf('=');
                        if (array[i].substr(0, 5) === 'title') { outfiter_title = array[i].substring(assign + 1); }
                        else {
                            key = assign === -1 ? array[i] : array[i].substring(0, assign);
                            if (outfiter_opt_namesr[key] !== undefined || outfiter_def[key] === undefined) {
                                if (outfiter_opt_namesr[key] !== 'undefined') { key = outfiter_opt_namesr[key]; }
                                outfiter_GET[key] = map_GET_values(key, assign === -1 ? '' : array[i].substring(assign + 1));
                            }
                        }
                    }
                }
            },
            //generate url for current options
            outfiter_gen_url = function () {
                var
                    l = location.protocol + '//' + location.host + location.pathname + '?',
                    basea = l.split('?'), base = basea[0],
                    params = '?',
                    mount_n = outfiter_mount_names[outfiter_GET.mount],
                    can_color_mount = outfiter_mount_colourisable[mount_n] === true,
                    opt;
                if (outfiter_title !== '') { params += 'title=' + outfiter_title + '&'; }
                for (opt in outfiter_def) {
                    if (
                        outfiter_def.hasOwnProperty(opt) &&
                        outfiter_GET[opt] !== outfiter_def[opt] &&
                        (can_color_mount || !opt.match(/mc\d/))
                    ) {
                        params += outfiter_opt_names[opt] +
                            (typeof outfiter_GET[opt] === 'boolean' ? (outfiter_GET[opt] === true ? '' : '=!') : '=' + outfiter_GET[opt]) + '&';
                    }
                }
                while (params.substr(-1) === '&') { params = params.substr(0, params.length - 1); }
                ogebi('url_input').val(encodeURI(base + (params.length > 1 ? params : '')));
            },
            //generate template code for current options
            outfiter_gen_template = function () {
                var params = [], opt;
                for (opt in outfiter_def_template) {
                    if (outfiter_def_template.hasOwnProperty(opt)) {
                        if (outfiter_GET[opt] !== outfiter_def_template[opt]) {
                            params.push(opt + '=' + outfiter_GET[opt]);
                        }
                    }
                }
                params.push('height=' + canvas_zoom.height);
                params.push('width=' + canvas_zoom.width);
                return params.join('|');
            },
            //get options from currently selected options
            outfiter_options_to_get = function () {
                var opt;
                for (opt in outfiter_GET) {
                    if (outfiter_GET.hasOwnProperty(opt)) {
                        if (typeof outfiter_GET[opt] === 'boolean') { outfiter_GET[opt] = ogebi(opt).is(':checked'); }
                        else if (typeof outfiter_def[opt] === 'number') { outfiter_GET[opt] = parseInt(ogebi(opt).val(), 10); }
                        else { outfiter_GET[opt] = encodeURIComponent(ogebi(opt).val()); }
                    }
                }
            },
            //help other functions to handle default parameters
            outfiter_parameters_get = function (defp, par) {
                var attrname;
                if ((typeof par) !== 'object') { par = defp; }
                else { for (attrname in defp) { if (defp.hasOwnProperty(attrname)) { if (!par.hasOwnProperty(attrname)) { par[attrname] = defp[attrname]; } } } }
                return par;
            },
            //get pixel data from canvases
            // Resolve creature animation / appearance props with sensible defaults.
            // Merges outfiter_creature_props over legacy standing/walking maps.
            outfiter_creature_get_props = function (creature_n) {
                var
                    // Defaults match historic creature behaviour (1 standing, 8 walking)
                    props = {
                        standing: 1,
                        walking: 8,
                        standing_delay: null,
                        walking_delay: null,
                        standing_delays: null,
                        walking_delays: null,
                        colourisable: false,
                        addon1: false,
                        addon2: false,
                        exclusive_addons: false
                    },
                    custom, k;
                if (!creature_n) { return props; }
                // Legacy irregular frame counts
                if (outfiter_sprites_creature_standing.hasOwnProperty(creature_n)) {
                    props.standing = outfiter_sprites_creature_standing[creature_n];
                }
                if (outfiter_sprites_creature_walking.hasOwnProperty(creature_n)) {
                    props.walking = outfiter_sprites_creature_walking[creature_n];
                }
                // Per-creature overrides (win over legacy maps)
                if (outfiter_creature_props.hasOwnProperty(creature_n)) {
                    custom = outfiter_creature_props[creature_n];
                    for (k in custom) {
                        if (custom.hasOwnProperty(k) && custom[k] !== undefined) {
                            props[k] = custom[k];
                        }
                    }
                }
                return props;
            },
            // True when the active selection is a creature (not outfit/mount)
            outfiter_is_creature_mode = function () {
                return !!(outfiter_GET && outfiter_GET.creature > 0);
            },
            outfiter_pixels_get_sub = function (par) {

                par = outfiter_parameters_get({ x: 0, y: 0, w: 64, h: 64, src: 'main', pink: true }, par);
                var
                    big_canvas, context, r, p, m,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    is_4096h = outfiter_4096h[outfit_n] === true;

                if (par.src === 'mount') { big_canvas = canvas_mount; }
                else if (par.src === 'creature') { big_canvas = canvas_creature; }
                else { big_canvas = canvas_main; }

                context = big_canvas.getContext('2d');
                r = context.getImageData(
                    (is_4096h && par.y >= 64 ? (Math.floor(par.y / 64) * 8) + par.x : par.x) * par.w,
                    (is_4096h && par.y >= 64 ? par.y - 64 : par.y) * par.h,
                    par.w,
                    par.h
                );
                if (par.pink) {
                    p = 0; m = r.width * r.height * 4;
                    while (p < m) { if (r.data[p] === 255 && r.data[p + 1] === 0 && r.data[p + 2] === 255) { r.data[p + 3] = 0; } p += 4; }
                }
                return r;
            },
            //merge pixel data
            outfiter_pixels_merge = function (bottomp, topp) {
                if (bottomp === false) { return topp; }
                if (topp === false) { return bottomp; }
                var
                    i, bpix = bottomp.data, tpix = topp.data, p = bottomp.width * bottomp.height,
                    pixr = p * 4, pixg, pixb, pixa, r1, g1, b1, a1,
                    res = canvas_work.getContext('2d').createImageData(bottomp.width, bottomp.height),
                    rpix;
                rpix = res.data;
                if (rpix.set) { rpix.set(bpix); }
                else { for (i = 0; i < bpix.length; i++) { rpix[i] = bpix[i]; } }
                while (p--) {
                    r1 = tpix[pixr -= 4];
                    g1 = tpix[pixg = pixr + 1];
                    b1 = tpix[pixb = pixr + 2];
                    a1 = tpix[pixa = pixr + 3];
                    if (a1 !== 0) {
                        rpix[pixr] = r1;
                        rpix[pixg] = g1;
                        rpix[pixb] = b1;
                        rpix[pixa] = a1;
                    }
                }
                return res;
            },
            //apply colors to pixel data
            outfiter_pixels_blend = function (main, blend, is_mount) {
                var
                    color_t = outfiter_color_t,
                    c1 = is_mount ? outfiter_GET.mc1 : outfiter_GET.c1,
                    c2 = is_mount ? outfiter_GET.mc2 : outfiter_GET.c2,
                    c3 = is_mount ? outfiter_GET.mc3 : outfiter_GET.c3,
                    c4 = is_mount ? outfiter_GET.mc4 : outfiter_GET.c4,
                    bpix = blend.data, mpix = main.data, p = blend.width * blend.height,
                    pixr = p * 4, pixg, pixb, r1, g1, b1;
                while (p--) {
                    r1 = bpix[pixr -= 4]; g1 = bpix[pixg = pixr + 1]; b1 = bpix[pixb = pixr + 2];
                    //change blend colors
                    if (r1 === 255 && g1 === 255 && b1 === 0) { r1 = color_t[c1][0]; g1 = color_t[c1][1]; b1 = color_t[c1][2]; }
                    else if (r1 === 255 && g1 === 0 && b1 === 0) { r1 = color_t[c2][0]; g1 = color_t[c2][1]; b1 = color_t[c2][2]; }
                    else if (r1 === 0 && g1 === 255 && b1 === 0) { r1 = color_t[c3][0]; g1 = color_t[c3][1]; b1 = color_t[c3][2]; }
                    else if (r1 === 0 && g1 === 0 && b1 === 255) { r1 = color_t[c4][0]; g1 = color_t[c4][1]; b1 = color_t[c4][2]; }
                    if (mpix[pixr] === 255 && mpix[pixg] === 0 && mpix[pixb] === 255) { mpix[pixb + 1] = 0; }
                    if (!(r1 === 255 && g1 === 0 && b1 === 255)) {
                        //Multiply
                        mpix[pixr] = r1 * mpix[pixr] / 255;
                        mpix[pixg] = g1 * mpix[pixg] / 255;
                        mpix[pixb] = b1 * mpix[pixb] / 255;
                    }
                }
                return main;
            },
            //get outfit pixel data merged and colored
            outfiter_pixels_get_out = function (anim) {
                var
                    pixel_data = false,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    noaddons = outfiter_a_names[outfit_n] === true,
                    noride = outfiter_no_ride_names[outfit_n] === true,
                    pingpong = outfiter_pingpong_animation[outfit_n] === true,
                    //Don't treat "other" outfits differently
                    //mult_y = outfiter_GET.outfit >= 100 ? 1 : (noaddons ? 2 : 6),
                    mult_y = (noaddons ? 1 : 3) * (noride ? 1 : 2);
                anim = pingpong ? Math.abs(anim - (anim % (8 / 2)) * 2) : anim;
                var base_y = (outfiter_GET.mount ? (noaddons ? 1 : 3) : 0) + (anim * mult_y);
                base_y += (outfiter_GET.animate ?
                    (!outfiter_GET.sanim && outfiter_sprites_standing.hasOwnProperty(outfit_n) ?
                        outfiter_sprites_standing[outfit_n] : 0
                    ) : 0) * mult_y;
                $.each([true, outfiter_GET.addon1, outfiter_GET.addon2], function (i, v) {
                    if (v) {
                        pixel_data = outfiter_pixels_merge(
                            pixel_data,
                            outfiter_pixels_blend(
                                outfiter_pixels_get_sub({ x: outfiter_GET.facing * 2, y: base_y + i }),
                                outfiter_pixels_get_sub({ x: outfiter_GET.facing * 2 + 1, y: base_y + i })
                            )
                        );
                    }
                });
                return pixel_data;
            },
            //get mount pixel data merged and colored
            outfiter_pixels_get_mount = function (anim) {
                if (anim === undefined) { anim = 0; }
                var
                    pixel_data = false, colourisable, colourisable_mult, base_y_m,
                    mount_n = outfiter_mount_names[outfiter_GET.mount];
                if (outfiter_GET.mount) {
                    colourisable = outfiter_mount_colourisable[mount_n] === true;
                    colourisable_mult = colourisable ? 2 : 1;
                    base_y_m = anim + (outfiter_GET.animate ?
                        (!outfiter_GET.sanim && outfiter_sprites_mount_standing.hasOwnProperty(mount_n) ?
                            outfiter_sprites_mount_standing[mount_n] : 0
                        ) : 0
                    );
                    //base
                    pixel_data = outfiter_pixels_get_sub({ x: outfiter_GET.facing * colourisable_mult, y: base_y_m, src: 'mount' });
                    //blend color
                    if (colourisable) {
                        pixel_data = outfiter_pixels_merge(
                            false,
                            outfiter_pixels_blend(
                                pixel_data,
                                outfiter_pixels_get_sub({ x: outfiter_GET.facing * colourisable_mult + 1, y: base_y_m, src: 'mount' }),
                                true
                            )
                        );
                    }
                }
                return pixel_data;
            },
            // Get creature pixel data (supports colourisation + optional addons).
            // Sheet layout is derived from props so any 256-wide height works.
            outfiter_pixels_get_creature = function (anim) {
                if (anim === undefined) { anim = 0; }
                var
                    pixel_data = false,
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    props, colourisable_mult, mult_y, base_y_c, standing_frames;
                if (outfiter_GET.creature) {
                    props = outfiter_creature_get_props(creature_n);
                    colourisable_mult = props.colourisable ? 2 : 1;
                    // Outfit-style layering: base + addon1 + addon2 when any addon is supported
                    mult_y = (props.addon1 || props.addon2) ? 3 : 1;
                    standing_frames = props.standing;
                    base_y_c = (anim * mult_y) + (outfiter_GET.animate ?
                        (!outfiter_GET.sanim ? standing_frames * mult_y : 0) : 0
                    );
                    // Base layer (always)
                    pixel_data = outfiter_pixels_get_sub({
                        x: outfiter_GET.facing * colourisable_mult,
                        y: base_y_c,
                        src: 'creature'
                    });
                    if (props.colourisable) {
                        pixel_data = outfiter_pixels_merge(
                            false,
                            outfiter_pixels_blend(
                                pixel_data,
                                outfiter_pixels_get_sub({
                                    x: outfiter_GET.facing * colourisable_mult + 1,
                                    y: base_y_c,
                                    src: 'creature'
                                }),
                                false
                            )
                        );
                    }
                    // Addon 1 layer
                    if (props.addon1 && outfiter_GET.addon1) {
                        pixel_data = outfiter_pixels_merge(
                            pixel_data,
                            props.colourisable ?
                                outfiter_pixels_blend(
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult,
                                        y: base_y_c + 1,
                                        src: 'creature'
                                    }),
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult + 1,
                                        y: base_y_c + 1,
                                        src: 'creature'
                                    }),
                                    false
                                ) :
                                outfiter_pixels_get_sub({
                                    x: outfiter_GET.facing * colourisable_mult,
                                    y: base_y_c + 1,
                                    src: 'creature'
                                })
                        );
                    }
                    // Addon 2 layer
                    if (props.addon2 && outfiter_GET.addon2) {
                        pixel_data = outfiter_pixels_merge(
                            pixel_data,
                            props.colourisable ?
                                outfiter_pixels_blend(
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult,
                                        y: base_y_c + 2,
                                        src: 'creature'
                                    }),
                                    outfiter_pixels_get_sub({
                                        x: outfiter_GET.facing * colourisable_mult + 1,
                                        y: base_y_c + 2,
                                        src: 'creature'
                                    }),
                                    false
                                ) :
                                outfiter_pixels_get_sub({
                                    x: outfiter_GET.facing * colourisable_mult,
                                    y: base_y_c + 2,
                                    src: 'creature'
                                })
                        );
                    }
                }
                return pixel_data;
            },
            //draw pixel data to a canvas
            outfiter_pixels_draw = function (par) {
                par = outfiter_parameters_get({ $canvas: $canvas_work, pixels: false, x: 0, y: 0, clear: false, resize: false }, par);
                if (par.pixels === false) { return; }
                if (par.resize) { par.$canvas.attr({ width: par.pixels.width, height: par.pixels.height }); }
                if (par.clear) { par.$canvas.attr({ width: par.$canvas[0].width, height: par.$canvas[0].height }); }
                par.$canvas[0].getContext('2d').putImageData(par.pixels, par.x, par.y);
            },
            //draw floor on canvas
            outfiter_floor_draw = function (par) {
                par = outfiter_parameters_get({ $canvas: $canvas_work, ctx: false, img: ogebi('floor_image')[0], floor_x: 0, floor_y: 0, clear: true }, par);
                if (!par.ctx) { par.ctx = par.$canvas[0].getContext('2d'); }
                var
                    floor_xs = [par.floor_x],
                    floor_ys = [par.floor_y];
                while (floor_xs[0] > 0) { floor_xs.unshift(floor_xs[0] - floor_spr_w); }
                while (floor_xs[floor_xs.length - 1] + floor_spr_w < floor_w) { floor_xs.push(floor_xs[floor_xs.length - 1] + floor_spr_w); }
                while (floor_ys[0] > 0) { floor_ys.unshift(floor_ys[0] - floor_spr_h); }
                while (floor_ys[floor_ys.length - 1] + floor_spr_h < floor_h) { floor_ys.push(floor_ys[floor_ys.length - 1] + floor_spr_h); }
                if (par.clear) { par.$canvas.attr({ width: par.$canvas[0].width, height: par.$canvas[0].height }); }
                floor_xs.forEach(function (floor_x) {
                    floor_ys.forEach(function (floor_y) {
                        par.ctx.drawImage(
                            ogebi('floor_image')[0],
                            0, 0, floor_spr_w, floor_spr_h,
                            floor_x, floor_y, floor_spr_w, floor_spr_h
                        );
                    });
                });
            },
            //get the limits to horizontally crop pixel data
            // Returns [left, right) — left inclusive, right exclusive — so hcrop keeps the
            // last non-transparent column (previously endx was inclusive and one px was lost).
            outfiter_pixels_hlimits = function (pixels) {
                var ppix = pixels.data, x, y, pixr, startx = false, endx = false;
                for (x = 0; x < pixels.width; x++) {
                    for (y = 0; y < pixels.height; y++) {
                        pixr = (y * pixels.width + x) * 4;
                        if (ppix[pixr + 3] !== 0) { startx = x; x = pixels.width; break; }
                    }
                    if (startx !== false) { break; }
                }
                // scan from the last valid column/row (width-1 / height-1)
                for (x = pixels.width - 1; x >= 0; x--) {
                    for (y = pixels.height - 1; y >= 0; y--) {
                        pixr = (y * pixels.width + x) * 4;
                        if (ppix[pixr + 3] !== 0) { endx = x; break; }
                    }
                    if (endx !== false) { break; }
                }
                // endx is inclusive; return exclusive right edge for hcrop (right - left)
                return (startx === false || endx === false) ? [0, pixels.width] : [startx, endx + 1];
            },
            //horizontally crops or extends area of pixel data
            outfiter_pixels_hcrop_expand = function (pixels, left, right, min_width) {
                if (min_width === undefined) { min_width = false; }
                var
                    ppix = pixels.data, npix, x, y, pixr, npixr, new_pixels,
                    neww = right - left,
                    x_extra = min_width === false ? 0 : neww < min_width ? Math.floor((min_width - neww) / 2) : 0;
                new_pixels = canvas_work.getContext('2d').createImageData(neww, pixels.height);
                npix = new_pixels.data;
                for (x = 0; x < neww; x++) {
                    for (y = 0; y < pixels.height; y++) {
                        pixr = (y * pixels.width + x + left) * 4;
                        npixr = (y * neww + x) * 4;
                        npix[npixr] = ppix[pixr];
                        npix[npixr + 1] = ppix[pixr + 1];
                        npix[npixr + 2] = ppix[pixr + 2];
                        npix[npixr + 3] = ppix[pixr + 3];
                    }
                }
                if (x_extra > 0) {
                    $canvas_work.attr({ width: min_width, height: pixels.height });
                    canvas_work.getContext('2d').putImageData(new_pixels, x_extra, 0);
                    new_pixels = canvas_work.getContext('2d').getImageData(0, 0, min_width, pixels.height);
                }
                return new_pixels;
            },
            //toggle loading and some controls usability
            outfiter_hide_body = function (h, is_fail) {
                if (h === true) {
                    clearTimeout(outfiter_atime);
                    var
                        i = ogebi('.body_main_div .body_main', 1),
                        src = i.attr('src'),
                        new_src = is_fail ? error_img : loading_img;
                    ogebi(':button, :checkbox, :radio', 1)
                        .not('.outfitm, .outfitp, .mountm, .mountp, .creaturem, .creaturep, [name="radio_outfits"], [name="radio_mounts"], [name="radio_creatures"]')
                        .prop({ disabled: true });
                    $this_main.addClass('outfiter_loading');
                    if (new_src && src !== new_src) {
                        outfiter_pan_x = 0;
                        outfiter_pan_y = 0;
                        outfiter_dragging = false;
                        i
                            .attr('src', '')
                            .attr('src', new_src)
                            .css({ height: '', width: '', transform: 'translate(-50%, 0)', cursor: 'default' })
                            .attr({ height: 128, width: 128 })
                            .removeClass('body_main_with_floor is-zoomed is-dragging');
                    }
                }
                else {
                    ogebi(':button, :checkbox, :radio', 1).filter(':disabled').prop({ disabled: false });
                    $this_main.removeClass('outfiter_loading');
                }
            },
            // get mount, outfit or creature sprite sheets
            outfiter_get_ajax = function (item_n, type, female_suffix) {
                var
                    iname = item_n + (female_suffix ? '_Female' : ''),
                    utype = type.substr(0, 1).toUpperCase() + type.substr(1),
                    retry_max = 1, retry_wait = 500, retry_i = 0,
                    ajax_call = function () {
                        $.ajax({
                            dataType: 'text',
                            success: function (text) {
                                var
                                    r = text.match(
                                        new RegExp('id="' + (iname.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&').replace(/\s/g, '_').replace(/_/g, '[ _]')) + '">' + '([\\w\\W]*)' + '<' + '/pre>', 'i')
                                    );
                                if (r !== null) {
                                    text = r[1].replace(/\s+/g, '');
                                    if (type === 'mount') { ogebi('mount_image').attr('src', '').attr('src', text); }
                                    else if (type === 'creature') { ogebi('creature_image').attr('src', '').attr('src', text); }
                                    else { ogebi('main_image').attr('src', '').attr('src', text); }
                                }
                            },
                            error: function () {
                                retry_i++;
                                if (retry_i <= retry_max) { setTimeout(ajax_call, retry_wait); }
                                else { outfiter_hide_body(true, true); } // lock and mark as fail
                            },
                            url: 'base64/' + utype + '/' + iname + '.txt'
                        });
                    };
                ajax_call();
            },
            outfiter_load_outfit = function (param) {
                // show_outfit_prev save
                if (param !== 'mount') {
                    ogebi('show_outfit_prev').val(
                        ogebi('show_outfit').prop('checked') ? parseInt(ogebi('outfit').val(), 10) : outfiter_GET.outfit
                    );
                }
                outfiter_options_to_get();

                // creature vs outfit/mount are mutually exclusive
                if (param === 'creature' && outfiter_GET.creature !== 0) {
                    ogebi('outfit').val(outfiter_outfit_none_id);
                    ogebi('mount').val(0);
                    ogebi('radio_outfits_' + outfiter_outfit_none_id).prop('checked', true);
                    ogebi('radio_mounts_0').prop('checked', true);
                    outfiter_options_to_get();
                } else if ((param === 'outfit' || param === 'mount') && (outfiter_GET.outfit !== outfiter_outfit_none_id || outfiter_GET.mount !== 0)) {
                    ogebi('creature').val(0);
                    ogebi('radio_creatures_0').prop('checked', true);
                    outfiter_options_to_get();
                }

                var
                    outfit = outfiter_GET.outfit,
                    mount = outfiter_GET.mount,
                    creature = outfiter_GET.creature,
                    outfit_n = outfiter_names[outfit],
                    mount_n = outfiter_mount_names[mount],
                    creature_n = outfiter_creature_names[creature],
                    has_standing_animation_any = outfiter_sprites_standing.hasOwnProperty(outfit_n) || outfiter_sprites_mount_standing.hasOwnProperty(mount_n) || outfiter_sprites_creature_standing.hasOwnProperty(creature_n) || (creature > 0 && outfiter_creature_get_props(creature_n).standing > 1);

                if (outfiter_m_names[outfit_n] === true || outfiter_mount_names[mount] === undefined) {
                    mount = 0; ogebi('mount').val(0);
                    mount_n = outfiter_mount_names[mount];
                    ogebi('radio_mounts_0').trigger('click');
                    if (param === 'mount') { return; }
                    outfiter_options_to_get();
                }
                if (outfiter_u_names[outfit_n] === true) {
                    ogebi('female').prop({ checked: false });
                    if (param === 'female') { return; }
                    outfiter_options_to_get();
                }
                if (!has_standing_animation_any) {
                    ogebi('sanim').prop({ checked: false });
                    outfiter_options_to_get();
                }

                ogebi('radio_outfits_' + outfit).trigger('click');
                outfiter_hide_body(true);
                ogebi('outfit_name').text((
                    (outfiter_GET.female && outfiter_f_names[outfit_n]) ?
                        outfiter_f_names[outfit_n] : outfit_n
                ).replace(/_/g, ' '));
                ogebi('mount_name').text(mount_n.replace(/_/g, ' '));
                ogebi('creature_name').text(creature_n.replace(/_/g, ' '));

                outfiter_images_loaded[1] = mount === 0;
                outfiter_images_loaded[2] = creature === 0;
                outfiter_images_loaded[0] = false;

                if (mount !== 0) { outfiter_get_ajax(mount_n, 'mount'); }
                if (creature !== 0) { outfiter_get_ajax(creature_n, 'creature'); }
                outfiter_get_ajax(
                    outfit_n,
                    outfit >= 100 && outfit < 200 ? 'other' : (outfiter_GET.female ? 'female' : 'male'),
                    outfiter_GET.female && outfiter_f_suffix_inames[outfit_n] === true
                );
            },
            outfiter_do_get_outfit_pos = function (outfit) {
                var x;
                for (x = 0; x < outfiter_names_sorted.length; x++) { if (outfit === outfiter_names_sorted[x]) { break; } }
                if (outfiter_names_sorted[x] !== undefined) { return x; }
                return -1;
            },
            outfiter_do_get_mount_pos = function (mount) {
                var x;
                for (x = 0; x < outfiter_mount_names_sorted.length; x++) { if (mount === outfiter_mount_names_sorted[x]) { break; } }
                if (outfiter_mount_names_sorted[x] !== undefined) { return x; }
                return -1;
            },
            outfiter_do_get_creature_pos = function (creature) {
                var x;
                for (x = 0; x < outfiter_creature_names_sorted.length; x++) { if (creature === outfiter_creature_names_sorted[x]) { break; } }
                if (outfiter_creature_names_sorted[x] !== undefined) { return x; }
                return -1;
            },
            outfiter_do_creature = function (i, absolute) {
                var
                    creature = outfiter_GET.creature,
                    creature_pos = absolute ? outfiter_do_get_creature_pos(i) : outfiter_do_get_creature_pos(creature) + i;
                creature = outfiter_creature_names[outfiter_creature_names_sorted[creature_pos]];
                if (outfiter_creature_names_sorted[creature_pos] === undefined) {
                    if (creature_pos < 0) { creature_pos = outfiter_creature_names_sorted.length - 1; }
                    else if (creature_pos >= outfiter_creature_names_sorted.length) { creature_pos = 0; }
                }
                ogebi('show_creature_prev').val(
                    ogebi('show_creature').length && ogebi('show_creature').prop('checked') ? outfiter_creature_names_sorted[creature_pos] : outfiter_GET.creature
                );
                ogebi('creature').val(outfiter_creature_names_sorted[creature_pos]);
                outfiter_load_outfit('creature');
            },
            outfiter_do_mount = function (i, absolute) {
                var
                    mount = outfiter_GET.mount,
                    mount_pos = absolute ? outfiter_do_get_mount_pos(i) : outfiter_do_get_mount_pos(mount) + i;
                mount = outfiter_mount_names[outfiter_mount_names_sorted[mount_pos]];
                if (outfiter_mount_names_sorted[mount_pos] === undefined) {
                    if (mount_pos < 0) { mount_pos = outfiter_mount_names_sorted.length - 1; }
                    else if (mount_pos >= outfiter_mount_names_sorted.length) { mount_pos = 0; }
                }
                ogebi('show_mount_prev').val(
                    ogebi('show_mount').prop('checked') ? outfiter_mount_names_sorted[mount_pos] : outfiter_GET.mount
                );
                ogebi('mount').val(outfiter_mount_names_sorted[mount_pos]);
                outfiter_load_outfit('mount');
            },
            outfiter_do_outfit = function (i, absolute) {
                outfiter_options_to_get();
                var
                    mount = outfiter_GET.mount,
                    mount_pos = outfiter_do_get_mount_pos(mount),
                    outfit = outfiter_GET.outfit,
                    outfit_pos = (absolute ? outfiter_do_get_outfit_pos(i) : outfiter_do_get_outfit_pos(outfit) + i),
                    has_standing_animation;
                outfit = outfiter_names[outfiter_names_sorted[outfit_pos]];
                mount = outfiter_mount_names[outfiter_mount_names_sorted[mount_pos]];
                if (outfiter_names_sorted[outfit_pos] === undefined) {
                    if (outfit_pos < 0) { outfit_pos = outfiter_names_sorted.length - 1; }
                    else if (outfit_pos >= outfiter_names_sorted.length) { outfit_pos = 0; }
                }
                ogebi('outfit').val(outfiter_names_sorted[outfit_pos]);
                if (outfiter_a_names[outfit] === true) {
                    ogebi('addon1').prop({ checked: false });
                    ogebi('addon2').prop({ checked: false });
                }
                else if (outfiter_o_names[outfit] === true) {
                    if (ogebi('addon1').is(':checked')) { ogebi('addon2').prop({ checked: false }); }
                    else if (ogebi('addon2').is(':checked')) { ogebi('addon1').prop({ checked: false }); }
                }
                if (outfiter_m_names[outfit] === true || outfiter_mount_names[mount_pos] === undefined) {
                    ogebi('radio_mounts_0').trigger('click');
                    outfiter_options_to_get();
                    mount = outfiter_GET.mount;
                    mount_pos = outfiter_do_get_mount_pos(mount);
                }
                if (ogebi('sanim').is(':checked')) {
                    has_standing_animation = outfiter_sprites_standing.hasOwnProperty(outfit) ||
                        outfiter_sprites_mount_standing.hasOwnProperty(mount) ||
                        outfiter_sprites_creature_standing.hasOwnProperty(outfiter_creature_names[outfiter_GET.creature]);
                    if (!has_standing_animation) { ogebi('sanim').prop({ checked: false }); }
                }
                outfiter_load_outfit('outfit');
            },
            outfiter_animate_char = function () {
                clearTimeout(outfiter_atime);
                outfiter_acurrent++;
                if (outfiter_acurrent >= outfiter_aframes.length) { outfiter_acurrent = 0; }
                if (!ogebi('animate').is(':checked')) { return; }
                ogebi('.body_main_div .body_main', 1).attr('src', '').attr('src', outfiter_aframes[outfiter_acurrent]);
                outfiter_atime = setTimeout(outfiter_animate_char, outfiter_outfit_speed(outfiter_acurrent));
            },
            greatest_common_factor = function (x, y) {
                var a = Math.max(x, y), b = Math.min(x, y), c = 1, res;
                do {
                    c = a % b;
                    // capture last value of $b as the potential last GCF result
                    res = b;
                    // if $c did not = 0 we need to repeat with the values held in $b and $c
                    // at this point $b is higher than $c so we set up for the next iteration
                    // set $a to the higher number and $b to the lower number
                    a = b;
                    b = c;
                } while (c !== 0);
                return res;
            },
            least_common_multiple = function (x, y) {
                return (x * y) / greatest_common_factor(x, y);
            },
            use_special_delays = false,
            special_delays = [],
            outfiter_outfit_speed = function (i) {
                var
                    res = 100,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    creature_n, props, frames;
                if (use_special_delays && special_delays && special_delays.length) {
                    res = special_delays[i % special_delays.length];
                }
                // Creature-specific timing when a creature is selected
                else if (outfiter_GET.creature > 0) {
                    creature_n = outfiter_creature_names[outfiter_GET.creature];
                    props = outfiter_creature_get_props(creature_n);
                    if (outfiter_GET.sanim) {
                        if (props.standing_delay !== null && props.standing_delay !== undefined) {
                            res = props.standing_delay;
                        } else {
                            frames = props.standing > 0 ? props.standing : 1;
                            res = 800 / frames;
                        }
                    } else {
                        if (props.walking_delay !== null && props.walking_delay !== undefined) {
                            res = props.walking_delay;
                        } else {
                            frames = props.walking > 0 ? props.walking : 8;
                            res = 800 / frames;
                        }
                    }
                    res = res < 100 ? 100 : res;
                }
                else {
                    res = 800 / (outfiter_sprites_walking.hasOwnProperty(outfit_n) ?
                        outfiter_sprites_walking[outfit_n] : 8
                    );
                    res = res < 100 ? 100 : res;
                }
                return res;
            },
            outfiter_do_display2 = function () {
                var
                    outfiter_readCookie = function (cname) { var i, c, cl = document.cookie.split(';'); for (i = 0; i < cl.length; i++) { c = $.trim(cl[i]); if (c.indexOf(cname + '=') === 0) { return c.substring(cname.length + 1); } } return null; },
                    // Format: [column, row, width, leftOffset, rightOffset]
                    outfiter_letters = {
                        'À': [0, 5, 9, 0, 0], 'Á': [1, 5, 9, 0, 0], 'Â': [2, 5, 9, 0, 0], 'Ã': [3, 5, 9, 0, 0], 'Ä': [4, 5, 9, 0, 0], 'Å': [5, 5, 9, 0, 0], 'Æ': [6, 5, 12, 0, 0], 'Ç': [7, 5, 8, 0, 0],
                        'È': [8, 5, 8, 0, 0], 'É': [9, 5, 8, 0, 0], 'Ê': [10, 5, 8, 0, 0], 'Ë': [11, 5, 8, 0, 0], 'Ì': [12, 5, 6, 0, 0], 'Í': [13, 5, 6, 0, 0], 'Î': [14, 5, 6, 0, 0], 'Ï': [15, 5, 6, 0, 0],
                        'Ð': [16, 5, 9, 0, 0], 'Ñ': [17, 5, 9, 0, 0], 'Ò': [18, 5, 9, 0, 0], 'Ó': [19, 5, 9, 0, 0], 'Ô': [20, 5, 9, 0, 0], 'Õ': [21, 5, 9, 0, 0], 'Ö': [22, 5, 9, 0, 0], '×': [23, 5, 10, 0, 0],
                        'Ø': [24, 5, 9, 0, 0], 'Ù': [25, 5, 9, 0, 0], 'Ú': [26, 5, 9, 0, 0], 'Û': [27, 5, 9, 0, 0], 'Ü': [28, 5, 9, 0, 0], 'Ý': [29, 5, 8, 0, 0], 'Þ': [30, 5, 8, 0, 0], 'ß': [31, 5, 8, 0, 0],
                        'à': [0, 6, 8, 0, 0], 'á': [1, 6, 8, 0, 0], 'â': [2, 6, 8, 0, 0], 'ã': [3, 6, 8, 0, 0], 'ä': [4, 6, 8, 0, 0], 'å': [5, 6, 8, 0, 0], 'æ': [6, 6, 12, 0, 0], 'ç': [7, 6, 7, 0, 0],
                        'è': [8, 6, 8, 0, 0], 'é': [9, 6, 8, 0, 0], 'ê': [10, 6, 8, 0, 0], 'ë': [11, 6, 8, 0, 0], 'ì': [12, 6, 4, 0, 0], 'í': [13, 6, 4, 0, 0], 'î': [14, 6, 4, 0, 0], 'ï': [15, 6, 4, 0, 0],
                        'ð': [16, 6, 8, 0, 0], 'ñ': [17, 6, 8, 0, 0], 'ò': [18, 6, 8, 0, 0], 'ó': [19, 6, 8, 0, 0], 'ô': [20, 6, 8, 0, 0], 'õ': [21, 6, 8, 0, 0], 'ö': [22, 6, 8, 0, 0], '÷': [23, 6, 9, 0, 0],
                        'ø': [24, 6, 8, 0, 0], 'ù': [25, 6, 8, 0, 0], 'ú': [26, 6, 8, 0, 0], 'û': [27, 6, 8, 0, 0], 'ü': [28, 6, 8, 0, 0], 'ý': [29, 6, 8, 0, 0], 'þ': [30, 6, 8, 0, 0], 'ÿ': [31, 6, 8, 0, 0],
                        ' ': [0, 0, 4, 0, 0], '.': [14, 0, 4, 0, 0], '-': [13, 4, 6, 0, 0], ',': [12, 0, 4, 0, 0],
                        '@': [0, 1, 9, 0, 0], 'A': [1, 1, 9, 0, 0], 'B': [2, 1, 8, 0, 0], 'C': [3, 1, 8, 0, 0], 'D': [4, 1, 9, 0, 0], 'E': [5, 1, 8, 0, 0], 'F': [6, 1, 8, 0, 0], 'G': [7, 1, 9, 0, 0],
                        'H': [8, 1, 9, 0, 0], 'I': [9, 1, 6, 0, 0], 'J': [10, 1, 6, 1, 0], 'K': [11, 1, 8, 0, 0], 'L': [12, 1, 7, 0, 1], 'M': [13, 1, 10, 0, 0], 'N': [14, 1, 9, 0, 0], 'O': [15, 1, 9, 0, 0],
                        'P': [16, 1, 8, 0, 0], 'Q': [17, 1, 9, 0, 0], 'R': [18, 1, 8, 0, 1], 'S': [19, 1, 8, 0, 0], 'T': [20, 1, 8, 1, 1], 'U': [21, 1, 9, 0, 0], 'V': [22, 1, 8, 0, 0], 'W': [23, 1, 12, 0, 0],
                        'X': [24, 1, 8, 0, 0], 'Y': [25, 1, 8, 0, 0], 'Z': [26, 1, 8, 0, 0],
                        '\'': [7, 0, 4, 0, 0], 'a': [1, 2, 8, 0, 0], 'b': [2, 2, 8, 0, 0], 'c': [3, 2, 7, 0, 0], 'd': [4, 2, 8, 0, 0], 'e': [5, 2, 8, 0, 0], 'f': [6, 2, 5, 1, 1], 'g': [7, 2, 8, 0, 0],
                        'h': [8, 2, 8, 0, 0], 'i': [9, 2, 4, 0, 0], 'j': [10, 2, 5, 1, 0], 'k': [11, 2, 8, 0, 0], 'l': [12, 2, 4, 0, 0], 'm': [13, 2, 12, 0, 0], 'n': [14, 2, 8, 0, 0], 'o': [15, 2, 8, 0, 0],
                        'p': [16, 2, 8, 0, 0], 'q': [17, 2, 8, 0, 0], 'r': [18, 2, 6, 0, 1], 's': [19, 2, 7, 0, 0], 't': [20, 2, 5, 1, 1], 'u': [21, 2, 8, 0, 0], 'v': [22, 2, 8, 0, 0], 'w': [23, 2, 10, 0, 0],
                        'x': [24, 2, 8, 0, 0], 'y': [25, 2, 8, 0, 0], 'z': [26, 2, 7, 0, 0],
                        '0': [16, 0, 8, 0, 0], '1': [17, 0, 6, 0, 0], '2': [18, 0, 8, 0, 0], '3': [19, 0, 8, 0, 0], '4': [20, 0, 8, 0, 0],
                        '5': [21, 0, 8, 0, 0], '6': [22, 0, 8, 0, 0], '7': [23, 0, 8, 0, 0], '8': [24, 0, 8, 0, 0], '9': [25, 0, 8, 0, 0],
                    },
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    mount_n = outfiter_mount_names[outfiter_GET.mount],
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    af_o = outfiter_GET.animate ?
                        (outfiter_GET.sanim ?
                            (outfiter_sprites_standing.hasOwnProperty(outfit_n) ?
                                outfiter_sprites_standing[outfit_n] +
                                (outfiter_pingpong_animation.hasOwnProperty(outfit_n) ?
                                    outfiter_sprites_standing[outfit_n] - 2 : 0) : 1
                            ) :
                            (outfiter_sprites_walking.hasOwnProperty(outfit_n) ?
                                outfiter_sprites_walking[outfit_n] +
                                (outfiter_pingpong_animation.hasOwnProperty(outfit_n) ?
                                    outfiter_sprites_walking[outfit_n] - 2 : 0) : 8
                            )
                        ) : 0,
                    af_m = outfiter_GET.mount ?
                        (outfiter_GET.animate ?
                            (outfiter_GET.sanim ?
                                (outfiter_sprites_mount_standing.hasOwnProperty(mount_n) ?
                                    outfiter_sprites_mount_standing[mount_n] : 1
                                ) :
                                (outfiter_sprites_mount_walking.hasOwnProperty(mount_n) ?
                                    outfiter_sprites_mount_walking[mount_n] : 8
                                )
                            ) : 0
                        ) : af_o,
                    // Creature frame counts come from outfiter_creature_get_props
                    af_c = outfiter_GET.creature ?
                        (outfiter_GET.animate ?
                            (outfiter_GET.sanim ?
                                outfiter_creature_get_props(creature_n).standing :
                                outfiter_creature_get_props(creature_n).walking
                            ) : 0
                        ) : 0,
                    done = false,
                    delays_o, delays_m, total_o, total_m,
                    keyframes_o, keyframes_m, keyframes,
                    has_creature = outfiter_GET.creature > 0,
                    af = has_creature ? af_c : ((af_o === 0 || af_m === 0) ? 0 : least_common_multiple(af_o, af_m)),
                    af_tmp,
                    afi,
                    frames_all = [],
                    frames_o = [],
                    frames_m = [],
                    frames_c = [],
                    pos_o,
                    pos_m,
                    pos_c,
                    limit_left = false,
                    limit_right = false,
                    pixel_data,
                    ctx_zoom,
                    ctx_work,
                    neww, newh,
                    output_image,
                    soft_mult = outfiter_GET.soft ? 2 : 1,
                    //name vars
                    bar_xpos = outfiter_GET.soft ? (outfiter_GET.outfit === 103 ? 44 : 82) : (outfiter_GET.outfit === 103 ? 16 : 34),
                    namew,
                    name_center = bar_xpos + 13,
                    name_left,
                    name_right,
                    char_name = decodeURIComponent(outfiter_GET.charn).split(''),
                    lastpos,
                    //floor
                    floor_offset = { x: 1, y: 1 },
                    floor_move = outfiter_GET.animate && !outfiter_GET.sanim && outfiter_no_floor_move_names[outfit_n] !== true,
                    floor_x,
                    floor_y,
                    //
                    has_standing_animation_o = outfiter_GET.animate && outfiter_sprites_standing.hasOwnProperty(outfit_n),
                    has_standing_animation_m = outfiter_GET.animate && outfiter_sprites_mount_standing.hasOwnProperty(mount_n),
                    has_standing_animation_c = outfiter_GET.animate && outfiter_creature_get_props(creature_n).standing > 1,
                    has_standing_animation_any = outfiter_sprites_standing.hasOwnProperty(outfit_n) || outfiter_sprites_mount_standing.hasOwnProperty(mount_n) || (outfiter_GET.creature > 0 && outfiter_creature_get_props(creature_n).standing > 1) || outfiter_sprites_creature_standing.hasOwnProperty(creature_n),
                    has_outfit = outfiter_GET.outfit !== outfiter_outfit_none_id,
                    can_have_mount = outfiter_m_names[outfit_n] !== true && has_outfit,
                    can_color_mount = outfiter_mount_colourisable[mount_n] === true,
                    show_mount_prev = parseInt(ogebi('show_mount_prev').val(), 10),
                    show_mount_checked = false,
                    show_mount_disabled = false,
                    show_outfit_prev = parseInt(ogebi('show_outfit_prev').val(), 10),
                    show_outfit_checked = false,
                    show_outfit_disabled = false,
                    draw_text_char = function (i) {
                        var v = char_name[i];
                        if (outfiter_letters.hasOwnProperty(v)) {
                            ctx_zoom.drawImage(
                                ogebi('letters_image')[0],
                                outfiter_letters[v][0] * 16 - outfiter_letters[v][3],
                                outfiter_letters[v][1] * 16,
                                outfiter_letters[v][2] + outfiter_letters[v][3] + outfiter_letters[v][4], 15,
                                lastpos + 1 + floor_offset.x - outfiter_letters[v][3],
                                (outfiter_GET.soft ? 48 : 16) - 1 + floor_offset.y,
                                outfiter_letters[v][2] + outfiter_letters[v][3] + outfiter_letters[v][4], 15
                            );
                            lastpos += outfiter_letters[v][2];
                        }
                    },
                    namew_add = function (i) { if (outfiter_letters.hasOwnProperty(char_name[i])) { namew += outfiter_letters[char_name[i]][2]; } },
                    array_fill = function (amount, val) {
                        var i, ret = [];
                        for (i = 0; i < amount; i++) { ret.push(typeof val === 'function' ? val(i) : val); }
                        return ret;
                    };
                //clean saved image frames
                outfiter_aframes = [];
                //clear canvases
                $canvas_main.attr({ width: canvas_main.width, height: canvas_main.height });
                $canvas_mount.attr({ width: canvas_mount.width, height: canvas_mount.height });
                $canvas_creature.attr({ width: canvas_creature.width, height: canvas_creature.height });
                //fill canvases with images
                try { canvas_main.getContext('2d').drawImage(ogebi('main_image')[0], 0, 0); } catch (ignore) { }
                try { canvas_mount.getContext('2d').drawImage(ogebi('mount_image')[0], 0, 0); } catch (ignore) { }
                try { canvas_creature.getContext('2d').drawImage(ogebi('creature_image')[0], 0, 0); } catch (ignore) { }

                ctx_zoom = canvas_zoom.getContext('2d');
                ctx_work = canvas_work.getContext('2d');
                use_special_delays = false;
                // Creature per-frame delay arrays (standing_delays / walking_delays)
                if (has_creature) {
                    (function () {
                        var cprops = outfiter_creature_get_props(creature_n), delay_arr = null, di;
                        if (outfiter_GET.sanim && cprops.standing_delays && cprops.standing_delays.length) {
                            delay_arr = cprops.standing_delays;
                        } else if (!outfiter_GET.sanim && cprops.walking_delays && cprops.walking_delays.length) {
                            delay_arr = cprops.walking_delays;
                        }
                        if (delay_arr) {
                            special_delays = [];
                            for (di = 0; di < delay_arr.length; di++) {
                                special_delays[di] = delay_arr[di];
                            }
                            use_special_delays = true;
                            af = delay_arr.length;
                        }
                    }());
                }
                if (outfiter_GET.sanim && (
                    outfiter_special_delays_standing.hasOwnProperty(outfit_n) ||
                    outfiter_special_delays_mount_standing.hasOwnProperty(mount_n))
                ) {
                    delays_o = [];
                    delays_m = [];
                    var special_o = outfiter_special_delays_standing.hasOwnProperty(outfit_n);
                    var special_m = outfiter_special_delays_mount_standing.hasOwnProperty(mount_n);
                    if (special_o && special_m) {
                        delays_o = outfiter_special_delays_standing[outfit_n];
                        delays_m = outfiter_special_delays_mount_standing[mount_n];
                    } else if (special_o) {
                        delays_o = outfiter_special_delays_standing[outfit_n];
                        if (outfiter_sprites_mount_standing.hasOwnProperty(mount_n)) {
                            delays_m = array_fill(outfiter_sprites_mount_standing[mount_n], 100);
                        } else {
                            delays_m = [delays_o.reduce(function (a, b) { return Math.min(a, b); })];
                        }
                    } else if (special_m) {
                        delays_m = outfiter_special_delays_mount_standing[mount_n];
                        if (outfiter_sprites_standing.hasOwnProperty(outfit_n)) {
                            delays_o = array_fill(outfiter_sprites_standing[outfit_n], 100);
                        } else {
                            delays_o = [delays_m.reduce(function (a, b) { return Math.min(a, b); })];
                        }
                    }
                    total_o = delays_o.reduce(function (a, b) { return a + b; });
                    total_m = delays_m.reduce(function (a, b) { return a + b; });
                    var
                        anim_duration = least_common_multiple(total_o, total_m),
                        delays_all_o = [],
                        delays_all_m = [],
                        d_all_i, keyframes_i;
                    keyframes_o = [];
                    keyframes_m = [];
                    keyframes = [];
                    special_delays = [];
                    for (d_all_i = 0; d_all_i < anim_duration / total_o; d_all_i++) {
                        delays_all_o = delays_all_o.concat(delays_o);
                    }
                    for (d_all_i = 0; d_all_i < anim_duration / total_m; d_all_i++) {
                        delays_all_m = delays_all_m.concat(delays_m);
                    }
                    delays_all_o.reduce(function (a, b, i) { return (keyframes_o[i] = a + b); }, 0);
                    delays_all_m.reduce(function (a, b, i) { return (keyframes_m[i] = a + b); }, 0);
                    keyframes = keyframes_o.concat(keyframes_m).sort(function (a, b) { return a - b; });
                    keyframes = keyframes.filter(function (v, i) { return keyframes.indexOf(v) === i; });
                    keyframes.unshift(0);
                    for (keyframes_i = 1; keyframes_i < keyframes.length; keyframes_i++) {
                        special_delays[keyframes_i - 1] = keyframes[keyframes_i] - keyframes[keyframes_i - 1];
                    }
                    use_special_delays = true;
                    af = keyframes.length - 1;
                    //console.log(delays_o.join(','));
                    //console.log(keyframes_o.join(','));
                    //console.log(delays_m.join(','));
                    //console.log(keyframes_m.join(','));
                    //console.log(keyframes.join(','));
                    //console.log(special_delays.join(','));
                }
                //floor_move frame adjust
                if (floor_move) {
                    af_tmp = least_common_multiple(af, floor_spr_w / floor_move_per_frame);
                    af = af_tmp < 128 ? af_tmp : af;
                }
                //getting animation frame
                var kf_red = function (a, b) { return keyframes[afi + 1] < b ? a : b; };
                for (afi = 0; afi < af || (af === 0 && done === false); afi++) {
                    //get basic data
                    if (af === 0) {
                        if (has_creature) {
                            pixel_data = outfiter_pixels_get_creature(0);
                        } else {
                            pixel_data = outfiter_pixels_merge(outfiter_pixels_get_mount(0), outfiter_pixels_get_out(0));
                        }
                        done = true;
                    } else if (use_special_delays) {
                        if (has_creature) {
                            // Creature delay-array animation: one frame index per special_delays entry
                            pos_c = afi % special_delays.length;
                            if (!frames_c[pos_c]) { frames_c[pos_c] = outfiter_pixels_get_creature(pos_c); }
                            pixel_data = frames_c[pos_c];
                        } else {
                            pos_o = keyframes_o.indexOf(keyframes_o.reduce(kf_red));
                            pos_o = pos_o % delays_o.length;
                            pos_m = keyframes_m.indexOf(keyframes_m.reduce(kf_red));
                            pos_m = pos_m % delays_m.length;
                            //console.log({afi: afi, pos_o: pos_o, pos_m: pos_m});
                            if (!frames_m[pos_m]) { frames_m[pos_m] = outfiter_pixels_get_mount(pos_m); }
                            if (!frames_o[pos_o]) { frames_o[pos_o] = outfiter_pixels_get_out(pos_o); }
                            pixel_data = outfiter_pixels_merge(frames_m[pos_m], frames_o[pos_o]);
                        }
                    } else {
                        if (has_creature) {
                            // Frame index only; standing-row offset is applied inside outfiter_pixels_get_creature
                            pos_c = afi % af_c;
                            if (!frames_c[pos_c]) { frames_c[pos_c] = outfiter_pixels_get_creature(pos_c); }
                            pixel_data = frames_c[pos_c];
                        } else {
                            pos_o = (afi % af_o) + (has_standing_animation_o ? 0 : (outfiter_GET.sanim ? 0 : 1));
                            pos_m = (afi % af_m) + (has_standing_animation_m ? 0 : (outfiter_GET.sanim ? 0 : 1));
                            //console.log({afi: afi, pos_o: pos_o, pos_m: pos_m});
                            if (!frames_m[pos_m]) { frames_m[pos_m] = outfiter_pixels_get_mount(pos_m); }
                            if (!frames_o[pos_o]) { frames_o[pos_o] = outfiter_pixels_get_out(pos_o); }
                            pixel_data = outfiter_pixels_merge(frames_m[pos_m], frames_o[pos_o]);
                        }
                    }
                    //floor
                    if (outfiter_GET.floor) {
                        //resize/reposition
                        $canvas_work.attr({ width: floor_w, height: floor_h });
                        floor_offset.x = (floor_w - 64) / 2;
                        floor_offset.y = floor_offset_y;
                        outfiter_pixels_draw({ pixels: pixel_data, x: floor_offset.x, y: floor_offset.y });
                        pixel_data = ctx_work.getImageData(0, 0, canvas_work.width, canvas_work.height);
                        //coords (0 north 1 east 2 south 3 west)
                        floor_x = (floor_move && (outfiter_GET.facing % 2) ? (afi * floor_move_per_frame * (outfiter_GET.facing === 1 ? -1 : 1)) : 0) - floor_offset_x;
                        floor_y = (floor_move && !(outfiter_GET.facing % 2) ? (afi * floor_move_per_frame * (outfiter_GET.facing === 2 ? -1 : 1)) : 0) - floor_offset_y;
                        outfiter_floor_draw({ ctx: ctx_work, floor_x: floor_x, floor_y: floor_y });
                        //merge
                        pixel_data = outfiter_pixels_merge(
                            ctx_work.getImageData(0, 0, canvas_work.width, canvas_work.height),
                            pixel_data
                        );
                        //update offset
                        floor_offset.x *= soft_mult;
                        floor_offset.y *= soft_mult;
                    }
                    else {
                        $canvas_work.attr({ width: 64, height: 64 });
                    }
                    //draw normal
                    outfiter_pixels_draw({ pixels: pixel_data, clear: true });
                    //draw zoomed
                    $canvas_zoom.attr({ width: canvas_work.width * soft_mult, height: canvas_work.height * soft_mult });
                    ctx_zoom.drawImage(
                        canvas_work,
                        0, 0, canvas_work.width, canvas_work.height,
                        0, 0, canvas_work.width * soft_mult, canvas_work.height * soft_mult
                    );
                    pixel_data = ctx_zoom.getImageData(0, 0, canvas_zoom.width, canvas_zoom.height);
                    //hp bar
                    if (outfiter_GET.hpbar) {
                        ctx_zoom.drawImage(
                            ogebi('hp_bar')[0],
                            0, 0, 64, 64,
                            bar_xpos + floor_offset.x, (outfiter_GET.soft ? 60 : 28) + floor_offset.y, 64, 64
                        );
                        pixel_data = ctx_zoom.getImageData(0, 0, canvas_zoom.width, canvas_zoom.height);
                    }
                    //name
                    if (outfiter_GET.charn !== '') {
                        namew = 0;
                        name_left = 0;
                        name_right = 0;
                        //get total length
                        $.each(char_name, namew_add);
                        namew += 2;
                        //resize canvas if needed and set start position
                        if (canvas_zoom.width - name_center < namew / 2) { name_right = Math.ceil((namew / 2) - (canvas_zoom.width - name_center)); }
                        if (name_center < namew / 2) { name_left = Math.ceil((namew / 2) - name_center); }
                        $canvas_zoom.attr({ width: canvas_zoom.width + name_left + name_right });
                        outfiter_pixels_draw({ $canvas: $canvas_zoom, pixels: pixel_data, x: name_left });
                        lastpos = name_center + name_left - Math.floor(namew / 2);
                        //draw the text
                        $.each(char_name, draw_text_char);
                        pixel_data = ctx_zoom.getImageData(0, 0, canvas_zoom.width, canvas_zoom.height);
                    }
                    //save frame pixel_data
                    frames_all[afi] = pixel_data;
                }
                //get limits
                if (outfiter_GET.floor) {
                    limit_left = 0;
                    limit_right = canvas_zoom.width;
                } else {
                    $.each(frames_all, function (i) {
                        var limits = outfiter_pixels_hlimits(frames_all[i]);
                        limit_left = limit_left === false ? limits[0] : Math.min(limits[0], limit_left);
                        limit_right = limit_right === false ? limits[1] : Math.max(limits[1], limit_right);
                    });
                }

                $.each(frames_all, function (i) {
                    frames_all[i] = outfiter_pixels_hcrop_expand(frames_all[i], limit_left, limit_right, 64 * soft_mult);
                    outfiter_pixels_draw({ $canvas: $canvas_zoom, pixels: frames_all[i], resize: true });
                    outfiter_aframes[i] = canvas_zoom.toDataURL();
                });

                output_image = outfiter_aframes[0];

                if (outfiter_bake_silent) {
                    return;
                }

                if (outfiter_GET.animate) {
                    outfiter_animate_char();
                }

                neww = frames_all[0].width * 2 / soft_mult;
                newh = frames_all[0].height * 2 / soft_mult;
                outfiter_base_w = neww;
                outfiter_base_h = newh;
                ogebi('.body_main_div .body_main', 1)
                    .attr('src', '')
                    .attr({ src: output_image }).toggleClass('body_main_with_floor', outfiter_GET.floor);
                outfiter_apply_zoom();

                ogebi('anistep_step_cont').empty();
                if (ogebi('anistep').is(':checked') && outfiter_aframes && outfiter_aframes.length) {
                    $.each(outfiter_aframes, function (i, v) {
                        ogebi('anistep_step_cont').append(
                            $('<div />', { class: 'anistep_step' }).append(
                                $('<img />', {
                                    alt: 'Animation step ' + (i + 1),
                                    title: 'Step ' + (i + 1),
                                    src: v
                                })
                            )
                        );
                    });
                    ogebi('anistep_panel').addClass('is-visible');
                } else {
                    ogebi('anistep_panel').removeClass('is-visible');
                }

                ogebi('template_code_code_cont').empty();
                if (ogebi('template_code').is(':checked')) {
                    ogebi('template_code_code_cont').append(
                        $('<span />', { class: 'url_input_text', html: 'Template:&nbsp;' }),
                        $('<span />', { class: 'template_code_out' }).append(
                            $('<textarea />', {
                                class: 'dark_input template_code_code',
                                rows: 2,
                                readonly: 'readonly'
                            }).val('{{Outfitter|' + outfiter_gen_template() + '}}')
                        ),
                        $('<button />', {
                            type: 'button',
                            class: 'copy_btn copy_template',
                            title: 'Copy',
                            'aria-label': 'Copy template'
                        })
                    );
                }

                outfiter_hide_body(false);
                outfiter_apply_zoom();

                // Colourise / addon UI — outfit/mount vs creature-mode capabilities
                if (has_creature) {
                    (function () {
                        var cprops = outfiter_creature_get_props(creature_n),
                            can_color_creature = cprops.colourisable === true;
                        // Colourise radios are outfit/mount oriented; disable when only a creature is shown
                        ogebi('[name="radio_colourise"]', 1).prop({ disabled: true }).parent().toggleClass('disabled', true);
                        ogebi('colourise_copy').prop({ disabled: true });
                        ogebi('female').parent().toggleClass('disabled', true);
                        // Per-addon enable based on creature props
                        ogebi('addon1').parent().toggleClass('disabled', !cprops.addon1);
                        ogebi('addon2').parent().toggleClass('disabled', !cprops.addon2);
                        if (!cprops.addon1) { ogebi('addon1').prop({ checked: false }); }
                        if (!cprops.addon2) { ogebi('addon2').prop({ checked: false }); }
                        // Note: creature colourisation uses c1–c4 directly when colourisable
                        if (!can_color_creature) {
                            // no colour mask — leave colour table usable for URL params but no visual effect
                        }
                    }());
                } else {
                    if (!can_color_mount) {
                        ogebi('[name="radio_colourise"][value="outfit"]', 1).prop({ checked: true }).trigger('change');
                    }
                    ogebi('[name="radio_colourise"]', 1).prop({ disabled: !can_color_mount }).parent().toggleClass('disabled', !can_color_mount);
                    ogebi('colourise_copy').prop({ disabled: !can_color_mount });
                    ogebi('female').parent().toggleClass('disabled', outfiter_u_names[outfit_n] === true);
                    ogebi('.addon1, .addon2', 1).parent().toggleClass('disabled', outfiter_a_names[outfit_n] === true);
                }
                ogebi('sanim').prop({ disabled: !has_standing_animation_any }).parent().toggleClass('disabled', !has_standing_animation_any);

                if (outfiter_GET.outfit === outfiter_outfit_none_id && show_outfit_prev === outfiter_outfit_none_id) { show_outfit_disabled = true; }
                else { show_outfit_checked = has_outfit; }
                ogebi('show_outfit').prop({ checked: show_outfit_checked, disabled: show_outfit_disabled }).parent().toggleClass('disabled', show_outfit_disabled);

                if ((has_outfit && !can_have_mount) || (!outfiter_GET.mount && !show_mount_prev)) { show_mount_disabled = true; }
                show_mount_checked = !!outfiter_GET.mount;
                ogebi('show_mount').prop({ checked: show_mount_checked, disabled: show_mount_disabled }).parent().toggleClass('disabled', show_mount_disabled);

                var show_creature_prev2 = parseInt(ogebi('show_creature_prev').val(), 10),
                    show_creature_checked = false, show_creature_disabled = false;
                if (!outfiter_GET.creature && !show_creature_prev2) { show_creature_disabled = true; }
                show_creature_checked = !!outfiter_GET.creature;
                ogebi('show_creature').prop({ checked: show_creature_checked, disabled: show_creature_disabled }).parent().toggleClass('disabled', show_creature_disabled);

                ogebi('.mountm, .mountp', 1).parent().toggleClass('disabled', !can_have_mount);
                outfiter_gen_url();
            },
            outfiter_do_display = function () {
                var display2_delay;
                outfiter_options_to_get();
                outfiter_hide_body(true);
                clearTimeout(outfiter_atime);
                display2_delay = (outfiter_GET.animate && outfiter_apng_supported === '') ? 1500 : 1;
                setTimeout(outfiter_do_display2, display2_delay);
            },
            outfiter_do_addon = function (id) {
                id = (typeof id === 'number') ? id : 0;
                var
                    tmp, has_standing_animation,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    mount_n = outfiter_mount_names[outfiter_GET.mount],
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    cprops;
                if (outfiter_GET.creature > 0) {
                    // Creature-mode addon rules (per-creature props)
                    cprops = outfiter_creature_get_props(creature_n);
                    if (!cprops.addon1 && !cprops.addon2) {
                        ogebi('addon1, .addon2').prop({ checked: false });
                        if (id) { return; }
                    } else {
                        if (!cprops.addon1) { ogebi('addon1').prop({ checked: false }); }
                        if (!cprops.addon2) { ogebi('addon2').prop({ checked: false }); }
                        // Mutually exclusive addons when configured
                        if (id && cprops.exclusive_addons) {
                            tmp = ogebi('addon' + id).is(':checked');
                            ogebi('addon1, .addon2').prop({ checked: false });
                            if (tmp && ((id === 1 && cprops.addon1) || (id === 2 && cprops.addon2))) {
                                ogebi('addon' + id).prop({ checked: true });
                            }
                        }
                    }
                } else if (outfiter_a_names[outfit_n] === true) {
                    ogebi('addon1, .addon2').prop({ checked: false });
                    if (id) { return; }
                }
                else if (id && outfiter_o_names[outfit_n] === true) {
                    tmp = ogebi('addon' + id).is(':checked');
                    ogebi('addon1, .addon2').prop({ checked: false });
                    if (tmp) { ogebi('addon' + id).prop({ checked: true }); }
                }
                if (ogebi('sanim').is(':checked')) {
                    has_standing_animation = outfiter_sprites_standing.hasOwnProperty(outfit_n) ||
                        outfiter_sprites_mount_standing.hasOwnProperty(mount_n) ||
                        outfiter_sprites_creature_standing.hasOwnProperty(creature_n) ||
                        (outfiter_GET.creature > 0 && outfiter_creature_get_props(creature_n).standing > 1);
                    if (!has_standing_animation) { ogebi('sanim').prop({ checked: false }); }
                    if (!ogebi('animate').is(':checked')) {
                        if ($(this).hasClass('animate')) { ogebi('sanim').prop({ checked: false }); }
                        else if ($(this).hasClass('sanim')) { ogebi('animate').prop({ checked: true }); }
                    }
                }
                if (outfiter_m_names[outfit_n] === true) { ogebi('mount').val(0); ogebi('radio_mounts_0').trigger('click'); }
                outfiter_do_display();
            },
            outfiter_do_facing = function (i) {
                var facing = parseInt(ogebi('facing').val(), 10) + parseInt(i, 10);
                if (facing < 0) { facing = 3; }
                else if (facing > 3) { facing = 0; }
                ogebi('facing').val(facing);
                outfiter_do_display();
            },
            /* Pan is unrestricted when zoomed so the outfit can be dragged wherever needed. */
            outfiter_clamp_pan = function () {
                if (outfiter_zoom <= 1) {
                    outfiter_pan_x = 0;
                    outfiter_pan_y = 0;
                }
            },
            outfiter_apply_zoom = function () {
                var
                    $img = ogebi('.body_main_div .body_main', 1),
                    w = Math.round(outfiter_base_w * outfiter_zoom),
                    h = Math.round(outfiter_base_h * outfiter_zoom),
                    tx;
                if (outfiter_zoom <= 1) {
                    outfiter_pan_x = 0;
                    outfiter_pan_y = 0;
                }
                tx = 'translate(calc(-50% + ' + outfiter_pan_x + 'px), ' + outfiter_pan_y + 'px)';
                $img
                    .css({
                        height: h,
                        width: w,
                        transform: tx,
                        cursor: outfiter_zoom > 1 ? (outfiter_dragging ? 'grabbing' : 'grab') : 'default'
                    })
                    .attr({ height: h, width: w })
                    .toggleClass('is-zoomed', outfiter_zoom > 1)
                    .toggleClass('is-dragging', outfiter_dragging);
                ogebi('zoomin').prop({ disabled: outfiter_zoom >= outfiter_zoom_max });
                ogebi('zoomout').prop({ disabled: outfiter_zoom <= outfiter_zoom_min });
            },
            outfiter_do_zoom = function (delta) {
                var next = outfiter_zoom + parseInt(delta, 10);
                if (next < outfiter_zoom_min) { next = outfiter_zoom_min; }
                else if (next > outfiter_zoom_max) { next = outfiter_zoom_max; }
                if (next === outfiter_zoom) { return; }
                outfiter_zoom = next;
                if (outfiter_zoom <= 1) {
                    outfiter_pan_x = 0;
                    outfiter_pan_y = 0;
                }
                outfiter_apply_zoom();
            },
            outfiter_do_zoom_reset = function () {
                outfiter_zoom = 1;
                outfiter_pan_x = 0;
                outfiter_pan_y = 0;
                outfiter_apply_zoom();
            },
            /* ---- Download helpers: APNG assembler + compact GIF encoder ---- */
            outfiter_file_comment = 'Created using the TibiaWiki Outfitter, developed collaboratively by the TibiaWiki Team.',
            outfiter_dataurl_to_u8 = function (dataUrl) {
                var b64 = dataUrl.split(',')[1], bin = atob(b64), u8 = new Uint8Array(bin.length), i;
                for (i = 0; i < bin.length; i++) { u8[i] = bin.charCodeAt(i); }
                return u8;
            },
            outfiter_crc32_table = (function () {
                var table = new Uint32Array(256), n, c, k;
                for (n = 0; n < 256; n++) {
                    c = n;
                    for (k = 0; k < 8; k++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); }
                    table[n] = c >>> 0;
                }
                return table;
            }()),
            outfiter_crc32 = function (buf) {
                var crc = 0xFFFFFFFF, i, table = outfiter_crc32_table;
                for (i = 0; i < buf.length; i++) { crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8); }
                return (crc ^ 0xFFFFFFFF) >>> 0;
            },
            outfiter_png_chunk = function (typeStr, data) {
                var type = new Uint8Array([typeStr.charCodeAt(0), typeStr.charCodeAt(1), typeStr.charCodeAt(2), typeStr.charCodeAt(3)]),
                    len = data ? data.length : 0,
                    out = new Uint8Array(12 + len),
                    view = new DataView(out.buffer),
                    crcBuf, i;
                view.setUint32(0, len);
                out[4] = type[0]; out[5] = type[1]; out[6] = type[2]; out[7] = type[3];
                if (data && len) { out.set(data, 8); }
                crcBuf = new Uint8Array(4 + len);
                crcBuf.set(type, 0);
                if (data && len) { crcBuf.set(data, 4); }
                view.setUint32(8 + len, outfiter_crc32(crcBuf));
                return out;
            },
            outfiter_concat_u8 = function (parts) {
                var total = 0, i, offset = 0, out;
                for (i = 0; i < parts.length; i++) { total += parts[i].length; }
                out = new Uint8Array(total);
                for (i = 0; i < parts.length; i++) { out.set(parts[i], offset); offset += parts[i].length; }
                return out;
            },
            outfiter_parse_png_chunks = function (u8) {
                var chunks = [], offset = 8, view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), len, type, data;
                while (offset + 12 <= u8.length) {
                    len = view.getUint32(offset);
                    type = String.fromCharCode(u8[offset + 4], u8[offset + 5], u8[offset + 6], u8[offset + 7]);
                    data = u8.subarray(offset + 8, offset + 8 + len);
                    chunks.push({ type: type, data: data });
                    offset += 12 + len;
                    if (type === 'IEND') { break; }
                }
                return chunks;
            },
            outfiter_build_apng = function (frameDataUrls, delaysMs) {
                var sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
                    parts = [sig],
                    first = outfiter_parse_png_chunks(outfiter_dataurl_to_u8(frameDataUrls[0])),
                    ihdr, idats = [], i, j, chunks, idatParts, seq = 0,
                    actl, fctl, fdat, delay;
                for (i = 0; i < first.length; i++) {
                    if (first[i].type === 'IHDR') { ihdr = first[i].data; }
                    if (first[i].type === 'IDAT') { idats.push(first[i].data); }
                }
                if (!ihdr) { return null; }
                parts.push(outfiter_png_chunk('IHDR', ihdr));
                (function () {
                    var kw = 'Comment',
                        text = outfiter_file_comment,
                        data = new Uint8Array(kw.length + 1 + text.length),
                        ti;
                    for (ti = 0; ti < kw.length; ti++) { data[ti] = kw.charCodeAt(ti) & 0xFF; }
                    data[kw.length] = 0;
                    for (ti = 0; ti < text.length; ti++) { data[kw.length + 1 + ti] = text.charCodeAt(ti) & 0xFF; }
                    parts.push(outfiter_png_chunk('tEXt', data));
                }());
                actl = new Uint8Array(8);
                new DataView(actl.buffer).setUint32(0, frameDataUrls.length);
                new DataView(actl.buffer).setUint32(4, 0);
                parts.push(outfiter_png_chunk('acTL', actl));
                for (i = 0; i < frameDataUrls.length; i++) {
                    chunks = (i === 0) ? first : outfiter_parse_png_chunks(outfiter_dataurl_to_u8(frameDataUrls[i]));
                    idatParts = [];
                    for (j = 0; j < chunks.length; j++) {
                        if (chunks[j].type === 'IDAT') { idatParts.push(chunks[j].data); }
                    }
                    delay = delaysMs[i] || 100;
                    fctl = new Uint8Array(26);
                    (function (v) {
                        v.setUint32(0, seq++);
                        v.setUint32(4, new DataView(ihdr.buffer, ihdr.byteOffset, 4).getUint32(0));
                        v.setUint32(8, new DataView(ihdr.buffer, ihdr.byteOffset, 8).getUint32(4));
                        v.setUint32(12, 0);
                        v.setUint32(16, 0);
                        v.setUint16(20, Math.max(1, Math.round(delay / 10)));
                        v.setUint16(22, 100);
                        v.setUint8(24, 1);
                        v.setUint8(25, 0);
                    }(new DataView(fctl.buffer)));
                    parts.push(outfiter_png_chunk('fcTL', fctl));
                    if (i === 0) {
                        for (j = 0; j < idatParts.length; j++) { parts.push(outfiter_png_chunk('IDAT', idatParts[j])); }
                    } else {
                        for (j = 0; j < idatParts.length; j++) {
                            fdat = new Uint8Array(4 + idatParts[j].length);
                            new DataView(fdat.buffer).setUint32(0, seq++);
                            fdat.set(idatParts[j], 4);
                            parts.push(outfiter_png_chunk('fdAT', fdat));
                        }
                    }
                }
                parts.push(outfiter_png_chunk('IEND', new Uint8Array(0)));
                return outfiter_concat_u8(parts);
            },
            outfiter_build_gif = function (frameDataUrls, delaysMs) {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d'),
                    w = 0,
                    h = 0,
                    frames = [];

                function loadFrames() {
                    return new Promise(function (resolve) {
                        var n = 0;
                        function next() {
                            if (n >= frameDataUrls.length) {
                                resolve();
                                return;
                            }
                            var img = new Image();
                            img.onload = function () {
                                if (n === 0) {
                                    w = img.naturalWidth || img.width;
                                    h = img.naturalHeight || img.height;
                                    canvas.width = w;
                                    canvas.height = h;
                                }
                                ctx.clearRect(0, 0, w, h);
                                ctx.drawImage(img, 0, 0);
                                frames.push(new Uint8ClampedArray(ctx.getImageData(0, 0, w, h).data));
                                n += 1;
                                next();
                            };
                            img.onerror = function () {
                                n += 1;
                                next();
                            };
                            img.src = frameDataUrls[n];
                        }
                        next();
                    });
                }

                function buildPalette(rgbaFrames) {
                    var count = {},
                        keys = [],
                        palette = [],
                        map = {},
                        transparentIndex = -1,
                        i, j, r, g, b, a, key, parts, used;

                    for (i = 0; i < rgbaFrames.length; i++) {
                        for (j = 0; j < rgbaFrames[i].length; j += 4) {
                            a = rgbaFrames[i][j + 3];
                            if (a < 128) {
                                key = 't';
                            } else {
                                r = rgbaFrames[i][j];
                                g = rgbaFrames[i][j + 1];
                                b = rgbaFrames[i][j + 2];
                                key = r + ',' + g + ',' + b;
                            }
                            count[key] = (count[key] || 0) + 1;
                        }
                    }
                    for (key in count) {
                        if (count.hasOwnProperty(key)) {
                            keys.push(key);
                        }
                    }
                    keys.sort(function (a, b) { return count[b] - count[a]; });

                    if (count.t) {
                        transparentIndex = 0;
                        palette.push(0, 0, 0);
                        map.t = 0;
                    }
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        if (key === 't') { continue; }
                        if ((palette.length / 3) >= 256) { break; }
                        parts = key.split(',');
                        map[key] = palette.length / 3;
                        palette.push(+parts[0], +parts[1], +parts[2]);
                    }
                    if (!palette.length) {
                        palette.push(0, 0, 0);
                    }
                    used = palette.length / 3;
                    while (used < 2) {
                        palette.push(0, 0, 0);
                        used += 1;
                    }
                    while (used & (used - 1)) {
                        palette.push(0, 0, 0);
                        used += 1;
                    }
                    if (used > 256) {
                        palette = palette.slice(0, 768);
                        used = 256;
                    }
                    return {
                        palette: palette,
                        map: map,
                        transparentIndex: transparentIndex,
                        size: used
                    };
                }

                function indexFrame(rgba, pal) {
                    var indices = [],
                        map = pal.map,
                        ti = pal.transparentIndex,
                        i, r, g, b, a, key, p, pr, pg, pb, best, dist, d, n;

                    n = pal.size;
                    for (i = 0; i < rgba.length; i += 4) {
                        a = rgba[i + 3];
                        if (a < 128 && ti >= 0) {
                            indices.push(ti);
                            continue;
                        }
                        r = rgba[i];
                        g = rgba[i + 1];
                        b = rgba[i + 2];
                        key = r + ',' + g + ',' + b;
                        if (map.hasOwnProperty(key)) {
                            indices.push(map[key]);
                            continue;
                        }
                        best = (ti === 0) ? 1 : 0;
                        dist = 1e12;
                        for (p = 0; p < n; p++) {
                            if (p === ti) { continue; }
                            pr = pal.palette[p * 3];
                            pg = pal.palette[p * 3 + 1];
                            pb = pal.palette[p * 3 + 2];
                            d = (pr - r) * (pr - r) + (pg - g) * (pg - g) + (pb - b) * (pb - b);
                            if (d < dist) {
                                dist = d;
                                best = p;
                            }
                        }
                        indices.push(best);
                    }
                    return indices;
                }

                /* gif.js / LZWEncoder-style compressor (verified round-trip) */
                function lzwEncode(minCodeSize, pixels) {
                    var htab = [],
                        codetab = [],
                        hsize = 5003,
                        clearCode = 1 << minCodeSize,
                        EOFCode = clearCode + 1,
                        freeEnt,
                        nBits,
                        maxCode,
                        clearFlg = false,
                        initBits = minCodeSize + 1,
                        remaining = pixels.length,
                        curPixel = 0,
                        curAccum = 0,
                        curBits = 0,
                        out = [],
                        masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F, 0x003F, 0x007F,
                            0x00FF, 0x01FF, 0x03FF, 0x07FF, 0x0FFF],
                        i;

                    for (i = 0; i < hsize; i++) {
                        htab[i] = -1;
                        codetab[i] = 0;
                    }

                    function charOut(c) {
                        out.push(c & 0xff);
                    }

                    function output(code) {
                        curAccum &= masks[curBits];
                        if (curBits > 0) {
                            curAccum |= (code << curBits);
                        } else {
                            curAccum = code;
                        }
                        curBits += nBits;
                        while (curBits >= 8) {
                            charOut(curAccum & 0xff);
                            curAccum >>= 8;
                            curBits -= 8;
                        }
                        if (freeEnt > maxCode || clearFlg) {
                            if (clearFlg) {
                                nBits = initBits;
                                maxCode = (1 << nBits) - 1;
                                clearFlg = false;
                            } else {
                                nBits += 1;
                                if (nBits === 12) {
                                    maxCode = 4095;
                                } else {
                                    maxCode = (1 << nBits) - 1;
                                }
                            }
                        }
                    }

                    function clBlock() {
                        var j;
                        for (j = 0; j < hsize; j++) {
                            htab[j] = -1;
                        }
                        freeEnt = clearCode + 2;
                        clearFlg = true;
                        output(clearCode);
                    }

                    function nextPixel() {
                        if (remaining === 0) {
                            return -1;
                        }
                        remaining -= 1;
                        return pixels[curPixel++] & 0xff;
                    }

                    nBits = initBits;
                    maxCode = (1 << nBits) - 1;
                    freeEnt = clearCode + 2;
                    clearFlg = false;

                    output(clearCode);

                    var ent = nextPixel();
                    var hshift = 0;
                    for (var fcode = hsize; fcode < 65536; fcode *= 2) {
                        hshift += 1;
                    }
                    hshift = 8 - hshift;

                    outer:
                    while (true) {
                        var c = nextPixel();
                        if (c === -1) {
                            break;
                        }
                        fcode = (c << 12) + ent;
                        i = (c << hshift) ^ ent;
                        if (htab[i] === fcode) {
                            ent = codetab[i];
                            continue;
                        }
                        if (htab[i] >= 0) {
                            var disp = hsize - i;
                            if (i === 0) {
                                disp = 1;
                            }
                            do {
                                i -= disp;
                                if (i < 0) {
                                    i += hsize;
                                }
                                if (htab[i] === fcode) {
                                    ent = codetab[i];
                                    continue outer;
                                }
                            } while (htab[i] >= 0);
                        }
                        output(ent);
                        ent = c;
                        if (freeEnt < 4096) {
                            codetab[i] = freeEnt;
                            freeEnt += 1;
                            htab[i] = fcode;
                        } else {
                            clBlock();
                        }
                    }
                    output(ent);
                    output(EOFCode);
                    if (curBits > 0) {
                        charOut(curAccum & 0xff);
                    }
                    return out;
                }

                function encode() {
                    var out = [],
                        pal = buildPalette(frames),
                        colourCount = pal.size,
                        psize = 0,
                        i,
                        minCodeSize,
                        indices,
                        compressed,
                        delayCs,
                        packedGCE,
                        pos,
                        size,
                        gctSize;

                    function pushByte(b) { out.push(b & 0xFF); }
                    function pushBytes(arr) {
                        var k;
                        for (k = 0; k < arr.length; k++) { out.push(arr[k] & 0xFF); }
                    }
                    function pushStr(s) {
                        var k;
                        for (k = 0; k < s.length; k++) { out.push(s.charCodeAt(k) & 0xFF); }
                    }

                    while ((1 << (psize + 1)) < colourCount) { psize += 1; }
                    if (psize > 7) { psize = 7; }
                    gctSize = 1 << (psize + 1);

                    pushStr('GIF89a');
                    pushByte(w & 0xFF);
                    pushByte((w >> 8) & 0xFF);
                    pushByte(h & 0xFF);
                    pushByte((h >> 8) & 0xFF);
                    pushByte(0x80 | 0x70 | psize);
                    pushByte(pal.transparentIndex >= 0 ? pal.transparentIndex : 0);
                    pushByte(0);

                    for (i = 0; i < gctSize; i++) {
                        if (i < colourCount) {
                            pushByte(pal.palette[i * 3]);
                            pushByte(pal.palette[i * 3 + 1]);
                            pushByte(pal.palette[i * 3 + 2]);
                        } else {
                            pushByte(0);
                            pushByte(0);
                            pushByte(0);
                        }
                    }

                    pushBytes([0x21, 0xFF, 0x0B]);
                    pushStr('NETSCAPE2.0');
                    pushBytes([0x03, 0x01, 0x00, 0x00, 0x00]);

                    // GIF Comment Extension (0x21 0xFE)
                    (function () {
                        var text = outfiter_file_comment,
                            pos = 0,
                            size;
                        pushBytes([0x21, 0xFE]);
                        while (pos < text.length) {
                            size = Math.min(255, text.length - pos);
                            pushByte(size);
                            pushStr(text.substring(pos, pos + size));
                            pos += size;
                        }
                        pushByte(0x00);
                    }());

                    minCodeSize = Math.max(2, psize + 1);

                    for (i = 0; i < frames.length; i++) {
                        delayCs = Math.max(2, Math.round((delaysMs[i] || 100) / 10));
                        packedGCE = 0x08;
                        if (pal.transparentIndex >= 0) { packedGCE |= 0x01; }
                        pushBytes([
                            0x21, 0xF9, 0x04,
                            packedGCE,
                            delayCs & 0xFF, (delayCs >> 8) & 0xFF,
                            pal.transparentIndex >= 0 ? pal.transparentIndex : 0,
                            0x00
                        ]);
                        pushBytes([
                            0x2C,
                            0x00, 0x00, 0x00, 0x00,
                            w & 0xFF, (w >> 8) & 0xFF,
                            h & 0xFF, (h >> 8) & 0xFF,
                            0x00
                        ]);
                        indices = indexFrame(frames[i], pal);
                        compressed = lzwEncode(minCodeSize, indices);
                        pushByte(minCodeSize);
                        pos = 0;
                        while (pos < compressed.length) {
                            size = Math.min(255, compressed.length - pos);
                            pushByte(size);
                            pushBytes(compressed.slice(pos, pos + size));
                            pos += size;
                        }
                        pushByte(0);
                    }

                    pushByte(0x3B);
                    return new Uint8Array(out);
                }

                return loadFrames().then(function () {
                    if (!frames.length || !w || !h) { return null; }
                    return encode();
                });
            },
            outfiter_download_blob = function (u8, mime, filename) {
                var blob = new Blob([u8], { type: mime }),
                    url = URL.createObjectURL(blob),
                    a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 0);
            },
            outfiter_download_name_base = function (opts) {
                // Naming: Outfit_<Name>_<Male|Female>[_Addon_1|_Addon_2|_Addon_3]
                // Addon_3 = both addons. opts.forceAddon1/2 override current selection (All Addons batch).
                var
                    parts = [],
                    clean = function (s) {
                        return String(s || '').replace(/[^a-zA-Z0-9_\-]/g, '_');
                    },
                    includeAddons = !opts || opts.includeAddons !== false,
                    a1 = opts && opts.hasOwnProperty('forceAddon1') ? opts.forceAddon1 : outfiter_GET.addon1,
                    a2 = opts && opts.hasOwnProperty('forceAddon2') ? opts.forceAddon2 : outfiter_GET.addon2,
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    display_n,
                    gender,
                    addonNum;
                if (outfiter_GET.creature > 0) {
                    parts.push('Creature');
                    parts.push(clean(outfiter_creature_names[outfiter_GET.creature] || 'Unknown'));
                    if (includeAddons) {
                        if (a1 && a2) { parts.push('Addon_3'); }
                        else if (a1) { parts.push('Addon_1'); }
                        else if (a2) { parts.push('Addon_2'); }
                    }
                } else {
                    parts.push('Outfit');
                    // Prefer gendered display name when female + mapped (Noblewoman etc.), else list name
                    display_n = outfit_n;
                    if (display_n && display_n !== 'None') {
                        if (outfiter_GET.female && outfiter_f_names[outfit_n]) {
                            display_n = outfiter_f_names[outfit_n];
                        }
                        parts.push(clean(display_n));
                    } else {
                        parts.push('Unknown');
                    }
                    // Gender: Female if selected and outfit supports it, otherwise Male
                    if (outfiter_GET.female && outfiter_u_names[outfit_n] !== true) {
                        gender = 'Female';
                    } else {
                        gender = 'Male';
                    }
                    parts.push(gender);
                    // Addons: 1, 2, or 3 (both)
                    if (includeAddons) {
                        if (a1 && a2) { parts.push('Addon_3'); }
                        else if (a1) { parts.push('Addon_1'); }
                        else if (a2) { parts.push('Addon_2'); }
                    }
                    if (outfiter_GET.mount > 0) {
                        parts.push(clean(outfiter_mount_names[outfiter_GET.mount] || 'mount'));
                    }
                }
                return parts.join('_');
            },
            // Which addon combinations are valid for the current selection
            outfiter_addon_combo_list = function () {
                var
                    outfit_n = outfiter_names[outfiter_GET.outfit],
                    creature_n = outfiter_creature_names[outfiter_GET.creature],
                    cprops,
                    can1 = true,
                    can2 = true,
                    exclusive = false,
                    combos = [];
                if (outfiter_GET.creature > 0) {
                    cprops = outfiter_creature_get_props(creature_n);
                    can1 = !!cprops.addon1;
                    can2 = !!cprops.addon2;
                    exclusive = !!cprops.exclusive_addons;
                } else {
                    if (outfiter_a_names[outfit_n] === true) {
                        can1 = false;
                        can2 = false;
                    } else if (outfiter_o_names[outfit_n] === true) {
                        // One-addon outfits (e.g. Yalaharian): only addon 1
                        can2 = false;
                    }
                }
                // Always include base (no addons)
                combos.push({ a1: false, a2: false, tag: 'no_addons' });
                if (can1) { combos.push({ a1: true, a2: false, tag: 'addon_1' }); }
                if (can2) { combos.push({ a1: false, a2: true, tag: 'addon_2' }); }
                if (can1 && can2 && !exclusive) {
                    combos.push({ a1: true, a2: true, tag: 'addon_1_addon_2' });
                }
                return combos;
            },
            // keep a copy of the current preview while multi-direction downloads run
            outfiter_preview_snapshot = function () {
                return {
                    src: ogebi('.body_main_div .body_main', 1).attr('src'),
                    withFloor: ogebi('.body_main_div .body_main', 1).hasClass('body_main_with_floor'),
                    aframes: (outfiter_aframes && outfiter_aframes.length) ? outfiter_aframes.slice() : [],
                    base_w: outfiter_base_w,
                    base_h: outfiter_base_h,
                    acurrent: outfiter_acurrent,
                    zoom: outfiter_zoom,
                    pan_x: outfiter_pan_x,
                    pan_y: outfiter_pan_y
                };
            },
            outfiter_preview_restore = function (snap) {
                if (!snap) { return; }
                clearTimeout(outfiter_atime);
                outfiter_aframes = snap.aframes || [];
                outfiter_base_w = snap.base_w;
                outfiter_base_h = snap.base_h;
                outfiter_acurrent = snap.acurrent || 0;
                outfiter_zoom = snap.zoom || 1;
                outfiter_pan_x = snap.pan_x || 0;
                outfiter_pan_y = snap.pan_y || 0;
                if (snap.src) {
                    ogebi('.body_main_div .body_main', 1)
                        .attr('src', '')
                        .attr({ src: snap.src })
                        .toggleClass('body_main_with_floor', !!snap.withFloor);
                }
                outfiter_apply_zoom();
                if (outfiter_GET.animate && outfiter_aframes.length > 1) {
                    outfiter_animate_char();
                }
            },
            // 4 directions (S, E, N, W), ~1600ms each using natural frame delays; opts.restore / opts.onDone for batching
            outfiter_do_download_4x_rotate = function (nameBase, format, opts) {
                var
                    DIR_MS = 1600,
                    dirs = [2, 1, 0, 3], // South, East, North, West (0=N 1=E 2=S 3=W)
                    dirIdx = 0,
                    allFrames = [],
                    allDelays = [],
                    options = opts || {},
                    doRestore = options.restore !== false,
                    onDone = typeof options.onDone === 'function' ? options.onDone : null,
                    previewSnap = options.previewSnap || (doRestore ? outfiter_preview_snapshot() : null),
                    saved = {
                        facing: outfiter_GET.facing,
                        animate: outfiter_GET.animate,
                        sanim: outfiter_GET.sanim,
                        facingVal: ogebi('facing').val(),
                        animateChk: ogebi('animate').is(':checked'),
                        sanimChk: ogebi('sanim').is(':checked')
                    },
                    emitFile = function () {
                        var fileBase = nameBase;
                        if (!allFrames.length) {
                            if (onDone) { onDone(); }
                            return;
                        }
                        if (format === 'gif') {
                            outfiter_build_gif(allFrames, allDelays).then(function (u8) {
                                if (u8) { outfiter_download_blob(u8, 'image/gif', fileBase + '.gif'); }
                                if (onDone) { onDone(); }
                            });
                        } else {
                            (function () {
                                var u8 = outfiter_build_apng(allFrames, allDelays);
                                if (u8) { outfiter_download_blob(u8, 'image/png', fileBase + '.png'); }
                                if (onDone) { onDone(); }
                            }());
                        }
                    },
                    finish = function () {
                        outfiter_bake_silent = false;
                        if (doRestore) {
                            ogebi('facing').val(saved.facingVal);
                            ogebi('animate').prop({ checked: saved.animateChk });
                            ogebi('sanim').prop({ checked: saved.sanimChk });
                            outfiter_GET.facing = saved.facing;
                            outfiter_GET.animate = saved.animate;
                            outfiter_GET.sanim = saved.sanim;
                            outfiter_preview_restore(previewSnap);
                            outfiter_hide_body(false);
                        }
                        emitFile();
                    },
                    processDir = function () {
                        var facing, frames, delays, i, sum, d, fi, safety;
                        if (dirIdx >= dirs.length) {
                            finish();
                            return;
                        }
                        facing = dirs[dirIdx];
                        ogebi('facing').val(facing);
                        outfiter_GET.facing = facing;
                        outfiter_GET.animate = true;
                        outfiter_GET.sanim = false;

                        clearTimeout(outfiter_atime);
                        outfiter_do_display2();

                        frames = (outfiter_aframes && outfiter_aframes.length) ? outfiter_aframes.slice() : [];
                        delays = [];
                        for (i = 0; i < frames.length; i++) {
                            d = outfiter_outfit_speed(i);
                            if (!(d > 0)) { d = 100; }
                            delays.push(d);
                        }
                        if (!frames.length) {
                            dirIdx += 1;
                            setTimeout(processDir, 0);
                            return;
                        }
                        // Keep natural frame timing (creature special delays, etc).
                        // Repeat the cycle until the direction is about DIR_MS long —
                        // e.g. 2 frames @ 500ms → three frames = 1500ms (~1.6s).
                        sum = 0;
                        fi = 0;
                        safety = 0;
                        while (safety < frames.length * 24) {
                            d = delays[fi % frames.length];
                            if (sum > 0 && sum + d > DIR_MS &&
                                Math.abs(sum - DIR_MS) <= Math.abs(sum + d - DIR_MS)) {
                                break;
                            }
                            if (sum >= DIR_MS) { break; }
                            allFrames.push(frames[fi % frames.length]);
                            allDelays.push(Math.max(20, Math.round(d)));
                            sum += d;
                            fi += 1;
                            safety += 1;
                        }
                        if (fi === 0) {
                            allFrames.push(frames[0]);
                            allDelays.push(Math.max(20, Math.round(delays[0])));
                        }
                        dirIdx += 1;
                        setTimeout(processDir, 0);
                    };

                outfiter_GET.animate = true;
                outfiter_GET.sanim = false;
                outfiter_bake_silent = true;
                clearTimeout(outfiter_atime);
                processDir();
            },
            // one rotating download per addon combo (none / 1 / 2 / both)
            outfiter_do_download_4x_all_addons = function (format) {
                var
                    combos = outfiter_addon_combo_list(),
                    comboIdx = 0,
                    previewSnap = outfiter_preview_snapshot(),
                    saved = {
                        addon1: outfiter_GET.addon1,
                        addon2: outfiter_GET.addon2,
                        addon1Chk: ogebi('addon1').is(':checked'),
                        addon2Chk: ogebi('addon2').is(':checked'),
                        facing: outfiter_GET.facing,
                        animate: outfiter_GET.animate,
                        sanim: outfiter_GET.sanim,
                        facingVal: ogebi('facing').val(),
                        animateChk: ogebi('animate').is(':checked'),
                        sanimChk: ogebi('sanim').is(':checked')
                    },
                    restoreAll = function () {
                        outfiter_bake_silent = false;
                        ogebi('addon1').prop({ checked: saved.addon1Chk });
                        ogebi('addon2').prop({ checked: saved.addon2Chk });
                        ogebi('facing').val(saved.facingVal);
                        ogebi('animate').prop({ checked: saved.animateChk });
                        ogebi('sanim').prop({ checked: saved.sanimChk });
                        outfiter_GET.addon1 = saved.addon1;
                        outfiter_GET.addon2 = saved.addon2;
                        outfiter_GET.facing = saved.facing;
                        outfiter_GET.animate = saved.animate;
                        outfiter_GET.sanim = saved.sanim;
                        outfiter_preview_restore(previewSnap);
                        outfiter_hide_body(false);
                    },
                    nextCombo = function () {
                        var combo, nameBase;
                        if (comboIdx >= combos.length) {
                            restoreAll();
                            return;
                        }
                        combo = combos[comboIdx];
                        comboIdx += 1;
                        outfiter_GET.addon1 = combo.a1;
                        outfiter_GET.addon2 = combo.a2;
                        nameBase = outfiter_download_name_base({
                            forceAddon1: combo.a1,
                            forceAddon2: combo.a2
                        });
                        outfiter_do_download_4x_rotate(nameBase, format, {
                            restore: false,
                            previewSnap: previewSnap,
                            onDone: function () { setTimeout(nextCombo, 50); }
                        });
                    };

                clearTimeout(outfiter_atime);
                outfiter_bake_silent = true;
                nextCombo();
            },
            outfiter_do_download = function () {
                var advanced = ogebi('show_advanced').is(':checked'),
                    format = advanced
                        ? (ogebi('[name="radio_save_format"]:checked', 1).val() || 'gif')
                        : 'gif',
                    frames, delays = [], i, nameBase, single,
                    // 4x / All Addons only apply when advanced options are shown
                    rotate4x = advanced && ogebi('rotate4x').is(':checked'),
                    allAddons = advanced && ogebi('all_addons').is(':checked');
                if (!outfiter_aframes || !outfiter_aframes.length) { return; }

                // All Addons: one rotating file per addon combo
                if (allAddons) {
                    if (format !== 'gif' && format !== 'apng') { format = 'gif'; }
                    outfiter_do_download_4x_all_addons(format);
                    return;
                }

                nameBase = outfiter_download_name_base();

                // 4x Rotate: all four facings in sequence
                if (rotate4x) {
                    if (format !== 'gif' && format !== 'apng') { format = 'gif'; }
                    outfiter_do_download_4x_rotate(nameBase, format);
                    return;
                }

                frames = outfiter_aframes.slice();
                for (i = 0; i < frames.length; i++) { delays.push(outfiter_outfit_speed(i)); }

                if (!outfiter_GET.animate || frames.length < 2) {
                    single = outfiter_dataurl_to_u8(frames[0]);
                    outfiter_download_blob(single, 'image/png', nameBase + '.png');
                    return;
                }

                if (format === 'gif') {
                    outfiter_build_gif(frames, delays).then(function (u8) {
                        if (u8) { outfiter_download_blob(u8, 'image/gif', nameBase + '.gif'); }
                    });
                } else {
                    (function () {
                        var u8 = outfiter_build_apng(frames, delays);
                        if (u8) { outfiter_download_blob(u8, 'image/png', nameBase + '.png'); }
                    }());
                }
            },
            outfiter_do_colourise_copy = function () {
                var
                    i, from_suffix = ogebi('[name="radio_colourise"]:checked', 1).val() === 'mount' ? 'm' : '',
                    to_suffix = from_suffix === 'm' ? '' : 'm',
                    value = to_suffix === 'm' ? 'mount' : 'outfit';
                for (i = 1; i <= 4; i++) { ogebi(to_suffix + 'c' + i).val(ogebi(from_suffix + 'c' + i).val()); }
                ogebi('[name="radio_colourise"][value="' + value + '"]', 1).prop({ checked: true }).trigger('change', { is_copy: true });
            },
            // Pick a random outfit from the sorted list (skips "None"). Also randomises
            // gender and addons when the chosen outfit supports them.
            outfiter_do_random_outfit = function () {
                if ($this_main.hasClass('outfiter_loading')) { return; }
                var
                    candidates = [],
                    i, id, outfit_n, addon_roll;
                for (i = 0; i < outfiter_names_sorted.length; i++) {
                    id = outfiter_names_sorted[i];
                    if (id !== outfiter_outfit_none_id && outfiter_names[id] !== undefined) {
                        candidates.push(id);
                    }
                }
                if (!candidates.length) { return; }
                id = candidates[Math.floor(Math.random() * candidates.length)];
                outfit_n = outfiter_names[id];
                // Gender (skip unisex / no-female outfits)
                if (outfiter_u_names[outfit_n] !== true) {
                    ogebi('female').prop({ checked: Math.random() < 0.5 });
                }
                // Addons
                if (outfiter_a_names[outfit_n] === true) {
                    ogebi('addon1').prop({ checked: false });
                    ogebi('addon2').prop({ checked: false });
                } else if (outfiter_o_names[outfit_n] === true) {
                    // single-addon outfits: none / addon1 / addon2
                    addon_roll = Math.floor(Math.random() * 3);
                    ogebi('addon1').prop({ checked: addon_roll === 1 });
                    ogebi('addon2').prop({ checked: addon_roll === 2 });
                } else {
                    ogebi('addon1').prop({ checked: Math.random() < 0.5 });
                    ogebi('addon2').prop({ checked: Math.random() < 0.5 });
                }
                outfiter_do_outfit(id, true);
            },
            // Randomise the four colour slots for the currently selected colourise target
            // (Outfit → c1–c4, Mount → mc1–mc4). Updates the colour-table highlight and redraws.
            outfiter_do_random_colours = function () {
                if ($this_main.hasClass('outfiter_loading')) { return; }
                var
                    col_type = ogebi('[name="radio_colourise"]:checked', 1).val(),
                    prefix = col_type === 'mount' ? 'm' : '',
                    n = outfiter_color_t.length,
                    i;
                for (i = 1; i <= 4; i++) {
                    ogebi(prefix + 'c' + i).val(Math.floor(Math.random() * n));
                }
                // Refresh selection highlight for the active colour tab
                ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).filter('.sel').trigger('click');
                outfiter_do_addon();
            },
            outfiter_do_show_outfit = function () {
                var
                    checked = $(this).prop('checked'),
                    show_outfit_prev = checked ? parseInt(ogebi('show_outfit_prev').val(), 10) : outfiter_outfit_none_id;
                outfiter_do_outfit(show_outfit_prev, true);
            },
            outfiter_do_show_creature = function () {
                var
                    checked = $(this).prop('checked'),
                    show_creature_prev = checked ? parseInt(ogebi('show_creature_prev').val(), 10) : 0;
                outfiter_do_creature(show_creature_prev, true);
            },
            outfiter_do_show_mount = function () {
                var
                    checked = $(this).prop('checked'),
                    show_mount_prev = checked ? parseInt(ogebi('show_mount_prev').val(), 10) : 0;
                outfiter_do_mount(show_mount_prev, true);
            },
            outfiter_init = function () {
                $.each(outfiter_mount_names, function (i, v) { if ($.inArray(i, outfiter_mount_names_extra) === -1) { outfiter_mount_names_sorted.push([i, v]); } });
                outfiter_mount_names_sorted.sort(function (a, b) { if (a[1] < b[1] || a[0] === 0) { return -1; } if (a[1] > b[1] || b[0] === 0) { return 1; } return 0; });
                $.each(outfiter_mount_names_sorted, function (i, v) { outfiter_mount_names_sorted[i] = v[0]; });
                outfiter_mount_names_sorted = outfiter_mount_names_sorted.concat(outfiter_mount_names_extra);

                $.each(outfiter_creature_names, function (i, v) { if ($.inArray(i, outfiter_creature_names_extra) === -1) { outfiter_creature_names_sorted.push([i, v]); } });
                outfiter_creature_names_sorted.sort(function (a, b) { if (a[1] < b[1] || a[0] === 0) { return -1; } if (a[1] > b[1] || b[0] === 0) { return 1; } return 0; });
                $.each(outfiter_creature_names_sorted, function (i, v) { outfiter_creature_names_sorted[i] = v[0]; });
                outfiter_creature_names_sorted = outfiter_creature_names_sorted.concat(outfiter_creature_names_extra);

                $.each(outfiter_names, function (i, v) {
                    if (v !== undefined && $.inArray(i, outfiter_names_extra) === -1) { outfiter_names_sorted.push([i, v]); }
                });
                outfiter_names_sorted.sort(function (a, b) { if (a[1] < b[1]) { return -1; } if (a[1] > b[1]) { return 1; } return 0; });
                $.each(outfiter_names_sorted, function (i, v) { outfiter_names_sorted[i] = v[0]; });
                outfiter_names_sorted = outfiter_names_sorted.concat(outfiter_names_extra);

                outfiter_get_get();
                var opt;
                for (opt in outfiter_def) {
                    if (outfiter_def.hasOwnProperty(opt)) {
                        if (!outfiter_GET.hasOwnProperty(opt)) { outfiter_GET[opt] = outfiter_def[opt]; }
                        if (outfiter_GET[opt] === true) { ogebi(opt).prop({ checked: true }); }
                        else { ogebi(opt).val(outfiter_GET[opt]); }
                    }
                }

                var d2h = function (d) { d = d.toString(16); return d.length === 1 ? '0' + d : d; };
                ogebi('dcolor_table div').removeClass('color_table_d_sel')
                    .each(function (i) {
                        $(this).css('background-color', '#' + d2h(outfiter_color_t[i][0]) + d2h(outfiter_color_t[i][1]) + d2h(outfiter_color_t[i][2]));
                    });
                ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).on('click', function () {
                    ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).removeClass('sel');
                    $(this).addClass('sel');
                    var
                        num = ($(this).attr('class').match(/\bcb_(\d+)\b/) || [])[1],
                        i = parseInt(num, 10),
                        col_type = ogebi('[name="radio_colourise"]:checked', 1).val(),
                        val_name = (col_type === 'mount' ? 'm' : '') + 'c' + i;
                    ogebi('.dcolor_table div', 1).removeClass('color_table_d_sel')
                        .filter(':eq(' + ogebi(val_name).val() + ')').addClass('color_table_d_sel');
                });
                ogebi('cb_1').trigger('click');

                var comp = true, big_canvas = ogebi('canvas_main')[0], context;
                if (!big_canvas || !big_canvas.getContext) { comp = false; }
                else {
                    context = big_canvas.getContext('2d');
                    if (!context || !context.getImageData || !context.putImageData || !context.drawImage) { comp = false; }
                }
                if (!comp) {
                    outfiter_hide_body(true);
                    alert('Browser not compatible, try latest version of ' + browsers_base);
                    return false;
                }

                ogebi('.dcolor_table div', 1).on('click', function () {
                    if ($this_main.hasClass('outfiter_loading')) { return; }
                    var
                        num = (ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).filter('.sel').attr('class').match(/\bcb_(\d+)\b/) || [])[1],
                        i = parseInt(num, 10),
                        col_type = ogebi('[name="radio_colourise"]:checked', 1).val(),
                        val_name = (col_type === 'mount' ? 'm' : '') + 'c' + i;
                    ogebi('.dcolor_table div', 1).removeClass('color_table_d_sel');
                    $(this).addClass('color_table_d_sel');
                    ogebi(val_name).val($(this).index());
                    outfiter_do_addon();
                });
                ogebi('[name="radio_colourise"]', 1).on('change', function (e, data) {
                    ogebi('colourise_copy').text('Copy to ' + (
                        ogebi('[name="radio_colourise"]:checked', 1).val() === 'mount' ?
                            'Outfit' : 'Mount'
                    ));
                    ogebi('.cb_1, .cb_2, .cb_3, .cb_4', 1).filter('.sel').trigger('click');
                    if (data && data.is_copy) { outfiter_do_addon(); }
                });

                outfiter_apng_supported = '';
                try {
                    (function () {
                        var canvas = document.createElement('canvas');
                        if (!(canvas.getContext && canvas.getContext('2d'))) { outfiter_apng_supported = false; }
                        var image = new Image();
                        var ctx = canvas.getContext('2d');
                        image.onload = function () {
                            if (!canvas.getContext) { outfiter_apng_supported = false; }
                            else {
                                ctx.drawImage(image, 0, 0);
                                outfiter_apng_supported = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
                            }
                        };
                        image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==';
                    }());
                } catch (ignore) { }

                ogebi('.main_image, .mount_image, .creature_image', 1).each(function (i) {
                    $(this).on('load', function () {
                        outfiter_images_loaded[i] = true;
                        (i === 0 ? $canvas_main : (i === 1 ? $canvas_mount : $canvas_creature)).attr({ height: $(this).height(), width: $(this).width() });
                        if (outfiter_images_loaded[0] && outfiter_images_loaded[1] && outfiter_images_loaded[2]) { outfiter_do_display(); }
                        return true;
                    });
                });

                var x, t = $(), toggle = true, sep_line = false;
                for (x = 0; x < outfiter_names_sorted.length; x++) {
                    if (outfiter_separator[outfiter_names[outfiter_names_sorted[x]]]) { sep_line = true; }
                    toggle = !toggle;
                    if (sep_line) { t = t.add($('<div />', { class: 'sep_line' })); }
                    t = t.add(
                        $('<label />', { class: 'list_el' }).append(
                            $('<input type="radio" />').attr({ name: 'radio_outfits', class: 'darkrad radio_outfits_' + outfiter_names_sorted[x] }),
                            $('<span>').attr({ class: 'darkrad_in' }),
                            $('<div />', { class: 't' }).text(outfiter_names[outfiter_names_sorted[x]].replace(/_/g, ' '))
                        ).css({ color: (toggle ? '#8F8F8F' : '#bfbfbf') })
                    );
                    sep_line = false;
                }
                ogebi('radio_outfits').append(t).find('[name=radio_outfits]').on('click', function () {
                    var
                        cls = $(this).attr('class').split(/\s+/), id;
                    $.each(cls, function (i) { if (cls[i].substr(0, 13) === 'radio_outfits') { id = parseInt(cls[i].split(/_/g)[2], 10); } });
                    if (id !== parseInt(ogebi('outfit').val(), 10)) { outfiter_do_outfit(id, true); }
                });

                t = $(); toggle = true; sep_line = false;
                for (x = 0; x < outfiter_mount_names_sorted.length; x++) {
                    if (outfiter_mount_separator[outfiter_mount_names[outfiter_mount_names_sorted[x]]]) { sep_line = true; }
                    toggle = !toggle;
                    if (sep_line) { t = t.add($('<div />', { class: 'sep_line' })); }
                    t = t.add(
                        $('<label />', { class: 'list_el' }).append(
                            $('<input type="radio" />').attr({ name: 'radio_mounts', class: 'darkrad radio_mounts_' + outfiter_mount_names_sorted[x] })
                                .prop({ checked: String(outfiter_mount_names_sorted[x]) === ogebi('mount').val() }),
                            $('<span>').attr({ class: 'darkrad_in' }),
                            $('<div />', { class: 't' }).text(outfiter_mount_names[outfiter_mount_names_sorted[x]].replace(/_/g, ' '))
                        ).css({ color: (toggle ? '#8F8F8F' : '#bfbfbf') })
                    );
                    sep_line = false;
                }
                ogebi('radio_mounts').append(t).find('[name=radio_mounts]').on('click', function () {
                    var
                        num = ($(this).attr('class').match(/\bradio_mounts_(\d+)\b/) || [])[1],
                        id = parseInt(num, 10);
                    if (id !== parseInt(ogebi('mount').val(), 10)) { outfiter_do_mount(id, true); }
                });

                t = $(); toggle = true; sep_line = false;
                for (x = 0; x < outfiter_creature_names_sorted.length; x++) {
                    if (outfiter_creature_separator[outfiter_creature_names[outfiter_creature_names_sorted[x]]]) { sep_line = true; }
                    toggle = !toggle;
                    if (sep_line) { t = t.add($('<div />', { class: 'sep_line' })); }
                    t = t.add(
                        $('<label />', { class: 'list_el' }).append(
                            $('<input type="radio" />').attr({ name: 'radio_creatures', class: 'darkrad radio_creatures_' + outfiter_creature_names_sorted[x] })
                                .prop({ checked: String(outfiter_creature_names_sorted[x]) === ogebi('creature').val() }),
                            $('<span>').attr({ class: 'darkrad_in' }),
                            $('<div />', { class: 't' }).text(outfiter_creature_names[outfiter_creature_names_sorted[x]].replace(/_/g, ' '))
                        ).css({ color: (toggle ? '#8F8F8F' : '#bfbfbf') })
                    );
                    sep_line = false;
                }
                ogebi('radio_creatures').append(t).find('[name=radio_creatures]').on('click', function () {
                    var
                        num = ($(this).attr('class').match(/\bradio_creatures_(\d+)\b/) || [])[1],
                        id = parseInt(num, 10);
                    if (id !== parseInt(ogebi('creature').val(), 10)) { outfiter_do_creature(id, true); }
                });

                ogebi('animate').on('change', outfiter_do_addon);
                ogebi('sanim').on('change', outfiter_do_addon);
                ogebi('show_outfit').on('change', outfiter_do_show_outfit);
                ogebi('floor').on('change', outfiter_do_addon);
                ogebi('soft').on('change', outfiter_do_addon);
                ogebi('hpbar').on('change', outfiter_do_addon);
                ogebi('anistep').on('change', outfiter_do_addon);
                ogebi('template_code').on('change', outfiter_do_addon);
                ogebi('addon1').on('change', function () { outfiter_do_addon(1); });
                ogebi('addon2').on('change', function () { outfiter_do_addon(2); });
                ogebi('show_mount').on('change', outfiter_do_show_mount);
                ogebi('show_creature').on('change', outfiter_do_show_creature);
                ogebi('female').on('change', function () { outfiter_load_outfit('female'); });

                ogebi('facingm').on('click', function () { outfiter_do_facing(-1); });
                ogebi('facingp').on('click', function () { outfiter_do_facing(1); });
                ogebi('zoomin').on('click', function () { outfiter_do_zoom(1); });
                ogebi('zoomout').on('click', function () { outfiter_do_zoom(-1); });
                ogebi('zoomreset').on('click', function () { outfiter_do_zoom_reset(); });
                ogebi('download_image').on('click', function () { outfiter_do_download(); });

                // toggle advanced save options and download button label
                (function () {
                    var syncAdvanced = function () {
                        var on = ogebi('show_advanced').is(':checked'),
                            $btn = ogebi('download_image');
                        ogebi('save_advanced_opts').toggleClass('is-visible', on);
                        if (on) {
                            $btn.text('Download').attr('title', 'Download using the selected Save as options.');
                        } else {
                            // hide extras that live under advanced options
                            if (ogebi('anistep').is(':checked')) {
                                ogebi('anistep').prop({ checked: false });
                            }
                            if (ogebi('template_code').is(':checked')) {
                                ogebi('template_code').prop({ checked: false });
                            }
                            ogebi('anistep_step_cont').empty();
                            ogebi('anistep_panel').removeClass('is-visible');
                            ogebi('template_code_code_cont').empty();
                            $btn.text('Download GIF').attr(
                                'title',
                                'Download the currently displayed options in the outfitter.'
                            );
                        }
                    };
                    ogebi('show_advanced').on('change', syncAdvanced);
                    syncAdvanced();
                }());

                // help tips for the ? icons (shown next to the icon; works on hover/click)
                (function () {
                    var $tip = $('<div class="outfiter_help_tip" role="tooltip" />').appendTo('body'),
                        hideTimer = null,
                        activeEl = null,
                        showTip = function (el) {
                            var text, rect, tipW, tipH, left, top, pad = 8;
                            if (!el) { return; }
                            text = el.getAttribute('data-help') || '';
                            if (!text) { return; }
                            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                            activeEl = el;
                            $tip.text(text);
                            $tip.addClass('is-visible');
                            tipW = $tip.outerWidth() || 220;
                            tipH = $tip.outerHeight() || 40;
                            rect = el.getBoundingClientRect();
                            // place below icon, or above if near the bottom of the window
                            left = rect.left + (rect.width / 2) - (tipW / 2);
                            top = rect.bottom + pad;
                            if (top + tipH > window.innerHeight - 4) {
                                top = rect.top - tipH - pad;
                            }
                            if (left < 4) { left = 4; }
                            if (left + tipW > window.innerWidth - 4) {
                                left = window.innerWidth - tipW - 4;
                            }
                            if (top < 4) { top = 4; }
                            $tip.css({ left: Math.round(left) + 'px', top: Math.round(top) + 'px' });
                            $(el).addClass('is-open');
                        },
                        hideTip = function (immediate) {
                            var doHide = function () {
                                $tip.removeClass('is-visible');
                                ogebi('.help_q', 1).removeClass('is-open');
                                activeEl = null;
                                hideTimer = null;
                            };
                            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
                            if (immediate) { doHide(); }
                            else { hideTimer = setTimeout(doHide, 120); }
                        };
                    ogebi('.help_q', 1)
                        .on('mouseenter focus', function () { showTip(this); })
                        .on('mouseleave blur', function () { hideTip(false); })
                        .on('click', function (e) {
                            var el = this, isOpen = $(el).hasClass('is-open') && activeEl === el;
                            e.preventDefault();
                            e.stopPropagation();
                            if (isOpen) { hideTip(true); }
                            else { showTip(el); }
                        })
                        .on('keydown', function (e) {
                            if (e.which === 13 || e.which === 32) {
                                e.preventDefault();
                                $(this).trigger('click');
                            }
                        });
                    $(document).on('click.outfiterHelp', function () { hideTip(true); });
                    $(window).on('scroll.outfiterHelp resize.outfiterHelp', function () {
                        if (activeEl) { showTip(activeEl); }
                    });
                }());

                /* Scroll-wheel zoom over the preview */
                ogebi('.body_main_div', 1).on('wheel', function (e) {
                    var oe = e.originalEvent, delta;
                    if (!oe) { return; }
                    delta = oe.deltaY !== undefined ? oe.deltaY : (oe.wheelDelta ? -oe.wheelDelta : 0);
                    if (delta === 0) { return; }
                    e.preventDefault();
                    outfiter_do_zoom(delta > 0 ? -1 : 1);
                });

                /* Drag-to-pan when zoomed in */
                ogebi('.body_main_div .body_main', 1).on('mousedown', function (e) {
                    if (outfiter_zoom <= 1 || e.which !== 1) { return; }
                    outfiter_dragging = true;
                    outfiter_drag_start_x = e.clientX;
                    outfiter_drag_start_y = e.clientY;
                    outfiter_pan_start_x = outfiter_pan_x;
                    outfiter_pan_start_y = outfiter_pan_y;
                    $(this).css({ cursor: 'grabbing' }).addClass('is-dragging');
                    e.preventDefault();
                });
                $(document).on('mousemove.outfiter_pan', function (e) {
                    if (!outfiter_dragging) { return; }
                    outfiter_pan_x = outfiter_pan_start_x + (e.clientX - outfiter_drag_start_x);
                    outfiter_pan_y = outfiter_pan_start_y + (e.clientY - outfiter_drag_start_y);
                    outfiter_clamp_pan();
                    ogebi('.body_main_div .body_main', 1).css({
                        transform: 'translate(calc(-50% + ' + outfiter_pan_x + 'px), ' + outfiter_pan_y + 'px)'
                    });
                });
                $(document).on('mouseup.outfiter_pan', function () {
                    if (!outfiter_dragging) { return; }
                    outfiter_dragging = false;
                    ogebi('.body_main_div .body_main', 1)
                        .css({ cursor: outfiter_zoom > 1 ? 'grab' : 'default' })
                        .removeClass('is-dragging');
                });
                /* Touch support for pan */
                ogebi('.body_main_div .body_main', 1).on('touchstart', function (e) {
                    var t;
                    if (outfiter_zoom <= 1) { return; }
                    t = e.originalEvent.touches[0];
                    if (!t) { return; }
                    outfiter_dragging = true;
                    outfiter_drag_start_x = t.clientX;
                    outfiter_drag_start_y = t.clientY;
                    outfiter_pan_start_x = outfiter_pan_x;
                    outfiter_pan_start_y = outfiter_pan_y;
                    $(this).addClass('is-dragging');
                    e.preventDefault();
                });
                $(document).on('touchmove.outfiter_pan', function (e) {
                    var t;
                    if (!outfiter_dragging) { return; }
                    t = e.originalEvent.touches[0];
                    if (!t) { return; }
                    outfiter_pan_x = outfiter_pan_start_x + (t.clientX - outfiter_drag_start_x);
                    outfiter_pan_y = outfiter_pan_start_y + (t.clientY - outfiter_drag_start_y);
                    outfiter_clamp_pan();
                    ogebi('.body_main_div .body_main', 1).css({
                        transform: 'translate(calc(-50% + ' + outfiter_pan_x + 'px), ' + outfiter_pan_y + 'px)'
                    });
                    e.preventDefault();
                });
                $(document).on('touchend.outfiter_pan touchcancel.outfiter_pan', function () {
                    if (!outfiter_dragging) { return; }
                    outfiter_dragging = false;
                    ogebi('.body_main_div .body_main', 1).removeClass('is-dragging');
                });
                ogebi('outfitm').on('click', function () { outfiter_do_outfit(-1); });
                ogebi('outfitp').on('click', function () { outfiter_do_outfit(1); });
                ogebi('mountm').on('click', function () { outfiter_do_mount(-1); });
                ogebi('mountp').on('click', function () { outfiter_do_mount(1); });
                ogebi('creaturem').on('click', function () { outfiter_do_creature(-1); });
                ogebi('creaturep').on('click', function () { outfiter_do_creature(1); });
                ogebi('colourise_copy').on('click', outfiter_do_colourise_copy);
                ogebi('colourise_random').on('click', outfiter_do_random_colours);
                ogebi('random_outfit').on('click', outfiter_do_random_outfit);
                ogebi('use_name').on('click', outfiter_do_addon);
                ogebi('clear_name').on('click', function () { ogebi('charn').val(''); outfiter_do_addon(); });
                ogebi('url_input').on('click', function () { $(this).select(); });

                // copy text to clipboard (no confirmation popup)
                var outfiter_copy_text = function (text) {
                    var ta;
                    text = text == null ? '' : String(text);
                    if (!text) { return; }
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).catch(function () {
                        });
                        return;
                    }
                    ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', 'readonly');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); } catch (ignore) { }
                    document.body.removeChild(ta);
                };
                $this_main.on('click', '.copy_url', function (e) {
                    e.preventDefault();
                    outfiter_copy_text(ogebi('url_input').val());
                });
                $this_main.on('click', '.copy_template', function (e) {
                    e.preventDefault();
                    outfiter_copy_text(ogebi('template_code_code').val());
                });

                ogebi('omsearch').keyup(function () {
                    var query = $(this).val().toLowerCase();
                    $(this).siblings('label').each(function (i, v) {
                        if (!$(v).children('div').first().html().toLowerCase().includes(query)) {
                            $(v).hide();
                        } else {
                            $(v).show();
                        }
                    });
                });

                var bgs = {
                    floor: 'data:image/png;base64,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',
                    arrows: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAABQCAYAAABrjzfBAAAABGdBTUEAALGPC/xhBQAACktpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAAEiJnVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4BUaaISkgChhBgSQOyIqMCIoiKCFRkUccDREZCxIoqFQbH3AXkIKOPgKDZU3g/eGn2z5r03b/avvfY5Z53vnH0+AEZgsESahaoBZEoV8ogAHzw2Lh4ndwMKVCCBA4BAmC0LifSPAgDg+/Hw7IgAH/gCBODNbUAAAG7YBIbhOPx/UBfK5AoAJAwApovE2UIApBAAMnIVMgUAMgoA7KR0mQIAJQAAWx4bFw+AagEAO2WSTwMAdtIk9wIAtihTKgJAowBAJsoUiQDQDgBYl6MUiwCwYAAoypGIcwGwmwBgkqHMlABg7wCAnSkWZAMQGABgohALUwEI9gDAkEdF8AAIMwEojJSveNJXXCHOUwAA8LJki+WSlFQFbiG0xB1cXbl4oDg3Q6xQ2IQJhOkCuQjnZWXKBNLFAJMzAwCARnZEgA/O9+M5O7g6O9s42jp8taj/GvyLiI2L/5c/r8IBAQCE0/VF+7O8rBoA7hgAtvGLlrQdoGUNgNb9L5rJHgDVQoDmq1/Nw+H78fBUhULmZmeXm5trKxELbYWpX/X5nwl/AV/1s+X78fDf14P7ipMFygwFHhHggwuzMrKUcjxbJhCKcZs/HvHfLvzzd0yLECeL5WKpUIxHS8S5EmkKzsuSiiQKSZYUl0j/k4l/s+wPmLxrAGDVfgb2QltQu8oG7JcuILDogCXsAgDkd9+CqdEQBgAxBoOTdw8AMPmb/x1oGQCg2ZIUHACAFxGFC5XynMkYAQCACDRQBTZogz4YgwXYgCO4gDt4gR/MhlCIgjhYAEJIhUyQQy4shVVQBCWwEbZCFeyGWqiHRjgCLXACzsIFuALX4BY8gF4YgOcwCm9gHEEQMsJEWIg2YoCYItaII8JFZiF+SDASgcQhiUgKIkWUyFJkNVKClCNVyF6kHvkeOY6cRS4hPcg9pA8ZRn5DPqAYykDZqB5qhtqhXNQbDUKj0PloCroIzUcL0Q1oJVqDHkKb0bPoFfQW2os+R8cwwOgYBzPEbDAuxsNCsXgsGZNjy7FirAKrwRqxNqwTu4H1YiPYewKJwCLgBBuCOyGQMJcgJCwiLCeUEqoIBwjNhA7CDUIfYZTwmcgk6hKtiW5EPjGWmELMJRYRK4h1xGPE88RbxAHiGxKJxCGZk1xIgaQ4UhppCamUtJPURDpD6iH1k8bIZLI22ZrsQQ4lC8gKchF5O/kQ+TT5OnmA/I5CpxhQHCn+lHiKlFJAqaAcpJyiXKcMUsapalRTqhs1lCqiLqaWUWupbdSr1AHqOE2dZk7zoEXR0miraJW0Rtp52kPaKzqdbkR3pYfTJfSV9Er6YfpFeh/9PUODYcXgMRIYSsYGxn7GGcY9xismk2nG9GLGMxXMDcx65jnmY+Y7FZaKrQpfRaSyQqVapVnlusoLVaqqqaq36gLVfNUK1aOqV1VH1KhqZmo8NYHacrVqteNqd9TG1FnqDuqh6pnqpeoH1S+pD2mQNcw0/DREGoUa+zTOafSzMJYxi8cSslazalnnWQNsEtuczWensUvY37G72aOaGpozNKM18zSrNU9q9nIwjhmHz8nglHGOcG5zPkzRm+I9RTxl/ZTGKdenvNWaquWlJdYq1mrSuqX1QRvX9tNO196k3aL9SIegY6UTrpOrs0vnvM7IVPZU96nCqcVTj0y9r4vqWulG6C7R3afbpTump68XoCfT2653Tm9En6PvpZ+mv0X/lP6wActgloHEYIvBaYNnuCbujWfglXgHPmqoaxhoqDTca9htOG5kbjTXqMCoyeiRMc2Ya5xsvMW43XjUxMAkxGSpSYPJfVOqKdc01XSbaafpWzNzsxiztWYtZkPmWuZ883zzBvOHFkwLT4tFFjUWNy1JllzLdMudltesUCsnq1Sraqur1qi1s7XEeqd1zzTiNNdp0mk10+7YMGy8bXJsGmz6bDm2wbYFti22L+xM7OLtNtl12n22d7LPsK+1f+Cg4TDbocChzeE3RytHoWO1483pzOn+01dMb53+cob1DPGMXTPuOrGcQpzWOrU7fXJ2cZY7NzoPu5i4JLrscLnDZXPDuKXci65EVx/XFa4nXN+7Obsp3I64/epu457uftB9aKb5TPHM2pn9HkYeAo+9Hr2z8FmJs/bM6vU09BR41ng+8TL2EnnVeQ16W3qneR/yfuFj7yP3OebzlufGW8Y744v5BvgW+3b7afjN9avye+xv5J/i3+A/GuAUsCTgTCAxMChwU+Advh5fyK/nj852mb1sdkcQIygyqCroSbBVsDy4LQQNmR2yOeThHNM50jktoRDKD90c+ijMPGxR2I/hpPCw8OrwpxEOEUsjOiNZkQsjD0a+ifKJKot6MNdirnJue7RqdEJ0ffTbGN+Y8pjeWLvYZbFX4nTiJHGt8eT46Pi6+LF5fvO2zhtIcEooSrg933x+3vxLC3QWZCw4uVB1oWDh0URiYkziwcSPglBBjWAsiZ+0I2lUyBNuEz4XeYm2iIbFHuJy8WCyR3J58lCKR8rmlOFUz9SK1BEJT1IleZkWmLY77W16aPr+9ImMmIymTEpmYuZxqYY0XdqRpZ+Vl9Ujs5YVyXoXuS3aumhUHiSvy0ay52e3KtgKmaJLaaFco+zLmZVTnfMuNzr3aJ56njSva7HV4vWLB/P9879dQlgiXNK+1HDpqqV9y7yX7V2OLE9a3r7CeEXhioGVASsPrKKtSl/1U4F9QXnB69Uxq9sK9QpXFvavCVjTUKRSJC+6s9Z97e51hHWSdd3rp6/fvv5zsaj4col9SUXJx1Jh6eVvHL6p/GZiQ/KG7jLnsl0bSRulG29v8tx0oFy9PL+8f3PI5uYt+JbiLa+3Ltx6qWJGxe5ttG3Kbb2VwZWt2022b9z+sSq16la1T3XTDt0d63e83SnaeX2X167G3Xq7S3Z/2CPZc3dvwN7mGrOain2kfTn7ntZG13Z+y/22vk6nrqTu037p/t4DEQc66l3q6w/qHixrQBuUDcOHEg5d+873u9ZGm8a9TZymksNwWHn42feJ398+EnSk/Sj3aOMPpj/sOMY6VtyMNC9uHm1JbeltjWvtOT77eHube9uxH21/3H/C8ET1Sc2TZadopwpPTZzOPz12RnZm5GzK2f72he0PzsWeu9kR3tF9Puj8xQv+F851eneevuhx8cQlt0vHL3Mvt1xxvtLc5dR17Cenn451O3c3X3W52nrN9Vpbz8yeU9c9r5+94Xvjwk3+zSu35tzquT339t07CXd674ruDt3LuPfyfs798QcrHxIfFj9Se1TxWPdxzc+WPzf1Ovee7PPt63oS+eRBv7D/+T+y//FxoPAp82nFoMFg/ZDj0Ilh/+Frz+Y9G3guez4+UvSL+i87Xli8+OFXr1+7RmNHB17KX078VvpK+9X+1zNet4+FjT1+k/lm/G3xO+13B95z33d+iPkwOJ77kfyx8pPlp7bPQZ8fTmROTPwTA5jz/IzFdaUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAABPiAAAT4gBIlldPwAAEJNJREFUaIHtmkuMXUeZx3/1OOfccx9923Hb7bZlLLfJJCKOEoaIwbOAFWiIvIEVGxjGrAIsHBKJyCHDaEwYE5hEJGFYsGDBhskWMYssvEJosMMQwdgEMMJG7sSvtvtx77nnVVWzqHOqu9PtJOOHNNJwW1e3X/e79VXV99X/930ljh593EkpEQLq2tDpJJRlhVISpRTOOaq6BudQSmGtJYoirLU4QEpJVZYALCws8Jvf/AZjDEop3v6QUqGUxFpLXdcIIVFKUjbvb+1LKYmThOnhEC2l4MyZ/0ZK/0brHJHWWOuYTDLiOEZKSV0bpBRY6wdaVSVRFCOEQCnFOBvz1ptvopRi/sABTF0DUBQlw+kh1lrGozFRpBFCkucT0m4XU9cIKbHGYq3lnu33sLy0RF0bDh36CLrX7/uBNc+qqqikQkeaqq5Ju13qqgbhcE7gmi+lNVJKjDW42qIb7+M4QTQza52j3+9RldUmZ5Mkoa7qDc5qrZlkE6q6JtIRtTHI0epqM+UGay1CSHq9LjhHJ+lQFn76rbHUdUWkNWVRkHZSnHN0koSqqgA/k5N8Ql3X1HVNkedk2YTa1FR1jdIaY2zjLJuctc5/hlYKIcBZiwRBHPuliuOYfr9HlmUMBgOsNSglqeuaOI6JopiyrBBCkmVjjDWsrq6CENR1RZwkKCnRWuMct+VsVVU455BKScbjcRhInuf0+wMeOHiQXr9PXhREkaaq6saJCKkkQvr/V0pj6hqtddh3rb3bcbbb7VKWFdJaS6/XwzmHkBLnHAcPPsDuuTmstXTTlCTp0OkkTZBYlJQYY/DTRFgBpRRCiGCvLEuklKysrDAYTPE3H/kIvX6PbDIBXFg1rTXWWnQU4ZxD64iiKOkP+mhvVFJVftTbZ3fx0Y9+lCRJmJubQwjBuXPnGA6HvPHGG8zPz/OL//xPduzcycWLF5mZmeHs2d+itaIoCoBgL4qiJkJNcPqXv/wl3TQlimKs9fveGIOSknqd06qZLJ3nOVk2RgjJ1NQUn3z075iengYgTVMArl69yo4dO/jzn//M7OwsKoro9XqkaUqSJFRVSa833eQ6GezdjtPnz58nn+ToJOkQRRF79+7lE5/4BPv27duUYAG/BcTaErfLWZYlaZpSVRVpmlKWJVEUIaWf0Vt12lqL1goJjqqqed++fezevXvLwQkhANG8grWWPM/J8xwhBFL6HFiWJXEcU1U1Dsf8/H4+9alPMb9//n/tdNlEs6xrQxRHvHb6NK+++mrYR5sHCcYYhBDkeY6UkiRJmtkS1KbGOcdkMiGKI7RSt+U0zlEUObKTdrDGUNU1r732GidPnqRu0sX6h3WumZ0qRF6b3KuqQjWzCGCNwVh7W04rpeh0OmghBEmSYBqjp0+/xt69e5mbm+PChQsAXLx4kUuXLnHhwgWMNVRVxeXLlxmPR8SxTw3t8sRxHOy1Tksp+fjHP47W+j073Ua3Hq2OqOsaYy2R1hRlwc9+9jMOHjzIT3/6H8RxxHg8ZnZ2F0WRc/78eaSSLCws0Ov1uHDhAtZaOp0OzjmMMcGeVuqWnW7PbR1mQMpmqSSXL1+m2+2ilM9FnTRlnI2ZZBmdTgdjLcPhNCsrywAkiZdoAErrYK825pad1lGEMdYvsXOuEQqCuq6pqorf//73KOVTxfbt21ldXaVN6t00YTLJ0FrT6XSaPesw1lIWRbDnlcqtOe2cAxxSSOkFYnNcdbtdAKRS/lweDFhdXW3OZB+xZVkFkTkajciyDOcg7aQYY4K9qqowZm1PnT17luFwGAIJR/hZCoG1xgeG1iil6A8GSK0Uk4nXYM45VldXkVIim/xWlaU//KVE64g8zymKHGMtcRyHlFFVJcbUyCaf1XV9W87mec54NEJ87GMfc0vLy5RFEeS2MQbwIsAYi3MW3QpUY7HWbEoZrcx/8MEH2bNnDwBRHPutQ4MGVbVmXwgirRFC+AxiLHEckecFWiuc87lRf/CDf82dZpLXX3/9L0zyFya5bSbxuWxrmT4cTr8nJtE6ujtM4pyPypsxycMPP8RgaupdmUQpecvObskksom8TichTX3SjbSm00mJ44gk8WljdnaWe++9F2ct1tmbMolzDillq12oqmoTk+R5jtaavz10iOlt2wKTjEajzUzywAMPcP3GEvvet5eFhQUOHTrEn/50nvvu+ytWVlaYP3AAnGM4HLJ//34WLl5kaWmJySTfkkkA4iTBGp++2pzXOu2Dwyf/2dlZ7s1zTv3iF9hmu21ikjhJ0ErS6XRQSjMzM8OVK1eYmZlBSsmu2dmQ09I05fDhw/zkJz9hZWVlSyYBuPf9779lp/NJjmyZJEkStFJhSfr9Xjgh1g7vjY/9+/dz+PBhDhw4EJhECBHsJUmypdO9XpeZmRmmp6fZNTvLrl27SNOUbdu2cfjwYYbDIVVVbmQSx9oAlFJBPvlTRmwaXPvYu3cv8/PzWzKJw92W0xuYxItL/8aWD8Cr3q0MARRFwauvvsqpU6e2ZBK97ri7Fac3MImxFhxY61VxFGlAeFm0hbd1XXPy5ElOnz5NURRbMol/3rrTm5jk+vXrZFnG4uIi2STjd7/7HdeuXePs2bOMRqNAXPv37+fNN9/k1KlTzdFVb8kk3rNbc9ornLcxyeXLlymriuXlJZyDS2+dJI4jzpw5w+zsLn7961+T5zmffPSTvP4rr1jyPL8pkwC35fRNmQRochZbyvNzfzjHeJyRZRlwcyYBbsvpmzJJS/xRFG3JJG+99RaTyeRdmQQIhaFbcfodmUQ3GX4rmZ7nxXtiEq/ITSNOBUVRbGKSbdu2AfDHP/6Ruq4Ckwgp7z6TtPnvVpz9C5PcUSb51a/+iyiKfDk3iknTDuNxRlVVIXDa7K+UDspFa01RlkRN5J4/fx6lFHv27Lkj9j70oQ95JokiX57odDpIJcM0t484jinLEqU1RVHgnKY2JqQT1xSBWia5U/YCk0RR7EdtHUWeN9Uq3ShfTVmWvtBoDPds2xaK60IKH3HNPmqZ5E7ZC0xS1xVxnDQK2HtljKEofIRprT1n4MiyjG6321RFVajr1XUdmORO2XPOoX0xB6JIc+zYsRAYQEDRLMv40Y9+xKVLl4IRpRRCepkfx7EXBg2TtPa8qnb+pKlKkmbQRVkEDn4ne2VZoX2x2kPR+shrGUMpxdTUFI899hgnTpzAOodtEm/79yzL6A8GKKX8Ad/Y01rzta99Ddnsq/ZprWUymfDjH/+Yy1eu3NReYJI2+7dHXKvVnHN861vfCoe/ahL49PQ0165dQ2vtoxVYWV4OTNLaa1NG63BrVylFFEV84Qtf4MSJEze1F5gECCmgXdrW4OOPP84Pf/hDLl26hGgkVZZl7Nmzh8XFxRC57UDa16qqSJIkON06DHD8+PGQT9/JXmCSujmiWgPPfvObfjma/XPkyBGGw2E4V4uiYHl5maSTUNU1ZelnrmWS1l5RFBucbmfyqaeeYm5u7l3tBSbRSqMjHYzUVcXVq1cRiJC3jh49yhNPPMGjjz7Kffffh1QSrRRTgwHj8ZjamMAkrb1WKQF8/ev/FPZgHMd8/vOfp9freewscqq6wtT1Bnsg0HXtvbDWcv36dWZmZoiiiO9+97s8/fTT9Hq9sDy9Xo9HHnmERx55JPzuueeeY/v27aysrAQmae1ZZ0Mp2Jiaq1evMtuga5IkfOUrXyHLMs6cOcPCwgLnzp0jiiKGwyFZllEUObqTdkjTFGstL7/8MsYY0jQljmOOHz/Ok08+wczMjnUVgo1SPcsm9Hpdds3tYmFhISx1e95ev36dHTt2EMcxL7zwAs8888wmpz/84Q/7n5sc9e1vf5tt92xbY5KyLJpijz8DbVOyGAwGPP/8C8zN7eJzn/t7+v1+CJ52O3Q6Caurq0wmk8Ak6+299NJLRE3ZbTAY8Oyzz3L06FF27ty5Yd8L4TeUg2Bv546dnkmiyOu6tQ6TD47JZEK31+Xq1Wt85zvf8VpPq6ZX7AdgmiVczyTvZu/ll19m9+7dfOYzn2FqaiqsRut0ay8wSVWVRHES8pepDZN6QqfT8agoINJenZRl1YhZ6T+w22V1dTXMhNL6Pdm7cuUKL7704gZ7ZVnS7XaZTCaNsxbpI61h2XUJW0pfpm1xcpJPKIuSOIpQ2h+HbR4TQmDdeia5M/YCk4A32O7BVkBqHWGMIY5ikjhppH2Fs22Q+DTU7XUp8jwwyZ2yF5gEwDTCQEi/0duOky9ZlP69vkuKA3+pwtSMRiOcdQ0erHHInbA3Ho3QP//5z7mTTPLwww//P2SSN974bejZdns9cI68yNFKgxCMx2O0VlRlhZCSOIq8wjEGqSTOOnQUce4Pf7jjTCJ7/T5a6wDuSzduUBQFUkqWlpf8Zm9qfEnHl3Nbyd5JU4rC9zgIHU4dmEQIsYFJoihCa0232/U5Loooq5KqqqiNCaWXTUwyyfMgsVVzW0MphUB4jyK/N0xtGAwGVE0fJJ9Mmk1fBMF5V5hEirU/SOX7HFVZ0ev1yMZjL8kbz/I8p9ftYa2l1+8jhVhrUdwtJhmPx6RpGhJlVdXoyPc90m6X6eGQfzhyhG6a+rLIOpVsreWZZ/6RoijvHpN0u90wyJYpymYflkXJl5/+cjgBNkemRGuf27Zikja9WGvJat+vw8H8/Dyf/vSng8hto75d3n99/vk1JmklfpIkOFjXPPQz8dRTT9FJUwb9Pl/96lc3DNBBeN9WTBKFC2N+RtubH5/97Gc3paL2PJdSbmSSXq+HEJLl5WWmpoZorXxz0VmUkuycnSWKNF987IvBUOgiOUe32w11vbczSZZlOBxxFIc6tZSS48ePhy117NixMHvtaxzHa0wyHo/p9/tMTU35Sw1CIKSg1/Obt5MkfOmLXwoQ5JzjG89+I3i+vLLC1NTUlkzieyYdn0K0QjYpS2vN9u3befLJJ4PTrdxqZ1JrhW438Wi0SpIkzM7Okk0mPPCBD7Bnzx4eeuihoIBb765cucJ4NAb8cVRXFSvN3YOWSVST2K21uIYvrLE466idYzAYcOTIkdDycs5x4sS/cOzY0wAbmcQYG7Ta26e7HUQrg7Is4wc/+AFp6luoN27cQAhJFKktmUQi6ff7ZFnG/fffz759+3jwwQfpdrsblvTq1avYRtU456irao1JjKlRSgYlvH5w6zuW165d49++/31fh4ki/vn4cSZZRpJ0QpkE1piEJnDaZdzKafDt2+9973vhBuiNGzfYNbdrjUl8bvMicb3sbr9fWlri3195hcXFReI4RjURKpoPbbtLWzHJ+pz59khtnX7xxRfRkf/fEydOkGX+0tDcrjnPJLq5RBHHMc899xxVXYfTxcOQpKpKnHOkaZeiLJgaDCiKgunpaaqqCo3rrZikdXR9jWZ1dZVXXnmFS5cvIaTA1AahBUVdbmYS19z2WJM90udCfJ6LtMJajXPWN7WdYTQasX37dhYXF4PYgK2Z5Pjx4wBhn1tnG6X0zowTmEQ3XNBKoHySI5WkrCoENF0jvzQrKytY44jimMXFRXbs2BES8V1jkiLPEfirma5pLkc6Ympqiv5gCtEsk1Kq4Qwb+m2Xr1ym1+v5u6x3i0kchEtgQkhGoxGTyYTRaMTy8lJg17KsUI3qaS8nSiHJC1+PvhtM8n++T/I/qZZwKb0BifcAAAAASUVORK5CYII=',
                    base: 'data:image/png;base64,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',
                    hp_bar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAACVBMVEX///8AAAAAwAC1q34TAAAAAXRSTlMAQObYZgAAAB9JREFUOE9jCAWDEAY4yFoFAkvwCGBoGQWjYBSMSAAAZB0NZefq320AAAAASUVORK5CYII=',
                    inputs: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAkBAMAAABh4ecdAAAAJFBMVEVHcExwcHAnJyc2NjZ2dna+vr4tLS1GRkZYWFhQUFChoaGGhobMWLNQAAAAAXRSTlMAQObYZgAAANRJREFUeF6djjFLBEEMRj+2sDassK3MgGIZEhktF+4PiAyIdpfiznLY7joRK6vDzn4L/6XMhOMWtBCbwOMlMw8XYR3CFlgHAFFERBFEAmAV+KTOczfcLUB9QprxZb9Rn7Cl8e32wOkvwPVTAl5oXI1nwLgCfrbdLts+98e2m3nfSc4VPmT3oPE653vF81eaX9kqMK4e3+9EzY29zb0cTOSnlpNzy+n/1ZaWbaUc2xKVTogqTFIGjUzUKzZDoomtAuOSyiBqbqzQJAcT09ByiFrO9Ie2b2LhVKVMtycmAAAAAElFTkSuQmCC',
                    letters: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfoAAACACAMAAADUBVtoAAAABGdBTUEAALGPC/xhBQAACktpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAAEiJnVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4BUaaISkgChhBgSQOyIqMCIoiKCFRkUccDREZCxIoqFQbH3AXkIKOPgKDZU3g/eGn2z5r03b/avvfY5Z53vnH0+AEZgsESahaoBZEoV8ogAHzw2Lh4ndwMKVCCBA4BAmC0LifSPAgDg+/Hw7IgAH/gCBODNbUAAAG7YBIbhOPx/UBfK5AoAJAwApovE2UIApBAAMnIVMgUAMgoA7KR0mQIAJQAAWx4bFw+AagEAO2WSTwMAdtIk9wIAtihTKgJAowBAJsoUiQDQDgBYl6MUiwCwYAAoypGIcwGwmwBgkqHMlABg7wCAnSkWZAMQGABgohALUwEI9gDAkEdF8AAIMwEojJSveNJXXCHOUwAA8LJki+WSlFQFbiG0xB1cXbl4oDg3Q6xQ2IQJhOkCuQjnZWXKBNLFAJMzAwCARnZEgA/O9+M5O7g6O9s42jp8taj/GvyLiI2L/5c/r8IBAQCE0/VF+7O8rBoA7hgAtvGLlrQdoGUNgNb9L5rJHgDVQoDmq1/Nw+H78fBUhULmZmeXm5trKxELbYWpX/X5nwl/AV/1s+X78fDf14P7ipMFygwFHhHggwuzMrKUcjxbJhCKcZs/HvHfLvzzd0yLECeL5WKpUIxHS8S5EmkKzsuSiiQKSZYUl0j/k4l/s+wPmLxrAGDVfgb2QltQu8oG7JcuILDogCXsAgDkd9+CqdEQBgAxBoOTdw8AMPmb/x1oGQCg2ZIUHACAFxGFC5XynMkYAQCACDRQBTZogz4YgwXYgCO4gDt4gR/MhlCIgjhYAEJIhUyQQy4shVVQBCWwEbZCFeyGWqiHRjgCLXACzsIFuALX4BY8gF4YgOcwCm9gHEEQMsJEWIg2YoCYItaII8JFZiF+SDASgcQhiUgKIkWUyFJkNVKClCNVyF6kHvkeOY6cRS4hPcg9pA8ZRn5DPqAYykDZqB5qhtqhXNQbDUKj0PloCroIzUcL0Q1oJVqDHkKb0bPoFfQW2os+R8cwwOgYBzPEbDAuxsNCsXgsGZNjy7FirAKrwRqxNqwTu4H1YiPYewKJwCLgBBuCOyGQMJcgJCwiLCeUEqoIBwjNhA7CDUIfYZTwmcgk6hKtiW5EPjGWmELMJRYRK4h1xGPE88RbxAHiGxKJxCGZk1xIgaQ4UhppCamUtJPURDpD6iH1k8bIZLI22ZrsQQ4lC8gKchF5O/kQ+TT5OnmA/I5CpxhQHCn+lHiKlFJAqaAcpJyiXKcMUsapalRTqhs1lCqiLqaWUWupbdSr1AHqOE2dZk7zoEXR0miraJW0Rtp52kPaKzqdbkR3pYfTJfSV9Er6YfpFeh/9PUODYcXgMRIYSsYGxn7GGcY9xismk2nG9GLGMxXMDcx65jnmY+Y7FZaKrQpfRaSyQqVapVnlusoLVaqqqaq36gLVfNUK1aOqV1VH1KhqZmo8NYHacrVqteNqd9TG1FnqDuqh6pnqpeoH1S+pD2mQNcw0/DREGoUa+zTOafSzMJYxi8cSslazalnnWQNsEtuczWensUvY37G72aOaGpozNKM18zSrNU9q9nIwjhmHz8nglHGOcG5zPkzRm+I9RTxl/ZTGKdenvNWaquWlJdYq1mrSuqX1QRvX9tNO196k3aL9SIegY6UTrpOrs0vnvM7IVPZU96nCqcVTj0y9r4vqWulG6C7R3afbpTump68XoCfT2653Tm9En6PvpZ+mv0X/lP6wActgloHEYIvBaYNnuCbujWfglXgHPmqoaxhoqDTca9htOG5kbjTXqMCoyeiRMc2Ya5xsvMW43XjUxMAkxGSpSYPJfVOqKdc01XSbaafpWzNzsxiztWYtZkPmWuZ883zzBvOHFkwLT4tFFjUWNy1JllzLdMudltesUCsnq1Sraqur1qi1s7XEeqd1zzTiNNdp0mk10+7YMGy8bXJsGmz6bDm2wbYFti22L+xM7OLtNtl12n22d7LPsK+1f+Cg4TDbocChzeE3RytHoWO1483pzOn+01dMb53+cob1DPGMXTPuOrGcQpzWOrU7fXJ2cZY7NzoPu5i4JLrscLnDZXPDuKXci65EVx/XFa4nXN+7Obsp3I64/epu457uftB9aKb5TPHM2pn9HkYeAo+9Hr2z8FmJs/bM6vU09BR41ng+8TL2EnnVeQ16W3qneR/yfuFj7yP3OebzlufGW8Y744v5BvgW+3b7afjN9avye+xv5J/i3+A/GuAUsCTgTCAxMChwU+Advh5fyK/nj852mb1sdkcQIygyqCroSbBVsDy4LQQNmR2yOeThHNM50jktoRDKD90c+ijMPGxR2I/hpPCw8OrwpxEOEUsjOiNZkQsjD0a+ifKJKot6MNdirnJue7RqdEJ0ffTbGN+Y8pjeWLvYZbFX4nTiJHGt8eT46Pi6+LF5fvO2zhtIcEooSrg933x+3vxLC3QWZCw4uVB1oWDh0URiYkziwcSPglBBjWAsiZ+0I2lUyBNuEz4XeYm2iIbFHuJy8WCyR3J58lCKR8rmlOFUz9SK1BEJT1IleZkWmLY77W16aPr+9ImMmIymTEpmYuZxqYY0XdqRpZ+Vl9Ujs5YVyXoXuS3aumhUHiSvy0ay52e3KtgKmaJLaaFco+zLmZVTnfMuNzr3aJ56njSva7HV4vWLB/P9879dQlgiXNK+1HDpqqV9y7yX7V2OLE9a3r7CeEXhioGVASsPrKKtSl/1U4F9QXnB69Uxq9sK9QpXFvavCVjTUKRSJC+6s9Z97e51hHWSdd3rp6/fvv5zsaj4col9SUXJx1Jh6eVvHL6p/GZiQ/KG7jLnsl0bSRulG29v8tx0oFy9PL+8f3PI5uYt+JbiLa+3Ltx6qWJGxe5ttG3Kbb2VwZWt2022b9z+sSq16la1T3XTDt0d63e83SnaeX2X167G3Xq7S3Z/2CPZc3dvwN7mGrOain2kfTn7ntZG13Z+y/22vk6nrqTu037p/t4DEQc66l3q6w/qHixrQBuUDcOHEg5d+873u9ZGm8a9TZymksNwWHn42feJ398+EnSk/Sj3aOMPpj/sOMY6VtyMNC9uHm1JbeltjWvtOT77eHube9uxH21/3H/C8ET1Sc2TZadopwpPTZzOPz12RnZm5GzK2f72he0PzsWeu9kR3tF9Puj8xQv+F851eneevuhx8cQlt0vHL3Mvt1xxvtLc5dR17Cenn451O3c3X3W52nrN9Vpbz8yeU9c9r5+94Xvjwk3+zSu35tzquT339t07CXd674ruDt3LuPfyfs798QcrHxIfFj9Se1TxWPdxzc+WPzf1Ovee7PPt63oS+eRBv7D/+T+y//FxoPAp82nFoMFg/ZDj0Ilh/+Frz+Y9G3guez4+UvSL+i87Xli8+OFXr1+7RmNHB17KX078VvpK+9X+1zNet4+FjT1+k/lm/G3xO+13B95z33d+iPkwOJ77kfyx8pPlp7bPQZ8fTmROTPwTA5jz/IzFdaUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlQTFRF////AAAAAMAAtat+EwAAAAF0Uk5TAEDm2GYAAAAJcEhZcwAACxMAAAsTAQCanBgAAAX/aVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA5LjEtYzAwMSA3OS5hOGQ0NzUzLCAyMDIzLzAzLzIzLTA4OjU2OjM3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuNCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA3LTIxVDA1OjU0OjQwLTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wOC0yOFQwMToyMjozNy0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wOC0yOFQwMToyMjozNy0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjIiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplYzQwOGI5Yy0yMGRiLWVkNDMtYWY3OS0yMTgyOGQxZGM5ZTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDhkYzI2NGItMjEzYS0yZjQ3LTkwZjgtYzZhZDI1YmY3YjQwIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NDhkYzI2NGItMjEzYS0yZjQ3LTkwZjgtYzZhZDI1YmY3YjQwIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0OGRjMjY0Yi0yMTNhLTJmNDctOTBmOC1jNmFkMjViZjdiNDAiIHN0RXZ0OndoZW49IjIwMjMtMDctMjFUMDU6NTQ6NDAtMDQ6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy40IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZWM0MDhiOWMtMjBkYi1lZDQzLWFmNzktMjE4MjhkMWRjOWUxIiBzdEV2dDp3aGVuPSIyMDIzLTA4LTI4VDAxOjIyOjM3LTA0OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMCAoMjAyMzA3MjcubS4yMjU3IDQ3YWM4OTIpICAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+WcxtsgAAD4hJREFUeJztXdm27CgIhT71/79MPySmZG8ULVN1hutevW4f4gBOqEBSIhsbGxseqqKaZJmsr/skSJ+p/kUZ/kE86ImKOVJFVOCZqfksjhQxkWcOX1qxMnhC6UrslwEcRUB+kI/SSR7F9KBDXDI+SOq/FUUcGnoeGi6rrnuUUkXsOR00aYqqWJVsMJNUjafjnT2jMFTYAVE6zk6l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',
                    dark: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAQBAMAAAAblGfKAAAAGFBMVEU4ODg1NjY5Ojo8PDwzMzQ/P0AvMDBDRERjbuM9AAACK0lEQVQYGQUAy3LbIHBZUHxdQPYZgZzzAlZ8BUnuWdbj7qT5gE7a/58OxDR7T2nyTAIUlVHUEKUTGiBvOoAVWRe+1sB5GFAECIOffIwXGTZjXFRkSRN7ZJscrzI4VRawdh/J9HkdPUi5ULyd4+iQK4haq3POcNsEqhxtPobZaiMadICBlYbkBueXur7payhin+lr01T0x1vecDjQS/szaoCKTnfCtwEaTmzO9Tp0X7nO069R2MWDXstrg3x3LqMHPSPfJjS2PluoTz8ow7oul+BE7WfgLYI66/eT9S5ZsqeIvZge39oxwxVyBjcY2My5M5zLLGaDBEHuzaNvlnUSPWUdJTRKfQEyAe0rRgQNanulDouKNUGp7VrkD1UTe7DAUrBPr5KKfYJYzuQBCIxVqZkUTDPkIvSmmuy5V1q2IBP6EOpnqMAA9uEmXhBU+zFrhPrW14DNxxhhOOBkEcHQ2SFLUlalAKsou3LInZweg1FjC6Uk7o87mrMPuKqOb2DvcD0WsUvB8LhpnGwe8PsmVDJKv0wnewfcmHSIEeNSn7qCu8Hht3YneK2KxCTl9j46nD21CoWPYgQfhD1l4vM3td1jQc/do1wFXBpLcuqCOEZsY1UztUYlh4BNaFL+Z9ReRwzBuLya/RthgL03ZpOpGcMpf8a24qSMJhLRkMt3l8ou+2vDJP6qI28Af9BZ00EeL8Veb9j9ft3cHDskEzF7+8SoP5+YQeyjapT7D2DRagKDaYcKAAAAAElFTkSuQmCC',
                    ZoomInIcon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAD2ElEQVR42k2Ty25TVxRA99n7nPuwr5VENkJ2UktMqGghJEE1UIoVRFFJB/Ar9N8sZZJKDJKIREqwaIEURBSHWnFiXD+4vr7n3UE66PqDpaXFXrz4DREZA2NsFIVKaSIkIu+9Nga8JyLnnBDCOecBEFErBQDdbpcjsoPDA04EwIzRnHPGGGMsDEOttXPOWENIiCiEUEoDeO9Ba3V2dsaLSVIsFI3RWmsk0lrHcTw/P++9J6LJZMId11pba7XWYRgyxrIsY4w553j69au11gMkSTKdTq9f//bu3UatVpvNZkmSfP78eW9vr9PpCCGUUlLKJEkQEQCIiO7f//Hi4oKQvPeNxg8bv2586fe3trb29/e73e7i4mKj0ej3+/1+P4qiSxFEjKIonU45EWqtiPO11dX19fWXL1/u7OwEQeCc63Q6Hz58ePbs2cbGRr/fHwwGc3Pzs1mmlMqltMagc06III6ilZWVN2/+2NvfF0KUkuSXp0+LxSJjbHNzkzF2+/ZtEYh0moZhGIYRIdJlFWttUiqVy+XXrw8JMY7jb+r1tdXVer1eLpeFEAcHBze+u8GJE6JSGpExxqSUmOc5IiPENE3TdOo9NBqNZrMZBMGDBw9u3bqVZVmapgxYFMV5nislrbVxXAAADMPIOW+sKZVKtVrVGLO9vd1qtfI8b7VaOzu7xGlpaSnPcyFEXChwzmd5nmXTOI4RwHNOw39Gnc7pnTt34jgGYOfn561W6/ziwlpz8/uby8vLh4eH3e7fxphSqRSFoVJKKYXGWOccQ7a9vV2tVp88+TkMA63Nx48fZZ7X6/Xnz58XCoUkSebm5pCxwWAQhGGSJN57Wn/0qHNyMpvNsmnW6/Xu3bu3trYWBAEiLi8vP378OAxDzvm1a9eiKDo5OUHEbDp1zk8mE3rYbH75MiBOjMFwOPzz7VsAuHLlysLCwsLCwrv377e2fi+Xy5VKZWlpqVKpnJ6eWucE5+PxmFZXVkejoZQqjmOllMxlt9s9Pj4+Ojp6++7dea83nU6Pjv6K47hWq129erVarZ71eqPRaDKZ0MOHP531ekZrrU2xWHTOOue8BwBAROec914pfXx8LKWs1+uVSmVxcbHdbg+HQ84YQ8YudzXGAAAScU7GWs4FMDBGMwZKqVevXqVp2mw22+22tdY6xxn+h3Nea0OE3vssyxhDZOjBcyILjnkvlWq3258+fZJSeoA4ipETOecAAJGFYSClFEIUiwmAd84qqbQxRmsiIkTv/Xg8VkrJPLfW8N3d3dF4rKS8fM1aCwBBEFjrvHecc0S01jln4X9Ya4noX/DDRnPcr8h7AAAAAElFTkSuQmCC',
                    ZoomOutIcon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAD0ElEQVR42k2TXW8TRxRA79w7s7tjr5VENgp2okiIQkWLQhJUA1WJgigP6QP8FfrreAmCh4CSSAkWLWBARHGoFRfHdeysP3Y+7vQhfej5B0dHRzx9+jsiCgHO+SSJjbFESEQhBOschEBEzKyUYuYAgIjWGABot9sSUewf7EsiAOGclVIKIYQQcRxba5nZeUdIiKiUMsYChBDAWnNyciKLaVosFJ2z1lokstZqrWdnZ0MIRDQcDiVLa6333lobx7EQYjweCyGYWWbn5977AJCm6Wg0un79+zt36rVabTKZpGn69evX3d3dVqullDLG5HmepikiAgAR0b17P3/79o2QQgj1+k+bv22edrtbW1t7e3vtdnthYaFer3e73W63myTJhQgiJkmSjUaSCK01JOXa6urGxsbLly9fvXoVRREzt1qtT58+PX78eHNzs9vt9nq9mZnZyWRsjJnmuXcOmVmpSCfJysrK27d/7O7tKaUCM4fgnBNCPHv2TAhx69YtFalslMVxHMcJIdJFFe99WiqVy+U3bw4IUWs9f/nyd1ev1mq1crmslNrf37/xww1JkhCNsYhCCJHnuZxOp4iCELMsy7JRCFCv169duwYAAPD58+cXL15kWSZAJInu9U6JSCmldQEAZBwnzMF5VyqVarVqs/lxe3t7Z2cHEb33zIEkLS4uTqdTpZQuFNj7yXRKaLTWCBCkpP4/Z63W8e3bt7XWAGIymZyfn0/z3Ht388eby8vLBwcH7fZfzrlSqZTEsTHGGIPOeWYWKLa3t6vV6qNHv8ZxRCS11gJgaWnpyZMnhUIhTdOZmRkUotfrRXGcpmkIgTYePGgdHU0mk/Fo3Ol07t69u7a2FkURIi4vLz98+DCOYynllStXkiQ5OjpCxPFoxByGwyHdX18/Pe2RJCGg3+//+e4dAFy6dGlubm5ubu79hw9bW8/L5XKlUllcXKxUKsfHx55ZSTkYDGh1ZfXsrJ/nRmttjMmnebvdPjw8bDab796//7vTGY1GzeZHrXWtVpufn69WqyedztnZ2XA4pPv3fznpdJy11rpiscjsmTkEAABEZOYQgjH28PAwz/OlpaVKpbKwsNBoNPr9vhRCoBAXuzrnAACJpCTnvZQKBDhnhQBjzM7OTpZl6+vrjUbDe++ZpcD/YA7WOiIMIYzHYyEQBQYIksgDixByYxqNxpcvX/I8DwA60SiJmBkAEEUcR3meK6WKxRQgMHuTG+ucs5aICDGEMBgMjDH5dOq9k69fvz4bDEyeX7zmvQeAKIq85xBYSomI3jOzh//hvSeifwG6L0Czvd2sNQAAAABJRU5ErkJggg==',
                    ZoomResetIcon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAADFUlEQVR42mVTu05dVxCd1973nAsYUSAq6GLk2OhGTgOKBT8S11RIztcgUTk/EHc0pIYCFAsprniIBkQZcl9nP2YmxUHIUnY7e82sNWsNfvr0GxEhQq3aNIOcCzMxs7uXWsGdmc0shGBmDkBEJWcAuL+/FyL8+vWvEAIgxBDbtplOZ6UURKy1EhEiMosIp5REJOUcRNz97u5OFhYXQ5CUU9M0xNR1SYQBAABijDlnFkkpuUtVdXcmcvcYo5nJZDwOIZqZm797+3Y0+um5IAIA7q6qDw8Px8fHw7bNJQuLmakqMxMA1lpiHLj79vZO27bMHEJAREQkohDCxsbG/v7+9va2sHRdR0S11jgYEDO5QwjPc9wd/vf6LqPR6M2Pb5g5xohEWqv0DEupInJ0dFRrNbNecK11cWlx693WaDRiZgB4/cPrb39/m81mi0tL3Luiqu5uZsz83BhRRERkOp2dn5+fnZ31FNbW1kSEiP59ekopUdd1AFBKEZHZbJZyMjMz67rOzNwMEa+vr3swMyNijIMYIwDIYNBUrUycUgohIFFOabgwLKUSIhGpakrpRb+ZqRYiatuWAFxYJAgimlkt5f37nz/++lFrzTnXWgFgdXX1BTwcDqfTaVXNOUut2i/J3Ahoa2vrw4df+s3HGFV1fX19d3e3R3Zdp6rLy8uz2czdpWmbtm3NrNa6vr6+t7fX/zs4OOhJEtEL4T++fJlOZwsLw1fLr+7v7wURc07uEGPc2dnpZyJiD/ge+fn3z6WUphmMx+P5fI6IMhlPQogAUGu9ubl5kWdmfQtVvb29PfnzxM1FJNXMzE3TuLvEGErJIQ5U9eLiYmVlZXNzEwAODw+JCRwAIefSb34+nw+Hw/F43AeRENEdTFVViejk5OTy8rK31Mzm3TynHENgYXd/yby5q5kgEQCYqoi4e8759PT06upKVWOM4KCqpZQ+ngAIAMOF4WQ8aZuWhBkA1MzMkLCP9OPjIzOnlAABENzBAZCoap1MJm69i1VOT0//eXrKKfWuqGp/Farmbn2SVc1Mv7+z/p7/A/Hj/e62GRnPAAAAAElFTkSuQmCC',
                    Help_Icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAa0lEQVR42r2SwQ3AIAwDk6oz8fBWTJKpzFruqy1BFIlPT+JBlGArxiVZT2stFQB4fz/HxlpreiAilAYlGUmVUp5DUrOapFehZ1TpcZKa2LAPe3bYJj8MAPDb84qIMAC+v6U76UVwKXHf/RoXawNNsyyrilkAAAAASUVORK5CYII=',
                    Copy_Icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAdklEQVR4nGNgIBEwwhgHDhz4j0uRg4MDXB0LskRbezuG4qrKShQ+C7qCaVOnYmi6c+fOfwYGBgYVFRVGDA0MDAwMdfX1GGJNjY3YbYCBtNRUOHvW7Nm4nYRNETKgsw3IQUjQBljkwIIQlw2M6AIwDdiAiooKIwDO2ygXPlrkqwAAAABJRU5ErkJggg=='
                },
                    css_text;
                if (!$('head .outfiter_style').length) {
                    css_text =
                        '.outfiter .leftb,' +
                        '.outfiter .rightb {' +
                        '  background-image: url(\'' + bgs.arrows + '\');' +
                        '}' +
                        '.outfiter .darkchk_in,' +
                        '.outfiter .darkrad_in {' +
                        '  background-image: url(\'' + bgs.inputs + '\');' +
                        '}' +
                        '.outfiter .dark_input,' +
                        '.outfiter .div2,' +
                        '.outfiter .div2_no_padding {' +
                        '  background: #383839 url(\'' + bgs.dark + '\') repeat;' +
                        '}' +
                        '.outfiter .template_code_code,' +
                        '.outfiter .template_code_code[disabled]:active,' +
                        '.outfiter .anistep_step,' +
                        '.outfiter .color_tab,' +
                        '.outfiter .color_tab[disabled]:active,' +
                        '.outfiter .nbutton,' +
                        '.outfiter .radio_list_out,' +
                        '.outfiter .omain_wrap {' +
                        '  background: #464747 url(\'' + bgs.base + '\') repeat;' +
                        '}' +
                        '.outfiter .body_main_div .zoomin {' +
                        '  background-image: url(\'' + bgs.ZoomInIcon + '\');' +
                        '  background-repeat: no-repeat;' +
                        '  background-position: center center;' +
                        '  background-size: 20px 20px;' +
                        '}' +
                        '.outfiter .body_main_div .zoomout {' +
                        '  background-image: url(\'' + bgs.ZoomOutIcon + '\');' +
                        '  background-repeat: no-repeat;' +
                        '  background-position: center center;' +
                        '  background-size: 20px 20px;' +
                        '}' +
                        '.outfiter .body_main_div .zoomreset {' +
                        '  background-image: url(\'' + bgs.ZoomResetIcon + '\');' +
                        '  background-repeat: no-repeat;' +
                        '  background-position: center center;' +
                        '  background-size: 20px 20px;' +
                        '}' +
                        '.outfiter .help_q {' +
                        '  background-image: url(\'' + bgs.Help_Icon + '\');' +
                        '  background-repeat: no-repeat;' +
                        '  background-position: center center;' +
                        '  background-size: 12px 12px;' +
                        '}' +
                        '.outfiter .copy_btn {' +
                        '  background-image: url(\'' + bgs.Copy_Icon + '\');' +
                        '  background-repeat: no-repeat;' +
                        '  background-position: center center;' +
                        '  background-size: 12px 12px;' +
                        '}' +
                        '.outfiter .charn_cont {' +
                        '  text-align: center;' +
                        '  margin: 0 auto 5px auto;' +
                        '  width: auto;' +
                        '  max-width: 100%;' +
                        '}' +
                        '.outfiter .charn_cont .charn_row {' +
                        '  display: flex;' +
                        '  flex-wrap: wrap;' +
                        '  align-items: center;' +
                        '  justify-content: center;' +
                        '  gap: 6px;' +
                        '}' +
                        '.outfiter .charn_cont .charn_title {' +
                        '  float: none;' +
                        '  display: inline-block;' +
                        '  padding: 0;' +
                        '  white-space: nowrap;' +
                        '}' +
                        '.outfiter .charn_cont .charn {' +
                        '  float: none;' +
                        '  width: 184px;' +
                        '  max-width: 100%;' +
                        '  box-sizing: border-box;' +
                        '  display: inline-block;' +
                        '  text-align: center;' +
                        '  margin: 0;' +
                        '}' +
                        '.outfiter .charn_cont .clear_name,' +
                        '.outfiter .charn_cont .use_name {' +
                        '  float: none;' +
                        '  display: inline-block;' +
                        '  margin: 0;' +
                        '}';
                    $('head').append('<style class="outfiter_style" type="text/css">' + css_text + '<' + '/style>');
                }
                ogebi('floor_image').attr('src', bgs.floor);
                ogebi('letters_image').attr('src', bgs.letters);
                ogebi('hp_bar').attr('src', bgs.hp_bar);
                return true;
            };
        if (outfiter_init()) { outfiter_load_outfit(); }
        $('.outfiter_img').hide();
    });
});
