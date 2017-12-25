const EventEmitter = require ('events')

const Timer = require ('./index')
const {MILLISECOND} = require('./constants')

const {hrtime} = process

jest.useFakeTimers ()

describe ('constructor', () => {
	test ('Return an instance of Timer and EventEmitter', () => {
		const timer = new Timer (0)
		expect (timer) . toBeInstanceOf (Timer)
		expect (timer) . toBeInstanceOf (EventEmitter)
	})
})

describe ('start', () => {
	test ('Timer is started or finished', () => {
		const t1 = new Timer (0)
		t1.start ()
		expect (t1.isStarted || t1.isFinished) . toBe (true)

		const t2 = new Timer (10)
		t2.start ()
		expect (t2.isStarted || t2.isFinished) . toBe (true)
	})

	test ('Timer is started and timeout is active', () => {
		const timer = new Timer (10)
		timer.start ()
		expect (timer.isStarted) . toBe (true)
		expect (timer.currentTimeout) . toBeDefined ()
	})
})

describe ('timeout', () => {
	test ('Timeout is active', () => {
		const timer = new Timer (10)
		timer.start ()
		expect (timer.currentTimeout) . toBeDefined ()
	})

	test ('Emit tick', () => {
		let seconds = 3
		expect.assertions (seconds)
		const timer = new Timer (seconds)
		timer.on ('tick', (secondsRemaining) => {
			seconds -= 1
			expect (secondsRemaining) . toBe (seconds)
		})
		timer.start ()
		jest.runAllTimers ()
	})

	test ('Do not tick if instantiated with 0 seconds', () => {
		const timer = new Timer (0)
		const tick = jest.fn ()
		timer.on ('tick', tick)
		timer.start ()
		jest.runAllTimers ()
		expect (tick) . toHaveBeenCalledTimes (0)
	})

	test ('Emit beep', () => {
		const timer = new Timer (10)
		const beep = jest.fn ()
		timer.on ('beep', beep)
		timer.start ()
		jest.runAllTimers ()
		expect (beep) . toHaveBeenCalledTimes (1)
	})

	test ('Do not beep if instantiated with 0 seconds', () => {
		const timer = new Timer (0)
		const beep = jest.fn ()
		timer.on ('beep', beep)
		timer.start ()
		jest.runAllTimers ()
		expect (beep) . toHaveBeenCalledTimes (0)
	})

	test ('tick event listeners do not cause internal state corruption', () => {
		const timer = new Timer (10)
		const tick = jest.fn((secondsRemaining) => {
			if (secondsRemaining % 2 === 0 || secondsRemaining % 3 === 0) {
				timer.start ()
				timer.start ()
				timer.start ()
				timer.stop ()
				timer.stop ()
				timer.stop ()
				timer.start ()
				timer.start ()
				timer.stop ()
				timer.stop ()
				timer.start ()
				timer.start ()
				timer.start ()
			}
		})
		timer.on ('tick', tick)
		timer.start ()
		jest.runAllTimers ()
		expect (tick) . toHaveBeenCalledTimes (10)
	})

	test ('beep event listeners do not cause internal state corruption', () => {
		const timer = new Timer (10)
		const beep = jest.fn(() => {
			timer.start ()
			timer.start ()
			timer.stop ()
			timer.stop ()
			timer.stop ()
			timer.start ()
		})
		timer.on ('beep', beep)
		timer.start ()
		jest.runAllTimers ()
		expect (beep) . toHaveBeenCalledTimes (1)
	})
})

describe ('getTimeDiff', () => {
	test ('Time diff is accurate', () => {
		const seconds = 10
		const timer = new Timer (seconds)
		timer.start ()
		const startTime = hrtime ()

		jest.runAllTimers ()

		const timeDiff = timer.getTimeDiff ()
		const [actualSeconds, actualNanoseconds] = hrtime (startTime)
		const actualTimeDiff = actualSeconds + (actualNanoseconds / 1e9) - seconds

		const secondsPrecision = MILLISECOND
		const diff = Math.abs (actualTimeDiff - timeDiff)
		expect (diff) . toBeLessThanOrEqual (secondsPrecision)
	})
})

describe ('stop', () => {
	test ('Timer is stopped', () => {
		const timer = new Timer (1)
		expect (timer.isStarted) . toEqual (false)
		timer.stop ()
		expect (timer.isStarted) . toEqual (false)
		timer.start ()
		timer.stop ()
		expect (timer.isStarted) . toEqual (false)
	})
})
