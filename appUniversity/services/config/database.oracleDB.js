module.exports = (app, appConfig) => {
    const oracleDB = require('oracledb');
    oracleDB.autoCommit = true;
    oracleDB.outFormat = oracleDB.OBJECT; // other option is 'oracleDB.ARRAY'
    oracleDB.fetchAsString = [oracleDB.CLOB];

    const CursorNumber = 100;
    const timeout = 10;
    const timeoutPromise = () => new Promise((i, reject) => setTimeout(() => reject(` - #${process.pid}: Timeout in ${timeout}s.`), 1000 * timeout));

    const objectFromEntries = arr => Object.assign({}, ...Array.from(arr, ([k, v]) => ({ [k]: v })));
    const transpose = m => m[0].map((x, i) => m.map(x => x[i]));
    const promiseAllObject = obj => new Promise(resolve => {
        const kvArray = transpose(Object.entries(obj));
        Promise.all(kvArray[1]).then(resolvedValues => resolve(objectFromEntries(transpose([kvArray[0], resolvedValues]))));
    });

    app.database.oracle = {
        BIND_INOUT: oracleDB.BIND_INOUT,
        BIND_IN: oracleDB.BIND_IN,
        BIND_OUT: oracleDB.BIND_OUT,
        CURSOR: oracleDB.CURSOR,
        NUMBER: oracleDB.NUMBER,
        STRING: oracleDB.STRING,
        DATE: oracleDB.DATE,

        connection: {},

        buildCondition: (mapper, condition, seperation, preParam = '') => {
            if (condition.statement && condition.parameter) {
                Object.keys(mapper).sort((a, b) => b.length - a.length).forEach(key => condition.statement = condition.statement.replaceAll(new RegExp('(?<!(:))' + key, 'g'), mapper[key]));
                let newCondition = {
                    statement: condition.statement,
                    parameter: {}
                };
                Object.keys(condition.parameter).sort((a, b) => b.length - a.length).forEach(key => {
                    let listVariable = '';
                    if (Array.isArray(condition.parameter[key])) {
                        for (let i = 0; i < condition.parameter[key].length; i++) {
                            listVariable += ':' + key + i + ' , ';
                            newCondition.parameter[key + i] = condition.parameter[key][i];
                        }
                        newCondition.statement = newCondition.statement.replaceAll('\\(:' + key + '\\)', '(' + listVariable.substring(listVariable.length - 3, 0) + ')');
                    } else {
                        newCondition.parameter[key] = condition.parameter[key];
                    }
                });
                return newCondition;
            } else {
                let statement = '', parameter = {};
                Object.keys(condition).forEach(field => {
                    if (mapper[field]) {
                        if (seperation == ', ' || condition[field] != null) {
                            statement += seperation + mapper[field] + '=:' + preParam + field;
                            parameter[preParam + field] = condition[field];
                        } else {
                            statement += seperation + mapper[field] + ' IS NULL';
                        }
                    } else if (field.toUpperCase() == 'ROWID') {
                        statement += seperation + 'ROWID=:' + preParam + 'row_Id';
                        parameter[preParam + 'row_Id'] = condition['rowId'];
                    }
                });
                return statement.length > 0 ? { statement: statement.substring(seperation.length), parameter } : {};
            }
        },

        parseSelectedColumns: (mapper, selectedColumns) => {
            if (selectedColumns == '*') selectedColumns = Object.keys(mapper).toString();
            let strColumns = '';
            selectedColumns.split(',').forEach(fieldName => {
                fieldName = fieldName.trim();
                strColumns += `, ${mapper[fieldName]} AS "${fieldName}"`;
            });
            return strColumns.length > 0 ? strColumns.substring(2) : '';
        },

        fetchRowsFromResultSet: (resultSet) => new Promise(resolve => {
            const list = [],
                fetchRow = rows => {
                    if (rows.length > 0) {
                        list.push(...rows);
                        resultSet.getRows(CursorNumber).then(fetchRow);
                    } else {
                        resolve(list);
                    }
                };
            resultSet ? resultSet.getRows(CursorNumber).then(fetchRow) : resolve([]);
        }),

        fetchRowsFromCursor: (error, result, done) => {
            if (error) {
                done(error);
            } else if (result && result.outBinds) {
                const fetchPromises = {};
                Object.keys(result.outBinds).forEach(key => {
                    if (result.outBinds[key] instanceof (oracleDB.ResultSet)) {
                        fetchPromises[key === 'ret' ? 'rows' : key] = app.database.oracle.fetchRowsFromResultSet(result.outBinds[key]);
                    } else {
                        fetchPromises[key] = result.outBinds[key];
                    }
                });
                promiseAllObject(fetchPromises).then(resolvedResult => done(null, resolvedResult));
            } else {
                done('The fetchRowsFromCursor has errors!');
            }
        },
    };

    const dbNames = appConfig.db ? Object.keys(appConfig.db) : [];
    const getConnection = (index = 0) => {
        if (index < dbNames.length) {
            const dbName = dbNames[index],
                db = appConfig.db[dbName];
            Promise.race([oracleDB.getConnection({
                connectString: `(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = ${db.host})(PORT = 1521)) (CONNECT_DATA = (SID = ${db.sid})) )`,
                user: db.username,
                password: db.password,
            }), timeoutPromise()]).then(connection => {
                if (connection) {
                    console.log(` - #${process.pid}: The Oracle connection ${db.username} succeeded.`);

                    app.database.oracle.connected = true;
                    app.database.oracle.connection[dbName] = connection;
                    app.database.oracle.connection[dbName].executeExtra = (sql, parameter, done) =>
                        connection.execute(sql, parameter, (error, result) => {
                            if (error) {
                                console.error(`${dbName} execute error - sql:`, sql, parameter);
                                console.error(`${dbName} execute error - error:`, error);
                            }

                            done && done(error, result);
                        });
                    app.database.oracle.connection[dbName].executeExtraSync = (sql, parameter) => new Promise((resolve, reject) => {
                        app.database.oracle.connection[dbName].executeExtra(sql, parameter, (error, result) => error ? reject(error) : resolve(result));
                    });
                }
                getConnection(index + 1);
            }).catch(error => {
                console.log(` - #${process.pid}: Could not connect to Oracle!`, error);
                process.exit(1);
            });
        }
    };
    getConnection();
};