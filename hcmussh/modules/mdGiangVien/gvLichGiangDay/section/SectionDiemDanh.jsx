import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormTextBox, renderDataTable, TableCell } from 'view/component/AdminPage';
import { gvLichDayGetDiemDanh, gvLichDayCreateVang, gvLichDayCreateGhiChu } from 'modules/mdGiangVien/gvLichGiangDay/redux';
import 'modules/mdGiangVien/gvLichGiangDay/card.scss';
import { Tooltip } from '@mui/material';


class SectionDiemDanh extends AdminPage {
    state = { dataTuan: [], listStudent: [], dataDiemDanh: [] }

    setValue = (maHocPhan) => {
        this.props.gvLichDayGetDiemDanh(maHocPhan, result => this.setState({ ...result, maHocPhan }));
    }

    handleDiemDanh = (value, mssv, idTuan) => {
        const { dataDiemDanh, maHocPhan } = this.state,
            isExist = dataDiemDanh.find(i => i.mssv == mssv);

        let listTuan = isExist ? isExist.listTuan : [];

        if (value) listTuan.push(idTuan.toString());
        else listTuan = listTuan.filter(i => i != idTuan);

        if (!isExist) dataDiemDanh.push({ mssv, listTuan, ghiChu: '' });

        this.setState({ dataDiemDanh: dataDiemDanh.map(i => i.mssv == mssv ? ({ ...i, listTuan }) : ({ ...i })) }, () => this.props.gvLichDayCreateVang({ maHocPhan, mssv, listTuan: listTuan.join(','), ghiChu: isExist ? isExist.ghiChu : '' }));
    }

    handleGhiChu = (value, mssv) => {
        let { dataDiemDanh } = this.state,
            isExist = dataDiemDanh.find(i => i.mssv == mssv);

        if (!isExist) dataDiemDanh.push({ mssv, listTuan: [], ghiChu: value });

        this.setState({ dataDiemDanh: dataDiemDanh.map(i => i.mssv == mssv ? ({ ...i, ghiChu: value }) : ({ ...i })) });
    }

    save = () => {
        const { dataDiemDanh, maHocPhan } = this.state;

        T.confirm('Lưu dữ liệu', 'Bạn có chắc bạn muốn lưu dữ liệu điểm danh không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang lưu dữ liệu. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.gvLichDayCreateGhiChu(maHocPhan, dataDiemDanh.map(i => ({ ...i, listTuan: i.listTuan.join(',') })), () => {
                    T.alert('Lưu dữ liệu thành công', 'success', false, 500);
                    this.setState({ isEdit: false });
                });
            }
        });
    }

    render() {
        const { dataTuan, listStudent, dataDiemDanh, isEdit, maHocPhan } = this.state;

        const className = isEdit ? 'btn btn-success' : 'btn btn-primary',
            icon = isEdit ? 'fa-save' : 'fa-pencil',
            textButton = isEdit ? 'Lưu' : 'Chỉnh sửa';

        const tableTuan = renderDataTable({
            data: listStudent,
            emptyTable: 'Chưa có sinh viên đăng ký!',
            header: 'thead-light',
            stickyHead: listStudent && listStudent.length > 10,
            className: 'table-pin',
            customClassName: 'table-pin-wrapper',
            renderHead: () => <tr>
                <th className='sticky-col pin-1-col' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>STT</th>
                <th className='sticky-col pin-2-col' style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }}>Mã sinh viên</th>
                <th className='sticky-col pin-3-col' style={{ width: '10%', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Họ tên</th>
                {
                    dataTuan.map((i, idx) => <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle' }} key={`tuan-${idx}`}><>
                        {T.dateToText(i.ngayHoc, 'dd/mm/yyyy')} <br />
                        Tiết {i.tietBatDau} - {i.tietBatDau + i.soTietBuoi - 1}
                    </></th>)
                }
                <th style={{ minWidth: '250px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Ghi chú</th>
            </tr>,
            renderRow: (item, index) => {
                const diemDanh = dataDiemDanh.find(dd => dd.mssv == item.mssv);
                return (<tr key={index}>
                    <TableCell className='sticky-col pin-1-col' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                    <TableCell className='sticky-col pin-2-col' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                    <TableCell className='sticky-col pin-3-col' style={{ whiteSpace: 'nowrap' }} content={item.ho + ' ' + item.ten} />
                    {
                        dataTuan.map((i, idx) => {
                            const isAbsent = diemDanh?.listTuan.includes(i.id.toString()),
                                editContent = <Tooltip arrow title='Vắng'><div style={{ verticalAlign: 'middle', textAlign: 'center' }}><FormCheckbox key={`${item.mssv}-vang-tuan-${idx}`} value={isAbsent} onChange={value => this.handleDiemDanh(value, item.mssv, i.id)} /></div></Tooltip>;
                            return <TableCell key={`${item.mssv}-tuan-${idx}`} style={{ textAlign: 'center' }} content={isEdit ? editContent : (isAbsent ? <i className='fa fa-times text-danger' /> : '')} />;
                        })
                    }
                    <TableCell content={isEdit ? <FormTextBox value={diemDanh?.ghiChu || ''} className='mb-0' placeholder='Ghi chú' key={`${item.mssv}-ghiChu`} onChange={e => this.handleGhiChu(e.target.value, item.mssv)} /> : diemDanh?.ghiChu} />
                </tr>);
            }
        });

        return <div>
            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 10, margin: '10px' }}>
                <button className={className} style={{ height: 'fit-content' }} onClick={e => {
                    e.preventDefault();
                    if (isEdit) this.save();
                    else this.setState({ isEdit: true });
                }}>
                    <i className={'fa fa-lg ' + icon} /> {textButton}
                </button>
                <button className='btn btn-secondary' style={{ display: isEdit ? '' : 'none', height: 'fit-content' }}
                    onClick={e => e.preventDefault() || this.setState({ isEdit: false })}>
                    <i className='fa fa-lg fa-times' /> Hủy
                </button>
                <Tooltip title='Tải danh sách điểm danh' arrow={true} placement='top'>
                    <button style={{ height: 'fit-content' }} className='btn btn-warning' type='button' onClick={e => e && e.preventDefault() || T.handleDownload(`/api/dt/gv/lich-giang-day/download-diem-danh?maHocPhan=${maHocPhan}`)}>
                        <i className='fa fa-fw fa-lg fa-file-excel-o' /> Danh sách điểm danh
                    </button>
                </Tooltip>
            </div>
            <div>
                {tableTuan}
            </div>
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { gvLichDayGetDiemDanh, gvLichDayCreateVang, gvLichDayCreateGhiChu };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionDiemDanh);