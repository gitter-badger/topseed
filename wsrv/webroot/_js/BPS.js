class BPS  { //testable pg services class for pg component com, ds/fetch, state machine and such. like RxJS, cycle.js

constructor() {
	this._pgBus= new Bacon.Bus() 	//loosely coupled
}

get pgBus() {
	return this._pgBus
}

init( ) {
	console.log('ps')
}

}//class

// for node:
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = BPS //node