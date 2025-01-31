// Table name: TC_TNCN_QUYET_TOAN_THUE_TRANSACTION { customerId, amount, status, thoiGianSoPhu, serviceId, billId, checksum, ghiChu, bank, nam, transId, transDate }
const keys = ["TRANS_ID"];
const obj2Db = {
  customerId: "CUSTOMER_ID",
  amount: "AMOUNT",
  status: "STATUS",
  thoiGianSoPhu: "THOI_GIAN_SO_PHU",
  serviceId: "SERVICE_ID",
  billId: "BILL_ID",
  checksum: "CHECKSUM",
  ghiChu: "GHI_CHU",
  bank: "BANK",
  nam: "NAM",
  transId: "TRANS_ID",
  transDate: "TRANS_DATE",
};

module.exports = (app) => {
  const db = "main";
  const tableName = "TC_TNCN_QUYET_TOAN_THUE_TRANSACTION";
  const type = "table";
  const schema = {
    CUSTOMER_ID: {
      type: "NVARCHAR2",
      length: "20",
    },
    AMOUNT: {
      type: "NUMBER",
      length: "20,0",
    },
    STATUS: {
      type: "NUMBER",
      length: "1,0",
      defaultValue: "1",
    },
    THOI_GIAN_SO_PHU: {
      type: "NUMBER",
      length: "20,0",
      allowNull: false,
    },
    SERVICE_ID: {
      type: "NVARCHAR2",
      length: "50",
    },
    BILL_ID: {
      type: "NVARCHAR2",
      length: "500",
    },
    CHECKSUM: {
      type: "NVARCHAR2",
      length: "2000",
    },
    GHI_CHU: {
      type: "NVARCHAR2",
      length: "256",
    },
    BANK: {
      type: "NVARCHAR2",
      length: "20",
    },
    NAM: {
      type: "NUMBER",
      length: "4,0",
    },
    TRANS_ID: {
      type: "NVARCHAR2",
      length: "2000",
      primaryKey: true,
    },
    TRANS_DATE: {
      type: "NUMBER",
      length: "20,0",
    },
    TINH_TRANG_THANH_TOAN: {
      type: "NUMBER",
      length: "3,0",
    },
  };
  const methods = {
    searchPage: "TC_QUYET_TOAN_THUE_TRANSACTION_SEARCH_PAGE",
  };
  app.model.tcTncnQuyetToanThueTransaction = {
    create: (data, done) =>
      new Promise((resolve, reject) => {
        let statement = "",
          values = "",
          parameter = {};
        Object.keys(data).forEach((column) => {
          if (obj2Db[column]) {
            statement += ", " + obj2Db[column];
            values += ", :" + column;
            parameter[column] = data[column];
          }
        });

        if (statement.length == 0) {
          done && done("Data is empty!");
          reject("Data is empty!");
        } else {
          const sql =
            "INSERT INTO TC_TNCN_QUYET_TOAN_THUE_TRANSACTION (" +
            statement.substring(2) +
            ") VALUES (" +
            values.substring(2) +
            ")";
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error, resultSet) => {
              if (error == null && resultSet && resultSet.lastRowid) {
                app.model.tcTncnQuyetToanThueTransaction
                  .get({ rowId: resultSet.lastRowid })
                  .then((item) => {
                    done && done(null, item);
                    resolve(item);
                  })
                  .catch((error) => {
                    done && done(error);
                    reject(error);
                  });
              } else {
                done &&
                  done(
                    error ? error : "Execute SQL command fail! Sql = " + sql
                  );
                reject(
                  error ? error : "Execute SQL command fail! Sql = " + sql
                );
              }
            }
          );
        }
      }),

    get: (condition, selectedColumns, orderBy, done) =>
      new Promise((resolve, reject) => {
        if (condition == undefined) {
          done = null;
          condition = {};
          selectedColumns = "*";
        } else if (typeof condition == "function") {
          done = condition;
          condition = {};
          selectedColumns = "*";
        } else if (selectedColumns && typeof selectedColumns == "function") {
          done = selectedColumns;
          selectedColumns = "*";
        } else {
          selectedColumns = selectedColumns ? selectedColumns : "*";
        }

        if (orderBy)
          Object.keys(obj2Db)
            .sort((a, b) => b.length - a.length)
            .forEach((key) => (orderBy = orderBy.replaceAll(key, obj2Db[key])));
        condition = app.database.oracle.buildCondition(
          obj2Db,
          condition,
          " AND "
        );
        const parameter = condition.parameter ? condition.parameter : {};
        const sql =
          "SELECT " +
          app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) +
          " FROM (SELECT * FROM TC_TNCN_QUYET_TOAN_THUE_TRANSACTION" +
          (condition.statement ? " WHERE " + condition.statement : "") +
          (orderBy ? " ORDER BY " + orderBy : "") +
          ") WHERE ROWNUM=1";
        app.database.oracle.connection.main.executeExtra(
          sql,
          parameter,
          (error, resultSet) => {
            if (error) {
              done && done(error);
              reject(error);
            } else {
              const item =
                resultSet && resultSet.rows && resultSet.rows.length
                  ? resultSet.rows[0]
                  : null;
              done && done(null, item);
              resolve(item);
            }
          }
        );
      }),

    getAll: (condition, selectedColumns, orderBy, done) =>
      new Promise((resolve, reject) => {
        if (condition == undefined) {
          done = null;
          condition = {};
          selectedColumns = "*";
        } else if (typeof condition == "function") {
          done = condition;
          condition = {};
          selectedColumns = "*";
        } else if (selectedColumns && typeof selectedColumns == "function") {
          done = selectedColumns;
          selectedColumns = "*";
        } else {
          selectedColumns = selectedColumns ? selectedColumns : "*";
        }

        if (orderBy)
          Object.keys(obj2Db)
            .sort((a, b) => b.length - a.length)
            .forEach((key) => (orderBy = orderBy.replaceAll(key, obj2Db[key])));
        condition = app.database.oracle.buildCondition(
          obj2Db,
          condition,
          " AND "
        );
        const parameter = condition.parameter ? condition.parameter : {};
        const sql =
          "SELECT " +
          app.database.oracle.parseSelectedColumns(obj2Db, selectedColumns) +
          " FROM TC_TNCN_QUYET_TOAN_THUE_TRANSACTION" +
          (condition.statement ? " WHERE " + condition.statement : "") +
          (orderBy ? " ORDER BY " + orderBy : "");
        app.database.oracle.connection.main.executeExtra(
          sql,
          parameter,
          (error, resultSet) => {
            if (error) {
              done && done(error);
              reject(error);
            } else {
              const items = resultSet && resultSet.rows ? resultSet.rows : [];
              done && done(null, items);
              resolve(items);
            }
          }
        );
      }),

    getPage: (
      pageNumber,
      pageSize,
      condition,
      selectedColumns,
      orderBy,
      done
    ) =>
      new Promise((resolve, reject) => {
        if (condition == undefined) {
          done = null;
          condition = {};
          selectedColumns = "*";
        } else if (typeof condition == "function") {
          done = condition;
          condition = {};
          selectedColumns = "*";
        } else if (selectedColumns && typeof selectedColumns == "function") {
          done = selectedColumns;
          selectedColumns = "*";
        } else {
          selectedColumns = selectedColumns ? selectedColumns : "*";
        }

        if (orderBy)
          Object.keys(obj2Db)
            .sort((a, b) => b.length - a.length)
            .forEach((key) => (orderBy = orderBy.replaceAll(key, obj2Db[key])));
        condition = app.database.oracle.buildCondition(
          obj2Db,
          condition,
          " AND "
        );
        let leftIndex = (pageNumber <= 1 ? 0 : pageNumber - 1) * pageSize,
          parameter = condition.parameter ? condition.parameter : {};
        const sqlCount =
          "SELECT COUNT(*) FROM TC_TNCN_QUYET_TOAN_THUE_TRANSACTION" +
          (condition.statement ? " WHERE " + condition.statement : "");
        app.database.oracle.connection.main.executeExtra(
          sqlCount,
          parameter,
          (error, res) => {
            if (error) {
              done && done(error);
              reject(error);
            } else {
              let result = {};
              let totalItem =
                res && res.rows && res.rows[0] ? res.rows[0]["COUNT(*)"] : 0;
              result = {
                totalItem,
                pageSize,
                pageTotal: Math.ceil(totalItem / pageSize),
              };
              result.pageNumber = Math.max(
                1,
                Math.min(pageNumber, result.pageTotal)
              );
              leftIndex = Math.max(0, result.pageNumber - 1) * pageSize;
              const sql =
                "SELECT " +
                app.database.oracle.parseSelectedColumns(
                  obj2Db,
                  selectedColumns
                ) +
                " FROM (SELECT TC_TNCN_QUYET_TOAN_THUE_TRANSACTION.*, ROW_NUMBER() OVER (ORDER BY " +
                (orderBy ? orderBy : keys) +
                ") R FROM TC_TNCN_QUYET_TOAN_THUE_TRANSACTION" +
                (condition.statement ? " WHERE " + condition.statement : "") +
                ") WHERE R BETWEEN " +
                (leftIndex + 1) +
                " and " +
                (leftIndex + pageSize);
              app.database.oracle.connection.main.executeExtra(
                sql,
                parameter,
                (error, resultSet) => {
                  if (error) {
                    done && done(error);
                    reject(error);
                  } else {
                    result.list =
                      resultSet && resultSet.rows ? resultSet.rows : [];
                    done && done(null, result);
                    resolve(result);
                  }
                }
              );
            }
          }
        );
      }),

    update: (condition, changes, done) =>
      new Promise((resolve, reject) => {
        condition = app.database.oracle.buildCondition(
          obj2Db,
          condition,
          " AND "
        );
        changes = app.database.oracle.buildCondition(
          obj2Db,
          changes,
          ", ",
          "NEW_"
        );

        if (Object.keys(condition).length == 0) {
          done && done("No condition!");
          reject("No condition!");
        } else if (changes.statement) {
          const parameter = app.clone(
            condition.parameter ? condition.parameter : {},
            changes.parameter ? changes.parameter : {}
          );
          const sql =
            "UPDATE TC_TNCN_QUYET_TOAN_THUE_TRANSACTION SET " +
            changes.statement +
            (condition.statement ? " WHERE " + condition.statement : "");
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error, resultSet) => {
              if (error == null && resultSet && resultSet.lastRowid) {
                app.model.tcTncnQuyetToanThueTransaction
                  .get({ rowId: resultSet.lastRowid })
                  .then((item) => {
                    done && done(null, item);
                    resolve(item);
                  })
                  .catch((error) => {
                    done && done(error);
                    reject(error);
                  });
              } else {
                done && done(error);
                reject(error);
              }
            }
          );
        } else {
          done && done("No changes!");
          reject("No changes!");
        }
      }),

    delete: (condition, done) =>
      new Promise((resolve, reject) => {
        if (condition == undefined) {
          done = null;
          condition = {};
        } else if (typeof condition == "function") {
          done = condition;
          condition = {};
        }
        condition = app.database.oracle.buildCondition(
          obj2Db,
          condition,
          " AND "
        );

        if (Object.keys(condition).length == 0) {
          done && done("No condition!");
          reject("No condition!");
        } else {
          const parameter = condition.parameter ? condition.parameter : {};
          const sql =
            "DELETE FROM TC_TNCN_QUYET_TOAN_THUE_TRANSACTION" +
            (condition.statement ? " WHERE " + condition.statement : "");
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error) => {
              if (error) {
                done && done(error);
                reject(error);
              } else {
                done && done();
                resolve();
              }
            }
          );
        }
      }),

    count: (condition, done) =>
      new Promise((resolve, reject) => {
        if (condition == undefined) {
          done = null;
          condition = {};
        } else if (typeof condition == "function") {
          done = condition;
          condition = {};
        }
        condition = app.database.oracle.buildCondition(
          obj2Db,
          condition,
          " AND "
        );
        const parameter = condition.parameter ? condition.parameter : {};
        const sql =
          "SELECT COUNT(*) FROM TC_TNCN_QUYET_TOAN_THUE_TRANSACTION" +
          (condition.statement ? " WHERE " + condition.statement : "");
        app.database.oracle.connection.main.executeExtra(
          sql,
          parameter,
          (error, result) => {
            if (error) {
              done && done(error);
              reject(error);
            } else {
              done && done(null, result);
              resolve(result);
            }
          }
        );
      }),

    searchPage: (pagenumber, pagesize, searchterm, filter, done) =>
      new Promise((resolve, reject) => {
        app.database.oracle.connection.main.executeExtra(
          "BEGIN :ret:=tc_quyet_toan_thue_transaction_search_page(:pagenumber, :pagesize, :searchterm, :filter, :totalitem, :totalmoney, :pagetotal); END;",
          {
            ret: {
              dir: app.database.oracle.BIND_OUT,
              type: app.database.oracle.CURSOR,
            },
            pagenumber: {
              val: pagenumber,
              dir: app.database.oracle.BIND_INOUT,
              type: app.database.oracle.NUMBER,
            },
            pagesize: {
              val: pagesize,
              dir: app.database.oracle.BIND_INOUT,
              type: app.database.oracle.NUMBER,
            },
            searchterm,
            filter,
            totalitem: {
              dir: app.database.oracle.BIND_OUT,
              type: app.database.oracle.NUMBER,
            },
            totalmoney: {
              dir: app.database.oracle.BIND_OUT,
              type: app.database.oracle.NUMBER,
            },
            pagetotal: {
              dir: app.database.oracle.BIND_OUT,
              type: app.database.oracle.NUMBER,
            },
          },
          (error, result) =>
            app.database.oracle.fetchRowsFromCursor(
              error,
              result,
              (error, result) => {
                if (error) {
                  done && done(error);
                  reject(error);
                } else {
                  done && done(null, result);
                  resolve(result);
                }
              }
            )
        );
      }),
  };
  return { db, tableName, type, schema, methods, keys };
};
