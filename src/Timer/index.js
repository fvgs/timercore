const EventEmitter = require ('events')

const {hrtime} = process

const MILLISECONDS_PER_SECOND = 1000
const INTERVAL = 1

class Timer extends EventEmitter {
	constructor (seconds) {
		super ()

		this.secondsRemaining = seconds
		this.residual = 0
		this.isStarted = false
		this.startHrtime
		this.secondsSinceStart
		this.currentTimeout

		Object.defineProperty(
			this,
			'isFinished',
			{get: () => this.secondsRemaining <= 0},
		)
	}

	start () {
		if (this.isStarted || this.isFinished) return

		this.startHrtime = hrtime ()
		const interval = (INTERVAL - this.residual) * MILLISECONDS_PER_SECOND
		this.timeout (interval)
		this.isStarted = true
		this.secondsSinceStart = 0
	}

	timeout (interval) {
		this.currentTimeout = setTimeout (() => {
			this.updateResidual ()
			this.secondsSinceStart += INTERVAL
			const diff = this.getTimeDiff ()
			let nextInterval = INTERVAL - diff - this.residual
			nextInterval *= MILLISECONDS_PER_SECOND
			this.timeout (nextInterval)

			/**
			 * Because EventEmitter.emit calls registered listeners synchronously, it
			 * must be possible for any public API method to be callable from within a
			 * listener without corrupting the internal Timer state.
			 *
			 * For that reason, the 'tick' event is emitted after the above code
			 */
			this.secondsRemaining -= INTERVAL
			this.emit ('tick', this.secondsRemaining)
			if (this.isFinished) {
				this.stop ()
				this.emit ('beep')
			}
		}, interval)
	}

	updateResidual () {
		this.residual = Math.max (this.residual - INTERVAL, 0)
	}

	getTimeDiff () {
		const [seconds, nanoseconds] = hrtime (this.startHrtime)
		const actualSecondsSinceStart = seconds + (nanoseconds / 1e9)
		const diff = actualSecondsSinceStart - this.secondsSinceStart
		return diff
	}

	stop () {
		if (!this.isStarted) return

		clearTimeout (this.currentTimeout)
		this.currentTimeout = null
		this.isStarted = false
		this.residual += this.getTimeDiff ()
	}
}

module.exports = Timer
