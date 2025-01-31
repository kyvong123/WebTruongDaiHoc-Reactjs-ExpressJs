// eslint-disable-next-line no-unused-vars
module.exports = (app) => {
    const maHinhThucCanhCao = app.isDebug ? 61 : 41;
    // const tinhTrangConHoc = 1;
    // const tinhTrangNghiHoc = 2;
    // app.model.svQtKyLuatDssvDuKien.foo = async () => { };
    function convertYear(yearObj) {
        const { namHoc, hocKy } = yearObj;
        const [startYear, endYear] = namHoc.split(' - ').map(year => Number(year));
        return { startYear, endYear, hocKy };
    }

    function removeDuplicateYears(sortedYears) {
        const uniqueYears = [sortedYears[0]];
        for (let i = 1; i < sortedYears.length; i++) {
            const currentYear = sortedYears[i];
            const previousYear = sortedYears[i - 1];
            if (currentYear.startYear !== previousYear.startYear || currentYear.hocKy !== previousYear.hocKy) {
                uniqueYears.push(currentYear);
            }
        }
        return uniqueYears;
    }

    function countContinuousYears(yearsArray) {
        const sortedYears = yearsArray.map(year => convertYear(year)).sort((a, b) => {
            if (a.startYear !== b.startYear) {
                return a.startYear - b.startYear;
            }
            return a.hocKy - b.hocKy;
        });

        const uniqueYears = removeDuplicateYears(sortedYears);

        let consecutiveCount = 0;

        for (let i = uniqueYears.length - 1; i >= 1; i--) {
            const currentYear = uniqueYears[i];
            const previousYear = uniqueYears[i - 1];

            if (
                (currentYear.startYear === previousYear.endYear &&
                    ((currentYear.hocKy === previousYear.hocKy + 1) || (currentYear.hocKy === previousYear.hocKy - 1))) || (currentYear.startYear === previousYear.startYear && currentYear.hocKy === previousYear.hocKy + 1)
            ) {
                consecutiveCount++;
            } else {
                break;
            }
        }

        return { consecutive: consecutiveCount === 0 ? consecutiveCount : consecutiveCount + 1, total: uniqueYears.length };
    }

    app.model.svQtKyLuatDssvDuKien.checkHinhThucKyLuat = (sv, dsDieuKien, hinhThucKyLuat, lichSuCanhCao, namHoc, hocKy) => {
        let hinhThucKyLuatMap = {};
        hinhThucKyLuat.forEach(ht => {
            hinhThucKyLuatMap[ht.id] = {
                ...ht
            };
        });
        let result = { hinhThucKyLuat: null, hinhThucKyLuatText: '' };
        dsDieuKien.forEach(dk => {
            const { ghiChu, expression, value, hinhThucKyLuat } = dk;
            // if (['diemTrungBinh', 'diemTrungBinhTichLuy'].includes(ghiChu) && sv.quaHanNhtt != null) return;

            if (eval(`${sv[ghiChu] ?? 0} ${expression} ${value}`)) {
                result.hinhThucKyLuat = hinhThucKyLuat;
                result.hinhThucKyLuatText = hinhThucKyLuatMap[hinhThucKyLuat].ten;
            }
        });
        if (result.hinhThucKyLuat == maHinhThucCanhCao && lichSuCanhCao.length) {
            lichSuCanhCao.push({ namHoc, hocKy: Number(hocKy) });
            const { consecutive, total } = countContinuousYears(lichSuCanhCao);
            dsDieuKien.forEach(dk => {
                const { ghiChu, expression, value, hinhThucKyLuat } = dk;
                if (['kyLuatLienTiep', 'kyLuatKhongLienTiep'].includes(ghiChu) && eval(`${ghiChu == 'kyLuatLienTiep' ? consecutive : total} ${expression} ${value}`)) {
                    result.hinhThucKyLuatBoSung = hinhThucKyLuat;
                    result.hinhThucKyLuatBoSungText = hinhThucKyLuatMap[hinhThucKyLuat].ten + ` (Bị cảnh cáo ${ghiChu == 'kyLuatLienTiep' ? consecutive : total} kỳ ${ghiChu == 'kyLuatLienTiep' ? '' : 'không '}liên tiếp)`;
                }
            });
        }
        return result;
    };
};