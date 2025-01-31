import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderTable, TableCell, FormTextBox, FormSelect, getValue } from 'view/component/AdminPage';
import { getAllCtsvShcd, createCtsvShcd, updateCtsvShcd, deleteCtsvShcd } from './redux/shcdRedux';
import { EaseDateRangePicker } from 'view/component/AdminPage';

class AdminShcdModal extends AdminModal {
    onShow = (item) => {
        const { id = '', ten = '', khoaSinhVien = '', timeStart = '', timeEnd = '' } = item || {};
        this.setState({ id, item });
        this.ten.value(ten || '');
        this.khoaSinhVien.value(khoaSinhVien || '');
        this.timeRange.value(timeStart, timeEnd);
        // this.timeStart.value(timeStart || '');
        // this.timeEnd.value(timeEnd || '');
    }

    onSubmit = () => {
        const [timeStart, timeEnd] = this.timeRange.value();
        const data = {
            ten: getValue(this.ten),
            khoaSinhVien: getValue(this.khoaSinhVien),
            timeStart: timeStart?.getTime(),
            timeEnd: timeEnd?.getTime(),
        };
        if (!timeStart || !timeEnd) {
            throw this.timeRange;
        }

        T.confirm(`Xác nhận ${this.state.id ? 'cập nhật' : 'tạo'} sinh hoạt công dân?`, '', isConfirm => {
            if (!isConfirm) return;
            this.state.id ? this.props.update(this.state.id, data, this.hide) : this.props.create(data, data => {
                this.props.history && T.confirm('Chuyển sang trang cấu hình?', '', redirect => {
                    redirect && this.props.history.push(`/user/ctsv/shcd/edit/${data.id}`);
                });
            });
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: `${this.state.id ? 'Cập nhật' : 'Tạo'} sinh hoạt công dân`,
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.ten = e} label='Tiêu đề' required readOnly={readOnly} />
                <FormSelect className='col-md-12' ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' data={Array.from({ length: 6 }, (_, k) => new Date().getFullYear() - k)} required readOnly={readOnly} />
                <EaseDateRangePicker ref={e => this.timeRange = e} label='Thời gian diễn ra' inputClassName='m-0 p-0 pl-2' className='col-md-12' middleWare={(start, end) => {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return [start, end];
                }} />
                {/* <FormDatePicker className='col-md-6' ref={e => this.timeStart = e} label='Thời gian bắt đầu' type='date' required readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.timeEnd = e} label='Thời gian Kết thúc' type='date' required readOnly={readOnly} /> */}
            </div>
        });
    }
}


class AdminShcdPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getAllCtsvShcd();
        });
    }

    delete = (id) => {
        T.confirm('Xác nhận xóa sinh hoạt công dân?', '<p class="text-danger"><b>LƯU Ý:</b> Tất cả nội dụng, sự kiện liên quan đến kế hoạch này sẽ bị xóa!</p>', isConfirm => isConfirm && this.props.deleteCtsvShcd(id));
    }

    activateShcd = (item, value) => {
        const { id, timeStart, timeEnd } = item;
        const now = Date.now();
        if (value) {
            T.confirm('Xác nhận kích hoạt kế hoạch SHCD?', '<span class="text-danger"><b>LƯU Ý:</b> Chỉ duy nhất một kế hoạch được kích hoạt tại một thời điểm!</span>', isConfirm => isConfirm && this.props.updateCtsvShcd(id, { kichHoat: value }));
        } else {
            T.confirm('Xác nhận tắt kích hoạt kế hoạch SHCD?', timeStart <= now && now <= timeEnd ? '<span class="text-danger"><b>CẢNH BÁO:</b> Kế hoạch đang diễn ra!</span>' : '', isConfirm => isConfirm && this.props.updateCtsvShcd(id, { kichHoat: value }));
        }
    }

    render() {
        const list = this.props.ctsvShcd?.items;
        const permission = this.getUserPermission('ctsvShcd');
        return this.renderPage({
            title: 'Danh sách kế hoạch sinh hoạt công dân',
            icon: 'fa fa-users',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Danh sách kế hoạch SHCD'
            ],
            content: <div className='tile'>{renderTable({
                getDataSource: () => list || [],
                renderHead: () => <tr>
                    <th>#</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ whiteSpace: 'nowrap', width: '60%' }}>Khóa sinh viên</th>
                    <th style={{ whiteSpace: 'nowrap', width: '40%' }}>Thời gian</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <td>{index + 1}</td>
                    <TableCell type='link' style={{ whiteSpace: 'nowrap', width: '60%' }} url={`/user/ctsv/shcd/edit/${item.id}`} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap', width: '40%' }} content={item.khoaSinhVien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                        <span><b>Từ:  </b>{T.dateToText(item.timeStart, 'dd/mm/yyyy')}</span><br />
                        <span><b>Đến: </b>{T.dateToText(item.timeEnd, 'dd/mm/yyyy')}</span>
                    </>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='checkbox' content={item.kichHoat} permission={permission} onChanged={value => this.activateShcd(item, value)} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='buttons' permission={permission}
                        onEdit={() => this.modal.show(item)}
                    // onDelete={() => this.delete(item.id)} 
                    />
                </tr>
            })}
                <AdminShcdModal ref={e => this.modal = e} readOnly={!permission.write} update={this.props.updateCtsvShcd} create={this.props.createCtsvShcd} history={this.props.history} />
            </div>,
            onCreate: () => permission.write && this.modal.show(),
            backRoute: '/user/ctsv'
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvShcd: state.ctsv.ctsvShcd });
const mapActionsToProps = { getAllCtsvShcd, createCtsvShcd, updateCtsvShcd, deleteCtsvShcd };

export default connect(mapStateToProps, mapActionsToProps)(AdminShcdPage);