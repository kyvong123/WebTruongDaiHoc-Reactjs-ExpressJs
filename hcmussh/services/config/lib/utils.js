module.exports = app => {
    app.utils = {
        waiting: (timer = 1000) => new Promise(resolve => setTimeout(() => resolve(), timer)),

        stringify: (value, defaultValue = '') => {
            try {
                return JSON.stringify(value);
            } catch (exception) {
                return defaultValue;
            }
        },

        parse: (value, defaultValue = {}) => {
            try {
                return JSON.parse(value);
            } catch (exception) {
                return defaultValue;
            }
        },

        hashPassword: (password) => app.crypt.hashSync(password, app.crypt.genSaltSync(8), null),

        equalPassword: (password, encryptedPassword) => app.crypt.compareSync(password, encryptedPassword),

        toIsoString: (date) => {
            let tzo = -date.getTimezoneOffset(),
                dif = tzo >= 0 ? '+' : '-',
                pad = function (num) {
                    return (num < 10 ? '0' : '') + num;
                };

            return date.getFullYear() +
                '-' + pad(date.getMonth() + 1) +
                '-' + pad(date.getDate()) +
                'T' + pad(date.getHours()) +
                ':' + pad(date.getMinutes()) +
                ':' + pad(date.getSeconds()) +
                dif + pad(Math.floor(Math.abs(tzo) / 60)) +
                ':' + pad(Math.abs(tzo) % 60);
        },

        numberToVnText: (so) => {
            const doc1so = (so) => {
                let arr_chuhangdonvi = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
                let resualt = '';
                resualt = arr_chuhangdonvi[so];
                return resualt;
            };

            const doc2so = (so) => {
                so = so.replace(' ', '');
                let arr_chubinhthuong = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
                let arr_chuhangdonvi = ['mươi', 'mốt', 'hai', 'ba', 'bốn', 'lăm', 'sáu', 'bảy', 'tám', 'chín'];
                let arr_chuhangchuc = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
                let resualt = '';
                let sohangchuc = so.substr(0, 1);
                let sohangdonvi = so.substr(1, 1);
                resualt += arr_chuhangchuc[sohangchuc];
                if (sohangchuc == 1 && sohangdonvi == 1)
                    resualt += ' ' + arr_chubinhthuong[sohangdonvi];
                else if (sohangchuc == 1 && sohangdonvi > 1)
                    resualt += ' ' + arr_chuhangdonvi[sohangdonvi];
                else if (sohangchuc > 1 && sohangdonvi > 0)
                    resualt += ' ' + arr_chuhangdonvi[sohangdonvi];

                return resualt;
            };

            const doc3so = (so) => {
                let resualt = '';
                let arr_chubinhthuong = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
                let sohangtram = so.substr(0, 1);
                let sohangchuc = so.substr(1, 1);
                let sohangdonvi = so.substr(2, 1);
                resualt = arr_chubinhthuong[sohangtram] + ' trăm';
                if (sohangchuc == 0 && sohangdonvi != 0)
                    resualt += ' linh ' + arr_chubinhthuong[sohangdonvi];
                else if (sohangchuc != 0)
                    resualt += ' ' + doc2so(sohangchuc + ' ' + sohangdonvi);
                return resualt;
            };

            const docsonguyen = (so) => {
                let result = '';
                if (so != undefined) {
                    let arr_So = [{ ty: '' }, { trieu: '' }, { nghin: '' }, { tram: '' }];
                    let sochuso = so.length;
                    for (let i = (sochuso - 1); i >= 0; i--) {
                        if ((sochuso - i) <= 3) {
                            if (arr_So['tram'] != undefined)
                                arr_So['tram'] = so.substr(i, 1) + arr_So['tram'];
                            else arr_So['tram'] = so.substr(i, 1);

                        }
                        else if ((sochuso - i) > 3 && (sochuso - i) <= 6) {
                            if (arr_So['nghin'] != undefined)
                                arr_So['nghin'] = so.substr(i, 1) + arr_So['nghin'];
                            else arr_So['nghin'] = so.substr(i, 1);
                        }
                        else if ((sochuso - i) > 6 && (sochuso - i) <= 9) {
                            if (arr_So['trieu'] != undefined)
                                arr_So['trieu'] = so.substr(i, 1) + arr_So['trieu'];
                            else arr_So['trieu'] = so.substr(i, 1);
                        }
                        else {
                            if (arr_So.ty != undefined)
                                arr_So.ty = so.substr(i, 1) + arr_So.ty;
                            else arr_So.ty = so.substr(i, 1);
                        }
                    }

                    if (arr_So['ty'] > 0)
                        result += doc(arr_So['ty']) + ' tỷ';
                    if (arr_So['trieu'] > 0) {
                        if (arr_So['trieu'].length >= 3 || arr_So['ty'] > 0)
                            result += ' ' + doc3so(arr_So['trieu']) + ' triệu';
                        else if (arr_So['trieu'].length >= 2)
                            result += ' ' + doc2so(arr_So['trieu']) + ' triệu';
                        else result += ' ' + doc1so(arr_So['trieu']) + ' triệu';
                    }
                    if (arr_So['nghin'] > 0) {
                        if (arr_So['nghin'].length >= 3 || arr_So['trieu'] > 0)
                            result += ' ' + doc3so(arr_So['nghin']) + ' nghìn';
                        else if (arr_So['nghin'].length >= 2)
                            result += ' ' + doc2so(arr_So['nghin']) + ' nghìn';
                        else result += ' ' + doc1so(arr_So['nghin']) + ' nghìn';
                    }
                    if (arr_So['tram'] > 0) {
                        if (arr_So['tram'].length >= 3 || arr_So['nghin'] > 0)
                            result += ' ' + doc3so(arr_So['tram']);
                        else if (arr_So['tram'].length >= 2)
                            result += ' ' + doc2so(arr_So['tram']);
                        else result += ' ' + doc1so(arr_So['tram']);
                    }
                }
                return result;
            };

            const doc = (so) => {
                let kytuthapphan = ',';
                let result = '';
                if (so != undefined) {
                    so = ' ' + so + ' ';
                    so = so.trim();
                    let cautrucso = so.split(kytuthapphan);
                    if (cautrucso[0] != undefined) {
                        result += docsonguyen(cautrucso[0]);
                    }
                    if (cautrucso[1] != undefined) {
                        result += ' phẩy ' + docsonguyen(cautrucso[1]);
                    }
                }

                return result;
            };

            return doc(so);
        },

        arrayToChunk: (array, chunkSize = 10) => {
            const list = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                list.push(array.slice(i, i + chunkSize));
            }
            return list;
        },

        romanize: (num) => {
            if (isNaN(num))
                return NaN;
            let digits = String(+num).split(''),
                key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
                    '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
                    '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
                roman = '',
                i = 3;
            while (i--)
                roman = (key[+digits.pop() + (i * 10)] || '') + roman;
            return Array(+digits.join('') + 1).join('M') + roman;
        }
    };

    app.notification = {
        send: ({ toEmail = '', title = '', subTitle = '', icon = 'fa-commenting', iconColor = '#1488db', link = '', buttons = [], sendEmail = null }) => new Promise((resolve, reject) => {
            // Validate data
            if (!toEmail) return reject('The email to send notification is empty!');
            if (!app.email.validateEmail(toEmail)) return reject('The email to send notification is invalid!');
            if (!title) return reject('The title of notification is empty!');
            // Convert iconColor
            switch (iconColor) {
                case 'primary': {
                    iconColor = '#1488db';
                    break;
                }
                case 'secondary': {
                    iconColor = '#6c757d';
                    break;
                }
                case 'success': {
                    iconColor = '#28a745';
                    break;
                }
                case 'info': {
                    iconColor = '#17a2b8';
                    break;
                }
                case 'warning': {
                    iconColor = '#ffc107';
                    break;
                }
                case 'danger': {
                    iconColor = '#dc3545';
                    break;
                }
                case 'light': {
                    iconColor = '#f8f9fa';
                    break;
                }
                case 'dark': {
                    iconColor = '#343a40';
                    break;
                }
                default: break;
            }
            // Convert buttons
            if (!Array.isArray(buttons)) buttons = [buttons];
            try {
                buttons = JSON.stringify(buttons);
            } catch {
                buttons = '[]';
            }
            // Create notification item:
            const newNotification = { email: toEmail, title, subTitle, icon, iconColor, targetLink: link, buttonLink: buttons, sendTime: new Date().getTime() };
            app.model.fwNotification.create(newNotification, (error, item) => {
                if (error || !item) {
                    reject(error || 'System has error when creating new notification');
                } else {
                    // if (sendSocket) {
                    app.io.to(toEmail).emit('receive-notification', toEmail, item);
                    // }

                    if (sendEmail) {
                        sendEmail(() => resolve(item));
                    } else {
                        resolve(item);
                    }
                }
            });
        })
    };
};
