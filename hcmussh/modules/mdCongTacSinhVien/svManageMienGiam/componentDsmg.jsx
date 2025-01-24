import React from 'react';
import { connect } from 'react-redux';
import { TableCell, FormCheckbox, FormSelect, AdminModal, FormRichTextBox, getValue, TableHead, renderDataTable, FormDatePicker } from 'view/component/AdminPage';
import { getSvDsMienGiamPage, updateHoanSvDsMienGiam, updateEndDate } from './redux/reduxDsmg';
import Pagination from 'view/component/Pagination';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DmTinhTrangSinhVienV2 } from 'modules/mdDanhMuc/dmTinhTrangSinhVien/redux';
import { DashboardIcon } from 'modules/mdCongTacSinhVien/svSetting/DashboardPage';
import { Tooltip } from '@mui/material';

class LyDoModal extends AdminModal {
    state = { mssv: null }
    onShow = (item) => {
        this.setState({ mssv: item.mssv, doiTuong: item.loaiMienGiam }, () => this.lyDo.value(''));
    }

    onSubmit = () => {
        const data = {
            isHoan: 1,
            lyDo: getValue(this.lyDo)
        };
        T.confirm('Xác nhận hoãn sinh viên', '', isConfirm => isConfirm && this.props.update({ mssv: this.state.mssv, doiTuong: this.state.doiTuong },
            data, () => this.hide() || this.props.getPage()));
    }

    render = () => {
        return this.renderModal({
            title: 'Lý do hoãn',
            body: <div className='row'>
                <FormRichTextBox ref={e => this.lyDo = e} className='col-md-12' required />
            </div>
        });
    }
}
class ComponentDsmg extends React.Component {
    state = {
        filterNamHocHocKy: false, filter: {},
        editingMssv: null,
    }
    timeline = Date.now()
    summary = null;

    componentDidMount() {
        this.props.getScheduleSettings(data => {
            const { namHoc, hocKy } = data.currentSemester;
            this.setState({ filter: { namHoc, hocKy } }, () => {
                this.getPage();
                this.namHoc?.value(namHoc);
                this.hocKy?.value(hocKy);
            }
            );
        });
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        let filter = this.state.filter;
        if (!this.state.filterNamHocHocKy) {
            filter = Object.assign({}, filter, { namHoc: null, hocKy: null });
        }
        this.props.getSvDsMienGiamPage(pageNumber, pageSize, pageCondition, filter, data => {
            this.timeLine = data.timeline;
            this.summary = data.summary;
        });
    }

    onActive = (mssv, subItem) => {
        if (subItem.isHoan == 0) {
            this.lyDoModal.show({ mssv, ...subItem });
        } else {
            this.props.updateHoanSvDsMienGiam({ mssv, doiTuong: subItem.loaiMienGiam }, { isHoan: 0 }, () => this.getPage());
        }
    }

    onKeySearch = (key) => {
        const [_key, value] = key.split(':'),
            { filter } = this.state;
        this.setState({ filter: { ...filter, [_key]: value } }, () => this.getPage());
    }

    editSinhVien = (mssv, qdId) => {
        this.setState({
            editingMssv: mssv,
            editingQd: qdId,
        });
    }
    stopEditingEndDate = () => {
        this.setState({
            editingMssv: null,
            editingQd: null,
        });
    };

    handleEndDateChange = (mssv, qdId, timeStart) => {
        const newDate = this.timeEndEditor.value();
        if (newDate) {
            if (newDate.getTime() < timeStart) {
                T.notify('Ngày kết thúc trước ngày bắt đầu', 'danger');
            }
            else {
                this.props.updateEndDate(mssv, qdId, { timeEnd: newDate.getTime() });
                this.stopEditingEndDate();
            }
        }
        else {
            T.notify('Sai định dạng thời gian', 'danger');
        }
    }
    render() {
        const permission = this.props.permission;
        const { list, pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.svDsMienGiam && this.props.svDsMienGiam.page ? this.props.svDsMienGiam.page : { list: [], pageNumber: 1, pageSize: 50 };
        return <>
            <div className="row">
                <div className='col-md-3'>
                    <DashboardIcon type='info' icon='fa-users' title='Tổng số sinh viên' value={this.summary?.totalItem || 0} />
                </div>
                <div className='col-md-3'>
                    <DashboardIcon type='danger' icon='fa-users' title='Số sinh viên kích hoạt' value={this.summary?.totalActive || 0} />
                </div>
            </div>
            <div className='d-flex justify-content-between'>
                <FormCheckbox onChange={(value) => {
                    this.setState({ filterNamHocHocKy: value }, () => {
                        if (value) {
                            const { namHoc, hocKy } = this.state.filter || {};
                            this.namHoc.value(namHoc);
                            this.hocKy.value(hocKy);
                        }
                        this.getPage();
                    });
                }} label={<>Lọc theo năm học và học kỳ <Tooltip title='Khung thời gian học kỳ được phòng đào tạo thiếp lập theo cấu hình'><span className='badge badge-pill badge-dark'><i className='fa fa-info' /></span></Tooltip></>} />
                {this.state.filterNamHocHocKy && <div className='row' style={{ width: 'calc(100vw / 4)' }}>
                    <FormSelect ref={e => this.namHoc = e} className="col-md-6" placeholder='Năm học hiện tại' data={SelectAdapter_SchoolYear} onChange={value => this.setState(prevState => ({ filter: { ...prevState.filter, namHoc: value.id } }), this.getPage)} />
                    <FormSelect ref={e => this.hocKy = e} placeholder='Học kỳ hiện tại' className='col-md-6' data={[{ id: '2', text: 'HK2' }, { id: '1', text: 'HK1' }]} onChange={value => this.setState(prevState => ({ filter: { ...prevState.filter, hocKy: value.id } }), this.getPage)} />
                </div>}
            </div>
            <div>
                {renderDataTable({
                    data: list || [],
                    header: 'thead-light',
                    // className: 'table-pin',
                    renderHead: () => <tr style={{ width: '100%' }}>
                        <th style={{ width: 'auto' }}>#</th>
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='MSSV' onKeySearch={this.onKeySearch} keyCol='mssv' />
                        <TableHead style={{ width: '15%', whiteSpace: 'nowrap' }} content='Hệ đào tạo' onKeySearch={this.onKeySearch} keyCol='heDaoTao' />
                        <TableHead style={{ width: '15%', whiteSpace: 'nowrap' }} content='Tình trạng' typeSearch='select' data={SelectAdapter_DmTinhTrangSinhVienV2} onKeySearch={this.onKeySearch} keyCol='tinhTrang' />
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đã áp dụng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SQĐ Miễn giảm</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Đối tượng MG</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>%</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Từ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Đến</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lý do</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }} className='sticky-col'>Kích hoạt {<Tooltip title='Nếu như sinh viên đã được áp dụng, thao tác sẽ áp dụng cho học kỳ kế tiếp'><span className='badge badge-pill badge-dark'><i className='fa fa-info' /></span></Tooltip>}</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chỉnh sửa</th>
                    </tr>,
                    renderRow: (item, index) => {
                        const dataMienGiam = T.parse(item.dataMienGiam) || [];
                        return dataMienGiam.map((subItem, subIndex) => (<tr key={`${index}-${subIndex}`}>
                            {!subIndex && <>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} rowSpan={dataMienGiam.length} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} rowSpan={dataMienGiam.length}>
                                </TableCell>
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.loaiHinhDaoTao} rowSpan={dataMienGiam.length} />
                                <TableCell content={item.tinhTrang} style={{ whiteSpace: 'nowrap', ...(item.maTinhTrang != 1 ? { color: '#d9534f', fontWeight: 'bold' } : {}) }} rowSpan={dataMienGiam.length} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} rowSpan={dataMienGiam.length} content={item.isApply == 1 ? <i className='fa fa-check'></i> : null} />
                            </>}
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={subItem.soCongVan} />
                            <TableCell content={subItem.doiTuong} />
                            <TableCell content={`${subItem.mucHuong}%`} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={subItem.timeStart} type='date' dateFormat='dd/mm/yyyy' />
                            {this.state.editingMssv === item.mssv && this.state.editingQd == subItem.mienGiamId ? (
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                                    <FormDatePicker
                                        type='date-mask'
                                        className="mb-0"
                                        style={{ width: '100px' }}
                                        ref={e => this.timeEndEditor = e}
                                        value={subItem.timeEnd}
                                    />
                                } />
                            ) : (
                                <TableCell style={{ whiteSpace: 'nowrap', ...(subItem.timeEnd < this.timeLine ? { color: '#f0ad4e', fontWeight: 'bold' } : {}) }} content={subItem.timeEnd} type='date' dateFormat='dd/mm/yyyy' />
                            )}
                            <TableCell style={{ textAlign: 'center' }} content={subItem.lyDoHoan ? <Tooltip title={subItem.lyDoHoan}><h5><span className='badge badge-pill badge-danger'><i className='fa fa-exclamation' /></span></h5></Tooltip> : null} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} className='sticky-col' type='checkbox' content={subItem.isHoan != 1} permission={{ write: permission['write'] && !this.state.filterNamHocHocKy }} onChanged={() => this.onActive(item.mssv, subItem)} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' permission={{ write: permission['write'] }} content={item}>
                                {this.state.editingMssv === item.mssv && this.state.editingQd == subItem.mienGiamId ? (
                                    <>
                                        <Tooltip title='Lưu' arrow placeholder='bottom'>
                                            <a className='btn btn-success' href='#' onClick={() => this.handleEndDateChange(item.mssv, subItem.mienGiamId, subItem.timeStart)}>
                                                <i className='fa fa-lg fa-save' />
                                            </a>
                                        </Tooltip>
                                        <Tooltip title='Huỷ' arrow placeholder='bottom'>
                                            <a className='btn btn-danger' href='#' onClick={() => this.stopEditingEndDate()}>
                                                <i className='fa fa-lg fa-ban' />
                                            </a>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Tooltip title='Chỉnh sửa' arrow placeholder='bottom'>
                                        <a className='btn btn-primary' href='#' onClick={() => this.editSinhVien(item.mssv, subItem.mienGiamId)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                    </Tooltip>
                                )
                                }
                            </TableCell>
                        </tr>));
                    }
                })}
            </div>
            <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
            <LyDoModal ref={e => this.lyDoModal = e} update={this.props.updateHoanSvDsMienGiam} getPage={this.getPage} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, svDsMienGiam: state.ctsv.svDsMienGiam });
const mapActionsToProps = { getSvDsMienGiamPage, updateHoanSvDsMienGiam, getScheduleSettings, updateEndDate };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentDsmg);
