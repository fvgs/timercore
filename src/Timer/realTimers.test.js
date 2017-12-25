const Timer = require ('./index')

const {MILLISECOND, MILLISECONDS_PER_SECOND} = require('./constants')

const {hrtime} = process

describe ('Timer', () => {
	test ('Ticks are precise', async () => {
		const msPrecision = 9
		const initialSeconds = 4
		const timer = new Timer (initialSeconds)
		let tick
		let startHrtime

		await new Promise ((resolve, reject) => {
			tick = jest.fn ((secondsRemaining) => {
				const [
					realElapsedSeconds,
					realElapsedNanoseconds,
				] = hrtime (startHrtime)
				const realElapsedms = (realElapsedSeconds * 1e3) +
					(realElapsedNanoseconds / 1e6)
				const timerElapsedms = (initialSeconds - secondsRemaining) * 1e3
				const diff = Math.abs (timerElapsedms - realElapsedms)
				try {
					expect (diff) . toBeLessThanOrEqual (msPrecision)
				} catch (err) {
					reject (err)
				}
				if (secondsRemaining === 0) resolve ()
			})
			timer.on ('tick', tick)

			timer.start ()
			startHrtime = hrtime ()
		})

		expect (tick) . toHaveBeenCalledTimes (initialSeconds)
	})

	test ('Beep is precise', async () => {
		const msPrecision = 9
		const initialSeconds = 4
		const timer = new Timer (initialSeconds)
		let beep
		let startHrtime

		await new Promise ((resolve, reject) => {
			beep = jest.fn (() => {
				const [
					realElapsedSeconds,
					realElapsedNanoseconds,
				] = hrtime (startHrtime)
				const realElapsedms = (realElapsedSeconds * 1e3) +
					(realElapsedNanoseconds / 1e6)
				const initialms = initialSeconds * 1e3
				const diff = Math.abs (initialms - realElapsedms)
				try {
					expect (diff) . toBeLessThanOrEqual (msPrecision)
				} catch (err) {
					reject (err)
				}
				resolve ()
			})
			timer.on ('beep', beep)

			timer.start ()
			startHrtime = hrtime ()
		})

		expect (beep) . toHaveBeenCalledTimes (1)
	})
})

describe.only('getTimeDiff', () => {
	const seconds = 4
	const milliseconds = seconds * MILLISECONDS_PER_SECOND

	test('Time diff is non-negative', () =>
		Promise.all(Array.from({length: milliseconds}, (_, i) =>
			new Promise((resolve, reject) => {
				const timer = new Timer(seconds)
				const realGetTimeDiff = timer.getTimeDiff

				const mockGetTimeDiff = jest.fn(() => {
					const val = realGetTimeDiff.call(timer)

					try {
						expect(val + MILLISECOND).toBeGreaterThanOrEqual(0)
					} catch (error) {
						reject(error)
					}

					return val
				})

				timer.getTimeDiff = mockGetTimeDiff

				timer.on('beep', () => {
					try {
						expect(mockGetTimeDiff).toHaveBeenCalled()
					} catch (error) {
						reject(error)
					}

					resolve()
				})

				timer.start()

				setTimeout(
					() => {
						timer.stop()
						timer.start()
					},
					i,
				)
			})
		))
	)
})
