import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, FormTextBox, FormCheckbox, FormDatePicker, getValue, renderTable, TableCell, AdminPage, FormSelect } from 'view/component/AdminPage';
import { getSdhSemesterAll, updateSdhSemester, createSdhSemester } from './redux';
import { SelectAdapter_DtDmHocKy } from '../../mdDaoTao/dtDmHocKy/redux';
import T from 'view/js/common.js';
class SemesterModal extends AdminModal {

    onShow = (item) => {
        let { namHoc, hocKy, active, beginTime, endTime, beginEditTime, endEditTime } = item ? item : { namHoc: '', hocKy: '', active: '', beginTime: '', endTime: '', beginEditTime: '', endEditTime: '' };
        this.setState({ ma: item ? item.ma : false });
        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.active.value(active ? 1 : 0);
        this.beginTime.value(beginTime);
        this.endTime.value(endTime);
        this.beginEditTime.value(beginEditTime);
        this.endEditTime.value(endEditTime);
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            beginTime: getValue(this.beginTime).setHours(0, 0, 0, 0),
            endTime: getValue(this.endTime).setHours(23, 59, 59, 999),
            beginEditTime: getValue(this.beginEditTime).setHours(0, 0, 0, 0),
            endEditTime: getValue(this.endEditTime).setHours(23, 59, 59, 999),
            active: Number(getValue(this.active))
        };
        if (data.beginTime > data.endTime) { T.notify('Ngày bắt đầu không được bé hơn ngày kết thúc học kì!', 'danger'); }
        else if (data.beginEditTime > data.endEditTime) { T.notify('Ngày bắt đầu điểu chỉnh kế hoạch không hợp lệ!', 'danger'); }
        else if (data.beginEditTime > data.beginTime || data.endEditTime > data.beginTime) {
            T.notify('Học kì đã bắt đầu không thể chỉnh sửa kế hoạch!', 'danger');
        }
        else {
            data.ma = `${data.namHoc.split(' - ')[0].substring(2, 4)}${data.hocKy}`;
            this.state.ma ? this.props.update(this.state.ma, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: readOnly ? 'Thông Tin Học Kỳ' : this.state.ma ? 'Chỉnh Sửa Học Kỳ' : 'Thêm Học Kỳ Mới',
            size: 'large',
            isShowSubmit: !readOnly,
            body: <div className='row'>
                <FormTextBox type='scholastic' ref={e => this.namHoc = e} label='Năm học' style={{ marginTop: (this.state.ma || readOnly) ? '35px' : '' }} className='col-md-6' required readOnly={this.state.ma || readOnly} />
                <FormSelect ref={e => this.hocKy = e} label='Học kỳ' className='col-md-6' required data={SelectAdapter_DtDmHocKy} readOnly={readOnly} />
                <div style={{ position: 'absolute', top: '2px', right: '8px' }}>
                    <FormCheckbox style={{ display: 'inline-flex', width: '100%', margin: 0 }} isSwitch={true} ref={e => this.active = e} label='Kích hoạt' readOnly={readOnly} />
                </div>
                <FormDatePicker type='date' ref={e => this.beginTime = e} label='Bắt đầu học kì' className='col-md-6' required readOnly={readOnly} />
                <FormDatePicker type='date' ref={e => this.endTime = e} label='Kết thúc học kì' className='col-md-6' required readOnly={readOnly} />
                <FormDatePicker type='date' ref={e => this.beginEditTime = e} label='Bắt đầu điều chỉnh kế hoạch' className='col-md-6' required readOnly={readOnly} />
                <FormDatePicker type='date' ref={e => this.endEditTime = e} label='Kết thúc điều chỉnh kế hoạch' className='col-md-6' required readOnly={readOnly} />
            </div>
        });
    }
}
class SemesterConfig extends AdminPage {

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhSemesterAll();
        });
    }

    handleActive = (ma, value) => {
        this.props.updateSdhSemester(ma, { active: Number(value) });
    }

    render() {
        const permission = this.getUserPermission('sdhSemester');
        const readOnly = !permission.write;
        let table = renderTable({
            getDataSource: () => this.props.sdhSemester?.items,
            emptyTable: 'Chưa có dữ liệu',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center' }}>Năm học</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Học kỳ</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Mở điều chỉnh</th>
                <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Khóa điều chỉnh</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index} style={{ width: '100%' }}>
                        <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                        <TableCell content={item.namHoc} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={`HK${item.hocKy}`} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell content={item.beginTime} type='date' dateFormat='dd/mm/yyyy  HH:MM' style={{ textAlign: 'center' }} />
                        <TableCell content={item.endTime} type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center' }} />
                        <TableCell content={item.beginEditTime} type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center' }} />
                        <TableCell content={item.endEditTime} type='date' dateFormat='dd/mm/yyyy  HH:MM' style={{ textAlign: 'center' }} />
                        <TableCell style={{ textAlign: 'center' }} type='checkbox' content={item.active} onChanged={value => this.handleActive(item.ma, value)} permission={permission} />
                        <TableCell type='buttons' content={item} onEdit={() => this.semesterModal.show(item)} permission={permission}></TableCell>
                    </tr>
                );
            }
        });
        return this.renderPage(
            {
                icon: 'fa fa-calendar',
                title: 'Cấu hình năm học',
                breadcrumb: [
                    <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                    'Cấu hình năm học'
                ],
                content: <>
                    <div className='tile'>
                        <div className='tile-body'>
                            {table}
                            <SemesterModal ref={e => this.semesterModal = e} create={this.props.createSdhSemester} update={this.props.updateSdhSemester} readOnly={readOnly} />
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' style={{ marginRight: '10px' }} onClick={e => e.preventDefault() || this.semesterModal.show()}>
                                <i className='fa fa-lg fa-plus' /> Thêm
                            </button>
                        </div>
                    </div>
                </>,
                backRoute: '/user/sau-dai-hoc',
            });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhSemester: state.sdh.sdhSemester });
const mapActionsToProps = { getSdhSemesterAll, updateSdhSemester, createSdhSemester };
export default connect(mapStateToProps, mapActionsToProps)(SemesterConfig);