import React from 'react';
import { AdminPage, renderDataTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { createDtDiem } from 'modules/mdDaoTao/dtDiem/redux';
import { getConfigDiemByHocPhan } from 'modules/mdDaoTao/dtDiemConfig/redux';
import { dtDiemVerifyVerifyStudent } from 'modules/mdDaoTao/dtDiemVerifyCode/redux';
import { UpdateThanhPhanDiem, UpdateDiemSinhVienByHocPhan, getDtThoiKhoaBieuStudentList, GhiChuDiemSinhVien, NhapDiemSinhVien } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import AdjustThanhPhanDiem from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/adjustThanhPhanDiem';
import ScanDiemModal from 'modules/mdDaoTao/dtDiemAll/scanDiemModal';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';
import LichSuNhapDiem from 'modules/mdDaoTao/dtDiemHistory/lichSuModal';

class SectionHPStudent extends AdminPage {
    defaultSortTerm = 'mssv_ASC'

    diemTk = {}
    ghiChu = {}

    thanhPhanDiem = {}

    state = { filter: {}, dataConfigThanhPhan: [], dataHocPhan: {}, listStudent: [], dataThanhPhanDiem: [], dataConfigQuyChe: [] }
    mapperLoaiDangKy = {
        'KH': <span className='text-primary'><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span className='text-success'><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span className='text-warning'><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span className='text-danger'><i className='fa fa-lg fa-repeat' /> Học lại</span>,
    }

    mapperStyle = {
        'GK': 'warning',
        'CK': 'danger',
    }

    setData = (data, done) => {
        let { maMonHoc, maHocPhan, namHoc, hocKy, tinhTrangDiem } = data[0];
        this.props.getConfigDiemByHocPhan({ maMonHoc, maHocPhan, namHoc, hocKy }, dataState => {
            let { timeNow, dataConfig, dataConfigQuyChe = [], dataConfigHocPhan = [], dataConfigMonHoc = [], dataConfigThanhPhan = [] } = dataState;

            let data = [];
            if (dataConfigHocPhan.length) {
                data = dataConfigHocPhan;
            } else if (dataConfigMonHoc.length) {
                data = dataConfigMonHoc;
            } else {
                dataConfigThanhPhan.forEach(item => {
                    let { loaiThanhPhan, tenThanhPhan, isThi, phanTramMacDinh: phanTram, loaiLamTron = 0.5, phanTramMax = 100, phanTramMin = 0, priority } = item;
                    data.push({ loaiThanhPhan, tenThanhPhan, isThi, phanTram, loaiLamTron, phanTramMax, phanTramMin, priority });
                });
            }

            if (!data.length) {
                dataConfigQuyChe = [];
            }

            let { thoiGianNhap, thoiGianKetThucNhap } = dataConfig ? dataConfig : { thoiGianNhap: 0, thoiGianKetThucNhap: 0 };
            let readOnly = !this.props.isManage && ((thoiGianNhap == 0) || (timeNow < thoiGianNhap || timeNow > thoiGianKetThucNhap));

            let listTp = data.map(i => i.loaiThanhPhan);
            dataConfigQuyChe = dataConfigQuyChe.filter(i => listTp.length && i.loaiApDung && listTp.some(tp => i.loaiApDung.split(', ').includes(tp)));

            data.sort((a, b) => b.priority - a.priority);
            this.setState({ tinhTrangDiem, readOnly, dataConfig, dataConfigQuyChe, dataConfigThanhPhan, dataThanhPhanDiem: data, dataHocPhan: { maMonHoc, maHocPhan, namHoc, hocKy } }, () => {
                this.getListStudent(done);
            });
        });
    }

    getListStudent = (done) => {
        let { namHoc, hocKy } = this.state.dataHocPhan || {};
        this.props.getDtThoiKhoaBieuStudentList(this.props.maHocPhan, { namHoc, hocKy }, (items) => {
            this.setState({ listStudent: items, isEditThanhPhan: !items.length || items.every(i => !i.count), isNhapDiem: false }, () => {
                this.setVal(this.state.listStudent);
                done && done();
            });
        });
    }

    setVal = (listStudent) => {
        listStudent.forEach(student => {
            let { mssv, diem, ghiChu } = student;
            if (diem && diem['TK'] != null) {
                this.diemTk[mssv]?.value((!isNaN(parseFloat(diem['TK']))) ? parseFloat(diem['TK']).toFixed(1).toString() : diem['TK']);
            } else {
                this.diemTk[mssv].value('');
            }
            this.ghiChu[mssv]?.value(ghiChu || '');
        });
    }

    handleGhiChu = (value, mssv) => {
        let { listStudent } = this.state;
        this.setState({ listStudent: listStudent.map(cur => (mssv == cur.mssv) ? ({ ...cur, ghiChu: value }) : ({ ...cur })) });
    }

    handleDiem = (e, student, thanhPhan) => {
        let { loaiThanhPhan, loaiLamTron } = thanhPhan,
            { diem, diemDacBiet, mssv } = student,
            { dataConfigQuyChe, dataThanhPhanDiem, listStudent } = this.state,
            keyDacBiet = dataConfigQuyChe.filter(i => i.loaiApDung.split(', ').includes(loaiThanhPhan)),
            khongTinhPhi = 0,
            value = e.target.innerText?.toUpperCase(),
            invalidValue = (diemDacBiet && diemDacBiet[loaiThanhPhan]) || (diem && diem[loaiThanhPhan]) || '';

        // Gan diem thanh phan va diem dac biet
        if (isNaN(value)) {
            const key = keyDacBiet.filter(i => i.ma != 'I').find(item => item.ma == value);
            if (key) {
                if (key.tinhTongKet) {
                    this.diemTk[mssv].value(value);
                    this.setState({
                        listStudent: listStudent.map(cur => (mssv == cur.mssv) ? ({
                            ...cur, khongTinhPhi: key.khongTinhPhi,
                            diem: { ...diem, 'TK': value, [loaiThanhPhan]: value },
                            diemDacBiet: { ...diemDacBiet, [loaiThanhPhan]: value }
                        }) : ({ ...cur }))
                    });
                    return;
                } else {
                    diem = { ...diem, [loaiThanhPhan]: '0.0' };
                    diemDacBiet = { ...diemDacBiet, [loaiThanhPhan]: value };
                    khongTinhPhi = key.khongTinhPhi;
                }
            } else {
                e.target.innerText = invalidValue;
                T.notify(value == 'I' ? 'Không được phép nhập điểm hoãn!' : 'Điểm đặc biệt không hợp lệ!', 'warning');
                return;
            }
        } else {
            if (parseFloat(value) < 0 || parseFloat(value) > 10) {
                e.target.innerText = invalidValue;
                T.notify('Điểm phải nằm trong khoảng 0 - 10!', 'warning');
                return;
            } else if (parseFloat(value) >= 0 || parseFloat(value) <= 10) {
                const rate = parseFloat(loaiLamTron) / 0.1;
                value = Math.round(value * (10 / rate)) / (10 / rate);
                diem = { ...diem, [loaiThanhPhan]: value.toFixed(1).toString() };
                diemDacBiet = { ...diemDacBiet, [loaiThanhPhan]: '' };
            } else {
                diem = { ...diem, [loaiThanhPhan]: '' };
                diemDacBiet = { ...diemDacBiet, [loaiThanhPhan]: '' };
            }
        }

        // Update diem tong ket
        let sum = '';
        for (const tp of dataThanhPhanDiem) {
            const diemTp = diem[tp.loaiThanhPhan];
            if (diemTp && isNaN(diemTp)) {
                sum = diemTp;
                break;
            } else if (diemTp != '' && diemTp != null) {
                if (sum == '') sum = parseFloat(diemTp) * parseInt(tp.phanTram);
                else sum += parseFloat(diemTp) * parseInt(tp.phanTram);
            }
        }

        if (!isNaN(parseFloat(sum))) {
            sum = (Math.round((2 * sum) / 100) / 2).toFixed(1);
        }

        this.diemTk[mssv].value(sum.toString());
        e.target.innerText = diemDacBiet[loaiThanhPhan] || diem[loaiThanhPhan];
        this.setState({
            listStudent: listStudent.map(cur => (mssv == cur.mssv) ? ({
                ...cur, khongTinhPhi,
                diem: { ...diem, 'TK': sum.toString() ?? '' },
                diemDacBiet: { ...diemDacBiet }
            }) : ({ ...cur }))
        });
    }

    handlePressDiem = (e) => {
        let key = e.key,
            value = e.target.textContent;

        // Only allow numeric values, decimal point, and backspace/delete keys
        const allowKeys = ['Backspace', 'Delete', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Tab'];

        if (!allowKeys.includes(key)) {
            if (/[0-9\.]/.test(key)) {
                // Only allow one decimal point
                if (key === '.' && value.includes('.')) {
                    e.preventDefault();
                    return;
                }

                // Limit value between 0 and 10
                if (parseFloat(value) < 0 || parseFloat(value) > 10) {
                    e.preventDefault();
                }
            }
        }

        if (key !== 'Backspace' && key !== 'Delete') {
            value += key;
        }

        // Limit value between 0 and 10
        if (parseFloat(value) < 0 || parseFloat(value) > 10) {
            e.preventDefault();
            return;
        }

        // If enter is pressed, set editable to false
        if (key === 'Enter' || key === 'Tab') {
            e.target.blur();
        }

        if (key == 'ArrowDown') {
            const currentTd = e.target.parentElement;
            const nextTd = currentTd.parentNode.nextElementSibling?.querySelector(`td:nth-child(${currentTd.cellIndex + 1})`);
            if (nextTd) {
                currentTd.children[0].blur();
                nextTd.children[0].focus();
            }
        }

        if (key == 'ArrowUp') {
            const currentTd = e.target.parentElement;
            const prevTd = currentTd.parentNode.previousElementSibling?.querySelector(`td:nth-child(${currentTd.cellIndex + 1})`);
            if (prevTd) {
                currentTd.children[0].blur();
                prevTd.children[0].focus();
            }
        }
    }

    downloadExcel = () => {
        T.handleDownload(`/api/dt/thoi-khoa-bieu/sinh-vien/download-dssv-hoc-phan?maHocPhan=${this.props.maHocPhan}`);
    }

    downloadExcelDiemDanh = () => {
        T.handleDownload(`/api/dt/thoi-khoa-bieu/sinh-vien/download-diem-danh-hoc-phan?maHocPhan=${this.props.maHocPhan}`);
    }

    downloadConfirm = () => {
        if (this.state.tinhTrangDiem == 4) {
            T.alert('Học phần đã khóa bảng điểm', 'warning', false, 5000);
        } else {
            T.confirm('Xác nhận bảng điểm', 'Sau khi xác nhận bảng điểm bạn sẽ không thể nhập điểm. Bạn có chắc chắn muốn xác nhận bảng điểm không?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.handleDownload(`/api/dt/verify-code/download-verify-diem?dataHocPhan=${T.stringify(this.state.dataHocPhan)}`);
                    this.setState({ tinhTrangDiem: 4 });
                }
            });
        }
    }

    downloadFormExam = (tp) => {
        const { dataHocPhan } = this.state,
            { maHocPhan, namHoc, hocKy } = dataHocPhan,
            { loaiThanhPhan: kyThi, tenThanhPhan: tenKyThi, phanTram } = tp;

        T.handleDownload(`/api/dt/thoi-khoa-bieu/sinh-vien/danh-sach-thi?data=${T.stringify({ maHocPhan, kyThi, namHoc, hocKy, tenKyThi, phanTram })}`);
    }

    save = () => {
        const { listStudent, dataThanhPhanDiem, dataHocPhan } = this.state;
        let dataStudent = listStudent.map(i => ({ mssv: i.mssv, diem: i.diem, diemDacBiet: i.diemDacBiet, ghiChu: i.ghiChu, khongTinhPhi: i.khongTinhPhi }));

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn Cập nhật điểm của lớp học phần này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang cập nhật điểm sinh viên!', 'warning', false, null, true);
                this.props.UpdateDiemSinhVienByHocPhan(T.stringify({ dataStudent, dataThanhPhanDiem, dataHocPhan }), () => {
                    this.getListStudent(() => T.alert('Cập nhập điểm thành công!', 'success', true));
                });
            }
        });
    }

    handleVerify = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn xác nhận điểm của sinh viên này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (!item.diem) return T.alert('Sinh viên chưa được nhập điểm!', 'warning', true, 2000);
                this.props.dtDiemVerifyVerifyStudent(item.mssv, item.maHocPhan);
            }
        });
    }

    render() {
        let { dataConfig, dataThanhPhanDiem, listStudent, dataConfigQuyChe, readOnly, isNhapDiem, isEditThanhPhan, dataHocPhan, dataConfigThanhPhan, tinhTrangDiem } = this.state,
            widthTP = 30 / (dataThanhPhanDiem.length + 1),
            { thoiGianNhap, thoiGianKetThucNhap } = dataConfig ? dataConfig : { thoiGianNhap: 0, thoiGianKetThucNhap: 0 };
        const { isManage } = this.props,
            className = isNhapDiem ? 'btn btn-success' : 'btn btn-primary',
            icon = isNhapDiem ? 'fa-save' : 'fa-pencil',
            textButton = isNhapDiem ? 'Lưu' : 'Nhập điểm',
            viewing = this.props.viewing;
        const permission = this.getUserPermission('dtThoiKhoaBieu', ['read', 'write', 'delete', 'manage', 'export', 'import']);
        permission.write = this.getUserPermission('dtDiemAll', ['write']).write;

        let studentTable = () => renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: listStudent,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>MSSV</th>
                        <th style={{ width: '20%', verticalAlign: 'middle' }}>Họ và tên lót</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Tên</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Lớp</th>
                        {dataThanhPhanDiem.map((item, index) => (<th key={index} style={{ width: `${widthTP}%`, whiteSpace: 'nowrap', textAlign: 'center' }}>{item.tenThanhPhan}</th>))}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm tổng kết</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                        {!isNhapDiem && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lịch sử</th>}
                    </tr>
                </>
                );
            },
            renderRow: (item, index) => {
                return (
                    <tr key={`student-${index}`}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.mssv} />
                        <TableCell content={item.ho} />
                        <TableCell content={item.ten} />
                        <TableCell content={item.lop} />
                        {listStudent.length && dataThanhPhanDiem.map(thanhPhan => {
                            let loaiThanhPhan = thanhPhan.loaiThanhPhan,
                                diem = item.diem ? item.diem[loaiThanhPhan] : '',
                                diemDacBiet = item.diemDacBiet ? item.diemDacBiet[loaiThanhPhan] : '',
                                timeMod = item.timeModified ? parseInt(item.timeModified[loaiThanhPhan]) : '',
                                userMod = item.userModified ? item.userModified[loaiThanhPhan] : '',
                                title = userMod ? `${T.dateToText(Number(timeMod), 'dd/mm/yyyy HH:MM:ss')}-${userMod}` : '';

                            diem = (!isNaN(parseFloat(diem))) ? parseFloat(diem).toFixed(1).toString() : diem;
                            return isNhapDiem && diemDacBiet != 'I' ? <Tooltip arrow title={title}>
                                <td>
                                    <div key={`${item.mssv}_${loaiThanhPhan}`} id={`${item.mssv}_${loaiThanhPhan}`}
                                        contentEditable suppressContentEditableWarning={true}
                                        onBlur={e => this.handleDiem(e, item, thanhPhan)}
                                        onKeyDown={e => this.handlePressDiem(e)}
                                        style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center', cursor: 'auto', border: '1.5px solid #ced4da', borderCollapse: 'collapse', borderRadius: '4px', fontSize: 'large', fontFamily: 'serif' }}
                                    >
                                        {diemDacBiet || diem}
                                    </div>
                                </td>
                            </Tooltip> : <Tooltip arrow title={title}>
                                <td><div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{diemDacBiet || diem}</div></td>
                            </Tooltip>;
                        })}
                        <TableCell style={{ width: 'auto', textAlign: 'center', justifyContent: 'center' }} content={<FormTextBox className='mb-0' ref={e => this.diemTk[item.mssv] = e} readOnly />} />
                        <TableCell style={{ width: 'auto', justifyContent: 'center' }} content={<FormTextBox className='mb-0' placeholder='Ghi chú' ref={e => this.ghiChu[item.mssv] = e} readOnly={readOnly || !isNhapDiem} onBlur={(e) => this.handleGhiChu(e, item.mssv)} />} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi ? 'text-danger' : 'text-success'}
                            content={item.tinhPhi ? <Tooltip title='Còn nợ học phí'>
                                <i className='fa fa-lg fa-times-circle' />
                            </Tooltip>
                                : <Tooltip title='Đã đóng đủ'>
                                    <i className='fa fa-lg fa-check-circle' />
                                </Tooltip>} />
                        {!isNhapDiem && <TableCell type='buttons' style={{ textAlign: 'center', whiteSpace: 'nowrap', display: !viewing && permission.write ? '' : 'none' }}
                            content={item} permission={{ write: true }}>
                            <Tooltip title='Lịch sử nhập điểm' arrow placeholder='bottom'>
                                <a className='btn btn-warning'
                                    onClick={e => e.preventDefault() || this.lichSuModal.show({ mssv: item.mssv, maHocPhan: dataHocPhan.maHocPhan, showInfo: 1 })}>
                                    <i className='fa fa-lg fa-eye' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Xác nhận điểm' arrow placeholder='bottom'>
                                <a className='btn btn-success'
                                    onClick={e => e.preventDefault() || this.handleVerify(item)}>
                                    <i className='fa fa-lg fa-check-circle' />
                                </a>
                            </Tooltip>
                        </TableCell>}
                    </tr>
                );
            }
        });

        return (<>
            <LichSuNhapDiem ref={e => this.lichSuModal = e} />
            <ScanDiemModal ref={e => this.scanDiemModal = e} save={() => this.getListStudent(() => T.alert('Cập nhật điểm thành công!', 'success', true, 1000))} />
            <AdjustThanhPhanDiem ref={e => this.modal = e} isEditThanhPhan={isEditThanhPhan} dataHocPhan={dataHocPhan} dataThanhPhan={dataConfigThanhPhan} setData={this.setData} />
            <div style={{ textAlign: 'left', margin: '10px 0px 10px 0px' }}>
                <hr />
                <div className='row' style={{ fontSize: '0.8rem' }}>
                    <div className='col-md-6' style={{ display: dataConfigQuyChe.length ? '' : 'none' }}>
                        <h6>Thông tin các điểm đặc biệt: </h6>
                        {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                            {dataConfigQuyChe.map((item, index) => {
                                return <span key={`qc-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.ma}</b>: {item.moTa} (Áp dụng {item.loaiApDung})</span>;
                            })}
                        </div>}
                    </div>
                    <div className='col-md-6' style={{ display: dataThanhPhanDiem.length ? '' : 'none' }}>
                        <h6>Thông tin các điểm thành phần: </h6>
                        {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                            {dataThanhPhanDiem.map((item, index) => {
                                return <span key={`tp-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.tenThanhPhan} ({item.loaiThanhPhan})</b>: {item.phanTram}% (làm tròn {item.loaiLamTron}) </span>;
                            })}
                        </div>}
                    </div>
                </div>

                <div className='row'>
                    <div className='col-md-12' style={{ marginTop: '10px' }}>
                        <h6 style={{ display: !isManage && thoiGianNhap && thoiGianKetThucNhap ? '' : 'none' }} >Thời gian nhập điểm từ {T.dateToText(thoiGianNhap)} đến {T.dateToText(thoiGianKetThucNhap)}</h6>
                    </div>

                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row-reverse', gap: 10, marginTop: '10px' }}>
                        {/* <Tooltip title='Tải bảng điểm xác nhận' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content', display: isManage ? 'none' : '' }} className='btn btn-primary' type='button' onClick={this.downloadConfirm}>
                                <i className='fa fa-fw fa-lg fa-qrcode' />
                            </button>
                        </Tooltip> */}
                        {dataThanhPhanDiem.filter(i => i.isThi).map(tp => <Tooltip key={`printFile${tp.loaiThanhPhan}`} title={`Tải danh sách thi ${tp.tenThanhPhan}`} arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className={`btn btn-${this.mapperStyle[tp.loaiThanhPhan]}`} type='button' onClick={e => e && e.preventDefault() || this.downloadFormExam(tp)}>
                                <i className='fa fa-fw fa-lg fa-print' /> Danh sách thi {tp.tenThanhPhan}
                            </button>
                        </Tooltip>)}
                        <Tooltip title='Tải danh sách sinh viên' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content', display: isManage ? 'none' : '' }} className='btn btn-info' type='button' onClick={this.downloadExcel}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' /> Danh sách sinh viên
                            </button>
                        </Tooltip>
                        <Tooltip title='Tải danh sách điểm danh' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content', display: isManage ? 'none' : '' }} className='btn btn-warning' type='button' onClick={this.downloadExcelDiemDanh}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' /> Danh sách điểm danh
                            </button>
                        </Tooltip>
                        {/* <Tooltip title='Tải bảng điểm tổng hợp pdf' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content', display: isManage ? 'none' : '' }} className='btn btn-secondary' type='button' onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/thoi-khoa-bieu/download-diem-tong-hop-hoc-phan/pdf?dataHocPhan=${T.stringify(dataHocPhan)}`)}>
                                <i className='fa fa-fw fa-lg fa-file-pdf-o' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Tải bảng điểm tổng hợp excel' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content', display: isManage ? 'none' : '' }} className='btn btn-success' type='button' onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/thoi-khoa-bieu/download-diem-tong-hop-hoc-phan/excel?dataHocPhan=${T.stringify(dataHocPhan)}`)}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' />
                            </button>
                        </Tooltip> */}
                        <React.Fragment>
                            <Tooltip title='Cấu hình phần trăm điểm' arrow placement='top'>
                                <button style={{ height: 'fit-content', display: !permission.write || viewing ? 'none' : '' }} className='btn btn-success' type='button' onClick={() => {
                                    if (tinhTrangDiem == 4) {
                                        T.alert('Học phần đã khóa bảng điểm', 'warning', false, 5000);
                                    } else {
                                        this.modal.show({ dataThanhPhanDiem });
                                    }
                                }}>
                                    <i className='fa fa-fw fa-lg fa-cogs' /> Cấu hình điểm
                                </button>
                            </Tooltip>
                            <Tooltip title='Đè dữ liệu scan' arrow placement='top'>
                                <button style={{ height: 'fit-content', display: tinhTrangDiem == 4 || !permission.write || viewing ? 'none' : '' }} className='btn btn-info' type='button' onClick={() => this.scanDiemModal.show(this.state.dataHocPhan)}>
                                    <i className='fa fa-fw fa-lg fa-refresh' /> Scan
                                </button>
                            </Tooltip>
                            <Tooltip title={textButton} placement='top' arrow>
                                <button className={className} style={{ height: 'fit-content', display: !permission.write || viewing ? 'none' : '' }} onClick={e => {
                                    e.preventDefault();
                                    if (isNhapDiem) this.save();
                                    else {
                                        if (!isManage && readOnly) {
                                            T.alert('Không trong thời gian nhập điểm', 'warning', false, 5000);
                                        } else if (tinhTrangDiem == 4) {
                                            T.alert('Học phần đã khóa bảng điểm', 'warning', false, 5000);
                                        }
                                        else {
                                            this.setState({ isNhapDiem: true });
                                        }
                                    }
                                }}>
                                    <i className={'fa fa-lg ' + icon} /> Nhập điểm
                                </button>
                            </Tooltip>
                            <Tooltip title='Huỷ' placement='top' arrow>
                                <button className='btn btn-secondary' style={{ display: isNhapDiem ? '' : 'none', height: 'fit-content' }}
                                    onClick={e => e.preventDefault() || this.setState({ isNhapDiem: false })}>
                                    <i className='fa fa-lg fa-times' /> Hủy
                                </button>
                            </Tooltip>
                        </React.Fragment>
                    </div>
                </div>
            </div>

            {studentTable()}
        </>);
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    createDtDiem, getConfigDiemByHocPhan, UpdateThanhPhanDiem, UpdateDiemSinhVienByHocPhan, getDtThoiKhoaBieuStudentList, GhiChuDiemSinhVien, NhapDiemSinhVien, dtDiemVerifyVerifyStudent
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionHPStudent);
