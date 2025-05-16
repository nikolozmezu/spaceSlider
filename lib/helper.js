class Helper {
    constructor(tagName) {
        this.tmpElement = document.createElement(tagName);
    }
    addClass(...classNames) {
        classNames.forEach(name => {
            if (typeof name !== 'string') {
                throw new Error('All class names must be strings');
            }
            this.tmpElement.classList.add(name);
        });
        return this;
    }

    getElement() {
        return this.tmpElement;
    }

    static create(tagName, ...classNames) {
        return new Helper(tagName).addClass(...classNames).getElement();
    }
}


export default Helper