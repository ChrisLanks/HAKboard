This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
Forked from https://github.com/NilSkilz/HAKboard.git

## Info

This was customized for my needs and will look horrible on most screens. I have this running on a 10" touch screen. 
I customized the format for what I need and that size. There are plenty places this code really needs to be improved.
BigCalendar does not support editting the default table component. So I ended up cloning a lot of the code to make a 
custom agenda. This was to model a similar DAKboard setting. I ended up just using moment and hardcoding that.

I also wanted to know the time it takes to get into NYC from a few different points. So i aggregated the distance and
time together. But of course, that meant some odd parsing to make it look nice. 

## To Test

### `yarn`

It should install everything you need.

### `cp public/config.sample.yml public/config.yml`

Copy the sample config and fill it in. 

### `vim /etc/chromium-browser/default` \# Add this to the chromium flags `--disable-session-crashed-bubble`

Fix the annoying chromium has crashed/restore browser sessions popup on reboot

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.


You may also run into issues where the screen locks up over a period of ~3 days. If this happens, try this fix:
https://github.com/raspberrypi/linux/issues/2810#issuecomment-456787673
```
sudo sysctl -w vm.dirty_ratio=10
sudo sysctl -w vm.dirty_background_ratio=5
sudo sysctl -p
```

## Pictures

![Image 1](pix/2020-04-08-011619_1280x800_scrot.png?raw=true)

![Image 2](pix/2020-04-08-011817_1280x800_scrot.png?raw=true)

![Image 3](pix/2020-04-08-012920_1280x800_scrot.png?raw=true)

