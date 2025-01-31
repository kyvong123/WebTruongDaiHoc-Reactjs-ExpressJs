// Table name: QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST { maHocPhan, maHdgd, ghiChu, diaDiemGiangDay, thoiGianBatDau, thoiGianKetThuc, heSoKhoiLuong, thanhTienHocPhan, tongSoTiet, soSinhVien, donGiaChuan, giangVien, id, hocKy, namHoc, heSoChatLuong, khauTruThueTncnHocPhan, thucNhanHocPhan }
const keys = ["ID"];
const obj2Db = {
  maHocPhan: "MA_HOC_PHAN",
  maHdgd: "MA_HDGD",
  ghiChu: "GHI_CHU",
  diaDiemGiangDay: "DIA_DIEM_GIANG_DAY",
  thoiGianBatDau: "THOI_GIAN_BAT_DAU",
  thoiGianKetThuc: "THOI_GIAN_KET_THUC",
  heSoKhoiLuong: "HE_SO_KHOI_LUONG",
  thanhTienHocPhan: "THANH_TIEN_HOC_PHAN",
  tongSoTiet: "TONG_SO_TIET",
  soSinhVien: "SO_SINH_VIEN",
  donGiaChuan: "DON_GIA_CHUAN",
  giangVien: "GIANG_VIEN",
  id: "ID",
  hocKy: "HOC_KY",
  namHoc: "NAM_HOC",
  heSoChatLuong: "HE_SO_CHAT_LUONG",
  khauTruThueTncnHocPhan: "KHAU_TRU_THUE_TNCN_HOC_PHAN",
  thucNhanHocPhan: "THUC_NHAN_HOC_PHAN",
};

module.exports = (app) => {
  const db = "main";
  const tableName = "QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST";
  const type = "table";
  const schema = {
    MA_HOC_PHAN: {
      type: "NVARCHAR2",
      length: "50",
    },
    MA_HDGD: {
      type: "NUMBER",
      length: "22,0",
    },
    GHI_CHU: {
      type: "NVARCHAR2",
      length: "200",
    },
    DIA_DIEM_GIANG_DAY: {
      type: "NVARCHAR2",
      length: "200",
    },
    THOI_GIAN_BAT_DAU: {
      type: "NUMBER",
      length: "20,0",
    },
    THOI_GIAN_KET_THUC: {
      type: "NUMBER",
      length: "20,0",
    },
    HE_SO_KHOI_LUONG: {
      type: "NUMBER",
      length: "5,2",
    },
    THANH_TIEN_HOC_PHAN: {
      type: "NUMBER",
      length: "25,0",
    },
    TONG_SO_TIET: {
      type: "NUMBER",
      length: "5,0",
    },
    SO_SINH_VIEN: {
      type: "NUMBER",
      length: "5,0",
    },
    DON_GIA_CHUAN: {
      type: "NUMBER",
      length: "10,0",
    },
    GIANG_VIEN: {
      type: "NVARCHAR2",
      length: "20",
    },
    ID: {
      type: "NUMBER",
      length: "22,0",
      autoIncrement: true,
      primaryKey: true,
    },
    HOC_KY: {
      type: "NUMBER",
      length: "5,0",
    },
    NAM_HOC: {
      type: "NVARCHAR2",
      length: "15",
    },
    HE_SO_CHAT_LUONG: {
      type: "NUMBER",
      length: "5,2",
    },
    KHAU_TRU_THUE_TNCN_HOC_PHAN: {
      type: "NUMBER",
      length: "20,0",
    },
    THUC_NHAN_HOC_PHAN: {
      type: "NUMBER",
      length: "20,0",
    },
  };
  const methods = {
    tinhTongHeSo: "QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST_TINH_TONG_HE_SO",
    download: "QT_HOP_DONG_GIANG_DAY_TEST_HOC_PHAN_DOWNLOAD",
  };
  app.model.qtHopDongGiangDayHocPhanTest = {
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
            "INSERT INTO QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST (" +
            statement.substring(2) +
            ") VALUES (" +
            values.substring(2) +
            ")";
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error, resultSet) => {
              if (error == null && resultSet && resultSet.lastRowid) {
                app.model.qtHopDongGiangDayHocPhanTest
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
          " FROM (SELECT * FROM QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST" +
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
          " FROM QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST" +
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
          "SELECT COUNT(*) FROM QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST" +
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
                " FROM (SELECT QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST.*, ROW_NUMBER() OVER (ORDER BY " +
                (orderBy ? orderBy : keys) +
                ") R FROM QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST" +
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
            "UPDATE QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST SET " +
            changes.statement +
            (condition.statement ? " WHERE " + condition.statement : "");
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error, resultSet) => {
              if (error == null && resultSet && resultSet.lastRowid) {
                app.model.qtHopDongGiangDayHocPhanTest
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
            "DELETE FROM QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST" +
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
          "SELECT COUNT(*) FROM QT_HOP_DONG_GIANG_DAY_HOC_PHAN_TEST" +
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

    tinhTongHeSo: (
      macanbo,
      hesochatluong,
      namhoc,
      loaihinhdaotao,
      loaicanbo,
      done
    ) =>
      new Promise((resolve, reject) => {
        app.database.oracle.connection.main.executeExtra(
          "BEGIN :ret:=qt_hop_dong_giang_day_hoc_phan_test_tinh_tong_he_so(:macanbo, :hesochatluong, :namhoc, :loaihinhdaotao, :loaicanbo); END;",
          {
            ret: {
              dir: app.database.oracle.BIND_OUT,
              type: app.database.oracle.CURSOR,
            },
            macanbo,
            hesochatluong,
            namhoc,
            loaihinhdaotao,
            loaicanbo,
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

    download: (done) =>
      new Promise((resolve, reject) => {
        app.database.oracle.connection.main.executeExtra(
          "BEGIN :ret:=qt_hop_dong_giang_day_test_hoc_phan_download(); END;",
          {
            ret: {
              dir: app.database.oracle.BIND_OUT,
              type: app.database.oracle.CURSOR,
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
