// Table name: TC_HOC_PHI_TRANSACTION { transId, transDate, customerId, billId, serviceId, amount, checksum, namHoc, hocKy, status, bank, ghiChu, originalCustomerId, khoanThu, invoiceId, thoiGianSoPhu, sessionInvoice, isAllowInvoice, loaiGiaoDich }
const keys = ['TRANS_ID'];
const obj2Db = { 'transId': 'TRANS_ID', 'transDate': 'TRANS_DATE', 'customerId': 'CUSTOMER_ID', 'billId': 'BILL_ID', 'serviceId': 'SERVICE_ID', 'amount': 'AMOUNT', 'checksum': 'CHECKSUM', 'namHoc': 'NAM_HOC', 'hocKy': 'HOC_KY', 'status': 'STATUS', 'bank': 'BANK', 'ghiChu': 'GHI_CHU', 'originalCustomerId': 'ORIGINAL_CUSTOMER_ID', 'khoanThu': 'KHOAN_THU', 'invoiceId': 'INVOICE_ID', 'thoiGianSoPhu': 'THOI_GIAN_SO_PHU', 'sessionInvoice': 'SESSION_INVOICE', 'isAllowInvoice': 'IS_ALLOW_INVOICE', 'loaiGiaoDich': 'LOAI_GIAO_DICH' };

module.exports = app => {
    const db = 'main';
    const tableName = 'TC_HOC_PHI_TRANSACTION';
    const type = 'table';
    const schema = {
        TRANS_ID: {
            type: 'NVARCHAR2',
            length: '50',
            primaryKey: true
        },
        TRANS_DATE: {
            type: 'NVARCHAR2',
            length: '20'
        },
        CUSTOMER_ID: {
            type: 'NVARCHAR2',
            length: '20'
        },
        BILL_ID: {
            type: 'NVARCHAR2',
            length: '20'
        },
        SERVICE_ID: {
            type: 'NVARCHAR2',
            length: '50'
        },
        AMOUNT: {
            type: 'NUMBER',
            length: '20,0'
        },
        CHECKSUM: {
            type: 'NVARCHAR2',
            length: '2000'
        },
        NAM_HOC: {
            type: 'NUMBER',
            length: '22,0'
        },
        HOC_KY: {
            type: 'NUMBER',
            length: '1,0'
        },
        STATUS: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        BANK: {
            type: 'NVARCHAR2',
            length: '20'
        },
        GHI_CHU: {
            type: 'NVARCHAR2',
            length: '256'
        },
        ORIGINAL_CUSTOMER_ID: {
            type: 'NVARCHAR2',
            length: '32'
        },
        KHOAN_THU: {
            type: 'NVARCHAR2',
            length: '2000'
        },
        INVOICE_ID: {
            type: 'NVARCHAR2',
            length: '200'
        },
        THOI_GIAN_SO_PHU: {
            type: 'NUMBER',
            length: '20,0'
        },
        SESSION_INVOICE: {
            type: 'NVARCHAR2',
            length: '30'
        },
        IS_ALLOW_INVOICE: {
            type: 'NUMBER',
            length: '1,0',
            defaultValue: '1'
        },
        LOAI_GIAO_DICH: {
            type: 'NVARCHAR2',
            length: '10'
        }
    };
    const methods = {
        'addBill': 'TC_HOC_PHI_TRANSACTION_ADD_BILL',
        'searchPage': 'TC_HOC_PHI_TRANSACTION_SEARCH_PAGE',
        'downloadPsc': 'TC_HOC_PHI_TRANSACTION_DOWNLOAD_PSC',
        'listBank': 'TC_HOC_PHI_TRANSACTION_LIST_BANK',
        'getStatistic': 'TC_HOC_PHI_TRANSACTION_GET_STATISTIC',
        'tachLoaiPhi': 'TC_HOC_PHI_TRANSACTION_TACH_LOAI_PHI',
        'getBankStatistic': 'TC_HOC_PHI_TRANSACTION_GET_BANK_STATISTIC',
        'excelCanTru': 'TC_HOC_PHI_TRANSACTION_EXCEL_CAN_TRU',
        'getList': 'TC_HOC_PHI_TRANSACTION_GET_LIST',
        'getHocPhiCanTru': 'TC_HOC_PHI_TRANSACTION_GET_HOC_PHI_CAN_TRU',
        'getThongKeExcel': 'TC_HOC_PHI_EXCEL_GIAO_DICH_THONG_KE',
        'getThongKeTuyenSinh': 'TC_HOC_PHI_TRANSACTION_THONG_KE_TUYEN_SINH',
        'getThongKeTuyenSinhNganh': 'TC_HOC_PHI_TRANSACTION_THONG_KE_TUYEN_SINH_NHOM_NGANH',
        'getSoLuongSv': 'TC_HOC_PHI_TRANSACTION_THONG_KE_TUYEN_SINH_COUNT_SV',
        'getCongNo': 'TC_HOC_PHI_TRANSACTION_GET_CONG_NO',
        'getCongNoBhyt': 'TC_HOC_PHI_TRANSACTION_GET_CONG_NO_BHYT'
    };
    app.model.tcHocPhiTransaction = {
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
                const sql = 'INSERT INTO TC_HOC_PHI_TRANSACTION (' + statement.substring(2) + ') VALUES (' + values.substring(2) + ')';
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tcHocPhiTransaction.get({ rowId: resultSet.lastRowid }).then(item => {
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT * FROM TC_HOC_PHI_TRANSACTION' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ') WHERE ROWNUM=1';
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
            const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM TC_HOC_PHI_TRANSACTION' + (condition.statement ? ' WHERE ' + condition.statement : '') + (orderBy ? ' ORDER BY ' + orderBy : '');
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
            const sqlCount = 'SELECT COUNT(*) FROM TC_HOC_PHI_TRANSACTION' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
                    const sql = 'SELECT ' + app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) + ' FROM (SELECT TC_HOC_PHI_TRANSACTION.*, ROW_NUMBER() OVER (ORDER BY ' + (orderBy ? orderBy : keys) + ') R FROM TC_HOC_PHI_TRANSACTION' + (condition.statement ? ' WHERE ' + condition.statement : '') + ') WHERE R BETWEEN ' + (leftIndex + 1) + ' and ' + (leftIndex + pageSize);
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
                const sql = 'UPDATE TC_HOC_PHI_TRANSACTION SET ' + changes.statement + (condition.statement ? ' WHERE ' + condition.statement : '');
                app.database.oracle.connection.main.executeExtra(sql, parameter, (error, resultSet) => {
                    if (error == null && resultSet && resultSet.lastRowid) {
                        app.model.tcHocPhiTransaction.get({ rowId: resultSet.lastRowid }).then(item => {
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
                const sql = 'DELETE FROM TC_HOC_PHI_TRANSACTION' + (condition.statement ? ' WHERE ' + condition.statement : '');
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
            const sql = 'SELECT COUNT(*) FROM TC_HOC_PHI_TRANSACTION' + (condition.statement ? ' WHERE ' + condition.statement : '');
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

        addBill: (namhoc, hocky, ebank, transid, transdate, customerid, billid, serviceid, eamount, echecksum, content, thoigiansophu, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_add_bill(:namhoc, :hocky, :ebank, :transid, :transdate, :customerid, :billid, :serviceid, :eamount, :echecksum, :content, :thoigiansophu); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, namhoc, hocky, ebank, transid, transdate, customerid, billid, serviceid, eamount, echecksum, content, thoigiansophu }, (error, result) => {
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
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_search_page(:pagenumber, :pagesize, :searchterm, :filter, :totalitem, :pagetotal, :totalmoney, :detailnganhang); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, pagenumber: { val: pagenumber, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, pagesize: { val: pagesize, dir: app.database.oracle.BIND_INOUT, type: app.database.oracle.NUMBER }, searchterm, filter, totalitem: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, pagetotal: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, totalmoney: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, detailnganhang: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        downloadPsc: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_download_psc(:filter); END;',
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

        listBank: (searchterm, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_list_bank(:searchterm); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, searchterm }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getStatistic: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_get_statistic(:filter, :tongsogiaodich); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, filter, tongsogiaodich: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER } }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        tachLoaiPhi: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_tach_loai_phi(:filter); END;',
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

        getBankStatistic: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_get_bank_statistic(:filter); END;',
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

        excelCanTru: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_excel_can_tru(:filter, :listloaiphi); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, listloaiphi: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getList: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_get_list(:filter); END;',
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

        getHocPhiCanTru: (imssv, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_get_hoc_phi_can_tru(:imssv); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, imssv }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getThongKeExcel: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_excel_giao_dich_thong_ke(:filter); END;',
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

        getThongKeTuyenSinh: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_thong_ke_tuyen_sinh(:filter, :listsinhvien, :listdetail, :listgiaodichsinhvien); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, listsinhvien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, listdetail: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, listgiaodichsinhvien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getThongKeTuyenSinhNganh: (filter, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_thong_ke_tuyen_sinh_nhom_nganh(:filter, :listsinhvien, :listdetail, :listgiaodichsinhvien); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, filter, listsinhvien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, listdetail: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, listgiaodichsinhvien: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR } }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getSoLuongSv: (namtuyensinh, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_thong_ke_tuyen_sinh_count_sv(:namtuyensinh); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.CURSOR }, namtuyensinh }, (error, result) => app.database.oracle.fetchRowsFromCursor(error, result, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                }));
        }),

        getCongNo: (imssv, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_get_cong_no(:imssv); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, imssv }, (error, result) => {
                    if (error) {
                        done && done(error);
                        reject(error);
                    } else {
                        done && done(null, result);
                        resolve(result);
                    }
                });
        }),

        getCongNoBhyt: (imssv, done) => new Promise((resolve, reject) => {
            app.database.oracle.connection.main.executeExtra('BEGIN :ret:=tc_hoc_phi_transaction_get_cong_no_bhyt(:imssv); END;',
                { ret: { dir: app.database.oracle.BIND_OUT, type: app.database.oracle.NUMBER }, imssv }, (error, result) => {
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