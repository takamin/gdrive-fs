"use strict";
const debug = require("debug")("DOM");
debug("loading");
function DOM() {}
DOM.toName = name => name.replace(/[\s.#[\]<>]/g, "-");
DOM.createButton = (caption, attributes, clickHandler) => {
    if(attributes && attributes instanceof Function) {
        clickHandler = attributes;
        attributes = {};
    }
    attributes = attributes || {};
    attributes.type = "button";
    clickHandler = clickHandler || (()=>{});
    return DOM.createElement(
        "BUTTON", attributes, caption,
        { "click": clickHandler });
};

DOM.createElement = (tagName, attributes, contents, eventHandlers) => {
    attributes = attributes || {};
    contents = contents || [];
    eventHandlers = eventHandlers || {};

    const e = document.createElement(tagName);

    if("style" in attributes) {
        const styles = attributes["style"];
        for(const name of Object.keys(styles)) {
            e.style[name] = attributes.style[name];
        }
        delete attributes["style"];
    }
    for(const name of Object.keys(attributes)) {
        e.setAttribute(name, attributes[name]);
    }
    if(typeof(contents) === "string") {
        e.innerHTML = contents;
    } else {
        if(!Array.isArray(contents)) {
            contents = [ contents ];
        }
        for(const content of contents) {
            if(typeof(content) === "string") {
                e.appendChild(DOM.text(content));
            } else {
                e.appendChild(content);
            }
        }
    }
    for(const eventName of Object.keys(eventHandlers)) {
        e.addEventListener(eventName, eventHandlers[eventName]);
    }
    return e;
};

DOM.text = text => document.createTextNode(text);

DOM.disableButton = (button, disabled) => {
    if(disabled) {
        button.setAttribute("disabled", "disabled");
    } else {
        button.removeAttribute("disabled");
    }
};

DOM.append = (container, ...children) => {
    for(const child of children) {
        if(typeof(child) === "string") {
            if(child.startsWith("<")) {
                container.insertAdjacentHTML("beforeend", child);
            } else {
                container.appendChild(DOM.text(child));
            }
        } else {
            container.appendChild(child);
        }
    }
};

module.exports = DOM;
