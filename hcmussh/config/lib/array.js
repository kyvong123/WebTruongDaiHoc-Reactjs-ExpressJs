module.exports = (app) => {

    Array.prototype.contains = function (pattern) {
        return pattern.reduce((result, item) => result && this.includes(item), true);
    };

    Array.prototype.removeByValue = function (value) {
        const index = this.indexOf(value);
        if (index >= 0) {
            this.splice(index, 1);
        }
    };

    Array.prototype.exists = function (pattern) {
        return pattern.some(item => this.includes(item));
    };

    Array.prototype.groupBy = function (key) {
        return this.reduce(
            (result, item) => ({
                ...result,
                [key && item[key]]: [
                    ...(result[item[key]] || []),
                    item,
                ],
            }),
            {},
        );
    };

    Array.prototype.sum = function () {
        return this.reduce((tot, curr) => tot + curr, 0);
    };

    Array.prototype.mapArrayToObject = function (key) {
        let arr = this;
        arr = arr.reduce((map, obj) => {
            map[obj[key]] = obj;
            return map;
        }, {});
        return arr;
    };

    Array.prototype.popByValue = function (value) {
        let arr = this.map(item => item.toString());
        let idx = arr.indexOf(value.toString());
        if (idx >= 0) {
            this.splice(idx, 1);
        }
        return this;
    };

    Array.prototype.sample = function () {
        return this[Math.floor(Math.random() * this.length)];
    };

    Array.prototype.intersect = function (other, compare = (a, b) => a == b) {
        return this.filter(itemA => other.some(itemB => compare(itemA, itemB)));
    };

    Array.prototype.difference = function (other, compare = (a, b) => a == b) {
        return this.filter(itemA => !other.some(itemB => compare(itemA, itemB)));
    };

    Array.prototype.chunk = function (size) {
        let chunk = [];
        for (let i = 0, j = 0; i < this.length; i += size, j++) {
            chunk[j] = this.slice(i, i + size);
        }
        return chunk;
    };

    app.arrayFunc = {
        clearData: (...arrays) => {
            for (let array of arrays) {
                if (Array.isArray(array)) {
                    array.length = 0;
                } else array = {};
            }
        }
    };
};