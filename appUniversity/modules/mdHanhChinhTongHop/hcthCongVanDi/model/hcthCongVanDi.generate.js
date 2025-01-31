// Table name: HCTH_CONG_VAN_DI { id, trichYeu, ngayGui, ngayKy, donViGui, loaiVanBan, trangThai, ngayTao, laySoTuDong, nguoiTao, ngoaiNgu, soDangKy, isPhysical, nguoiKy, capVanBan, isConverted, systemId, vanBanCongKhai, namHanhChinh, doKhanVanBan, donViSoanThao, vanBanChonDonVi }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'trichYeu': 'TRICH_YEU', 'ngayGui': 'NGAY_GUI', 'ngayKy': 'NGAY_KY', 'donViGui': 'DON_VI_GUI', 'loaiVanBan': 'LOAI_VAN_BAN', 'trangThai': 'TRANG_THAI', 'ngayTao': 'NGAY_TAO', 'laySoTuDong': 'LAY_SO_TU_DONG', 'nguoiTao': 'NGUOI_TAO', 'ngoaiNgu': 'NGOAI_NGU', 'soDangKy': 'SO_DANG_KY', 'isPhysical': 'IS_PHYSICAL', 'nguoiKy': 'NGUOI_KY', 'capVanBan': 'CAP_VAN_BAN', 'isConverted': 'IS_CONVERTED', 'systemId': 'SYSTEM_ID', 'vanBanCongKhai': 'VAN_BAN_CONG_KHAI', 'namHanhChinh': 'NAM_HANH_CHINH', 'doKhanVanBan': 'DO_KHAN_VAN_BAN', 'donViSoanThao': 'DON_VI_SOAN_THAO', 'vanBanChonDonVi': 'VAN_BAN_CHON_DON_VI' };

module.exports = app => {
    const db = 'main';
    const tableName = 'HCTH_CONG_VAN_DI';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        TRICH_YEU: {
            type: 'NVARCHAR2',
            length: '1000'
        },
        NGAY_GUI: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_KY: {
            type: 'NUMBER',
            length: '20,0'
        },
        DON_VI_GUI: {
            type: 'NVARCHAR2',
            length: '200'
        },
        LOAI_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '10'
        },
        TRANG_THAI: {
            type: 'NVARCHAR2',
            length: '20',
            defaultValue: 'NULL'
        },
        NGAY_TAO: {
            type: 'NUMBER',
            length: '20,0'
        },
        LAY_SO_TU_DONG: {
            type: 'NUMBER',
            length: '1,0'
        },
        NGUOI_TAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGOAI_NGU: {
            type: 'NVARCHAR2',
            length: '2'
        },
        SO_DANG_KY: {
            type: 'NUMBER',
            length: '22,0'
        },
        IS_PHYSICAL: {
            type: 'NUMBER',
            length: '1,0'
        },
        NGUOI_KY: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CAP_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '16'
        },
        IS_CONVERTED: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        SYSTEM_ID: {
            type: 'NUMBER',
            length: '22,0'
        },
        VAN_BAN_CONG_KHAI: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        },
        NAM_HANH_CHINH: {
            type: 'NUMBER',
            length: '4,0'
        },
        DO_KHAN_VAN_BAN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        DON_VI_SOAN_THAO: {
            type: 'NUMBER',
            length: '20,0'
        },
        VAN_BAN_CHON_DON_VI: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '0'
        }
    };
    const methods = {
        'searchPage': 'HCTH_CONG_VAN_DI_SEARCH_PAGE',
        'getAllPhanHoi': 'HCTH_CONG_VAN_DI_GET_ALL_PHAN_HOI',
        'getHcthStaff': 'HCTH_CONG_VAN_DI_GET_HCTH_STAFF',
        'searchSelector': 'HCTH_CONG_VAN_DI_SEARCH_SELECTOR',
        'downloadExcel': 'HCTH_CONG_VAN_DI_DOWNLOAD_EXCEL',
        'getSignStaff': 'HCTH_CONG_VAN_DI_GET_SIGN_STAFF',
        'validateSoCongVan': 'HCTH_CONG_VAN_DI_VALIDATE_SO_CONG_VAN',
        'dashboardGetData': 'HCTH_DASHBOARD_GET_DATA',
        'searchPageAlternate': 'HCTH_CONG_VAN_DI_SEARCH_PAGE_ALTERNATE',
        'getManageStaff': 'HCTH_CONG_VAN_DI_GET_MANAGE_STAFF',
        'searchTrinhKyPage': 'HCTH_VAN_BAN_TRINH_KY_SEARCH_PAGE',
        'getRelatedStaff': 'HCTH_CONG_VAN_DI_GET_RELATED_STAFF',
        'getUserInfo': 'HCTH_VAN_BAN_DI_GET_USER_INFO',
        'isDeletable': 'HCTH_VAN_BAN_DI_IS_DELETABLE'
    };
    app.model.hcthCongVanDi = {
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
                const sql = 'INSERT INTO HCTH_CONG_VAN_DI (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthCongVanDi.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT HCTH_CONG_VAN_DI.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE HCTH_CONG_VAN_DI SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.hcthCongVanDi.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM HCTH_CONG_VAN_DI' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, searchterm, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_search_page(:pagenumber, :pagesize, :searchterm, :filter, :totalitem, :pagetotal); END;',
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

        getAllPhanHoi: (idnhiemvu, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_get_all_phan_hoi(:idnhiemvu); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idnhiemvu }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getHcthStaff: (done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_get_hcth_staff(); END;',
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

        searchSelector: (pagenumber, pagesize, filterparam, scope, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_search_selector(:pagenumber, :pagesize, :filterparam, :scope, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filterparam, scope, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (filter, scope, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_download_excel(:filter, :scope, :searchterm, :totalitem); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, scope, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getSignStaff: (congvanid, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_get_sign_staff(:congvanid); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, congvanid }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        validateSoCongVan: (ma, donvigui, nam, trangthaimoi, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN hcth_cong_van_di_validate_so_cong_van(:ma, :donvigui, :nam, :trangthaimoi); END;',
                { ma, donvigui, nam, trangthaimoi }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        dashboardGetData: (timeselect, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_dashboard_get_data(:timeselect, :totalVanBanDen, :totalVanBanDi, :vanBanDenNam, :vanBanDiNam); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, timeselect, totalVanBanDen: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, totalVanBanDi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, vanBanDenNam: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, vanBanDiNam: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchPageAlternate: (pagenumber, pagesize, searchterm, scope, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_search_page_alternate(:pagenumber, :pagesize, :searchterm, :scope, :filter, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, scope, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getManageStaff: (donvi, nguoitao, role, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_get_manage_staff(:donvi, :nguoitao, :role); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, donvi, nguoitao, role }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchTrinhKyPage: (pagenumber, pagesize, shcccanbo, filterparam, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_van_ban_trinh_ky_search_page(:pagenumber, :pagesize, :shcccanbo, :filterparam, :searchterm, :totalitem, :pagetotal); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, shcccanbo, filterparam, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getRelatedStaff: (vanbanid, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_cong_van_di_get_related_staff(:vanbanid); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, vanbanid }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getUserInfo: (shcclist, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_van_ban_di_get_user_info(:shcclist); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, shcclist }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        isDeletable: (vanbanid, userpermission, usershcc, nguoitao, systemid, donvigui, userdepartments, trangthai, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=hcth_van_ban_di_is_deletable(:vanbanid, :userpermission, :usershcc, :nguoitao, :systemid, :donvigui, :userdepartments, :trangthai); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, vanbanid, userpermission, usershcc, nguoitao, systemid, donvigui, userdepartments, trangthai }, (error, result) => {
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