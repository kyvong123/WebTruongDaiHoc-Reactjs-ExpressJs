module.exports = app => {

    Date.prototype.yyyymmdd = function () {
        return this.toISOString().slice(0, 10).replace(/-/g, '');
    };

    Date.prototype.getWeek = function () {
        const target = new Date(this);
        const dayNumber = (this.getDay() + 6) % 7; // Adjust Sunday (0) to 7 and Monday (1) to 0

        target.setDate(target.getDate() - dayNumber + 3); // Find the nearest Thursday
        const firstThursday = new Date(target.getFullYear(), 0, 4);

        const weekNumber = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + (firstThursday.getDay() + 6) % 7) / 7);
        return weekNumber;
    };

    Date.prototype.getListWeeksOfYear = function (year) {
        const weeks = [];
        const date = new Date(year, 0, 1); // January 1st of the year

        if (date.getDay() == 0) {
            date.setDate(date.getDate() + 1);
        } else if (date.getDay() > 4) {
            while (date.getDay() !== 1) {
                date.setDate(date.getDate() + 1);
            }
        } else {
            while (date.getDay() !== 1) {
                date.setDate(date.getDate() - 1);
            }
        }

        do {
            const weekStart = new Date(date);
            const weekEnd = new Date(date.setDate(date.getDate() + 6));
            weeks.push({
                weekNumber: `${weekStart.getWeek()}${date.getFullYear()}`,
                week: weekStart.getWeek(),
                weekStart: weekStart.setHours(0, 0, 0),
                weekEnd: weekEnd.setHours(0, 0, 0),
                year,
            });
            date.setDate(date.getDate() + 1);
            if (weeks.length == 52) break;
        } while (date.getFullYear() === year);

        return weeks;
    };

    const get2 = (x) => ('0' + x).slice(-2);

    app.date = {
        dateFormat: (date) => {
            return get2(date.getMonth() + 1) + '/' + get2(date.getDate()) + '/' + date.getFullYear();
        },

        viDateFormat: (date) => {
            return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
        },

        viDateFormatString: (date) => {
            return 'ngày ' + get2(date.getDate()) + ' tháng ' + get2(date.getMonth() + 1) + ' năm ' + date.getFullYear();
        },

        viTimeFormat: (date) => {
            return get2(date.getHours()) + ':' + get2(date.getMinutes());
        },

        dateTimeFormat: (date, format) => {
            if (format == 'yyyy') return date.getFullYear();
            else if (format == 'mm/yyyy') return get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else if (format == 'dd/mm/yyyy') return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else if (format == 'HH:MM:ss dd/mm/yyyy') return get2(date.getHours()) + ':' + get2(date.getMinutes()) + ':' + get2(date.getSeconds()) + ' ' + get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear();
            else if (format == 'dd/mm/yyyy HH:MM:ss') return get2(date.getDate()) + '/' + get2(date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + get2(date.getHours()) + ':' + get2(date.getMinutes()) + ':' + get2(date.getSeconds());
            else if (format == 'yyyymmdd-MMDD') return date.yyyymmdd() + '-' + get2(date.getHours()) + get2(date.getMinutes());
            else return '';
        },

        dateToNumber: (date, h = 0, m = 0, s = 0, ms = 0) => {
            if (isNaN(new Date(date).getTime())) return null;
            date.setHours(h, m, s, ms);
            return date.getTime();
        },

        // TIME Operation ----------------------------------
        monthDiff: (d1, d2) => { //Difference in Months between two dates
            let months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        },

        dayDiff: (d1, d2) => { //Difference in Days between two dates
            let result = d2.getTime() - d1.getTime();
            return Math.floor(result / (1000 * 60 * 60 * 24));
        },

        fullFormatToDate: (string) => {
            let year = string.substring(0, 4);
            let month = string.substring(4, 6);
            let day = string.substring(6, 8);
            let hour = string.substring(8, 10);
            let minute = string.substring(10, 12);
            let second = string.substring(12, 14);
            return new Date(year, month - 1, day, hour, minute, second);
        },

        numberNgayNghi: (start, end, yearCalc, danhSachNgayLe = []) => { //Số ngày nghỉ trong khoảng [start, end] ở năm yearCalc (nếu tồn tại)
            if (yearCalc) {
                let startDateOfYear = new Date(yearCalc, 0, 1, 0, 0, 0, 0);
                let endDateOfYear = new Date(yearCalc, 11, 31, 23, 59, 59, 999);
                if (start <= startDateOfYear) start = startDateOfYear;
                if (endDateOfYear <= end) end = endDateOfYear;
            }
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            danhSachNgayLe.sort();
            let result = 0, idNgayLe = 0;
            while (end >= start && result <= 70) {
                let positionDay = start.getDay();
                if (positionDay == 0 || positionDay == 6) {
                    //thứ bảy, chủ nhật
                } else {
                    // kiểm tra ngày lễ
                    while (idNgayLe < danhSachNgayLe.length && new Date(danhSachNgayLe[idNgayLe]) < start) idNgayLe++;
                    if (idNgayLe < danhSachNgayLe.length) {
                        let ngayLeDate = new Date(danhSachNgayLe[idNgayLe]);
                        if (ngayLeDate.getFullYear() == start.getFullYear() && ngayLeDate.getMonth() == start.getMonth() && ngayLeDate.getDate() == start.getDate()) {
                            // do nothing
                        } else result += 1;
                    } else result += 1;
                }
                start.setDate(start.getDate() + 1);
            }
            if (result > 70) { //Case: Quá nhiều ngày nghỉ
                return -1;
            }
            return result;
        }
    };
};