// Table name: HCTH_VAN_BAN_DI_STATUS_DETAIL { id, systemId, trangThai, backTo, forwardTo, signType, requireSign, recipientVisible, isEditable, canEditFile, isInitial, mailSubject, mailText, mailHtml, notificationSubject, notificationContent, notificationIcon, historyContent, isPartialEditable, allowSkip, skipWhenSigned, isDeletable, verifyFile }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'systemId': 'SYSTEM_ID', 'trangThai': 'TRANG_THAI', 'backTo': 'BACK_TO', 'forwardTo': 'FORWARD_TO', 'signType': 'SIGN_TYPE', 'requireSign': 'REQUIRE_SIGN', 'recipientVisible': 'RECIPIENT_VISIBLE', 'isEditable': 'IS_EDITABLE', 'canEditFile': 'CAN_EDIT_FILE', 'isInitial': 'IS_INITIAL', 'mailSubject': 'MAIL_SUBJECT', 'mailText': 'MAIL_TEXT', 'mailHtml': 'MAIL_HTML', 'notificationSubject': 'NOTIFICATION_SUBJECT', 'notificationContent': 'NOTIFICATION_CONTENT', 'notificationIcon': 'NOTIFICATION_ICON', 'historyContent': 'HISTORY_CONTENT', 'isPartialEditable': 'IS_PARTIAL_EDITABLE', 'allowSkip': 'ALLOW_SKIP', 'skipWhenSigned': 'SKIP_WHEN_SIGNED', 'isDeletable': 'IS_DELETABLE', 'verifyFile': 'VERIFY_FILE' };

module.exports = app => {
    const db = 'main';
    const tableName = 'HCTH_VAN_BAN_DI_STATUS_DETAIL';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        SYSTEM_ID: {
            type: 'NUMBER',
            length: '22,0'
        },
        TRANG_THAI: {
            type: 'NVARCHAR2',
            length: '20'
        },
        BACK_TO: {
            type: 'NVARCHAR2',
            length: '32'
        },
        FORWARD_TO: {
            type: 'NVARCHAR2',
            length: '32'
        },
        SIGN_TYPE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        REQUIRE_SIGN: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        RECIPIENT_VISIBLE: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_EDITABLE: {
            type: 'NUMBER',
            length: '1,0'
        },
        CAN_EDIT_FILE: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_INITIAL: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        MAIL_SUBJECT: {
            type: 'NVARCHAR2',
            length: '256'
        },
        MAIL_TEXT: {
            type: 'CLOB',
            length: '4000'
        },
        MAIL_HTML: {
            type: 'CLOB',
            length: '4000'
        },
        NOTIFICATION_SUBJECT: {
            type: 'NVARCHAR2',
            length: '128'
        },
        NOTIFICATION_CONTENT: {
            type: 'NVARCHAR2',
            length: '256'
        },
        NOTIFICATION_ICON: {
            type: 'NVARCHAR2',
            length: '32'
        },
        HISTORY_CONTENT: {
            type: 'NVARCHAR2',
            length: '512'
        },
        IS_PARTIAL_EDITABLE: {
            type: 'NUMBER',
            length: '1,0'
        },
        ALLOW_SKIP: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        SKIP_WHEN_SIGNED: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        IS_DELETABLE: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        VERIFY_FILE: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        }
    };
    const methods = {};
    app.model.hcthVanBanDiStatusDetail = {
        create: (data, done) => new Promise((resolve, reject) => {
            let statement = '', values = '', parameter = {};
            Object.keys(data).forEach(column => {
                if (obj2Db[column]) {
                    statement += ', ' + obj2Db[column];
                    values += ', :' + column;
                    parameter[column] = data[column];
                }
            });

            if (statement.length == 0) {
                done && done('Data is empty!');
                reject('Data is empty!');
            } else {
                const sql = 'INSERT INTO HCTH_VAN_BAN_DI_STATUS_DETAIL (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthVanBanDiStatusDetail.get({ rowId: resultSet.lastRowid }).then(item => {
                            done && done(null, item);
                            resolve(item);
                        }).catch(error => {
                            done && done(error);
                            reject(error);
                        });
                    } else {
                        done && done(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                        reject(error ? error : 'Execute SQL command fail! Sql = ' + sql);
                    }
                });
            }
        }),

        get: (condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM HCTH_VAN_BAN_DI_STATUS_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    const item = resultSet && resultSet.rows && resultSet.rows.length ? resultSet.rows[0] : null;
                    done && done(null, item);
                    resolve(item);
                }
            });
        }),

        getAll: (condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM HCTH_VAN_BAN_DI_STATUS_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    const items = resultSet && resultSet.rows ? resultSet.rows : [];
                    done && done(null, items);
                    resolve(items);
                }
            });
        }),

        getPage: (pageNumber, pageSize, condition, selectedColumns, orderBy, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
                selectedColumns = '*';
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
                selectedColumns = '*';
            } else if (selectedColumns && typeof selectedColumns == 'function') {
                done = selectedColumns;
                selectedColumns = '*';
            } else {
                selectedColumns = selectedColumns ? selectedColumns : '*';
            }

            if (orderBy) Object.keys(obj2Db).sort((a, b) => b.length - a.length).forEach(key => orderBy = orderBy.replaceAll(key, obj2Db[key]));
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
                parameter = condition.parameter ? condition.parameter : {};
            const sqlCount = 'SELECT COUNT(*) FROM HCTH_VAN_BAN_DI_STATUS_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sqlCount, parameter, (error, res) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    let result = {};
                    let totalItem = res && res.rows && res.rows[0] ? res.rows[0]['COUNT(*)'] : 0;
                    result = { totalItem, pageSize, pageTotal: Math.ceil(totalItem / pageSize) };
                    result.pageNumber = Math.max(1, Math.min(pageNumber, result.pageTotal));
                    leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT HCTH_VAN_BAN_DI_STATUS_DETAIL.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM HCTH_VAN_BAN_DI_STATUS_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
                    app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                        if (error) {
                            done && done(error);
                            reject(error);
                        } else {
                            result.list = resultSet && resultSet.rows ? resultSet.rows : [];
                            done && done(null, result);
                            resolve(result);
                        }
                    });
                }
            });
        }),

        update: (condition, changes, done) => new Promise((resolve, reject) => {
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            changes = app.database.oracle.buildCondition(obj2Db, changes, ', ', 'NEW_');

            if (Object.keys(condition).length == 0) {
                done && done('No condition!');
                reject('No condition!');
            } else if (changes.statement) {
                const parameter = app.clone(condition.parameter ? condition.parameter : {}, changes.parameter ? changes.parameter : {});
                const sql = 'UPDATE HCTH_VAN_BAN_DI_STATUS_DETAIL SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthVanBanDiStatusDetail.get({ rowId: resultSet.lastRowid }).then(item => {
                            done && done(null, item);
                            resolve(item);
                        }).catch(error => {
                            done && done(error);
                            reject(error);
                        });
                    } else {
                        done && done(error);
                        reject(error);
                    }
                });
            } else {
                done && done('No changes!');
                reject('No changes!');
            }
        }),

        delete: (condition, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');

            if (Object.keys(condition).length == 0) {
                done && done('No condition!');
                reject('No condition!');
            } else {
                const parameter = condition.parameter ? condition.parameter : {};
                const sql = 'DELETE FROM HCTH_VAN_BAN_DI_STATUS_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, error => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done();
                        resolve();
                    }
                });
            }
        }),

        count: (condition, done) => new Promise((resolve, reject) => {
            if (condition == undefined) {
                done = null;
                condition = {};
            } else if (typeof condition == 'function') {
                done = condition;
                condition = {};
            }
            condition = app.database.oracle.buildCondition(obj2Db, condition, ' AND ');
            const parameter = condition.parameter ? condition.parameter : {};
            const sql = 'SELECT COUNT(*) FROM HCTH_VAN_BAN_DI_STATUS_DETAIL' + (condition.statement ? ' WHERE ' + condition.statement : '');
            app.database.oracle.connection.main.executeExtra(sql, parameter, (error, result) => {
                if (error) {
                    done && done(error);
                    reject(error);
                } else {
                    done && done(null, result);
                    resolve(result);
                }
            });
        }),
    };
    return { db, tableName, type, schema, methods, keys };
};