# Solar System

## Description

Solar System is a small simulation of our solar system, featuring all planets (sorry Americans folks, Pluton isn't included!) plus the Moon and the Sun (makes sense).

All *relative* rotation speed (on itself and around the Sun) between planets are astronomically correct (at least, they should be). But the overhaul speed isn't realistic. Currently 1 second of simulation equals approximatively 5 hours (4.8 to be precise) in real life.

Axis *should* be realistic too but I am a beginner in 3D scene so don't expect too much on that.

You can look around in the system with your mouse (drag and drop) as well as zooming in and out by scrolling.

Because of the current controls, farther planets (Uranus, Neptune) are trickier to observe.

An important point to mention: I recently changed the way all objects are loaded but I forgot to add Saturn rings in the process. So Saturn will stay *alone* for now.  :sweat_smile:

Last thing: while all planets' rotation use the current Date to update their position, their position isn't astronomically corrects. Indeed, I haven't been able to determine their "offset" for January 1th, 1970 (the '0' of the Date). So I have considered them to be aligned at this date.

## Planned features

[ ] Add Saturn rings
[ ] Add ability to select a planet
[ ] Add ability to *switch point of view* (ie, changing the camera target)
[ ] Change skybox to shine a little bit less
[ ] Add ability to dynamically change distances and sizes
[ ] Add other planetoids (Europe, Titan, Pluton, ...)
[ ] Change orbits to be elliptic when needed (which is basically everywhere)

## Building and launching

This project doesn't require much.

Clone it, start a Web server (like Apache) and enjoy!

## Useful links

A demo of this project is available at [this URL](https://pierreelliott.github.io/SolarSystem/)

And the GitHub repository is [right here](https://github.com/pierreelliott/SolarSystem)

## Credits

All textures used don't belong to me nor do I claim any right on them.

If I used your work and would like me to remove or give credit for it, just send me a message.
