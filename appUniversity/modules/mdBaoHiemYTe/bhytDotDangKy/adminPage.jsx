import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderTable, TableCell, FormTextBox, FormDatePicker, FormSelect, getValue } from 'view/component/AdminPage';
import { getAllCtsvDotDangKyBhyt, createCtsvDotDangKyBhyt, updateCtsvDotDangKyBhyt } from './redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
// import { Img } from 'view/component/HomePage';
// import BhModal from 'modules/mdBaoHiemYTe/svBaoHiemYTe/BhModal';

class DotBhytModal extends AdminModal {
    onShow = (item) => {
        const { ma, namDangKy, thoiGianBatDau, thoiGianKetThuc, heDaoTao, khoaSinhVien } = item || {};
        this.setState({ ma, item });
        this.ma.value(ma || '');
        this.heDaoTao.value(heDaoTao?.split(','));
        this.namDangKy.value(namDangKy || '');
        this.khoaSinhVien.value(khoaSinhVien?.split(','));
        this.thoiGianBatDau.value(thoiGianBatDau || '');
        this.thoiGianKetThuc.value(thoiGianKetThuc || '');
    }

    onSubmit = () => {
        const data = {
            ma: getValue(this.ma),
            namDangKy: getValue(this.namDangKy),
            heDaoTao: getValue(this.heDaoTao).join(','),
            khoaSinhVien: getValue(this.khoaSinhVien).join(','),
            thoiGianBatDau: getValue(this.thoiGianBatDau).getTime(),
            thoiGianKetThuc: getValue(this.thoiGianKetThuc).getTime(),
        };
        T.confirm(`Xác nhận ${this.state.ma ? 'Cập nhật' : 'Tạo'} đợt đăng ký?`, '<p class="text-danger">Lưu ý: Đợt sẽ tự động kích hoạt sau khi xác nhận</p>', isConfirm => {
            if (!isConfirm) return;
            this.state.ma ? this.props.update(this.state.ma, data, this.hide) : this.props.create(data, this.hide);
        });
    }

    render = () => {
        const { ma } = this.state;
        const { readOnly } = this.props;
        return this.renderModal({
            title: `${this.state.ma ? 'Cập nhật' : 'Tạo'} đợt đóng bảo hiểm y tế`,
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} className='col-md-12' label='Mã' required readOnly={!!ma} />
                <FormSelect ref={e => this.namDangKy = e} className='col-md-12' label='Năm đăng ký' data={Array.from({ length: 6 }, (_, k) => (new Date().getFullYear() + 1) - k)} required readOnly={readOnly} />
                <FormSelect ref={e => this.heDaoTao = e} className='col-md-12' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple required readOnly={readOnly} />
                <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-12' label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} multiple required readOnly={readOnly} />
                <FormDatePicker ref={e => this.thoiGianBatDau = e} className='col-md-6' type='time-mask' label='Thời gian bắt đầu' required readOnly={readOnly} />
                <FormDatePicker ref={e => this.thoiGianKetThuc = e} className='col-md-6' type='time-mask' label='Thời gian kết thúc' required readOnly={readOnly} />
            </div>
        });
    }
}

class DotDangKyBhytAdminPage extends AdminPage {
    state = { isLoading: false }
    componentDidMount() {
        const permission = this.getUserPermission('bhyt');
        this.setState({ permission });
        T.ready('/user/bao-hiem-y-te', () => {
            this.props.getAllCtsvDotDangKyBhyt();
        });
    }

    onActive = (item, value) => {
        if (!value) return;
        T.confirm('Xác nhận kích hoạt đợt đóng BHYT?', '', isConfirm => {
            isConfirm && this.props.updateCtsvDotDangKyBhyt(item.ma);
        });
    }

    render() {
        let permission = this.getUserPermission('bhyt', ['read', 'write', 'delete', 'export']);
        const { items = [] } = this.props.ctsvDotDangKyBhyt || {};
        const latest = Math.max(...items.map(item => item.timeModified));
        return this.renderPage({
            title: 'Cấu hình đợt đăng ký BHYT',
            icon: 'fa fa-cogs',
            breadcrumb: [
                <Link key={0} to='/user/bao-hiem-y-te'>Bảo hiểm y tế</Link>,
                'Cấu hình đợt đăng ký BHYT'
            ],
            content: (<>
                <div className="tile">
                    <p className="tile-title">Danh sách đợt đóng bảo hiểm y tế</p>
                    <div className="tile-body">
                        {renderTable({
                            getDataSource: () => items || [],
                            renderHead: () => (<tr>
                                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                                <th style={{ whiteSpace: 'nowrap', width: '25%' }}>Mã</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Năm đăng ký</th>
                                <th style={{ whiteSpace: 'nowrap', width: '10%' }}>Hệ đào tạo</th>
                                <th style={{ whiteSpace: 'nowrap', width: '15%' }}>Khóa sinh viên</th>
                                <th style={{ whiteSpace: 'nowrap', width: '25%' }}>Thời gian bắt đầu</th>
                                <th style={{ whiteSpace: 'nowrap', width: '25%' }}>Thời gian kết thúc</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Cập nhật cuối</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Kích hoạt</th>
                                <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                            </tr>),
                            renderRow: (item, index) => (<tr key={index}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='link' url={`/user/bao-hiem-y-te/quan-ly/${item.ma}`} content={item.ma} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.namDangKy} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.heDaoTao?.split(',').join(', ')} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.khoaSinhVien?.split(',').join(', ')} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianBatDau} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.thoiGianKetThuc} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                                    {/* <span>{item.userModified}</span><br /> */}
                                    <span>{T.dateToText(item.timeModified, 'dd/mm/yyyy')}</span></>} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='checkbox' permission={permission} content={Number(item.timeModified == latest)} onChanged={(value) => this.onActive(item, value)} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons' permission={permission} onEdit={e => e.preventDefault() || this.modal.show(item)} />
                            </tr>)
                        })}
                        {/* <FormTextBox ref={e => this.ma = e} className='col-md-3' label='Mã' required />
                        <FormTextBox ref={e => this.namDangKy = e} type='year' className='col-md-3' label='Năm đăng ký' required />
                        <FormDatePicker ref={e => this.thoiGianBatDau = e} className='col-md-3' type='time-mask' label='Thời gian bắt đầu' required />
                        <FormDatePicker ref={e => this.thoiGianKetThuc = e} className='col-md-3' type='time-mask' label='Thời gian kết thúc' required /> */}
                    </div>
                </div>
                <DotBhytModal ref={e => this.modal = e} create={this.props.createCtsvDotDangKyBhyt} update={this.props.updateCtsvDotDangKyBhyt} />
                {/* <BaoHiemHistory permission={this.state.permission} ref={e => this.bhytHistory = e} /> */}
            </>),
            onCreate: () => permission.write && this.modal.show()
            // collapse: [
            //     { icon: 'fa-print', name: 'Export', permission: permission.export, onClick: () => this.downloadExcel(), type: 'success' }
            // ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvDotDangKyBhyt: state.ctsv.ctsvDotDangKyBhyt });
const mapActionsToProps = {
    getAllCtsvDotDangKyBhyt, createCtsvDotDangKyBhyt, updateCtsvDotDangKyBhyt
};

export default connect(mapStateToProps, mapActionsToProps)(DotDangKyBhytAdminPage);
