import React from 'react';
import { AdminPage, renderTable, TableCell, TableHead } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

export default class HocPhanSection extends AdminPage {
    //Kiem tra môn học có đủ điều kiện cải thiện không
    checkCaiThien = (item) => {
        let { caiThienHK, caiThienMax, caiThienMin, rotMon } = this.props.cauHinhDiem;
        caiThienHK = parseInt(caiThienHK);
        caiThienMax = parseFloat(caiThienMax);
        caiThienMin = parseFloat(caiThienMin);
        rotMon = parseFloat(rotMon);

        let { namHoc, hocKy } = this.props.cauHinh;
        let { maxDiemTK, latestDiem, soonestNamHoc, soonestHocKy } = item;

        if (maxDiemTK && latestDiem && parseFloat(latestDiem) >= rotMon) {
            maxDiemTK = parseFloat(maxDiemTK);
            if (maxDiemTK >= rotMon && (maxDiemTK >= caiThienMax || maxDiemTK < caiThienMin)) {
                return true;
            } else if (maxDiemTK >= rotMon) {
                let soHK = (parseInt(namHoc) - parseInt(soonestNamHoc)) * 2 + parseInt(hocKy) - parseInt(soonestHocKy);

                if (soonestHocKy == 3) {
                    soHK = soHK + 1;
                }

                if (hocKy == 3 && soonestHocKy == 3) {
                    soHK = soHK - 1;
                }

                if (soHK > caiThienHK) {
                    return true;
                }
            }
        }
        return false;
    }
    //Kiem tra môn học có đủ điều kiện tiên quyết không
    checkTienQuyet = (item) => {
        let { rotMon } = this.props.cauHinhDiem;
        let { monTienQuyet } = item;
        let mon = [];
        let isTienQuyet = false;
        if (monTienQuyet && monTienQuyet.length) {
            monTienQuyet.forEach(tq => {
                const { maMon, diem } = tq;
                if (!diem.maxDiemTK || parseFloat(diem.maxDiemTK) < parseFloat(rotMon)) {
                    isTienQuyet = true;
                    mon.push(maMon);
                }
            });
        }
        return [isTienQuyet, mon];
    }
    //Kiem tra môn học có đủ điều kiện tương đương không
    checkTuongDuong = (item) => {
        let { rotMon } = this.props.cauHinhDiem;
        let { monTuongDuong } = item;
        let mon = [];
        let isTuongDuong = false;
        if (monTuongDuong && monTuongDuong.lengh) {
            let listTD = monTuongDuong.split(';');
            listTD.forEach(TD => {
                let diem = TD.split(':')[1];
                if (diem && parseFloat(diem) >= parseFloat(rotMon)) {
                    isTuongDuong = true;
                    mon.push(TD.split(':')[0]);
                }
            });
            monTuongDuong.forEach(td => {
                const { maMon, diem } = td;
                if (diem.maxDiemTK && parseFloat(diem.maxDiemTK) >= parseFloat(rotMon)) {
                    isTuongDuong = true;
                    mon.push(maMon);
                }
            });
        }
        return [isTuongDuong, mon];
    }

    chonMonHoc = (item) => {
        let [isTD, mon] = this.checkTuongDuong(item);
        if (isTD) {
            T.notify(`Bạn đã học môn tương đương: ${mon.join(', ')}`, 'warning');
        }
    }

    renderSection = (list, { caiThienHK, caiThienMax, caiThienMin }) => {
        return renderTable({
            emptyTable: list?.length == 0 ? 'Không tìm thấy môn học nào!' : '',
            getDataSource: () => list || [],
            stickyHead: list?.length > 20,
            divStyle: { height: '50vh' },
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <TableHead style={{ width: '30%', minWidth: 'auto', maxWidth: 'auto' }} content='Mã môn học' keyCol='monHoc' />
                    <TableHead content='Tên môn học' style={{ width: '70%', minWidth: 'auto', maxWidth: 'auto' }} keyCol='tenMonHoc' />
                    <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto', textAlign: 'right' }} content='TC' keyCol='tongTinChi' />
                    <TableHead style={{ width: 'auto', minWidth: 'auto', maxWidth: 'auto', textAlign: 'right' }} content='Số tiết' keyCol='tongSoTiet' />
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chọn lớp</th>
                </tr>),
            renderRow: (item, index) => {
                let [isTQ, mon] = this.checkTienQuyet(item),
                    isCaiThien = this.checkCaiThien(item),
                    isNotHasDiem = item.tinhTrangDiem == 1 || (item.isDangKy && (item.maxDiemTK == null || (item.latestDiem && isNaN(parseFloat(item.latestDiem))))),
                    isMienDiem = Number(item.isMienDiem),
                    { avrInfo } = this.props.hocPhan,
                    { tcDkMin, tcTlMin, avrMin } = item,
                    isErrorAvr = false, message = '';

                if (tcDkMin != null && avrInfo.tinChiDangKy < tcDkMin) {
                    message = `Bạn chưa đủ tín chỉ đăng ký tối thiếu ${tcDkMin} cần để đăng ký môn học`;
                    isErrorAvr = true;
                } else if (tcTlMin != null && avrInfo.tinChiTichLuy < tcTlMin) {
                    message = `Bạn chưa đủ tín chỉ tích lũy tối thiểu ${tcTlMin} cần để đăng ký môn học`;
                    isErrorAvr = true;
                } else if (avrMin != null && parseFloat(avrInfo.diemTrungBinhTichLuy) < parseFloat(avrMin)) {
                    message = `Bạn chưa đạt điểm trung bình tích lũy tối thiểu ${avrMin} cần để đăng ký môn học`;
                    isErrorAvr = true;
                }

                return (
                    <tr key={index} style={{ backgroundColor: item.tinhTrang == 3 ? '#ffcccb' : '' }} >
                        <TableCell style={{ width: 'auto' }} content={index + 1} />
                        <TableCell style={{ width: 'auto' }} content={item.maMonHoc} />
                        <TableCell style={{ width: 'auto' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell type='number' content={item.tongTinChi} />
                        <TableCell type='number' content={item.tongSoTiet} />
                        <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ write: true }}>
                            <Tooltip title='Chọn' arrow>
                                <button className='btn btn-primary' style={{ display: !(isTQ || isCaiThien || isNotHasDiem || isMienDiem || isErrorAvr || item.isCheckNN) ? '' : 'none' }} onClick={(e) => e.preventDefault() || this.chonMonHoc(item)}>
                                    <i className='fa fa-lg fa-list' />
                                </button>
                            </Tooltip>

                            <Tooltip title='Bạn không đủ điều kiện ngoại ngữ không chuyên' arrow onClick={(e) => e.preventDefault() || T.alert('Bạn không đủ điều kiện ngoại ngữ không chuyên', 'error', false, 5000)}>
                                <button className='btn btn-danger' style={{ display: item.isCheckNN ? '' : 'none' }}>
                                    <i className='fa fa-lg fa-lock' />
                                </button>
                            </Tooltip>

                            <Tooltip title='Bạn chưa có điểm của môn học' arrow onClick={(e) => e.preventDefault() || T.alert('Môn học của học kỳ trước chưa có điểm', 'error', false, 5000)}>
                                <button className='btn btn-danger' style={{ display: !item.isCheckNN && isNotHasDiem ? '' : 'none' }}>
                                    <i className='fa fa-lg fa-lock' />
                                </button>
                            </Tooltip>

                            <Tooltip title='Bạn chưa học môn tiên quyết' arrow onClick={(e) => e.preventDefault() || T.alert(`Bạn chưa học môn tiên quyết: ${mon.join(', ')}`, 'error', false, 5000)}>
                                <button className='btn btn-danger' style={{ display: isTQ && !isNotHasDiem && !item.isCheckNN ? '' : 'none' }}>
                                    <i className='fa fa-lg fa-lock' />
                                </button>
                            </Tooltip>

                            <Tooltip title='Môn học đã được miễn' arrow onClick={(e) => e.preventDefault() || T.alert('Bạn đã được miễn học môn học này', 'error', false, 5000)}>
                                <button className='btn btn-danger' style={{ display: isMienDiem && !isTQ && !isNotHasDiem && !item.isCheckNN ? '' : 'none' }}>
                                    <i className='fa fa-lg fa-lock' />
                                </button>
                            </Tooltip>

                            <Tooltip title='Bạn không đủ điều kiện đăng ký học cải thiện' arrow onClick={(e) => e.preventDefault() || T.alert(`Bạn chỉ có thể đăng ký môn học cải thiện khi điểm của bạn từ ${caiThienMin} đến dưới ${caiThienMax} và trong vòng tối đa ${caiThienHK} học kỳ sau khi có điểm`, 'error', false, 5000)}>
                                <button className='btn btn-danger' style={{ display: isCaiThien && !isMienDiem && !isTQ && !isNotHasDiem && !item.isCheckNN ? '' : 'none' }}>
                                    <i className='fa fa-lg fa-lock' />
                                </button>
                            </Tooltip>

                            <Tooltip title='Bạn không đủ điều kiện đăng ký môn học' arrow onClick={(e) => e.preventDefault() || T.alert(message, 'error', false, 5000)}>
                                <button className='btn btn-danger' style={{ display: isErrorAvr && !isMienDiem && !isCaiThien && !isTQ && !isNotHasDiem && !item.isCheckNN ? '' : 'none' }}>
                                    <i className='fa fa-lg fa-lock' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr >
                );
            }
        });
    }
}