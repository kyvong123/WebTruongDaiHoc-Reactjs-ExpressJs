import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, FormCheckbox, FormDatePicker, getValue, renderTable, TableCell, AdminPage, FormSelect } from 'view/component/AdminPage';
import { getDtSemesterAll, updateDtSemester, createDtSemester } from '../../dtSemester/redux.jsx';
import { SelectAdapter_DtDmHocKy } from '../../dtDmHocKy/redux';


class SemesterModal extends AdminModal {

    onShow = (item) => {
        let { namHoc, hocKy, active, beginTime, endTime } = item ? item : { namHoc: '', hocKy: '', active: '', beginTime: '', endTime: '' };

        this.setState({ ma: item ? item.ma : false });

        this.namHoc.value(namHoc);
        this.hocKy.value(hocKy);
        this.active.value(active ? 1 : 0);
        this.beginTime.value(beginTime);
        this.endTime.value(endTime);
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            beginTime: getValue(this.beginTime).setHours(0, 0, 0, 0),
            endTime: getValue(this.endTime).setHours(23, 59, 59, 999),
            active: Number(getValue(this.active)),
            // isPrivate: Number(getValue(this.isPrivate)),
            // pass: getValue(this.pass)
        };
        data.ma = `${data.namHoc.split(' - ')[0].substring(2, 4)}${data.hocKy}`;

        if (data.beginTime > data.endTime) return T.notify('Thời gian bắt đầu phải lớn hơn thời gian kết thúc', 'danger');
        if (this.state.ma) {
            this.props.update(this.state.ma, data, this.hide);
        }
        else {
            this.props.create(data, this.hide);
        }
    }

    handleTypePass = (e) => {
        let value = e.target.value;
        if (value && value.length > 8) this.pass.value(value.substring(0, 8));
    }

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Chỉnh Sửa Học Kỳ' : 'Thêm Học Kỳ Mới',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='scholastic' ref={e => this.namHoc = e} label='Năm học' className='col-md-5' required readOnly={this.state.ma} />
                <FormSelect ref={e => this.hocKy = e} label='Học kỳ' className='col-md-5' required data={SelectAdapter_DtDmHocKy} />
                <FormCheckbox style={{ display: 'inline-flex', width: '100%', margin: 0 }} isSwitch={true} className='col-md-2' ref={e => this.active = e} label='Kích hoạt' />
                <FormDatePicker type='time-mask' ref={e => this.beginTime = e} label='Thời gian bắt đầu' className='col-md-6' required />
                <FormDatePicker type='time-mask' ref={e => this.endTime = e} label='Thời gian kết thúc' className='col-md-6' required />
                <div>
                    {/* <FormCheckbox isSwitch ref={e => this.isPrivate = e} label='Bảo mật folder điểm' className='col-md-12' onChange={isPrivate => this.setState({ isPrivate }, () => {
                        if (!isPrivate) {
                            this.pass.value('');
                        }
                    })} />
                    <FormTextBox type='password' ref={e => this.pass = e} label='Mật khẩu' smallText='Độ dài 8 ký tự.' className='col-md-12' required={this.state.isPrivate} style={{ display: this.state.isPrivate ? '' : 'none' }} onChange={e => this.handleTypePass(e)} /> */}
                </div>
            </div>
        });
    }
}


class SemesterConfigSection extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtSemesterAll();
        });
    }

    handleActive = (ma, value) => {
        this.props.updateDtSemester(ma, { active: Number(value) });
    }

    renderSemesterConfig = (items) => renderTable({
        getDataSource: () => items,
        emptyTable: 'Chưa có dữ liệu',
        header: 'thead-light',
        stickyHead: items?.length > 10,
        divStyle: { height: '45vh' },
        renderHead: () => (<tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '20%', textAlign: 'center' }}>Năm học</th>
            <th style={{ width: '10%', textAlign: 'center' }}>Học kỳ</th>
            <th style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
            <th style={{ width: '35%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>
        ),
        renderRow: (item, index) => {
            const permission = this.getUserPermission('dtSemester', ['write', 'delete']);
            return (
                <tr key={index} style={{ width: '100%' }}>
                    <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.namHoc} style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} />
                    <TableCell content={item.tenHocKy} style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableCell content={item.beginTime} type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ width: '35%', textAlign: 'center' }} />
                    <TableCell content={item.endTime} type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ width: '35%', textAlign: 'center' }} />
                    <TableCell type='checkbox' content={item.active} onChanged={value => this.handleActive(item.ma, value)} permission={permission} />
                    <TableCell type='buttons' content={item} onEdit={() => this.semesterModal.show(item)} permission={permission}></TableCell>
                </tr>
            );
        }
    });

    render() {
        return (
            <div className='tile'>
                <h4 className='tile-title'>Thông số năm học - học kỳ</h4>
                <div className='tile-body'>
                    {this.renderSemesterConfig(this.props.dtSemester?.items)}
                    <SemesterModal ref={e => this.semesterModal = e} create={this.props.createDtSemester} update={this.props.updateDtSemester} />
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' style={{ marginRight: '10px' }} onClick={e => e.preventDefault() || this.semesterModal.show()}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtSemester: state.daoTao.dtSemester });
const mapActionsToProps = { getDtSemesterAll, updateDtSemester, createDtSemester };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SemesterConfigSection);