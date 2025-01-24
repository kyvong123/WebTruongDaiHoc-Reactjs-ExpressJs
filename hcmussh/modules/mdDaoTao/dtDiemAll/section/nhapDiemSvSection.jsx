import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, renderDataTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getDataDiem, dtDiemAllSinhVien } from 'modules/mdDaoTao/dtDiemAll/redux';
import { dtDiemUpdateFilter, updateDtDiemSinhVien } from 'modules/mdDaoTao/dtDiemAll/redux';
import { dtDiemVerifyVerifyStudent, dtDiemVerifyCancelVerifyStudent } from 'modules/mdDaoTao/dtDiemVerifyCode/redux';
import { Tooltip } from '@mui/material';
import LichSuNhapDiem from 'modules/mdDaoTao/dtDiemHistory/lichSuModal';
import ScanDiemModal from 'modules/mdSinhVien/svBangDiem/ScanDiemModal';



export class NhapDiemSvSection extends AdminPage {
    ghiChu = {};
    state = { dataHocPhan: [], configQC: [] }

    setValue = ({ namHoc, hocKy }) => {
        const { mssv } = this.state;
        if (mssv) {
            this.getValue({ mssv, namHoc, hocKy });
        }
    }

    getValue = ({ mssv, namHoc, hocKy }) => {
        T.alert('Đang lấy dữ liệu', 'info', false, null, true);
        this.props.getDataDiem({ mssv, namHoc, hocKy }, data => {
            const configQC = data[0] && data[0].configQC ? JSON.parse(data[0].configQC) : [],
                listTp = data.flatMap(item => {
                    let tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
                    tpDiem = tpDiem ? T.parse(tpDiem) : [];
                    return tpDiem.map(i => i.thanhPhan);
                });

            this.setState({ dataHocPhan: data, configQC, mssv, loaiDiem: this.props.loaiDiem.filter(item => listTp.includes(item.ma)), isNhapDiem: false }, () => {
                for (let hocPhan of this.state.dataHocPhan) {
                    this.ghiChu[hocPhan.maHocPhan]?.value(hocPhan.ghiChu);
                }
                T.alert('Tải dữ liệu thành công!', 'success', false, 1000);
            });
        });
    }

    onChangeSV = (value) => {
        this.getValue({ mssv: value.id, ...this.props.filter });
    }

    lamTronDiem = (e, { diem, diemDacBiet }, tpDiem, index) => {
        let value = e.target.innerText?.toUpperCase(),
            loaiDiem = tpDiem.thanhPhan || '',
            loaiLamTron = tpDiem.loaiLamTron || '', sum = '',
            rate = parseFloat(loaiLamTron) / 0.1;
        let { dataHocPhan } = this.state,
            keyDacBiet = dataHocPhan[index].configQC ? JSON.parse(dataHocPhan[index].configQC) : [];
        if (isNaN(value)) {
            let dacBiet = keyDacBiet.filter(i => i.ma != 'I').find(item => item.ma == value);
            if (dacBiet) {
                if (!dacBiet.loaiApDung.includes(loaiDiem)) {
                    T.notify(`Điểm đặc biệt này không được áp dụng cho ${loaiDiem}`, 'warning');
                    e.target.innerText = diem[loaiDiem];
                } else {
                    if (dacBiet.tinhTongKet == '1') {
                        diemDacBiet[loaiDiem] = value;
                        diem[loaiDiem] = value;
                        diem['TK'] = value;
                        dataHocPhan[index] = { ...dataHocPhan[index], diem: JSON.stringify(diem), diemDacBiet: JSON.stringify(diemDacBiet), khongTinhPhi: dacBiet.khongTinhPhi };
                        this.setState({ dataHocPhan }, () => {
                            let tkId = document.getElementById(`${dataHocPhan[index].maHocPhan}_TK`);
                            tkId.innerHTML = diem['TK'];
                            e.target.innerText = value;
                        });
                    } else {
                        diemDacBiet[loaiDiem] = value;
                        diem[loaiDiem] = '0.0';
                        let diemTp = Object.values(diem);
                        if (!diemTp.every(diem => diem == '')) {
                            let tpDiems = dataHocPhan[index].tpHocPhan || dataHocPhan[index].tpMonHoc || dataHocPhan[index].configDefault;
                            sum = 0;
                            tpDiems = tpDiems ? JSON.parse(tpDiems) : [];
                            for (let tp of tpDiems) {
                                sum += Number(diem[tp.thanhPhan]) * Number(tp.phanTram) / 100;
                            }
                            sum = (Math.round(sum * (10 / 5)) / (10 / 5)).toFixed(1);
                        }
                        diem['TK'] = sum.toString();
                        dataHocPhan[index] = { ...dataHocPhan[index], diem: JSON.stringify(diem), diemDacBiet: JSON.stringify(diemDacBiet), khongTinhPhi: dacBiet.khongTinhPhi };
                        this.setState({ dataHocPhan }, () => {
                            let tkId = document.getElementById(`${dataHocPhan[index].maHocPhan}_TK`);
                            tkId.innerHTML = diem['TK'];
                            e.target.innerText = value;
                        });
                    }
                }
            } else {
                T.notify(value == 'I' ? 'Không được phép nhập điểm hoãn!' : 'Điểm đặc biệt không hợp lệ!', 'warning');
                e.target.innerText = diem[loaiDiem];
            }
        } else {
            if (value > 10) {
                diem[loaiDiem] = '10.0';
                e.target.innerText = '10.0';
            } else if (value < 0) {
                diem[loaiDiem] = '0.0';
                e.target.innerText = '0.0';
            } else {
                diem[loaiDiem] = value != '' ? (Math.round(Number(value) * (10 / rate)) / (10 / rate)).toFixed(1).toString() : '';
                e.target.innerText = diem[loaiDiem];
            }
            delete diem['TK'];
            diemDacBiet[loaiDiem] = '';

            let tpDiems = dataHocPhan[index].tpHocPhan || dataHocPhan[index].tpMonHoc || dataHocPhan[index].configDefault;
            tpDiems = tpDiems ? JSON.parse(tpDiems) : [];
            for (const tp of tpDiems) {
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
            diem['TK'] = sum.toString();
            dataHocPhan[index] = { ...dataHocPhan[index], diem: JSON.stringify(diem), diemDacBiet: JSON.stringify(diemDacBiet) };
            this.setState({ dataHocPhan }, () => {
                let tkId = document.getElementById(`${dataHocPhan[index].maHocPhan}_TK`);
                tkId.innerHTML = diem['TK'];
                e.target.innerText = diem[loaiDiem];
            });
        }
    }

    handlePressDiem = (e) => {
        let key = e.key,
            value = e.target.innerText;

        // Only allow numeric values, decimal point, and backspace/delete keys
        const allowKeys = ['Backspace', 'Delete', 'Enter', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];

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

        // If enter is pressed, set editable to false
        if (key === 'Enter' || key === 'Tab') {
            e.target.blur();
        } else if (key === 'ArrowDown') {
            const currentTd = e.target.parentElement;
            const nextTd = currentTd.parentNode.nextElementSibling?.querySelector(`td:nth-child(${currentTd.cellIndex + 1})`);
            if (nextTd) {
                currentTd.children[0].blur();
                nextTd.children[0].focus();
            }
        } else if (key === 'ArrowUp') {
            const currentTd = e.target.parentElement;
            const prevTd = currentTd.parentNode.previousElementSibling?.querySelector(`td:nth-child(${currentTd.cellIndex + 1})`);
            if (prevTd) {
                currentTd.children[0].blur();
                prevTd.children[0].focus();
            }
        }
    }

    nhapDiemSinhVien = () => {
        this.setState({ isNhapDiem: true }, () => {
            for (let hocPhan of this.state.dataHocPhan) {
                this.ghiChu[hocPhan.maHocPhan]?.value(hocPhan.ghiChu);
            }
        });
    }

    save = () => {
        const { mssv, dataHocPhan } = this.state, filter = this.props.filter,
            { namHoc, hocKy } = filter;
        let listSave = dataHocPhan.filter(i => i.tinhTrangDiem != 4);
        for (let hocPhan of listSave) {
            hocPhan.ghiChu = this.ghiChu[hocPhan.maHocPhan].value();
        }

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn cập nhật điểm của sinh viên này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang lưu điểm sinh viên', 'info', false, null, true);
                this.props.updateDtDiemSinhVien({ mssv, namHoc, hocKy }, JSON.stringify(listSave), () => {
                    this.props.getDataDiem({ mssv, namHoc, hocKy }, (data) => {
                        this.setState({ dataHocPhan: data, isNhapDiem: false }, () => {
                            T.alert('Lưu điểm thành công!', 'success', false, 1000);
                        });
                    });
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

    handleCancelVerify = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn hủy xác nhận điểm của sinh viên này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (!item.diem) return T.alert('Sinh viên chưa được nhập điểm!', 'warning', true, 2000);
                this.props.dtDiemVerifyCancelVerifyStudent(item.mssv, item.maHocPhan);
            }
        });
    }

    render() {
        let { dataHocPhan, mssv, isNhapDiem, configQC } = this.state,
            className = isNhapDiem ? 'btn btn-success' : 'btn btn-primary',
            icon = isNhapDiem ? 'fa-save' : 'fa-pencil',
            textButton = isNhapDiem ? 'Lưu' : 'Nhập điểm';

        let table = () => renderDataTable({
            emptyTable: 'Không có học phần đăng ký',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: dataHocPhan,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên học phần</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>{'Điểm thành phần (%)'}</th>
                        {this.state.loaiDiem && this.state.loaiDiem.map(item => {
                            return <th key={item.ma} style={{ width: 'auto', whiteSpace: 'nowrap' }}>{item.ten}</th>;
                        })}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                        {!isNhapDiem && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lịch sử</th>}
                    </tr>
                </>
                );
            },
            renderRow: (item, index) => {
                let diem = item.diem ? T.parse(item.diem) : { GK: '', CK: '' },
                    diemDacBiet = item.diemDacBiet ? T.parse(item.diemDacBiet) : { GK: '', CK: '' };
                let tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
                tpDiem = tpDiem ? T.parse(tpDiem) : [];
                let thanhPhan = tpDiem.sort((a, b) => Number(a.phanTram) - Number(b.phanTram)).map(tp => (`${tp.thanhPhan}:${Number(tp.phanTram)}`));

                return (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.maHocPhan} />
                        <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={thanhPhan.join(' - ')} />
                        {this.state.loaiDiem && this.state.loaiDiem.map((loai) => {
                            let timeMod = item.timeModified ? JSON.parse(item.timeModified) : '',
                                userMod = item.userModified ? JSON.parse(item.userModified) : '',
                                title = userMod && userMod[loai.ma] ? `${T.dateToText(Number(timeMod[loai.ma]), 'dd/mm/yyyy HH:MM:ss')}-${userMod[loai.ma]}` : '',
                                diemSv = diemDacBiet[loai.ma] || (!isNaN(parseFloat(diem[loai.ma])) ? parseFloat(diem[loai.ma]).toFixed(1).toString() : diem[loai.ma]);

                            return isNhapDiem && diemDacBiet[loai.ma] != 'I' ? (tpDiem.find(tp => tp.thanhPhan == loai.ma) ? (
                                item.tinhTrangDiem == 4 ? <Tooltip arrow title={'Học phần đã khóa bảng điểm'}>
                                    <td><div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{diemSv}</div></td>
                                </Tooltip> : <Tooltip arrowtitle={title}>
                                    <td>
                                        <div key={`${item.maHocPhan}_${loai.ma}`} id={`${item.maHocPhan}_${loai.ma}`} contentEditable suppressContentEditableWarning={true}
                                            onBlur={e => this.lamTronDiem(e, { diem, diemDacBiet }, tpDiem.find(tp => tp.thanhPhan == loai.ma), index)}
                                            onKeyDown={this.handlePressDiem}
                                            style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center', cursor: 'auto', border: '1.5px solid #ced4da', borderCollapse: 'collapse', borderRadius: '4px', fontSize: 'large', fontFamily: 'serif' }}
                                        >
                                            {diemSv}
                                        </div>
                                    </td>
                                </Tooltip>)
                                : <TableCell style={{ cursor: 'not-allowed', backgroundColor: '#e9ecef' }} content='' />)
                                : <Tooltip arrow title={title}>
                                    <td><div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{diemSv}</div></td>
                                </Tooltip>;
                        })}
                        <td id={`${item.maHocPhan}_TK`} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} >{(!isNaN(parseFloat(diem['TK']))) ? parseFloat(diem['TK']).toFixed(1).toString() : diem['TK']}</td>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={isNhapDiem ?
                            <FormTextBox ref={e => this.ghiChu[item.maHocPhan] = e} className='mb-0' disabled={item.tinhTrangDiem == 4} />
                            : item.ghiChu} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi && item.noHocPhi < 0 ? 'text-danger' : 'text-success'}
                            content={item.tinhPhi && item.noHocPhi < 0
                                ? <Tooltip title='Còn nợ học phí'>
                                    <i className='fa fa-lg fa-times-circle' />
                                </Tooltip>
                                : <Tooltip title='Đã đóng đủ'>
                                    <i className='fa fa-lg fa-check-circle' />
                                </Tooltip>} />
                        {!isNhapDiem && <TableCell type='buttons' style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                            content={item} permission={{ write: true }}>
                            <Tooltip title='Lịch sử nhập điểm' arrow placeholder='bottom'>
                                <a className='btn btn-warning'
                                    onClick={e => e.preventDefault() || this.lichSuModal.show({ mssv, maHocPhan: item.maHocPhan })}>
                                    <i className='fa fa-lg fa-eye' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Ảnh scan' arrow placeholder='bottom'>
                                <a className='btn btn-info'
                                    onClick={e => e.preventDefault() || this.scanDiemModal.show({ mssv, maHocPhan: item.maHocPhan })}>
                                    <i className='fa fa-lg fa-search' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Xác nhận điểm' arrow placeholder='bottom'>
                                <a className='btn btn-success'
                                    onClick={e => e.preventDefault() || this.handleVerify(item)}>
                                    <i className='fa fa-lg fa-check-circle' />
                                </a>
                            </Tooltip>
                            <Tooltip title='Hủy xác nhận điểm' arrow placeholder='bottom'>
                                <a className='btn btn-danger'
                                    onClick={e => e.preventDefault() || this.handleCancelVerify(item)}>
                                    <i className='fa fa-lg fa-times-circle-o' />
                                </a>
                            </Tooltip>
                        </TableCell>}

                    </tr>
                );
            }
        });

        return <>
            <LichSuNhapDiem ref={e => this.lichSuModal = e} />
            <ScanDiemModal ref={e => this.scanDiemModal = e} />
            <div style={{ marginBottom: '10px' }}>
                <h6>Chọn sinh viên thao tác</h6>
                <div className='row'>
                    <FormSelect ref={e => this.sinhVien = e} className='col-md-10' placeholder='Sinh viên' data={SelectAdapter_DangKyHocPhanStudent}
                        onChange={value => this.onChangeSV(value)} />
                    {mssv && <div className='col-md-2 px-0' style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
                        <button className={className} style={{ height: '34px', alignSelf: 'flex-end' }} onClick={e => {
                            e.preventDefault();
                            if (isNhapDiem) this.save();
                            else this.nhapDiemSinhVien();
                        }}>
                            <i className={'fa fa-lg ' + icon} />{textButton}
                        </button>
                        <button className='btn btn-secondary' style={{ display: isNhapDiem ? '' : 'none', marginLeft: '10px', height: '34px', alignSelf: 'flex-end' }}
                            onClick={e => e.preventDefault() || this.setState({ isNhapDiem: false })}>
                            <i className='fa fa-lg fa-times' /> Huỷ
                        </button>
                    </div>}
                </div>
            </div>
            <div style={{ display: mssv ? '' : 'none' }}>
                <div className='col-md-12' style={{ display: configQC.length ? '' : 'none' }}>
                    <h6>Thông tin các điểm đặc biệt: </h6>
                    {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                        {configQC.map((item, index) => {
                            return <span key={`qc-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.ma}</b>: {item.moTa} (Áp dụng {item.loaiApDung})</span>;
                        })}
                    </div>}
                </div>
                <div>
                    {table()}
                </div>
            </div>
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDataDiem, dtDiemAllSinhVien, dtDiemUpdateFilter, updateDtDiemSinhVien, dtDiemVerifyVerifyStudent, dtDiemVerifyCancelVerifyStudent };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(NhapDiemSvSection);