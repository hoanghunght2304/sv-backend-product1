/* eslint-disable no-useless-escape */

/**
 * Replace string to - character
 * @public
 */
exports.replaceText = (text) => text.replace(/\s/g, '-').replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, '-');
