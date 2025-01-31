// Table name: TCCB_DATA_VNU { emailLogIn, ho, ten, gioiTinh, danToc, tonGiao, mscb, ngaySinh, noiSinh, nguyenQuan, hienTai, cccd, cccdNgayCap, email, sdt, ngayBatDauCongTac, ngayVaoDang, ngayVaoDangCt, trinhDoPhoThong, hocVi, hocHam, danhHieuNhaNuoc, chucVu, ngayBoNhiem, congViecChinh, chucVuDang, ngach, bacLuong, heSoLuong, phanTramHuong, ngayHuong, phuCapTnvk, ngayHuongTnvk, chuyenMon, chinhTri, ngoaiNgu, tinHoc, qtCongTac, khenThuong, kyLuat, giaCanhBanThan, giaCanhGiaDinh, qtLuong, qtPhuCap, nhaDat, xacNhan, keyVnu, timeModified }
const keys = ["EMAIL_LOG_IN"];
const obj2Db = {
  emailLogIn: "EMAIL_LOG_IN",
  ho: "HO",
  ten: "TEN",
  gioiTinh: "GIOI_TINH",
  danToc: "DAN_TOC",
  tonGiao: "TON_GIAO",
  mscb: "MSCB",
  ngaySinh: "NGAY_SINH",
  noiSinh: "NOI_SINH",
  nguyenQuan: "NGUYEN_QUAN",
  hienTai: "HIEN_TAI",
  cccd: "CCCD",
  cccdNgayCap: "CCCD_NGAY_CAP",
  email: "EMAIL",
  sdt: "SDT",
  ngayBatDauCongTac: "NGAY_BAT_DAU_CONG_TAC",
  ngayVaoDang: "NGAY_VAO_DANG",
  ngayVaoDangCt: "NGAY_VAO_DANG_CT",
  trinhDoPhoThong: "TRINH_DO_PHO_THONG",
  hocVi: "HOC_VI",
  hocHam: "HOC_HAM",
  danhHieuNhaNuoc: "DANH_HIEU_NHA_NUOC",
  chucVu: "CHUC_VU",
  ngayBoNhiem: "NGAY_BO_NHIEM",
  congViecChinh: "CONG_VIEC_CHINH",
  chucVuDang: "CHUC_VU_DANG",
  ngach: "NGACH",
  bacLuong: "BAC_LUONG",
  heSoLuong: "HE_SO_LUONG",
  phanTramHuong: "PHAN_TRAM_HUONG",
  ngayHuong: "NGAY_HUONG",
  phuCapTnvk: "PHU_CAP_TNVK",
  ngayHuongTnvk: "NGAY_HUONG_TNVK",
  chuyenMon: "CHUYEN_MON",
  chinhTri: "CHINH_TRI",
  ngoaiNgu: "NGOAI_NGU",
  tinHoc: "TIN_HOC",
  qtCongTac: "QT_CONG_TAC",
  khenThuong: "KHEN_THUONG",
  kyLuat: "KY_LUAT",
  giaCanhBanThan: "GIA_CANH_BAN_THAN",
  giaCanhGiaDinh: "GIA_CANH_GIA_DINH",
  qtLuong: "QT_LUONG",
  qtPhuCap: "QT_PHU_CAP",
  nhaDat: "NHA_DAT",
  xacNhan: "XAC_NHAN",
  keyVnu: "KEY_VNU",
  timeModified: "TIME_MODIFIED",
};

module.exports = (app) => {
  const db = "main";
  const tableName = "TCCB_DATA_VNU";
  const type = "table";
  const schema = {
    EMAIL_LOG_IN: {
      type: "NVARCHAR2",
      length: "100",
      primaryKey: true,
    },
    HO: {
      type: "NVARCHAR2",
      length: "100",
    },
    TEN: {
      type: "NVARCHAR2",
      length: "50",
    },
    GIOI_TINH: {
      type: "NVARCHAR2",
      length: "5",
    },
    DAN_TOC: {
      type: "NVARCHAR2",
      length: "5",
    },
    TON_GIAO: {
      type: "NVARCHAR2",
      length: "5",
    },
    MSCB: {
      type: "NVARCHAR2",
      length: "20",
    },
    NGAY_SINH: {
      type: "NUMBER",
      length: "20,0",
    },
    NOI_SINH: {
      type: "NVARCHAR2",
      length: "10",
    },
    NGUYEN_QUAN: {
      type: "NVARCHAR2",
      length: "500",
    },
    HIEN_TAI: {
      type: "NVARCHAR2",
      length: "500",
    },
    CCCD: {
      type: "NVARCHAR2",
      length: "20",
    },
    CCCD_NGAY_CAP: {
      type: "NUMBER",
      length: "20,0",
    },
    EMAIL: {
      type: "NVARCHAR2",
      length: "100",
    },
    SDT: {
      type: "NVARCHAR2",
      length: "20",
    },
    NGAY_BAT_DAU_CONG_TAC: {
      type: "NUMBER",
      length: "20,0",
    },
    NGAY_VAO_DANG: {
      type: "NUMBER",
      length: "20,0",
    },
    NGAY_VAO_DANG_CT: {
      type: "NUMBER",
      length: "20,0",
    },
    TRINH_DO_PHO_THONG: {
      type: "NVARCHAR2",
      length: "5",
    },
    HOC_VI: {
      type: "NVARCHAR2",
      length: "10",
    },
    HOC_HAM: {
      type: "NVARCHAR2",
      length: "10",
    },
    DANH_HIEU_NHA_NUOC: {
      type: "NVARCHAR2",
      length: "10",
    },
    CHUC_VU: {
      type: "NVARCHAR2",
      length: "10",
    },
    NGAY_BO_NHIEM: {
      type: "NUMBER",
      length: "20,0",
    },
    CONG_VIEC_CHINH: {
      type: "NVARCHAR2",
      length: "200",
    },
    CHUC_VU_DANG: {
      type: "NVARCHAR2",
      length: "10",
    },
    NGACH: {
      type: "NVARCHAR2",
      length: "20",
    },
    BAC_LUONG: {
      type: "NVARCHAR2",
      length: "5",
    },
    HE_SO_LUONG: {
      type: "NUMBER",
      length: "5,2",
    },
    PHAN_TRAM_HUONG: {
      type: "NUMBER",
      length: "5,0",
    },
    NGAY_HUONG: {
      type: "NUMBER",
      length: "20,0",
    },
    PHU_CAP_TNVK: {
      type: "NUMBER",
      length: "5,0",
    },
    NGAY_HUONG_TNVK: {
      type: "NUMBER",
      length: "20,0",
    },
    CHUYEN_MON: {
      type: "NVARCHAR2",
      length: "2000",
    },
    CHINH_TRI: {
      type: "NVARCHAR2",
      length: "2000",
    },
    NGOAI_NGU: {
      type: "NVARCHAR2",
      length: "2000",
    },
    TIN_HOC: {
      type: "NVARCHAR2",
      length: "2000",
    },
    QT_CONG_TAC: {
      type: "NVARCHAR2",
      length: "2000",
    },
    KHEN_THUONG: {
      type: "NVARCHAR2",
      length: "2000",
    },
    KY_LUAT: {
      type: "NVARCHAR2",
      length: "2000",
    },
    GIA_CANH_BAN_THAN: {
      type: "NVARCHAR2",
      length: "2000",
    },
    GIA_CANH_GIA_DINH: {
      type: "NVARCHAR2",
      length: "2000",
    },
    QT_LUONG: {
      type: "NVARCHAR2",
      length: "2000",
    },
    QT_PHU_CAP: {
      type: "NVARCHAR2",
      length: "2000",
    },
    NHA_DAT: {
      type: "NVARCHAR2",
      length: "2000",
    },
    XAC_NHAN: {
      type: "NUMBER",
      length: "1,0",
    },
    KEY_VNU: {
      type: "NVARCHAR2",
      length: "50",
    },
    TIME_MODIFIED: {
      type: "NUMBER",
      length: "20,0",
    },
  };
  const methods = {};
  app.model.tccbDataVnu = {
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
            "INSERT INTO TCCB_DATA_VNU (" +
            statement.substring(2) +
            ") VALUES (" +
            values.substring(2) +
            ")";
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error, resultSet) => {
              if (error == null && resultSet && resultSet.lastRowid) {
                app.model.tccbDataVnu
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
          " FROM (SELECT * FROM TCCB_DATA_VNU" +
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
          " FROM TCCB_DATA_VNU" +
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
          "SELECT COUNT(*) FROM TCCB_DATA_VNU" +
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
                " FROM (SELECT TCCB_DATA_VNU.*, ROW_NUMBER() OVER (ORDER BY " +
                (orderBy ? orderBy : keys) +
                ") R FROM TCCB_DATA_VNU" +
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
            "UPDATE TCCB_DATA_VNU SET " +
            changes.statement +
            (condition.statement ? " WHERE " + condition.statement : "");
          app.database.oracle.connection.main.executeExtra(
            sql,
            parameter,
            (error, resultSet) => {
              if (error == null && resultSet && resultSet.lastRowid) {
                app.model.tccbDataVnu
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
            "DELETE FROM TCCB_DATA_VNU" +
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
          "SELECT COUNT(*) FROM TCCB_DATA_VNU" +
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
  };
  return { db, tableName, type, schema, methods, keys };
};
