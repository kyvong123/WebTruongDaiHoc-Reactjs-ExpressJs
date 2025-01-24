// Table name: HCTH_CONG_VAN_DEN { id, ngayNhan, donViGui, soCongVan, ngayCongVan, trichYeu, canBoNhan, ngayHetHan, quyenChiDao, chiDao, trangThai, soDen, nhacNho, nguoiTao, capNhatLuc, ngoaiNgu, loaiVanBan, donViChuTri, doKhanVanBan, theoDoiTienDo, vanBanCongKhai, isUrgent }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'ngayNhan': 'NGAY_NHAN', 'donViGui': 'DON_VI_GUI', 'soCongVan': 'SO_CONG_VAN', 'ngayCongVan': 'NGAY_CONG_VAN', 'trichYeu': 'TRICH_YEU', 'canBoNhan': 'CAN_BO_NHAN', 'ngayHetHan': 'NGAY_HET_HAN', 'quyenChiDao': 'QUYEN_CHI_DAO', 'chiDao': 'CHI_DAO', 'trangThai': 'TRANG_THAI', 'soDen': 'SO_DEN', 'nhacNho': 'NHAC_NHO', 'nguoiTao': 'NGUOI_TAO', 'capNhatLuc': 'CAP_NHAT_LUC', 'ngoaiNgu': 'NGOAI_NGU', 'loaiVanBan': 'LOAI_VAN_BAN', 'donViChuTri': 'DON_VI_CHU_TRI', 'doKhanVanBan': 'DO_KHAN_VAN_BAN', 'theoDoiTienDo': 'THEO_DOI_TIEN_DO', 'vanBanCongKhai': 'VAN_BAN_CONG_KHAI', 'isUrgent': 'IS_URGENT' };

module.exports = app => {
    const db = 'main';
    const tableName = 'HCTH_CONG_VAN_DEN';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        NGAY_NHAN: {
            type: 'NUMBER',
            length: '20,0'
        },
        DON_VI_GUI: {
            type: 'NUMBER',
            length: '22,0'
        },
        SO_CONG_VAN: {
            type: 'NVARCHAR2',
            length: '100'
        },
        NGAY_CONG_VAN: {
            type: 'NUMBER',
            length: '20,0'
        },
        TRICH_YEU: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        CAN_BO_NHAN: {
            type: 'NVARCHAR2',
            length: '2000'
        },
        NGAY_HET_HAN: {
            type: 'NUMBER',
            length: '20,0'
        },
        QUYEN_CHI_DAO: {
            type: 'NVARCHAR2',
            length: '2000',
            defaultValue: 'QSX7400068'
        },
        CHI_DAO: {
            type: 'NVARCHAR2',
            length: '255'
        },
        TRANG_THAI: {
            type: 'NUMBER',
            length: '5,0',
            defaultValue: '0'
        },
        SO_DEN: {
            type: 'NVARCHAR2',
            length: '32'
        },
        NHAC_NHO: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        NGUOI_TAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CAP_NHAT_LUC: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGOAI_NGU: {
            type: 'NVARCHAR2',
            length: '2'
        },
        LOAI_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        DON_VI_CHU_TRI: {
            type: 'NUMBER',
            length: '22,0'
        },
        DO_KHAN_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        THEO_DOI_TIEN_DO: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        VAN_BAN_CONG_KHAI: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        IS_URGENT: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        }
    };
    const methods = {
        'searchPage': 'HCTH_CONG_VAN_DEN_SEARCH_PAGE',
        'getNotification': 'HCTH_CONG_VAN_DEN_GET_NOTIFICATION',
        'getRelatedStaff': 'HCTH_CONG_VAN_DEN_GET_RELATED_STAFF',
        'getAuthorizedStaff': 'HCTH_CONG_VAN_DEN_GET_AUTHORIZED_STAFF',
        'searchSelector': 'HCTH_CONG_VAN_DEN_SEARCH_SELECTOR',
        'downloadExcel': 'HCTH_CONG_VAN_DEN_DOWNLOAD',
        'getFileHistory': 'HCTH_CONG_VAN_DEN_GET_FILE_HISTORY',
        'fileSignSearchPage': 'HCTH_VAN_BAN_DEN_FILE_SIGN_SEARCH_PAGE'
    };
    app.model.hcthCongVanDen = {
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
                const sql = 'INSERT INTO HCTH_CONG_VAN_DEN (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthCongVanDen.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM HCTH_CONG_VAN_DEN' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM HCTH_CONG_VAN_DEN' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM HCTH_CONG_VAN_DEN' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT HCTH_CONG_VAN_DEN.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM HCTH_CONG_VAN_DEN' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE HCTH_CONG_VAN_DEN SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthCongVanDen.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM HCTH_CONG_VAN_DEN' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM HCTH_CONG_VAN_DEN' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, donviguicv, listdonvi, macanbo, timetype, fromtime, totime, sortby, sorttype, shcccanbo, donvicanbo, stafftype, status, searchterm, requireprocessing, usershcc, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_search_page(:pagenumber, :pagesize, :donviguicv, :listdonvi, :macanbo, :timetype, :fromtime, :totime, :sortby, :sorttype, :shcccanbo, :donvicanbo, :stafftype, :status, :searchterm, :requireprocessing, :usershcc, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, donviguicv, listdonvi, macanbo, timetype, fromtime, totime, sortby, sorttype, shcccanbo, donvicanbo, stafftype, status, searchterm, requireprocessing, usershcc, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getNotification: (expiretime, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_get_notification(:expiretime); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, expiretime }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getRelatedStaff: (key, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_get_related_staff(:key); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, key }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getAuthorizedStaff: (done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_get_authorized_staff(); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchSelector: (pagenumber, pagesize, filterparam, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_search_selector(:pagenumber, :pagesize, :filterparam, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filterparam, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (donviguicv, listdonvi, macanbo, timetype, fromtime, totime, sortby, sorttype, shcccanbo, donvicanbo, stafftype, status, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_download(:donviguicv, :listdonvi, :macanbo, :timetype, :fromtime, :totime, :sortby, :sorttype, :shcccanbo, :donvicanbo, :stafftype, :status, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, donviguicv, listdonvi, macanbo, timetype, fromtime, totime, sortby, sorttype, shcccanbo, donvicanbo, stafftype, status, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getFileHistory: (fileid, loaivanban, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_den_get_file_history(:fileid, :loaivanban); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, fileid, loaivanban }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        fileSignSearchPage: (pagenumber, pagesize, searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_van_ban_den_file_sign_search_page(:pagenumber, :pagesize, :searchterm, :filter, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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