import React from 'react';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { AdminModal, FormSelect, FormDatePicker, renderTable, TableCell, AdminPage, getValue } from 'view/component/AdminPage';
import { getDtThoiGianPhanCong, createDtThoiGianPhanCong, updateDtThoiGianPhanCong } from '../../dtThoiGianPhanCong/redux.jsx';
import { connect } from 'react-redux';

class ThoiGianPhanCongGiangDayModal extends AdminModal {

    onShow = (item) => {
        let { donVi, batDau, ketThuc } = item ? item : { donVi: '', batDau: '', ketThuc: '' };

        this.setState({ id: item ? item.id : false });
        this.donVi.value(donVi);
        this.batDau.value(batDau);
        this.ketThuc.value(ketThuc);
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            donVi: getValue(this.donVi),
            batDau: getValue(this.batDau).setHours(0, 0, 0, 0),
            ketThuc: getValue(this.ketThuc).setHours(23, 59, 59, 999)
        };

        if (this.state.id) {
            this.props.update(this.state.id, data, this.hide);
        }
        else {
            this.props.create(data, this.hide);
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Chỉnh Sửa Phân Công' : 'Thêm Phân Công Mới',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.donVi = e} label='Đơn vị' data={SelectAdapter_DmDonViFaculty_V2} required readOnly={this.state.id} />
                <FormDatePicker type='time-mask' ref={e => this.batDau = e} label='Từ ngày' className='col-md-6' required />
                <FormDatePicker type='time-mask' ref={e => this.ketThuc = e} label='Đến ngày' className='col-md-6' required />
            </div>
        });
    }
}

class ThoiGianPhanCongConfigSection extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtThoiGianPhanCong();
        });
    }

    renderThoiGianPhanCong = () => renderTable({
        getDataSource: () => (this.props.dtThoiGianPhanCong && this.props.dtThoiGianPhanCong.items) ? this.props.dtThoiGianPhanCong.items : [],
        emptyTable: 'Không có dữ liệu',
        header: 'thead-dark',
        stickyHead: false,
        renderHead: () => (<tr>
            <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
            <th style={{ width: '45%', textAlign: 'center' }}>Đơn vị</th>
            <th style={{ width: '10%', textAlign: 'center' }}>Năm học</th>
            <th style={{ width: '5%', textAlign: 'center' }}>Học Kỳ</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>
        ),
        renderRow: (item, index) => {
            const permission = this.getUserPermission('dtThoiGianPhanCong', ['read', 'write']);
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.tenDonVi} />
                    <TableCell content={item.nam} style={{ textAlign: 'center' }} />
                    <TableCell content={item.tenHocKy} style={{ textAlign: 'center' }} />
                    <TableCell content={item.batDau} type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center' }} />
                    <TableCell content={item.ketThuc} type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center' }} />
                    <TableCell type='buttons' content={item} onEdit={() => this.thoiGianModal.show(item)} permission={permission}></TableCell>
                </tr>
            );
        }
    })
    render() {
        return (
            <div className='tile'>
                <h4 className='tile-title'>Thời gian các đơn vị phân công giảng dạy</h4>
                <div className='tile-body'>
                    {this.renderThoiGianPhanCong()}

                    <ThoiGianPhanCongGiangDayModal ref={e => this.thoiGianModal = e} create={this.props.createDtThoiGianPhanCong} update={this.props.updateDtThoiGianPhanCong} />
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' style={{ marginRight: '10px' }} onClick={e => e.preventDefault() || this.thoiGianModal.show()}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiGianPhanCong: state.daoTao.dtThoiGianPhanCong });
const mapActionsToProps = { createDtThoiGianPhanCong, getDtThoiGianPhanCong, updateDtThoiGianPhanCong };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ThoiGianPhanCongConfigSection);
