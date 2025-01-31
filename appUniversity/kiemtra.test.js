const common = require("./config/lib/date");
describe("Test function", () => {
  Date.prototype.yyyymmdd = function () {
    return this.toISOString().slice(0, 10).replace(/-/g, "");
  };

  const get2 = (x) => ("0" + x).slice(-2);

  dateTimeFormat = (date, format) => {
    if (format == "yyyy") return date.getFullYear();
    else if (format == "mm/yyyy")
      return get2(date.getMonth() + 1) + "/" + date.getFullYear();
    else if (format == "dd/mm/yyyy")
      return (
        get2(date.getDate()) +
        "/" +
        get2(date.getMonth() + 1) +
        "/" +
        date.getFullYear()
      );
    else if (format == "HH:MM:ss dd/mm/yyyy")
      return (
        get2(date.getHours()) +
        ":" +
        get2(date.getMinutes()) +
        ":" +
        get2(date.getSeconds()) +
        " " +
        get2(date.getDate()) +
        "/" +
        get2(date.getMonth() + 1) +
        "/" +
        date.getFullYear()
      );
    else if (format == "dd/mm/yyyy HH:MM:ss")
      return (
        get2(date.getDate()) +
        "/" +
        get2(date.getMonth() + 1) +
        "/" +
        date.getFullYear() +
        " " +
        get2(date.getHours()) +
        ":" +
        get2(date.getMinutes()) +
        ":" +
        get2(date.getSeconds())
      );
    else if (format == "yyyymmdd-MMDD")
      return (
        date.yyyymmdd() + "-" + get2(date.getHours()) + get2(date.getMinutes())
      );
    else return "";
  };
  normalizedName = (name) => {
    let convertToArray = name.toLowerCase().split(" ");
    let result = convertToArray.map(function (val) {
      return val.replace(val.charAt(0), val.charAt(0).toUpperCase());
    });
    return result.join(" ");
  };

  numberDisplay = (number, replaceValue = ".") => {
    number = number ?? "";
    const decimalSplitter = replaceValue == "." ? "," : ".";
    let [integer, decimal] = number.toString().split(".");
    if (!decimal) [integer, decimal] = number.toString().split(",");
    return `${integer
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, replaceValue)}${
      decimal ? decimalSplitter : ""
    }${decimal || ""}`;
  };

  numberToVnText = (so) => {
    const doc1so = (so) => {
      let arr_chuhangdonvi = [
        "không",
        "một",
        "hai",
        "ba",
        "bốn",
        "năm",
        "sáu",
        "bảy",
        "tám",
        "chín",
      ];
      let resualt = "";
      resualt = arr_chuhangdonvi[so];
      return resualt;
    };

    const doc2so = (so) => {
      so = so.replace(" ", "");
      let arr_chubinhthuong = [
        "không",
        "một",
        "hai",
        "ba",
        "bốn",
        "năm",
        "sáu",
        "bảy",
        "tám",
        "chín",
      ];
      let arr_chuhangdonvi = [
        "mươi",
        "mốt",
        "hai",
        "ba",
        "bốn",
        "lăm",
        "sáu",
        "bảy",
        "tám",
        "chín",
      ];
      let arr_chuhangchuc = [
        "",
        "mười",
        "hai mươi",
        "ba mươi",
        "bốn mươi",
        "năm mươi",
        "sáu mươi",
        "bảy mươi",
        "tám mươi",
        "chín mươi",
      ];
      let resualt = "";
      let sohangchuc = so.substr(0, 1);
      let sohangdonvi = so.substr(1, 1);
      resualt += arr_chuhangchuc[sohangchuc];
      if (sohangchuc == 1 && sohangdonvi == 1)
        resualt += " " + arr_chubinhthuong[sohangdonvi];
      else if (sohangchuc == 1 && sohangdonvi > 1)
        resualt += " " + arr_chuhangdonvi[sohangdonvi];
      else if (sohangchuc > 1 && sohangdonvi > 0)
        resualt += " " + arr_chuhangdonvi[sohangdonvi];

      return resualt;
    };

    const doc3so = (so) => {
      let resualt = "";
      let arr_chubinhthuong = [
        "không",
        "một",
        "hai",
        "ba",
        "bốn",
        "năm",
        "sáu",
        "bảy",
        "tám",
        "chín",
      ];
      let sohangtram = so.substr(0, 1);
      let sohangchuc = so.substr(1, 1);
      let sohangdonvi = so.substr(2, 1);
      resualt = arr_chubinhthuong[sohangtram] + " trăm";
      if (sohangchuc == 0 && sohangdonvi != 0)
        resualt += " linh " + arr_chubinhthuong[sohangdonvi];
      else if (sohangchuc != 0)
        resualt += " " + doc2so(sohangchuc + " " + sohangdonvi);
      return resualt;
    };

    const docsonguyen = (so) => {
      let result = "";
      if (so != undefined) {
        let arr_So = [{ ty: "" }, { trieu: "" }, { nghin: "" }, { tram: "" }];
        let sochuso = so.length;
        for (let i = sochuso - 1; i >= 0; i--) {
          if (sochuso - i <= 3) {
            if (arr_So["tram"] != undefined)
              arr_So["tram"] = so.substr(i, 1) + arr_So["tram"];
            else arr_So["tram"] = so.substr(i, 1);
          } else if (sochuso - i > 3 && sochuso - i <= 6) {
            if (arr_So["nghin"] != undefined)
              arr_So["nghin"] = so.substr(i, 1) + arr_So["nghin"];
            else arr_So["nghin"] = so.substr(i, 1);
          } else if (sochuso - i > 6 && sochuso - i <= 9) {
            if (arr_So["trieu"] != undefined)
              arr_So["trieu"] = so.substr(i, 1) + arr_So["trieu"];
            else arr_So["trieu"] = so.substr(i, 1);
          } else {
            if (arr_So.ty != undefined) arr_So.ty = so.substr(i, 1) + arr_So.ty;
            else arr_So.ty = so.substr(i, 1);
          }
        }

        if (arr_So["ty"] > 0) result += doc(arr_So["ty"]) + " tỷ";
        if (arr_So["trieu"] > 0) {
          if (arr_So["trieu"].length >= 3 || arr_So["ty"] > 0)
            result += " " + doc3so(arr_So["trieu"]) + " triệu";
          else if (arr_So["trieu"].length >= 2)
            result += " " + doc2so(arr_So["trieu"]) + " triệu";
          else result += " " + doc1so(arr_So["trieu"]) + " triệu";
        }
        if (arr_So["nghin"] > 0) {
          if (arr_So["nghin"].length >= 3 || arr_So["trieu"] > 0)
            result += " " + doc3so(arr_So["nghin"]) + " nghìn";
          else if (arr_So["nghin"].length >= 2)
            result += " " + doc2so(arr_So["nghin"]) + " nghìn";
          else result += " " + doc1so(arr_So["nghin"]) + " nghìn";
        }
        if (arr_So["tram"] > 0) {
          if (arr_So["tram"].length >= 3 || arr_So["nghin"] > 0)
            result += " " + doc3so(arr_So["tram"]);
          else if (arr_So["tram"].length >= 2)
            result += " " + doc2so(arr_So["tram"]);
          else result += " " + doc1so(arr_So["tram"]);
        }
      }
      return result;
    };

    const doc = (so) => {
      let kytuthapphan = ",";
      let result = "";
      if (so != undefined) {
        so = " " + so + " ";
        so = so.trim();
        let cautrucso = so.split(kytuthapphan);
        if (cautrucso[0] != undefined) {
          result += docsonguyen(cautrucso[0]);
        }
        if (cautrucso[1] != undefined) {
          result += " phẩy " + docsonguyen(cautrucso[1]);
        }
      }

      return result;
    };

    return doc(so);
  };

  it("Chuyển số sang số bằng chữ", () => {
    expect(numberToVnText(1000)).toBe(" một nghìn");
    expect(numberToVnText(12530)).toBe(" mười hai nghìn năm trăm ba mươi");
    expect(numberToVnText(3000000)).toBe(" ba triệu");
  });

  it("Hiển thị số có phần nghìn", () => {
    expect(numberDisplay(1000)).toBe("1.000");
    expect(numberDisplay(12530)).toBe("12.530");
    expect(numberDisplay(3000000)).toBe("3.000.000");
  });

  it("Chuyển tên viết hoa sang viết thường", () => {
    expect(normalizedName("NGUYỄN THỊ A")).toBe("Nguyễn Thị A");
    expect(normalizedName("HOÀNG VĂN B")).toBe("Hoàng Văn B");
    expect(normalizedName("TRẦN NGỌC C")).toBe("Trần Ngọc C");
  });

  it("Định dạng ngày tháng", () => {
    expect(dateTimeFormat(new Date(1748214605000), "dd/mm/yyyy")).toBe(
      "26/05/2025"
    );
    expect(dateTimeFormat(new Date(1705942800000), "HH:MM:ss dd/mm/yyyy")).toBe(
      "00:00:00 23/01/2024"
    );
    expect(dateTimeFormat(new Date(1704042000000), "yyyymmdd-MMDD")).toBe(
      "20231231-0000"
    );
  });
});
