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

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
