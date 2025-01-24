// Table name: HCTH_SO_DANG_KY { id, soCongVan, soDi, loaiVanBan, donViGui, ngayTao, tuDong, suDung, ma, nguoiTao, namHanhChinh, capVanBan, soLui, idSoGoc, maQuySo }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'soCongVan': 'SO_CONG_VAN', 'soDi': 'SO_DI', 'loaiVanBan': 'LOAI_VAN_BAN', 'donViGui': 'DON_VI_GUI', 'ngayTao': 'NGAY_TAO', 'tuDong': 'TU_DONG', 'suDung': 'SU_DUNG', 'ma': 'MA', 'nguoiTao': 'NGUOI_TAO', 'namHanhChinh': 'NAM_HANH_CHINH', 'capVanBan': 'CAP_VAN_BAN', 'soLui': 'SO_LUI', 'idSoGoc': 'ID_SO_GOC', 'maQuySo': 'MA_QUY_SO' };

module.exports = app => {
    const db = 'main';
    const tableName = 'HCTH_SO_DANG_KY';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        SO_CONG_VAN: {
            type: 'NVARCHAR2',
            length: '200'
        },
        SO_DI: {
            type: 'NUMBER',
            length: '10,0'
        },
        LOAI_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        DON_VI_GUI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        NGAY_TAO: {
            type: 'NUMBER',
            length: '20,0'
        },
        TU_DONG: {
            type: 'NUMBER',
            length: '1,0'
        },
        SU_DUNG: {
            type: 'NUMBER',
            length: '1,0'
        },
        MA: {
            type: 'NUMBER',
            length: '22,0'
        },
        NGUOI_TAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NAM_HANH_CHINH: {
            type: 'NUMBER',
            length: '4,0'
        },
        CAP_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '16'
        },
        SO_LUI: {
            type: 'NUMBER',
            length: '20,0'
        },
        ID_SO_GOC: {
            type: 'NUMBER',
            length: '22,0'
        },
        MA_QUY_SO: {
            type: 'NVARCHAR2',
            length: '50'
        }
    };
    const methods = {
        'createSoVanBan': 'HCTH_SO_DANG_KY_CREATE_SO_VAN_BAN',
        'validateSoCongVan': 'HCTH_SO_DANG_KY_VALIDATE_SO_CONG_VAN',
        'searchPage': 'HCTH_SO_DANG_KY_SEARCH_PAGE',
        'createSoVanBanMain': 'HCTH_SO_DANG_KY_CREATE_SO_VAN_BAN_MAIN',
        'createSoLui': 'HCTH_SO_DANG_KY_CREATE_SO_LUI',
        'getRootSoLui': 'HCTH_SO_DANG_KY_GET_ROOT_SO_LUI',
        'zeroFill': 'HCTH_UTILS_ZERO_FILL_SO_VAN_BAN',
        'combineSoVanBan': 'HCTH_UTILS_COMBINE_SO_VAN_BAN',
        'newSearchPage': 'HCTH_SO_DANG_KY_NEW_SEARCH_PAGE',
        'export': 'HCTH_SO_VAN_BAN_EXPORT'
    };
    app.model.hcthSoDangKy = {
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
                const sql = 'INSERT INTO HCTH_SO_DANG_KY (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthSoDangKy.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM HCTH_SO_DANG_KY' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM HCTH_SO_DANG_KY' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM HCTH_SO_DANG_KY' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT HCTH_SO_DANG_KY.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM HCTH_SO_DANG_KY' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE HCTH_SO_DANG_KY SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthSoDangKy.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM HCTH_SO_DANG_KY' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM HCTH_SO_DANG_KY' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        createSoVanBan: (donvigui, capvanban, loaivanban, nam, tudong, ngaytao, nguoitao, sovanbanid, soluingay, ngaylui, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_dang_ky_create_so_van_ban(:donvigui, :capvanban, :loaivanban, :nam, :tudong, :ngaytao, :nguoitao, :sovanbanid, :soluingay, :ngaylui); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.STRING }, donvigui, capvanban, loaivanban, nam, tudong, ngaytao, nguoitao, sovanbanid, soluingay, ngaylui }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        validateSoCongVan: (sodangky, capvanban, donvigui, nam, quyso, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN hcth_so_dang_ky_validate_so_cong_van(:sodangky, :capvanban, :donvigui, :nam, :quyso); END;',
                { sodangky, capvanban, donvigui, nam, quyso }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        searchPage: (pagenumber, pagesize, tabvalue, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_dang_ky_search_page(:pagenumber, :pagesize, :tabvalue, :filter, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, tabvalue, filter, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        createSoVanBanMain: (donvigui, capvanban, loaivanban, nam, tudong, ngaytao, nguoitao, sovanbanid, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_dang_ky_create_so_van_ban_main(:donvigui, :capvanban, :loaivanban, :nam, :tudong, :ngaytao, :nguoitao, :sovanbanid); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.STRING }, donvigui, capvanban, loaivanban, nam, tudong, ngaytao, nguoitao, sovanbanid }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        createSoLui: (donvigui, capvanban, loaivanban, nam, tudong, ngaytao, nguoitao, sovanbanid, ngaylui, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_dang_ky_create_so_lui(:donvigui, :capvanban, :loaivanban, :nam, :tudong, :ngaytao, :nguoitao, :sovanbanid, :ngaylui); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.STRING }, donvigui, capvanban, loaivanban, nam, tudong, ngaytao, nguoitao, sovanbanid, ngaylui }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        getRootSoLui: (donvigui, capvanban, quyso, ngaylui, phancaptheocapvanban, phancaptheoloaivanban, nhomloaivanban, nhomordinal, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_dang_ky_get_root_so_lui(:donvigui, :capvanban, :quyso, :ngaylui, :phancaptheocapvanban, :phancaptheoloaivanban, :nhomloaivanban, :nhomordinal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.STRING }, donvigui, capvanban, quyso, ngaylui, phancaptheocapvanban, phancaptheoloaivanban, nhomloaivanban, nhomordinal }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        zeroFill: (sovanban, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_utils_zero_fill_so_van_ban(:sovanban); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.STRING }, sovanban }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        combineSoVanBan: (sovanban, maxsolui, postfix, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_utils_combine_so_van_ban(:sovanban, :maxsolui, :postfix); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.STRING }, sovanban, maxsolui, postfix }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        newSearchPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_dang_ky_new_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        export: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_so_van_ban_export(:filter); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),
    };
    return { db, tableName, type, schema, methods, keys };
};