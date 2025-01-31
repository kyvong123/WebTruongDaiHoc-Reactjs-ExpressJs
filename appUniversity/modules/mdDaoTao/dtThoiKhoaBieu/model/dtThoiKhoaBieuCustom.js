// eslint-disable-next-line no-unused-vars
const dateformat = require('dateformat');
module.exports = (app) => {
    // app.model.dtThoiKhoaBieuCustom.foo = async () => { };

    const template = `
    <p><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="background-color:#ffffff"><span style="font-family:'Times New Roman'"><span style="color:#222222">Ch&agrave;o c&aacute;c bạn sinh vi&ecirc;n,</span></span></span></span></span></span></p>

    <p><span style="font-size:11pt"><span style="background-color:#ffffff"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Ph&ograve;ng Quản l&yacute; Đ&agrave;o tạo gửi c&aacute;c bạn th&ocirc;ng tin b&aacute;o nghỉ như sau:</span></span></span></span></span></span></p>
    
    <ul>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">M&ocirc;n học: {tenMonHoc}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">M&atilde; lớp học phần: {maHocPhan}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Giảng vi&ecirc;n phụ tr&aacute;ch: {teacher}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Thời gian nghỉ: {thoiGianNghi}</span></span></span></span></li>
        <li><span style="background-color:#ffffff"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">L&yacute; do nghỉ: {lyDo}</span></span></span></span></li>
    </ul>
    
    <p style="text-align:left"><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'">Email n&agrave;y được gửi từ hệ thống email tự động.</span></span></span></span></p>
    <p style="text-align:left"><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'">Xin vui l&ograve;ng kh&ocirc;ng trả lời email n&agrave;y.</span></span></span></span></p>
    <p><span style="font-size:11pt"><span style="font-family:Calibri"><span style="font-size:14.0000pt"><span style="font-family:'Times New Roman'"><span style="color:#222222">Th&acirc;n mến.</span></span></span></span></span></p>
    `;

    const templateBu = `
    <p>Ch&agrave;o c&aacute;c bạn sinh vi&ecirc;n,</p>

    <p>Ph&ograve;ng Quản l&yacute; Đ&agrave;o tạo gửi c&aacute;c bạn th&ocirc;ng tin học b&ugrave; như sau:</p>

    <ul>
	    <li>M&ocirc;n học: {tenMonHoc}</li>
	    <li>M&atilde; lớp học phần: {maHocPhan}</li>
	    <li>Giảng vi&ecirc;n phụ tr&aacute;ch: {teacher}</li>
	    <li>Thời gian b&ugrave;: {thoiGianBu}</li>
    </ul>

    <p>Email n&agrave;y được gửi từ hệ thống email tự động.</p>

    <p>Xin vui l&ograve;ng kh&ocirc;ng trả lời email n&agrave;y.</p>

    <p>Th&acirc;n mến.</p>
    `;

    app.model.dtThoiKhoaBieuCustom.checkTrungLich = async (fullData, datangayLe, dataTiet) => {
        let dataHocPhan = [...fullData], dataToCreate = [], isTrungTKB = false, isTrungGV = false, ghiChu = '';
        if (dataHocPhan.every(item => item.thu && item.ngayBatDau && item.tietBatDau && item.soTietBuoi)) {
            dataHocPhan.sort((a, b) => parseInt(a.ngayBatDau) - parseInt(b.ngayBatDau));
            dataHocPhan = dataHocPhan.map(i => {
                let thoiGianBatDau = dataTiet.find(item => item.ten == i.tietBatDau).thoiGianBatDau;
                let thoiGianKetThuc = dataTiet.find(item => item.ten == parseInt(i.tietBatDau) + parseInt(i.soTietBuoi) - 1).thoiGianKetThuc;
                return { ...i, thoiGianBatDau, thoiGianKetThuc };
            });
            dataToCreate = await app.model.dtThoiKhoaBieu.customGenerateSchedule({
                fullData: dataHocPhan, listNgayLe: datangayLe || [], dataTiet, dataTeacher: []
            });
        }

        for (let i = 0; i < dataToCreate.length - 1; i++) {
            let curr = { ...dataToCreate[i] },
                next = { ...dataToCreate[i + 1] };
            if (curr.ngayKetThuc >= next.ngayBatDau) {
                ghiChu = 'Trùng thời gian học giữa các lịch học của học phần';
                break;
            }
        }

        if (!ghiChu && dataToCreate.length) {
            for (let tuan of dataToCreate.filter(i => i.phong)) {
                let { maHocPhan, ngayHoc, phong, ngayBatDau, ngayKetThuc, maCanBoGV, maCanBoTG } = tuan,
                    listGV = maCanBoGV ? maCanBoGV.split(', ') : [],
                    listTG = maCanBoTG ? maCanBoTG.split(', ') : [];

                let checkFree = await app.model.dtThoiKhoaBieuCustom.checkFreePhong({ phong, ngayBatDau, ngayKetThuc, maHocPhan });

                isTrungTKB = checkFree.isTrungTKB;
                ghiChu = checkFree.ghiChu;

                if (isTrungTKB || ghiChu) break;

                for (let gv of [...new Set([...listGV, ...listTG])]) {
                    let gvHienTai = await app.model.dtThoiKhoaBieuGiangVien.get({
                        statement: 'giangVien = :giangVien AND idNgayNghi IS NULL AND idThoiKhoaBieu != :idThoiKhoaBieu AND NOT ((:ngayBatDau > ngayKetThuc) OR (:ngayKetThuc < ngayBatDau))',
                        parameter: {
                            giangVien: gv,
                            ngayBatDau: tuan.ngayBatDau,
                            ngayKetThuc: tuan.ngayKetThuc,
                            idThoiKhoaBieu: tuan.id,
                        }
                    });
                    if (gvHienTai) {
                        isTrungGV = true;
                        ghiChu = `Trùng lịch dạy của giảng viên ${gv} ngày ${dateformat(ngayHoc, 'dd/mm/yyyy')}`;
                        break;
                    }
                }
                if (isTrungGV) break;
            }
        }
        return { isTrungTKB, isTrungGV, ghiChu };
    };

    app.model.dtThoiKhoaBieuCustom.checkFreePhong = async ({ phong, ngayBatDau, ngayKetThuc, maHocPhan }) => {
        let [tkb, exam, event] = await Promise.all([
            app.model.dtThoiKhoaBieuCustom.get({
                statement: 'maHocPhan != :maHocPhan AND isNghi IS NULL AND isNgayLe IS NULL AND phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                parameter: { maHocPhan, phong, ngayBatDau, ngayKetThuc },
            }),
            app.model.dtExam.get({
                statement: 'phong = :phong AND NOT ((:ngayBatDau > ketThuc) OR (:ngayKetThuc < batDau))',
                parameter: { phong, ngayBatDau, ngayKetThuc },
            }),
            app.model.dtLichEvent.get({
                statement: 'phong = :phong AND NOT ((:ngayBatDau > thoiGianKetThuc) OR (:ngayKetThuc < thoiGianBatDau))',
                parameter: { phong, ngayBatDau, ngayKetThuc },
            })
        ]), ghiChu = '', isTrungTKB = false;

        if (tkb) {
            isTrungTKB = true;
            ghiChu = `Trùng thời khóa biểu với ngày ${app.date.viDateFormat(new Date(tkb.ngayHoc))} của học phần ${tkb.maHocPhan}`;
        } else if (exam) {
            isTrungTKB = true;
            ghiChu = `Trùng lịch thi với ngày ${app.date.viDateFormat(new Date(exam.batDau))} của học phần ${exam.maHocPhan}`;
        } else if (event) {
            isTrungTKB = true;
            ghiChu = `Trùng lịch với ngày ${app.date.viDateFormat(new Date(event.thoiGianBatDau))} của sự kiện ${event.ten}`;
        }
        return { isTrungTKB, ghiChu };
    };

    app.model.dtThoiKhoaBieuCustom.sendEmail = async ({ maHocPhan, dataTenGiangVien, tenMonHoc, title, ghiChu, emailTo, listEmail }) => {
        const subject = `Thông báo nghỉ môn ${app.utils.parse(tenMonHoc, { vi: '' })?.vi}. – Mã lớp: ${maHocPhan}.`,
            text = '',
            html = template.replaceAll('{tenMonHoc}', app.utils.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianNghi}', title).replaceAll('{lyDo}', ghiChu || '');

        app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', emailTo, listEmail.toString(), null, subject, text, html, null);
    };

    app.model.dtThoiKhoaBieuCustom.sendEmailBu = async ({ maHocPhan, dataTenGiangVien, tenMonHoc, title, emailTo, listEmail }) => {
        const subject = `Thông báo học bù môn ${app.utils.parse(tenMonHoc, { vi: '' })?.vi}. – Mã lớp: ${maHocPhan}.`,
            text = '',
            html = templateBu.replaceAll('{tenMonHoc}', app.utils.parse(tenMonHoc, { vi: '' })?.vi).replaceAll('{maHocPhan}', maHocPhan).replaceAll('{teacher}', dataTenGiangVien || '').replaceAll('{thoiGianBu}', title);

        app.service.emailService.send('hocvudaotao1@hcmussh.edu.vn', 'fromMailPassword', emailTo, listEmail.toString(), null, subject, text, html, null);
    };
};