import React from 'react';
import { AdminPage, FormTextBox, TableCell, getValue, renderTable } from 'view/component/AdminPage';

export default class BangDiemSinhVien extends AdminPage {
    state = {};
    colorMain = '#0139a6';

    genDataNamHoc = () => {
        try {
            let nam = Number(this.props.system.user.data.khoaSV);
            const currYear = new Date().getFullYear();
            this.setState({ namHoc: Array.from({ length: currYear - nam + 1 }, (_, i) => `${nam + i} - ${nam + i + 1}`) });
        } catch (error) {
            T.notify('Không tìm thấy khoá học của sinh viên', 'danger');
            console.error(error);
        }
    }

    initData = () => {
        const { mssv, hoTen, heDaoTao, tenNganh, ngaySinh, noiSinh } = this.state.studentInfo;
        this.mssv.value(mssv);
        this.hoTen.value(hoTen);
        this.he.value(heDaoTao);
        this.noiSinh.value(noiSinh);
        this.ngaySinh.value(!isNaN(ngaySinh) ? T.dateToText(ngaySinh, 'dd/mm/yyyy') : ngaySinh);
        this.nganh.value(tenNganh);
    }

    tongQuan = (currNamHoc, currHocKy, fullDataDiem) => {
        let diemTB = 0, soTCTichLuy = 0, tcTinhTrungBinh = 0;
        const listMonHoc = (fullDataDiem || []).groupBy('maMonHoc'),
            { diemRotMon, monKhongTinhTB } = this.state;
        Object.keys(listMonHoc).forEach(key => {
            const monHoc = listMonHoc[key].filter(monHoc => monHoc.diem && ((monHoc.namHoc < currNamHoc) || (monHoc.namHoc == currNamHoc && monHoc.hocKy <= currHocKy)));

            let diemTBMon = 0, TCTLMon = 0, TCTinhTb = 0;
            for (let diemMon of monHoc) {
                const { diem, tongTinChi, configQC, diemDat } = diemMon,
                    threshold = Number(diemDat || diemRotMon || 5);

                if (tongTinChi) {
                    const diemDacBiet = configQC.find(i => i.ma == diem['TK']);
                    if (diemDacBiet) {
                        let { tinhTinChi } = diemDacBiet;
                        tinhTinChi = Number(tinhTinChi);
                        if (tinhTinChi) TCTLMon = tongTinChi;
                    } else {
                        if (Number(diem['TK']) >= threshold) {
                            TCTLMon = tongTinChi;
                            if (diemTBMon < Number(diem['TK'] || 0)) {
                                TCTinhTb = tongTinChi;
                                diemTBMon = Number(diem['TK'] || 0);
                            }
                        }
                        if (monKhongTinhTB.includes(key)) TCTinhTb = 0;
                    }
                }
            }

            soTCTichLuy += TCTLMon;
            diemTB += diemTBMon * TCTinhTb;
            tcTinhTrungBinh += TCTinhTb;
        });

        let { soTCDat, soTCKhongDat, soTC } = this.calculateTCHK(fullDataDiem || []);
        this.tongTC.value(soTC);
        this.soTCDat.value(soTCDat);
        this.soTCTichLuy.value(soTCTichLuy);
        this.diemTBTL.value(((diemTB / tcTinhTrungBinh) || 0).toFixed(2));
        this.soTCKDat.value(soTCKhongDat);
    };

    calculateTCHK = (list) => {
        let soTCDat = 0, soTCKhongDat = 0, soTCKhongTinh = 0, soTC = 0;
        for (let item of list) {
            let threshold = Number(item.diemDat || this.state.diemRotMon || 5),
                tongTinChi = Number(item.tongTinChi);

            if (item.tongTinChi) {
                const diemDacBiet = item.configQC.find(i => i.ma == item.diem.TK);
                if (diemDacBiet) {
                    let { tinhTinChi } = diemDacBiet;
                    tinhTinChi = Number(tinhTinChi);
                    if (tinhTinChi) soTCDat += tongTinChi;
                    else soTCKhongTinh += tongTinChi;
                } else {
                    if (Number(item.diem.TK ?? 0) >= threshold) soTCDat += Number(tongTinChi);
                    else soTCKhongDat += tongTinChi;
                }
                soTC += tongTinChi;
            }
        }
        return { soTCDat, soTCKhongDat, soTCKhongTinh, soTC };
    };

    diemTrungBinhHocKy = (list) => {
        let tongTC = 0, tongDiem = 0;
        list.filter(i => i.diem).forEach(item => {
            const { configQC, diem } = item,
                diemDacBiet = configQC.find(i => i.ma == diem['TK']);
            if (!this.state.monKhongTinhTB.includes(item.maMonHoc) && !diemDacBiet) {
                tongDiem += Number(item.diem['TK'] || 0) * Number(item.tongTinChi);
                tongTC += Number(item.tongTinChi);
            }
        });
        return Math.round((tongDiem / tongTC + 1e-9) * 100) / 100;
    };


    handleChange = () => {
        let namHoc = getValue(this.namHocFilter), hocKy = getValue(this.hocKyFilter);
        if (!namHoc && hocKy) {
            T.notify('Vui lòng chọn năm học tìm kiếm', 'danger');
        } else {
            const listDiem = (this.state.dataDiem || []).filter(diem => {
                if (namHoc && hocKy) {
                    return diem.namHoc == namHoc && diem.hocKy == hocKy;
                } else if (namHoc) {
                    return diem.namHoc == namHoc;
                } else if (hocKy) {
                    return diem.hocKy == hocKy;
                } else {
                    return true;
                }
            });
            if (listDiem.length == 0) {
                T.notify('Hiện không có thông tin điểm của năm học và học kỳ bạn muốn tìm kiếm!!!', 'danger');
            }
            this.setState({ listDiem, namHoc, hocKy });
        }
    }

    renderBangDiem = () => {
        let { showThanhPhan = true, showChiTiet = true } = this.props;
        let { listDiem, dataThanhPhan, dmHeDiem, dataThangDiem, studentInfo } = this.state;
        const dataNamHoc = (listDiem || []).groupBy('namHoc');
        const namHocKeys = Object.keys(dataNamHoc);

        let table = (list, namHoc, hocKy) => renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có thông tin điểm trong năm học và học kỳ này',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => {
                const thanhPhan = dataThanhPhan.filter(i => i.namHoc == namHoc && i.hocKy == hocKy).sort((a, b) => Number(a.phanTramMacDinh) - Number(b.phanTramMacDinh));
                return (
                    <>
                        <tr>
                            <th rowSpan='2' style={{ widht: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>#</th>
                            <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Mã môn học</th>
                            <th rowSpan='2' style={{ width: '80%', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Tên môn học</th>
                            <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Mã học phần</th>
                            <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Phần trăm điểm</th>
                            <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>TC</th>
                            {showThanhPhan && <th colSpan={thanhPhan.length} rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: '1px solid #d0d3d6', display: thanhPhan.length ? '' : 'none' }}>Điểm thành phần</th>}
                            <th colSpan={dmHeDiem.length + 1} rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border: '1px solid #d0d3d6' }}>Điểm tổng kết</th>
                            <th rowSpan='2' style={{ widht: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Kết quả</th>
                            <th rowSpan='2' style={{ widht: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Ghi chú</th>
                            {showChiTiet && <th rowSpan='2' style={{ widht: 'auto', whiteSpace: 'nowrap', border: '1px solid #d0d3d6' }}>Chi tiết</th>}
                        </tr>
                        <tr>
                            {
                                showThanhPhan && thanhPhan.map(tp => <th key={tp.ma} style={{ minWidth: `${21 / thanhPhan.length}rem`, whiteSpace: 'nowrap', textAlign: 'center', border: '1px solid #d0d3d6' }}>{tp.loaiDiem}</th>)
                            }
                            <th style={{ width: 'auto', minWidth: '7rem', whiteSpace: 'nowrap', textAlign: 'center', border: '1px solid #d0d3d6' }}>Điểm 10</th>
                            {
                                dmHeDiem.map(he => <th key={he.id} style={{ width: 'auto', minWidth: '7rem', whiteSpace: 'nowrap', textAlign: 'center', border: '1px solid #d0d3d6' }}>{he.ten}</th>)
                            }
                        </tr>
                    </>);
            },
            renderRow: (item, index) => {
                let isPass = Number(item.diem['TK']) >= Number(item.diemDat || this.state.diemRotMon || 5),
                    color = isPass ? '#0139a6' : '#d3242c',
                    showPass = isPass ? <i className='fa fa-lg fa-check-circle text-success' /> : <i className='fa fa-lg fa-times-circle text-danger' />;
                const thanhPhan = dataThanhPhan.filter(i => i.namHoc == namHoc && i.hocKy == hocKy).sort((a, b) => Number(a.phanTramMacDinh) - Number(b.phanTramMacDinh)),
                    diemDacBiet = item.configQC.find(i => i.ma == item.diem['TK']);

                return (
                    <tr key={index} >
                        <TableCell content={index + 1} />
                        <TableCell content={item.maMonHoc} />
                        <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tpDiem.sort((a, b) => Number(a.phanTram) - Number(b.phanTram)).map((i, idx) => <div key={idx}>{`${i.tenThanhPhan}: ${i.phanTram}%`}</div>)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongTinChi} />
                        {showThanhPhan && thanhPhan.map(tp => <TableCell key={`${item.maMonHoc}-${tp.ma}`} style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold' }} content={item.diem[tp.ma]} />)}
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', color: isNaN(item.diem['TK']) ? '' : color }} content={item.diem['TK']} />
                        {
                            dmHeDiem.map(he => {
                                let diem = Number(item.diem['TK'] || 0);
                                let thangDiem = dataThangDiem.find(i => (Number(i.min) <= diem && Number(i.max) > diem) || (diem == 10 && Number(i.max) == 10));
                                return <TableCell key={'diem' + he.id} style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', color: isNaN(item.diem['TK']) ? '' : color }} content={isNaN(parseFloat(item.diem['TK'])) ? '' : thangDiem?.loaiHe[he.id]} />;
                            })
                        }
                        <TableCell style={{ textAlign: 'center' }} content={Object.keys(item.diem).length == 0 || isNaN(parseFloat(item.diem['TK'])) ? '' : showPass} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={diemDacBiet?.moTa || ''} />
                        {showChiTiet && <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center', cursor: 'pointer' }} content={<i className='fa fa-lg fa-search text-primary' onClick={() => this.scanDiemModal.show({ mssv: studentInfo.mssv, maHocPhan: item.maHocPhan, isAnDiem: item.R != 1 && item.tinhPhi && item.noHocPhi < 0 && item.isAnDiem })} />} />}
                    </tr>
                );
            }
        });

        return <>
            {
                namHocKeys.map(key => {
                    const dataHocKy = dataNamHoc[key].groupBy('hocKy');
                    return Object.keys(dataHocKy).sort((a, b) => a - b ? - 1 : 0).map((hocKy, i) => {
                        let { soTCDat, soTCKhongDat, soTCKhongTinh, soTC } = this.calculateTCHK(dataHocKy[hocKy]),
                            diemTB = this.diemTrungBinhHocKy(dataHocKy[hocKy]);
                        return (
                            <div className='tile' key={`${key}_${i}`}>
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h4 style={{ margin: '10px', color: '#0139a6' }}>Niên khóa: {key} - Học kỳ {hocKy}</h4>
                                    <i className='fa fa-2x fa-bars text-primary' style={{ cursor: 'pointer' }} data-toggle='collapse' data-target={`#collapse_${key.substring(0, 4)}${hocKy}`} aria-expanded='true' aria-controls={`collapse_${key.substring(0, 4)}${hocKy}`} />
                                </div>
                                <div className='collapse' id={`collapse_${key.substring(0, 4)}${hocKy}`}>
                                    {table(dataHocKy[hocKy], key, hocKy)}
                                </div>
                                <div className='row' style={{ marginTop: '25px' }}>
                                    <h6 className='col-md-3' style={{ textAlign: 'center' }}>Số tín chỉ đăng ký học kỳ: <span style={{ color: '#0139a6' }}>{soTC}</span></h6>
                                    <h6 className='col-md-2' style={{ textAlign: 'center' }}>Số tín chỉ đạt: <span style={{ color: '#0139a6' }}>{soTCDat}</span></h6>
                                    <h6 className='col-md-2' style={{ textAlign: 'center' }}>Số tín chỉ không đạt: <span style={{ color: '#0139a6' }}>{soTCKhongDat}</span></h6>
                                    <h6 className='col-md-2' style={{ textAlign: 'center' }}>Số tín chỉ chưa tính: <span style={{ color: '#0139a6' }}>{soTCKhongTinh}</span></h6>
                                    <h6 className='col-md-3' style={{ textAlign: 'center' }}>Điểm trung bình học kỳ: <span style={{ color: '#0139a6' }}>{diemTB}</span></h6>
                                </div>
                            </div>
                        );
                    });
                })
            }
        </>;
    };

    renderTongQuan = () => (
        <>
            <div className='tile-title'>
                Tổng quan kết quả học tập sinh viên
            </div>
            <div className='tile-body row'>
                <FormTextBox ref={e => this.mssv = e} className='col-md-4' readOnly label='MSSV' />
                <FormTextBox ref={e => this.hoTen = e} className='col-md-4' readOnly label='Họ và tên sinh viên' />
                <FormTextBox ref={e => this.ngaySinh = e} className='col-md-4' readOnly label='Ngày sinh' />
                <FormTextBox ref={e => this.noiSinh = e} className='col-md-4' readOnly label='Nơi sinh' />
                <FormTextBox ref={e => this.he = e} className='col-md-4' readOnly label='Hệ đào tạo' />
                <FormTextBox ref={e => this.nganh = e} className='col-md-4' readOnly label='Ngành' />
            </div>
            <hr />
            <div className='tile-body row'>
                <FormTextBox ref={e => this.tongTC = e} className='col-md-3' label='Tổng số tín chỉ đăng ký' readOnly />
                <FormTextBox ref={e => this.soTCDat = e} className='col-md-2' label='Số tín chỉ đạt' readOnly />
                <FormTextBox ref={e => this.soTCKDat = e} className='col-md-2' label='Số tín chỉ không đạt' readOnly />
                <FormTextBox ref={e => this.soTCTichLuy = e} className='col-md-2' label='Số tín chỉ tích luỹ' readOnly />
                <FormTextBox ref={e => this.diemTBTL = e} className='col-md-3' label='Điểm trung bình tích luỹ' readOnly />
                <i className='col-md-12 text-primary'>* ĐTB không tính môn Giáo dục thể chất, Giáo dục quốc phòng và Ngoại ngữ không chuyên.</i>
            </div>
        </>
    );
}