// Table name: DT_THOI_KHOA_BIEU { id, maMonHoc, nhom, hocKy, thu, phong, ngayBatDau, giangVien, namHoc, tietBatDau, soTietBuoi, khoaDangKy, soLuongDuKien, sucChua, buoi, loaiMonHoc, isMo, soBuoiTuan, soTietLyThuyet, soTietThucHanh, ngayKetThuc, loaiHinhDaoTao, bacDaoTao, khoaSinhVien, userModified, lastModified, coSo, maHocPhan, tinhTrang, semester, tinhTrangDiem, tuanBatDau, soTuan, isTrung, isOnlyKhoa }
const keys = ['ID'];
const obj2Db = { 'id': 'ID', 'maMonHoc': 'MA_MON_HOC', 'nhom': 'NHOM', 'hocKy': 'HOC_KY', 'thu': 'THU', 'phong': 'PHONG', 'ngayBatDau': 'NGAY_BAT_DAU', 'giangVien': 'GIANG_VIEN', 'namHoc': 'NAM_HOC', 'tietBatDau': 'TIET_BAT_DAU', 'soTietBuoi': 'SO_TIET_BUOI', 'khoaDangKy': 'KHOA_DANG_KY', 'soLuongDuKien': 'SO_LUONG_DU_KIEN', 'sucChua': 'SUC_CHUA', 'buoi': 'BUOI', 'loaiMonHoc': 'LOAI_MON_HOC', 'isMo': 'IS_MO', 'soBuoiTuan': 'SO_BUOI_TUAN', 'soTietLyThuyet': 'SO_TIET_LY_THUYET', 'soTietThucHanh': 'SO_TIET_THUC_HANH', 'ngayKetThuc': 'NGAY_KET_THUC', 'loaiHinhDaoTao': 'LOAI_HINH_DAO_TAO', 'bacDaoTao': 'BAC_DAO_TAO', 'khoaSinhVien': 'KHOA_SINH_VIEN', 'userModified': 'USER_MODIFIED', 'lastModified': 'LAST_MODIFIED', 'coSo': 'CO_SO', 'maHocPhan': 'MA_HOC_PHAN', 'tinhTrang': 'TINH_TRANG', 'semester': 'SEMESTER', 'tinhTrangDiem': 'TINH_TRANG_DIEM', 'tuanBatDau': 'TUAN_BAT_DAU', 'soTuan': 'SO_TUAN', 'isTrung': 'IS_TRUNG', 'isOnlyKhoa': 'IS_ONLY_KHOA' };

module.exports = app => {
    const db = 'main';
    const tableName = 'DT_THOI_KHOA_BIEU';
    const type = 'table';
    const schema = {
        ID: {
            type: 'NUMBER',
            length: '22,0',
            autoIncrement: true,
            primaryKey: true
        },
        MA_MON_HOC: {
            type: 'NVARCHAR2',
            length: '20',
            allowNull: false
        },
        NHOM: {
            type: 'NUMBER',
            length: '22,0',
            allowNull: false,
            defaultValue: 'null'
        },
        HOC_KY: {
            type: 'NUMBER',
            length: '1,0',
            allowNull: false
        },
        THU: {
            type: 'NUMBER',
            length: '10,0'
        },
        PHONG: {
            type: 'NVARCHAR2',
            length: '20'
        },
        NGAY_BAT_DAU: {
            type: 'NUMBER',
            length: '20,0'
        },
        GIANG_VIEN: {
            type: 'NVARCHAR2',
            length: '500'
        },
        NAM_HOC: {
            type: 'NVARCHAR2',
            length: '11'
        },
        TIET_BAT_DAU: {
            type: 'NUMBER',
            length: '2,0'
        },
        SO_TIET_BUOI: {
            type: 'NUMBER',
            length: '3,0'
        },
        KHOA_DANG_KY: {
            type: 'NUMBER',
            length: '22,0'
        },
        SO_LUONG_DU_KIEN: {
            type: 'NUMBER',
            length: '4,0'
        },
        SUC_CHUA: {
            type: 'NUMBER',
            length: '5,0'
        },
        BUOI: {
            type: 'NUMBER',
            length: '2,0'
        },
        LOAI_MON_HOC: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_MO: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        SO_BUOI_TUAN: {
            type: 'NUMBER',
            length: '1,0'
        },
        SO_TIET_LY_THUYET: {
            type: 'NUMBER',
            length: '3,0'
        },
        SO_TIET_THUC_HANH: {
            type: 'NUMBER',
            length: '3,0'
        },
        NGAY_KET_THUC: {
            type: 'NUMBER',
            length: '20,0'
        },
        LOAI_HINH_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '10'
        },
        BAC_DAO_TAO: {
            type: 'NVARCHAR2',
            length: '5'
        },
        KHOA_SINH_VIEN: {
            type: 'NUMBER',
            length: '4,0'
        },
        USER_MODIFIED: {
            type: 'NVARCHAR2',
            length: '70'
        },
        LAST_MODIFIED: {
            type: 'NUMBER',
            length: '20,0'
        },
        CO_SO: {
            type: 'NUMBER',
            length: '22,0'
        },
        MA_HOC_PHAN: {
            type: 'NVARCHAR2',
            length: '30'
        },
        TINH_TRANG: {
            type: 'NUMBER',
            length: '22,0'
        },
        SEMESTER: {
            type: 'NUMBER',
            length: '22,0'
        },
        TINH_TRANG_DIEM: {
            type: 'NUMBER',
            length: '10,0'
        },
        TUAN_BAT_DAU: {
            type: 'NUMBER',
            length: '10,0'
        },
        SO_TUAN: {
            type: 'NUMBER',
            length: '5,0'
        },
        IS_TRUNG: {
            type: 'NUMBER',
            length: '1,0'
        },
        IS_ONLY_KHOA: {
            type: 'NUMBER',
            length: '1,0'
        }
    };
    const methods = {
        'searchPage': 'DT_THOI_KHOA_BIEU_SEARCH_PAGE',
        'getCalendar': 'DT_CALENDAR',
        'downloadExcel': 'DT_THOI_KHOA_BIEU_DOWNLOAD_EXCEL',
        'getFree': 'DT_THOI_KHOA_BIEU_GET_FREE',
        'getScheduleGiangVien': 'DT_THOI_KHOA_BIEU_GIANG_VIEN_GET_SCHEDULE',
        'getAllLop': 'DT_THOI_KHOA_BIEU_GET_ALL_LOP',
        'getData': 'DT_THOI_KHOA_BIEU_GET_DATA',
        'searchSchedule': 'DT_THOI_KHOA_BIEU_SEARCH_SCHEDULE',
        'searchScheduleAll': 'DT_THOI_KHOA_BIEU_SEARCH_SCHEDULE_ALL',
        'exportData': 'DT_THOI_KHOA_BIEU_EXPORT',
        'getStudent': 'DT_THOI_KHOA_BIEU_GET_STUDENT',
        'getLichNghiBuSV': 'DT_THOI_KHOA_BIEU_LICH_NGHI_BU_SV',
        'thongKeSearchPage': 'DT_THOI_KHOA_BIEU_THONG_KE_SEARCH_PAGE',
        'getInfo': 'DT_THOI_KHOA_BIEU_GET_INFO',
        'getListGen': 'DT_THOI_KHOA_BIEU_GET_LIST_GEN',
        'getStatusGen': 'DT_THOI_KHOA_BIEU_GET_STATUS_GEN'
    };
    app.model.dtThoiKhoaBieu = {
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
                const sql = 'INSERT INTO DT_THOI_KHOA_BIEU (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtThoiKhoaBieu.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM DT_THOI_KHOA_BIEU' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM DT_THOI_KHOA_BIEU' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM DT_THOI_KHOA_BIEU' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT DT_THOI_KHOA_BIEU.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM DT_THOI_KHOA_BIEU' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE DT_THOI_KHOA_BIEU SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.dtThoiKhoaBieu.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM DT_THOI_KHOA_BIEU' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM DT_THOI_KHOA_BIEU' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal, :thoigianphancong); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, filter, searchterm, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, thoigianphancong: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getCalendar: (room, idnam, hocky, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_calendar(:room, :idnam, :hocky); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, room, idnam, hocky }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadExcel: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_download_excel(:filter); END;',
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

        getFree: (config, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_free(:config, :hocphantheoidnganh, :hocphandaxep, :currentstatusroom); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, config, hocphantheoidnganh: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, hocphandaxep: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, currentstatusroom: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getScheduleGiangVien: (idtkb, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_giang_vien_get_schedule(:idtkb); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idtkb }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getAllLop: (config, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_all_lop(:config); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, config }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getData: (mahocphan, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_data(:mahocphan, :datacahoc, :datateacher, :datangayle); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mahocphan, datacahoc: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, datateacher: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, datangayle: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchSchedule: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_search_schedule(:filter, :datathi, :dataevent); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, datathi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, dataevent: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        searchScheduleAll: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_search_schedule_all(:filter, :datathi, :dataevent); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, datathi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, dataevent: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        exportData: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_export(:filter); END;',
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

        getStudent: (idhocphan, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_student(:idhocphan, :filter); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, idhocphan, filter }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getLichNghiBuSV: (masinhvien, filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_lich_nghi_bu_sv(:masinhvien, :filter, :datangaynghi); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, masinhvien, filter, datangaynghi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        thongKeSearchPage: (pagenumber, pagesize, filter, searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_thong_ke_search_page(:pagenumber, :pagesize, :filter, :searchterm, :totalitem, :pagetotal); END;',
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

        getInfo: (mahocphan, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_info(:mahocphan); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, mahocphan }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getListGen: (config, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_list_gen(:config); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, config }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getStatusGen: (config, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=dt_thoi_khoa_bieu_get_status_gen(:config, :lichtuan, :lichsukien); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, config, lichtuan: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, lichsukien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
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