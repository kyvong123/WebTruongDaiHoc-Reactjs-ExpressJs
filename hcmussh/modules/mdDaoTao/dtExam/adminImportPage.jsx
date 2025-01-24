import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, renderDataTable, TableCell, TableHead, FormSelect } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { Tooltip } from '@mui/material';
import { getScheduleSettings } from '../dtSettings/redux';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from '../dtDmHocKy/redux';

class DtExamPage extends AdminPage {
    state = { displayState: 'import', items: [], falseItems: [] }
    componentDidMount() {
        this.tab?.tabClick(null, 0);
        T.ready('/user/dao-tao', () => {
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester;
                this.namHoc.value(namHoc);
                this.hocKy.value(hocKy);
                this.setState({ namHoc, hocKy });
            });
            T.socket.on('import-single-done', ({ requester, items, falseItems, dssvTong, index }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ current: index, isDone: false, items, falseItems, dssvTong, displayState: 'importing', message: `${items.length} hàng dự kiến đăng ký thành công` });
                }
            });
            T.socket.on('import-all-done', ({ requester, items, falseItems, dssvTong }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ current: 0, isDone: true, items, falseItems, dssvTong }, () => {
                        falseItems.length && T.notify(`${falseItems.length} hàng đăng ký thất bại`, 'danger');
                        items.length && T.notify(this.state.message, 'success');
                        this.setState({ canSave: !!items.length, displayState: 'data' });
                    });
                }
            });
        });
    }

    componentWillUnmount() {
        T.socket.off('import-single-done');
        T.socket.off('import-all-done');
    }

    onSuccess = (result) => {
        if (result.error) {
            T.alert('Xảy ra lỗi trong quá trình import', 'danger', true);
        }
        else {
            let { items, falseItems, dssvTong } = result;
            this.setState({ items, falseItems, dssvTong, displayState: 'data', canSave: result.items.some(item => item.isValid), isDone: true }, () => {
                if (this.state.isDone) {
                    T.alert('Import thành công! Vui lòng kiểm tra lại dữ liệu trước khi lưu', 'success', true, null, true);
                }
            });
        }
    }

    handleSave = (e) => {
        e.preventDefault();
        let items = T.stringify(this.state.items),
            dssv = T.stringify(this.state.dssvTong),
            { namHoc, hocKy } = this.state;
        T.confirm('Xác nhận', 'Bạn có chắc muốn import dữ liệu phòng thi?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                T.post('/api/dt/exam/multiple', { items, dssv, filter: { namHoc, hocKy } }, (result) => {
                    if (result.error) {
                        T.alert('Tạo lịch thi bỊ lỗi', 'warning', false, 1000);
                        console.error(result.error);
                    } else {
                        T.alert('Tạo lịch thi thành công', 'success', false, 1000);
                        this.props.history.push('/user/dao-tao/lich-thi');
                    }
                });
            }
        });
    }

    handleReload = (e) => {
        e.preventDefault();
        this.setState({ displayState: 'import', items: [], canSave: false, isDone: false, current: 0 }, () => {
            this.tab?.tabClick(null, 0);
        });
    }

    tableImportSuccessDssv = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu',
        data: list,
        stickyHead: true,
        divStyle: { height: '63vh' },
        header: 'thead-light',
        className: this.state.isFixCol ? 'table-fix-col' : '',
        renderHead: () => (<tr>
            <TableHead content='STT' />
            <TableHead content='MSSV' style={{ width: 'auto' }} />
            <TableHead content='Họ' style={{ width: 'auto' }} />
            <TableHead content='Tên' style={{ width: 'auto' }} />
            <TableHead content='Mã lớp học phần' style={{ width: 'auto' }} />
            <TableHead content='Tên học phần' style={{ width: '100%' }} />
            <TableHead content='Phòng' style={{ textAlign: 'center' }} />
            <TableHead content='Ngày thi' style={{ textAlign: 'center' }} />
            <TableHead content='Bắt đầu' style={{ textAlign: 'center' }} />
            <TableHead content='Kết thúc' style={{ textAlign: 'center' }} />
            <TableHead content='Học phí' style={{ textAlign: 'center' }} />
            <TableHead content='Trạng thái' />
            {/* <TableHead content='Chọn' /> */}
        </tr>),
        renderRow: (item, index) => (
            <tr key={'sv ' + index}>
                <TableCell style={{ textAlign: 'right' }} content={item.stt} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenMonHoc} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={new Date(item.batDau)} />
                <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='HH:MM' content={new Date(item.batDau)} />
                <TableCell style={{ textAlign: 'center' }} type='date' dateFormat='HH:MM' content={new Date(item.ketThuc)} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={!item.isThanhToan ? 'text-danger' : 'text-success'}
                    content={!item.isThanhToan ? <Tooltip title='Còn nợ học phí'>
                        <i className='fa fa-lg fa-times-circle' />
                    </Tooltip>
                        : <Tooltip title='Đã đóng đủ'>
                            <i className='fa fa-lg fa-check-circle' />
                        </Tooltip>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<div className='text-success'><i className='fa fa-lg fa-check' />Được phép chọn lưu</div>} />
                {/* <TableCell type='checkbox' isCheck
                    permission={{ write: permission.write }} content={item.isValid}
                onChanged={value => this.setState({ items: items.map(i => item.id != i.id ? ({ ...i }) : ({ ...i, isValid: value })) })}
                /> */}
            </tr>
        )
    });

    groupBy = (array, func) => {
        let groups = [];
        array.forEach(item => {
            let group = JSON.stringify(func(item));
            groups[group] = groups[group] || [];
            groups[group].push(item);
        });
        return Object.keys(groups).sort((a, b) => a > b ? 0 : -1).map(group => groups[group]);
    }

    render() {
        const permission = this.getUserPermission('dtExam', ['manage', 'write', 'delete', 'import']);
        const { displayState, items, falseItems, dssvTong, canSave, namHoc, hocKy } = this.state;
        const tableImportSuccess = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: this.groupBy(items, item => [item.maHocPhan, item.loaiKyThi, item.caThi]),
            stickyHead: true,
            divStyle: { height: '63vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (<tr>
                <TableHead content='Hàng' />
                <TableHead content='Mã lớp học phần' style={{ width: 'auto' }} />
                <TableHead content='Tên học phần' style={{ width: '100%' }} />
                <TableHead content='Sĩ số' style={{ textAlign: 'center' }} />
                <TableHead content='Kỳ thi' style={{ textAlign: 'center' }} />
                <TableHead content='Ca thi' style={{ textAlign: 'center' }} />
                <TableHead content='Ngày thi' style={{ textAlign: 'center' }} />
                <TableHead content='Bắt đầu' style={{ textAlign: 'center' }} />
                <TableHead content='Kết thúc' style={{ textAlign: 'center' }} />
                <TableHead content='Phòng' style={{ textAlign: 'center' }} />
                <TableHead content='Số lượng' style={{ textAlign: 'center' }} />
                <TableHead content='Giám thị' style={{ textAlign: 'center' }} />
                <TableHead content='Trạng thái' />
                {/* <TableHead content='Chọn' /> */}
            </tr>),
            renderRow: (item, index) => {
                const rows = [];
                let rowSpan = item.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = item[i];
                        if (i == 0) {
                            rows.push(<tr key={'success ' + index}>
                                <TableCell rowSpan={rowSpan} style={{ textAlign: 'right' }} content={hocPhan.id} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.tenMonHoc} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.siSo} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.loaiKyThi} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.caThi} />
                                {hocPhan.batDau ? <>
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={new Date(hocPhan.batDau)} />
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} type='date' dateFormat='HH:MM' content={new Date(hocPhan.batDau)} />
                                </> : <>
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} content={hocPhan.ngayThi} />
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} content={hocPhan.gioBatDau} />
                                </>}
                                {hocPhan.ketThuc ? <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} type='date' dateFormat='HH:MM' content={new Date(hocPhan.ketThuc)} />
                                    : <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} content={hocPhan.gioKetThuc} />}
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soLuong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.giamThi} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={<div className='text-success'><i className='fa fa-lg fa-check' />Được phép chọn lưu</div>} />
                                {/* <TableCell type='checkbox' isCheck
                                    permission={{ write: permission.write && !hocPhan.errorCode?.length }} content={hocPhan.isValid}
                                    onChanged={value => this.setState({ items: items.map(i => hocPhan.id != i.id ? ({ ...i }) : ({ ...i, isValid: value })) })} /> */}
                            </tr>);
                        }
                        else {
                            rows.push(<tr key={'fail ' + index}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soLuong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.giamThi} />
                                {/* <TableCell type='checkbox' isCheck
                                    permission={{ write: permission.write && !hocPhan.errorCode?.length }} content={hocPhan.isValid}
                                    onChanged={value => this.setState({ items: items.map(i => hocPhan.id != i.id ? ({ ...i }) : ({ ...i, isValid: value })) })} /> */}
                            </tr>);
                        }
                    }
                }
                return rows;
            }
        });
        const tableImportFail = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: this.groupBy(falseItems, (item) => [item.maHocPhan, item.loaiKyThi, item.caThi]),
            stickyHead: true,
            divStyle: { height: '63vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (<tr>
                <TableHead content='Hàng' />
                <TableHead content='Mã lớp học phần' style={{ width: 'auto' }} />
                <TableHead content='Tên học phần' style={{ width: '100%' }} />
                <TableHead content='Sĩ số' style={{ textAlign: 'center' }} />
                <TableHead content='Kỳ thi' style={{ textAlign: 'center' }} />
                <TableHead content='Ca thi' style={{ textAlign: 'center' }} />
                <TableHead content='Ngày thi' style={{ textAlign: 'center' }} />
                <TableHead content='Bắt đầu' style={{ textAlign: 'center' }} />
                <TableHead content='Kết thúc' style={{ textAlign: 'center' }} />
                <TableHead content='Phòng' style={{ textAlign: 'center' }} />
                <TableHead content='Số lượng' style={{ textAlign: 'center' }} />
                <TableHead content='Giám thị' style={{ textAlign: 'center' }} />
                <TableHead content='Trạng thái' />
                {/* <TableHead content='Chọn' /> */}
            </tr>),
            renderRow: (item) => {
                const rows = [];
                let rowSpan = item.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        const hocPhan = item[i];
                        if (i == 0) {
                            rows.push(<tr key={rowSpan}>
                                <TableCell rowSpan={rowSpan} style={{ textAlign: 'right' }} content={hocPhan.id} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.maHocPhan} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.tenMonHoc} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.siSo} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.loaiKyThi} />
                                <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap' }} content={hocPhan.caThi} />
                                {hocPhan.batDau ? <>
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={new Date(hocPhan.batDau)} />
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} type='date' dateFormat='HH:MM' content={new Date(hocPhan.batDau)} />
                                </> : <>
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} content={hocPhan.ngayThi} />
                                    <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} content={hocPhan.gioBatDau} />
                                </>}
                                {hocPhan.ketThuc ? <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} type='date' dateFormat='HH:MM' content={new Date(hocPhan.ketThuc)} />
                                    : <TableCell rowSpan={rowSpan} style={{ textAlign: 'center' }} content={hocPhan.gioKetThuc} />}
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soLuong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.giamThi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                                    {hocPhan.errorDetail && hocPhan.errorDetail.map((error, i) => <div key={i} className='text-danger'><i className='fa fa-lg fa-times' /> {error}</div>)}
                                    {hocPhan.warningDetail && hocPhan.warningDetail.map((warning, i) => <div key={i} className='text-warning'><i className='fa fa-lg fa-exclamation-circle' /> {warning}</div>)}
                                </>} />
                                {/* <TableCell type='checkbox' isCheck
                                    permission={{ write: permission.write && !hocPhan.errorCode?.length }} content={hocPhan.isValid}
                                    onChanged={value => this.setState({ items: items.map(i => hocPhan.id != i.id ? ({ ...i }) : ({ ...i, isValid: value })) })} /> */}
                            </tr>);
                        }
                        else {
                            rows.push(<tr key={rowSpan}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.phong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soLuong} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.giamThi} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                                    {hocPhan.errorDetail && hocPhan.errorDetail.map((error, i) => <div key={i} className='text-danger'><i className='fa fa-lg fa-times' /> {error}</div>)}
                                    {hocPhan.warningDetail && hocPhan.warningDetail.map((warning, i) => <div key={i} className='text-warning'><i className='fa fa-lg fa-exclamation-circle' /> {warning}</div>)}
                                </>} />
                                {/* <TableCell type='checkbox' isCheck
                                    permission={{ write: permission.write && !hocPhan.errorCode?.length }} content={hocPhan.isValid}
                                    onChanged={value => this.setState({ items: items.map(i => hocPhan.id != i.id ? ({ ...i }) : ({ ...i, isValid: value })) })} /> */}
                            </tr>);
                        }
                    }
                }
                return rows;
            }
        });
        const tabs = [
            {
                title: 'Danh sách theo học phần ' + (Object.keys(items.groupBy('maHocPhan')).length ? `(${Object.keys(items.groupBy('maHocPhan')).length})` : ''),
                component: <>{tableImportSuccess}</>
            },
            {
                title: 'Danh sách theo sinh viên', component: <>{this.tableImportSuccessDssv(dssvTong)}</>
            },
            {
                title: 'Import thất bại ' + (Object.keys(falseItems.groupBy('maHocPhan')).length ? `(${Object.keys(falseItems.groupBy('maHocPhan')).length})` : ''),
                component: <>{tableImportFail}</>
            }
        ];
        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-pencil',
            title: 'Quản lý Lịch thi: Import',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý Lịch thi - Import'
            ],
            backRoute: '/user/dao-tao/lich-thi',
            content: <div className='tile'>
                <div className='text-primary'>{(!this.state.isDone && this.state.current) ? `(Đang import hàng ${this.state.current})` : ''}</div>
                <div className='rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>
                    <div className='row' style={{ textAlign: 'left' }}>
                        <FormSelect ref={e => this.namHoc = e} className='col-md-6' data={SelectAdapter_SchoolYear} label='Năm học'
                            onChange={value => this.setState({ namHoc: value.id })} />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-6' data={SelectAdapter_DtDmHocKy} label='Học kỳ'
                            onChange={value => this.setState({ hocKy: value.id })} />
                    </div>
                    <FileBox postUrl={`/user/upload?namHoc=${namHoc}&hocKy=${hocKy}`} uploadType='DtExamPhongThi' userData={'DtExamPhongThi'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} />
                    <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/dt/exam/download-import-phong-thi-template', 'TEMPLATE_PHONG_THI.xlsx')}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file template tại đây
                    </button>
                </div>
                <div className='rows' style={{ display: displayState == 'import' ? 'none' : 'block' }}>
                    {displayState != 'import' ? <>
                        <FormTabs ref={e => this.tab = e} tabs={tabs} />
                    </> : ''}
                </div>
            </div>,
            collapse: [
                { icon: 'fa-save', name: 'Lưu dữ liệu import', permission: permission.write && canSave, onClick: this.handleSave, type: 'success' },
                { icon: 'fa-refresh', name: 'Re-upload', permission: true, onClick: this.handleReload, type: 'warning' },
            ],
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = { getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps)(DtExamPage);