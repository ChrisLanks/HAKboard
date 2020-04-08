#!/bin/bash
# Really quick script to turn on and off my rpi's screen

# on or off
STATUS=$1

if [ $STATUS = "on" ]; then
	/opt/vc/bin/tvservice -p
	# Reset x server's resolution to what it was before fbset -s shows you
	fbset -depth 8
	fbset -g 1280 800 1280 800 32

	# Needs to fake a mouse click
	DISPLAY=:0 xdotool click 1

elif [ $STATUS = "off" ]; then
	/opt/vc/bin/tvservice -o
fi
