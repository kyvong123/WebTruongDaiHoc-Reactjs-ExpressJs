import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, TableCell, renderDataTable } from 'view/component/AdminPage';
import { getDataNhapDiem, updateDiemSinhVien } from './redux';
import AdjustThanhPhanDiem from 'modules/mdGiangVien/gvLichGiangDay/adjustThanhPhanDiem';
import { Tooltip } from '@mui/material';
import ImportModal from './importModal';

class nhapDiemPage extends AdminPage {
    defaultSortTerm = 'mssv_ASC'

    diemTk = {}
    ghiChu = {}
    thanhPhanDiem = {}
    state = { dataHocPhan: {}, configQC: [], tpDiem: [], dataStudent: [], listTpThi: [] }

    componentDidMount() {
        T.ready('/user/affair/nhap-diem', () => {
            const route = T.routeMatcher('/user/affair/nhap-diem/edit/:id'),
                id = route.parse(window.location.pathname).id;
            T.alert('Đang lấy dữ liệu!', 'warning', false, null, true);
            this.setState({ id }, () => this.props.getDataNhapDiem(id, result => this.setData(result, () => T.alert('Lấy dữ liệu thành công', 'success', false, 1000))));
        });
    }

    setData = ({ infoHocPhan, item, dataStudent, timeNow, listTpThi, codeStatus }, done) => {
        let { tpHocPhan, tpMonHoc, configQC, configDefault, thoiGianNhap, thoiGianKetThucNhap } = item,
            { namHoc, hocKy, maMonHoc, tenMonHoc, tongTiet, maHocPhan, tenNganh, tenHe, listNienKhoa } = infoHocPhan,
            tpDiem = tpHocPhan || tpMonHoc || configDefault;

        tpDiem = tpDiem ? T.parse(tpDiem) : [];
        tpDiem.sort((a, b) => b.priority - a.priority);

        configQC = configQC ? T.parse(configQC) : [];
        configDefault = configDefault ? T.parse(configDefault) : [];

        tpDiem = tpDiem.map(tp => {
            let { phanTramMax, phanTramMin, isLock } = configDefault.find(cf => cf.thanhPhan == tp.thanhPhan) || { isLock: 0, phanTramMax: tp.thanhPhan == 'CK' ? 100 : 50, phanTramMin: tp.thanhPhan == 'CK' ? 50 : 0 };
            return { ...tp, phanTramMax, phanTramMin, isLock };
        });

        if (!tpDiem.length) configQC = [];

        let listTp = tpDiem.map(i => i.thanhPhan);
        configQC = configQC.filter(i => listTp.length && i.loaiApDung && listTp.some(tp => i.loaiApDung.split(', ').includes(tp)));
        let readOnly = (thoiGianNhap == 0) || (timeNow < thoiGianNhap || timeNow > thoiGianKetThucNhap);

        this.setState({ item, readOnly, configQC, tpDiem, dataHocPhan: { maMonHoc, maHocPhan, namHoc, hocKy }, dataStudent, isNhapDiem: false, thoiGianNhap, thoiGianKetThucNhap, listTpThi, codeStatus }, () => {
            dataStudent.forEach(student => {
                let { mssv, diem, ghiChu } = student;
                if (diem && diem['TK'] != null) {
                    this.diemTk[mssv]?.value((!isNaN(parseFloat(diem['TK']))) ? parseFloat(diem['TK']).toFixed(1).toString() : diem['TK']);
                } else {
                    this.diemTk[mssv].value('');
                }
                this.ghiChu[mssv]?.value(ghiChu || '');
            });
            this.tongTiet.value(tongTiet);
            this.monHoc.value(maMonHoc + ': ' + T.parse(tenMonHoc, { vi: '' })?.vi);
            this.maHocPhan.value(maHocPhan);
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.tenNganh.value(tenNganh);
            this.tenHe.value(tenHe);
            this.listNienKhoa.value(listNienKhoa);
            done && done();
        });
    }

    handleGhiChu = (value, mssv) => {
        let { dataStudent } = this.state;
        this.setState({ dataStudent: dataStudent.map(cur => (mssv == cur.mssv) ? ({ ...cur, ghiChu: value }) : ({ ...cur })) });
    }

    handleDiem = (e, student, tp) => {
        let { thanhPhan, loaiLamTron } = tp,
            { diem, diemDacBiet, mssv } = student,
            { configQC, tpDiem, dataStudent } = this.state,
            keyDacBiet = configQC.filter(i => i.loaiApDung.split(', ').includes(thanhPhan)),
            khongTinhPhi = 0,
            value = e.target.innerText?.toUpperCase(),
            invalidValue = (diemDacBiet && diemDacBiet[thanhPhan]) || (diem && diem[thanhPhan]) || '';

        // Gan diem thanh phan va diem dac biet
        if (isNaN(value)) {
            const key = keyDacBiet.filter(i => !Number(i.tinhTongKet)).find(item => item.ma == value);
            if (key) {
                diem = { ...diem, [thanhPhan]: '0.0' };
                diemDacBiet = { ...diemDacBiet, [thanhPhan]: value };
                khongTinhPhi = key.khongTinhPhi;
            } else {
                e.target.innerText = invalidValue;
                T.notify((keyDacBiet.filter(i => Number(i.tinhTongKet)).map(i => i.ma).includes(value)) ? 'Không được phép nhập điểm hoãn!' : 'Điểm đặc biệt không hợp lệ!', 'warning');
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
                diem = { ...diem, [thanhPhan]: value.toFixed(1).toString() };
                diemDacBiet = { ...diemDacBiet, [thanhPhan]: '' };
            } else {
                diem = { ...diem, [thanhPhan]: '' };
                diemDacBiet = { ...diemDacBiet, [thanhPhan]: '' };
            }
        }

        // Update diem tong ket
        let sum = '';
        for (const tp of tpDiem) {
            const diemTp = diem[tp.thanhPhan];
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
        e.target.innerText = diemDacBiet[thanhPhan] || diem[thanhPhan];
        this.setState({
            dataStudent: dataStudent.map(cur => (mssv == cur.mssv) ? ({
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

    save = () => {
        const { dataStudent, tpDiem, dataHocPhan, id, item } = this.state;
        let listStudent = dataStudent.map(i => ({ mssv: i.mssv, diem: i.diem, diemDacBiet: i.diemDacBiet, ghiChu: i.ghiChu, idDinhChiThi: i.idDinhChiThi }));

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn cập nhật điểm của lớp học phần này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang cập nhật điểm sinh viên!', 'warning', false, null, true);
                this.props.updateDiemSinhVien(T.stringify({ listStudent, tpDiem, dataHocPhan: { ...dataHocPhan, kyThi: item.kyThi, idExam: item.idExam } }), () => {
                    this.props.getDataNhapDiem(id, result => this.setData(result, () => T.alert('Cập nhập điểm thành công!', 'success', true)));
                });
            }
        });
    }

    downloadConfirmFile = () => {
        T.handleDownload(`/api/dt/gv/nhap-diem/bang-diem-xac-nhan?id=${this.state.id}`);
    }

    render() {
        let { dataHocPhan, tpDiem, dataStudent, configQC, readOnly, isNhapDiem, thoiGianNhap, thoiGianKetThucNhap, item, listTpThi, id, codeStatus } = this.state,
            widthTP = 30 / (tpDiem.length + 1),
            { kyThi, tinhTrangDiem, idExam, caThi, phong, tenKyThi } = item ? item : { kyThi: '', idExam: '', tinhTrangDiem: 4, caThi: '', phong: '', tenKyThi: '' },
            dataThanhPhanDiem = tpDiem.map(i => ({ loaiThanhPhan: i.thanhPhan, tenThanhPhan: i.tenThanhPhan, isThi: i.isThi, phanTram: i.phanTram, loaiLamTron: i.loaiLamTron, phanTramMax: Number(i.phanTramMax), phanTramMin: Number(i.phanTramMin), isLock: Number(i.isLock) }));
        const className = isNhapDiem ? 'btn btn-success' : 'btn btn-primary',
            icon = isNhapDiem ? 'fa-save' : 'fa-pencil',
            textButton = isNhapDiem ? 'Lưu' : 'Nhập điểm';

        let studentTable = () => renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: dataStudent,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>MSSV</th>
                        <th style={{ width: '20%', verticalAlign: 'middle' }}>Họ và tên lót</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Tên</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Lớp</th>
                        {tpDiem.map((item, index) => (<th key={index} style={{ width: `${widthTP}%`, whiteSpace: 'nowrap', textAlign: 'center' }}>{item.tenThanhPhan}</th>))}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm tổng kết</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
                    </tr>
                </>
                );
            },
            renderRow: (item, index) => {
                const contentText = text => item.idDinhChiThi ? <Tooltip arrow title='Sinh viên hoãn thi đăng ký thi lại'><div>{text}</div></Tooltip> : text;
                return (
                    <tr key={`student-${index}`}>
                        <TableCell content={index + 1} />
                        <TableCell className={item.idDinhChiThi ? 'text-info' : ''} content={contentText(item.mssv)} />
                        <TableCell className={item.idDinhChiThi ? 'text-info' : ''} content={contentText(item.ho)} />
                        <TableCell className={item.idDinhChiThi ? 'text-info' : ''} content={contentText(item.ten)} />
                        <TableCell content={item.lop} />
                        {dataStudent.length && tpDiem.map(tp => {
                            let loaiThanhPhan = tp.thanhPhan,
                                diem = item.diem ? item.diem[loaiThanhPhan] : '',
                                lockDiem = item.lockDiem && item.lockDiem[loaiThanhPhan] ? Number(item.lockDiem[loaiThanhPhan]) : 0,
                                diemDacBiet = item.diemDacBiet ? item.diemDacBiet[loaiThanhPhan] : '',
                                timeMod = item.timeModified ? parseInt(item.timeModified[loaiThanhPhan]) : '',
                                userMod = item.userModified ? item.userModified[loaiThanhPhan] : '',
                                title = userMod ? `${T.dateToText(Number(timeMod), 'dd/mm/yyyy HH:MM:ss')}-${userMod}` : '';

                            diem = (!isNaN(parseFloat(diem))) ? parseFloat(diem).toFixed(1).toString() : diem;
                            return (isNhapDiem && !lockDiem && (!codeStatus.length || !codeStatus.filter(i => loaiThanhPhan == 'CK' ? i == 'CK' : i != 'CK').length) && (listTpThi.length || (kyThi == 'CK' ? loaiThanhPhan == 'CK' : loaiThanhPhan != 'CK')) && (!item.idDinhChiThi || item.kyThiDinhChi == loaiThanhPhan)) ? <Tooltip arrow title={title}>
                                <td>
                                    <div key={`${item.mssv}_${loaiThanhPhan}`} id={`${item.mssv}_${loaiThanhPhan}`}
                                        contentEditable suppressContentEditableWarning={true}
                                        onBlur={e => this.handleDiem(e, item, tp)}
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
                    </tr>
                );
            }
        });

        return this.renderPage({
            icon: 'fa fa-pencil-square',
            title: 'Nhập điểm học phần',
            content: <>
                <AdjustThanhPhanDiem ref={e => this.modal = e} dataHocPhan={dataHocPhan} dataThanhPhan={dataThanhPhanDiem} handleSetData={(done, allRole) => {
                    if (kyThi == 'CK') {
                        id = allRole.find(i => idExam ? (i.idExam == idExam) : (i.kyThi == 'CK'))?.id;
                    } else {
                        let roleCK = allRole.filter(i => i.kyThi == 'CK'),
                            roleQT = allRole.filter(i => i.kyThi != 'CK');

                        if (!roleQT.length) id = roleCK[0]?.id;
                        else {
                            if (!roleQT.find(i => i.kyThi == kyThi)) {
                                id = roleQT[0]?.id;
                            } else {
                                id = roleQT.find(i => idExam ? (i.idExam == idExam) : i.kyThi == kyThi)?.id;
                            }
                        }
                    }
                    if (!id) return this.props.history.push('/user/affair/nhap-diem');
                    this.props.history.replace({ pathname: `/user/affair/nhap-diem/edit/${id}` });
                    this.setState({ id }, () => {
                        this.props.getDataNhapDiem(id, result => this.setData(result, done));
                    });
                }} />
                <ImportModal ref={e => this.importModal = e} readOnly={readOnly} dataHocPhan={{ ...dataHocPhan, kyThi, idExam }} id={id} kyThi={kyThi} listTpThi={listTpThi} codeStatus={codeStatus} tpDiem={tpDiem} configQC={configQC} dataStudent={dataStudent}
                    handleSetData={() => this.props.getDataNhapDiem(id, result => this.setData(result, () => T.alert('Cập nhập điểm thành công!', 'success', true)))}
                />
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.namHoc = e} className='col-md-4' readOnly label='Năm học' />
                        <FormTextBox ref={e => this.hocKy = e} className='col-md-4' readOnly label='Học kỳ' />
                        <FormTextBox ref={e => this.listNienKhoa = e} className='col-md-4' readOnly label='Khóa' />
                        <FormTextBox ref={e => this.tenHe = e} className='col-md-4' readOnly label='Hệ' />
                        <FormTextBox ref={e => this.tenNganh = e} className='col-md-4' readOnly label='Ngành/Chuyên ngành' />
                        <FormTextBox ref={e => this.tongTiet = e} className='col-md-4' readOnly label='Tổng số tiết' />
                        <FormTextBox ref={e => this.maHocPhan = e} className='col-md-12' readOnly label='Mã học phần' />
                        <FormTextBox ref={e => this.monHoc = e} className='col-md-12' label='Môn học' readOnly />
                    </div>
                    <hr />
                    <div style={{ textAlign: 'left', margin: '10px 0px 10px 0px' }}>
                        <div className='row' style={{ fontSize: '0.8rem' }}>
                            <div className='col-md-6' style={{ display: configQC.length ? '' : 'none' }}>
                                <h6>Thông tin các điểm đặc biệt: </h6>
                                {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                                    {configQC.map((item, index) => {
                                        return <span key={`qc-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.ma}</b>: {item.moTa} (Áp dụng {item.loaiApDung})</span>;
                                    })}
                                </div>}
                            </div>
                            <div className='col-md-6' style={{ display: tpDiem.length ? '' : 'none' }}>
                                <h6>Thông tin các điểm thành phần: </h6>
                                {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                                    {tpDiem.map((item, index) => {
                                        return <span key={`tp-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.tenThanhPhan} ({item.thanhPhan})</b>: {item.phanTram}% (làm tròn {item.loaiLamTron}) </span>;
                                    })}
                                </div>}
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div style={{ marginTop: '10px' }}>
                        <h6 style={{ display: thoiGianNhap && thoiGianKetThucNhap ? '' : 'none' }} >Thời gian nhập điểm từ {T.dateToText(thoiGianNhap)} đến {T.dateToText(thoiGianKetThucNhap)}</h6>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        {
                            idExam ? <h5 className='text-danger'>
                                Nhập điểm học phần loại điểm: {kyThi == 'CK' ? tenKyThi : 'Quá trình'}, ca thi: {caThi}, phòng: {phong}.
                            </h5> : <h5 className='text-danger'>
                                Nhập điểm học phần loại điểm: {kyThi == 'CK' ? tenKyThi : 'Quá trình'}.
                            </h5>
                        }
                    </div>
                </div>
                <div className='tile'>
                    <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 10, margin: '10px' }}>
                        <button className={className} style={{ height: 'fit-content' }} onClick={e => {
                            e.preventDefault();
                            if (isNhapDiem) this.save();
                            else {
                                if (readOnly) {
                                    T.alert('Không trong thời gian nhập điểm', 'warning', false, 5000);
                                } else if (tinhTrangDiem == 4) {
                                    T.alert('Học phần đã khóa bảng điểm', 'warning', false, 5000);
                                } else {
                                    this.setState({ isNhapDiem: true });
                                }
                            }
                        }}>
                            <i className={'fa fa-lg ' + icon} /> {textButton}
                        </button>
                        <button className='btn btn-secondary' style={{ display: isNhapDiem ? '' : 'none', height: 'fit-content' }}
                            onClick={e => e.preventDefault() || this.setState({ isNhapDiem: false })}>
                            <i className='fa fa-lg fa-times' /> Hủy
                        </button>
                        <Tooltip title='Tải bảng điểm xác nhận' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-warning' type='button' onClick={e => e && e.preventDefault() || this.downloadConfirmFile()}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' /> Bảng điểm xác nhận
                            </button>
                        </Tooltip>
                        <Tooltip title='Cấu hình phần trăm điểm' arrow placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-success' type='button' onClick={() => {
                                this.modal.show({ dataThanhPhanDiem });
                            }}>
                                <i className='fa fa-fw fa-lg fa-cogs' /> Cấu hình điểm
                            </button>
                        </Tooltip>
                        <Tooltip title='Nhập điểm bảng file excel' arrow placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={() => {
                                this.importModal.show();
                            }}>
                                <i className='fa fa-fw fa-lg fa-upload' /> Import điểm
                            </button>
                        </Tooltip>
                    </div>
                    {studentTable()}
                </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDataNhapDiem, updateDiemSinhVien };
export default connect(mapStateToProps, mapActionsToProps)(nhapDiemPage);