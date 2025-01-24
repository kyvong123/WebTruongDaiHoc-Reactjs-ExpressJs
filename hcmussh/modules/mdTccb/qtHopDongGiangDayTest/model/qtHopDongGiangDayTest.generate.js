// Table name: QT_HOP_DONG_GIANG_DAY_TEST { ma, donViGiangDay, loaiHinhDaoTao, nguoiKy, ngayKyHopDong, maNgach, soHopDong, mauHopDong, cmnd, ngayCapCmnd, noiCapCmnd, trinhDoChuyenMon, hocHam, soHoChieu, ngayCapHoChieu, ngayHetHanHoChieu, soTheTamTru, ngayCapTheTamTru, ngayHetHanTheTamTru, soTaiKhoan, tenNganHang, chiNhanh, maSoThue, nguoiDuocThue, ngayTaiKy, noiCapTheTamTru, heSoChatLuong, loaiCanBo, tinhTrangThanhToan, namHoc, hocKy }
const keys = ['MA'];
const obj2Db = { 'ma': 'MA', 'donViGiangDay': 'DON_VI_GIANG_DAY', 'loaiHinhDaoTao': 'LOAI_HINH_DAO_TAO', 'nguoiKy': 'NGUOI_KY', 'ngayKyHopDong': 'NGAY_KY_HOP_DONG', 'maNgach': 'MA_NGACH', 'soHopDong': 'SO_HOP_DONG', 'mauHopDong': 'MAU_HOP_DONG', 'cmnd': 'CMND', 'ngayCapCmnd': 'NGAY_CAP_CMND', 'noiCapCmnd': 'NOI_CAP_CMND', 'trinhDoChuyenMon': 'TRINH_DO_CHUYEN_MON', 'hocHam': 'HOC_HAM', 'soHoChieu': 'SO_HO_CHIEU', 'ngayCapHoChieu': 'NGAY_CAP_HO_CHIEU', 'ngayHetHanHoChieu': 'NGAY_HET_HAN_HO_CHIEU', 'soTheTamTru': 'SO_THE_TAM_TRU', 'ngayCapTheTamTru': 'NGAY_CAP_THE_TAM_TRU', 'ngayHetHanTheTamTru': 'NGAY_HET_HAN_THE_TAM_TRU', 'soTaiKhoan': 'SO_TAI_KHOAN', 'tenNganHang': 'TEN_NGAN_HANG', 'chiNhanh': 'CHI_NHANH', 'maSoThue': 'MA_SO_THUE', 'nguoiDuocThue': 'NGUOI_DUOC_THUE', 'ngayTaiKy': 'NGAY_TAI_KY', 'noiCapTheTamTru': 'NOI_CAP_THE_TAM_TRU', 'heSoChatLuong': 'HE_SO_CHAT_LUONG', 'loaiCanBo': 'LOAI_CAN_BO', 'tinhTrangThanhToan': 'TINH_TRANG_THANH_TOAN', 'namHoc': 'NAM_HOC', 'hocKy': 'HOC_KY' };

module.exports = app => {
    const db = 'main';
    const tableName = 'QT_HOP_DONG_GIANG_DAY_TEST';
    const type = 'table';
    const schema = {
        MA: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        DON_VI_GIANG_DAY: {
            type: 'NUMBER',
            length: '20,0'
        },
        LOAI_HINH_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGUOI_KY: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_KY_HOP_DONG: {
            type: 'NUMBER',
            length: '20,0'
        },
        MA_NGACH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SO_HOP_DONG: {
            type: 'NVARCHAR2',
            length: '50'
        },
        MAU_HOP_DONG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CMND: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_CAP_CMND: {
            type: 'NUMBER',
            length: '20,0'
        },
        NOI_CAP_CMND: {
            type: 'NVARCHAR2',
            length: '200'
        },
        TRINH_DO_CHUYEN_MON: {
            type: 'NVARCHAR2',
            length: '200'
        },
        HOC_HAM: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SO_HO_CHIEU: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_CAP_HO_CHIEU: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_HET_HAN_HO_CHIEU: {
            type: 'NUMBER',
            length: '20,0'
        },
        SO_THE_TAM_TRU: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_CAP_THE_TAM_TRU: {
            type: 'NUMBER',
            length: '20,0'
        },
        NGAY_HET_HAN_THE_TAM_TRU: {
            type: 'NUMBER',
            length: '20,0'
        },
        SO_TAI_KHOAN: {
            type: 'NVARCHAR2',
            length: '20'
        },
        TEN_NGAN_HANG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CHI_NHANH: {
            type: 'NVARCHAR2',
            length: '20'
        },
        MA_SO_THUE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGUOI_DUOC_THUE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_TAI_KY: {
            type: 'NUMBER',
            length: '20,0'
        },
        NOI_CAP_THE_TAM_TRU: {
            type: 'NVARCHAR2',
            length: '200'
        },
        HE_SO_CHAT_LUONG: {
            type: 'NUMBER',
            length: '5,2'
        },
        LOAI_CAN_BO: {
            type: 'NVARCHAR2',
            length: '2'
        },
        TINH_TRANG_THANH_TOAN: {
            type: 'NUMBER',
            length: '3,0'
        },
        NAM_HOC: {
            type: 'NVARCHAR2',
            length: '20'
        },
        HOC_KY: {
            type: 'NVARCHAR2',
            length: '10'
        }
    };
    const methods = {
        'searchPage': 'QT_HOP_DONG_GIANG_DAY_TEST_SEARCH_PAGE',
        'hocPhanSearchPage': 'QT_HOP_DONG_GIANG_DAY_TEST_HOC_PHAN_SEARCH_PAGE',
        'download': 'QT_HOP_DONG_GIANG_DAY_TEST_DOWNLOAD',
        'hocPhanDownloadExcel': 'QT_HOP_DONG_GIANG_DAY_TEST_HOC_PHAN_DOWNLOAD_EXCEL',
        'downloadExcel': 'QT_HOP_DONG_GIANG_DAY_TEST_DOWNLOAD_EXCEL'
    };
    app.model.qtHopDongGiangDayTest = {
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
                const sql = 'INSERT INTO QT_HOP_DONG_GIANG_DAY_TEST (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtHopDongGiangDayTest.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM QT_HOP_DONG_GIANG_DAY_TEST' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM QT_HOP_DONG_GIANG_DAY_TEST' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM QT_HOP_DONG_GIANG_DAY_TEST' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT QT_HOP_DONG_GIANG_DAY_TEST.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM QT_HOP_DONG_GIANG_DAY_TEST' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE QT_HOP_DONG_GIANG_DAY_TEST SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.qtHopDongGiangDayTest.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM QT_HOP_DONG_GIANG_DAY_TEST' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM QT_HOP_DONG_GIANG_DAY_TEST' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        searchPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_giang_day_test_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        hocPhanSearchPage: (pagenumber, pagesize, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_giang_day_test_hoc_phan_search_page(:pagenumber, :pagesize, :filter, :totalitem, :pagetotal, :tongthanhtien, :tongkhautruthue, :tongthucnhan); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, tongthanhtien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, tongkhautruthue: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, tongthucnhan: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        download: (mahd, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_giang_day_test_download(:mahd); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mahd }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        hocPhanDownloadExcel: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_giang_day_test_hoc_phan_download_excel(:filter); END;',
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

        downloadExcel: (filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=qt_hop_dong_giang_day_test_download_excel(:filter, :searchterm); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, searchterm }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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