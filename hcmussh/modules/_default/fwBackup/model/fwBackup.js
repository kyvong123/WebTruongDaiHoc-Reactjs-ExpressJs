module.exports = app => {
    app.model.fwBackup = {
        getAllTables: async (databaseName, database) => {
            try {
                const sql = `SELECT OBJECT_NAME FROM ALL_OBJECTS WHERE OBJECT_TYPE='TABLE' AND OWNER='${database.owner}'`;
                const resultSet = await app.database.oracle.connection[databaseName].executeExtraSync(sql, {});
                return (resultSet && resultSet.rows ? resultSet.rows : []).map(item => item.OBJECT_NAME);
            } catch (error) {
                return { error };
            }

        },
        backupTable: async (databaseName, tableName) => {
            try {
                const sql = `SELECT * FROM ${tableName}`;
                const resultSet = await app.database.oracle.connection[databaseName].executeExtraSync(sql, {});
                return resultSet && resultSet.rows ? resultSet.rows : [];
            } catch (error) {
                return { error };
            }
        },
        backupTablePage: async (databaseName, tableName, columnName, from, to) => {
            try {
                const sql = `SELECT * FROM (
                    SELECT 
                        ${tableName}.*, row_number() OVER (ORDER BY ${columnName}) R
                        FROM ${tableName}
                ) WHERE R BETWEEN ${from} AND ${to}`;
                const resultSet = await app.database.oracle.connection[databaseName].executeExtraSync(sql, {});
                return (resultSet?.rows || []).map(item => {
                    // eslint-disable-next-line no-unused-vars
                    const { R, ...data } = item;
                    return data;
                });
            } catch (error) {
                return { error };
            }
        },
        count: async (databaseName, tableName) => {
            try {
                const sql = `SELECT count(*) FROM ${tableName}`;
                const resultSet = await app.database.oracle.connection[databaseName].executeExtraSync(sql, {});
                return resultSet?.rows?.[0]?.['COUNT(*)'];
            } catch (error) {
                return { error };
            }
        },
        getColumn: async (database, databaseName, tableName) => {
            try {
                const sql = `SELECT * FROM all_tab_columns cols WHERE TABLE_NAME = '${tableName}' AND OWNER = '${database.owner}' AND NULLABLE = 'N' AND ROWNUM=1`;
                const resultSet = await app.database.oracle.connection[databaseName].executeExtraSync(sql, {});
                const column = resultSet?.rows?.[0]?.['COLUMN_NAME'];

                if (column) {
                    return column;
                } else {
                    const reSql = `SELECT * FROM all_tab_columns cols WHERE TABLE_NAME = '${tableName}' AND OWNER = '${database.owner}' AND ROWNUM=1`;
                    const reResultSet = await app.database.oracle.connection[databaseName].executeExtraSync(reSql, {});
                    return reResultSet?.rows?.[0]?.['COLUMN_NAME'];
                }
            } catch (error) {
                return { error };
            }
        },
    };
};