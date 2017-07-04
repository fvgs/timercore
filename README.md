# timercore :hourglass_flowing_sand:

[![npm](https://img.shields.io/npm/v/timercore.svg)](https://www.npmjs.com/package/timercore)
[![downloads](https://img.shields.io/npm/dt/timercore.svg)](https://www.npmjs.com/package/timercore)
![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
[![maintained](https://img.shields.io/badge/maintained-%E2%9C%94-brightgreen.svg)](https://github.com/fvgs/timercore)

> Robust, accurate, and precise timer library for Node.js

## Install

**npm**
```
npm install --save timercore
```

**yarn**
```
yarn add timercore
```

## Example

```javascript
const Timer = require ('timercore')

// The timer expects a non-negative integer argument
const seconds = 10
const timer = new Timer (seconds)

// A timer initialized with zero will not emit any events and starting or
// stopping the timer will have no effect

timer.on ('tick', (secondsRemaining) => {
	// The tick event is emitted every second

	// The total number of tick events is equal to the number of seconds used to
	// initialize the timer
})

timer.on ('beep', () => {
	// The beep event is emitted once, after the final tick event
})

// Start the timer
timer.start ()

// Start it again if you like; the start method is idempotent
timer.start ()

// Stop the timer
timer.stop ()

// Stop it again if you like; the stop method is also idempotent
timer.stop ()

// Resume the timer if it was previously stopped and has not yet finished
timer.start ()

// Starting or stopping a timer that has finished will have no effect

// When you are done with a timer and need another, just create a new one
const anotherTimer = new Timer (60)
```
