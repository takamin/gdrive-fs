"use strict";
const debug = require("debug")("GdfsEvent");
/**
 * Event class
 * @constructor
 * @param {HTMLElement} target An element that dispatch
 * @param {string} eventName An event name
 */
function GdfsEvent(target, eventName) {
    this._target = target;
    this._eventName = eventName;
}

/**
 * Listen this event.
 * @param {Function} handler An event handler
 * @returns {undefined}
 */
GdfsEvent.prototype.listen = function(handler) {
    debug(`GdfsEvent.listen: ${this._eventName}=>${handler.constructor.name}`);
    if(handler.constructor.name === "AsyncFunction") {
        this._target.addEventListener(
            this._eventName, async event => await handler(event));
    } else {
        this._target.addEventListener(
            this._eventName, handler);
    }
};

/**
 * Fire this event.
 * @param {Function} handler An event handler
 * @returns {undefined}
 */
GdfsEvent.prototype.fire = function(extraData = {}) {
    const event = new Event(this._eventName);
    for(const key of Object.keys(extraData)) {
        event[key] = extraData[key];
    }
    debug(
        `GdfsEvent.fire: ${this._eventName}`,
        `extraData: ${JSON.stringify(extraData)}`);
    this._target.dispatchEvent(event);
};

module.exports = GdfsEvent;
