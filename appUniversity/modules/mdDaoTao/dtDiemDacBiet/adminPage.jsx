import React from 'react';
import { connect } from 'react-redux';
import { getDtDiemDacBietAll, createDtDiemDacBiet, updateDtDiemDacBiet } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, getValue, FormTabs } from 'view/component/AdminPage';

class EditModal extends AdminModal {

    onShow = (item) => {
        let { ma, moTa, moTaTiengAnh, kichHoat, tinhTongKet, khongTinhPhi } = item ? item : { ma: '', moTa: '', moTaTiengAnh: '', kichHoat: 1, tinhTongKet: 0, khongTinhPhi: 0 };
        this.setState({ ma });

        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat ? 1 : 0);
        this.tinhTongKet.value(tinhTongKet ? 1 : 0);
        this.khongTinhPhi.value(khongTinhPhi ? 1 : 0);
        this.moTaTiengAnh.value(moTaTiengAnh);
    };

    changeKichHoat = value => this.kichHoat.value(Number(value));

    changeTinhTongKet = value => this.tinhTongKet.value(Number(value));

    changeTinhPhi = value => this.khongTinhPhi.value(Number(value));

    changeTinhTinChi = value => this.tinhTinChi.value(Number(value));

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ma: getValue(this.ma),
            moTa: getValue(this.moTa),
            kichHoat: Number(this.kichHoat.value()),
            tinhTongKet: Number(this.tinhTongKet.value()),
            khongTinhPhi: Number(this.khongTinhPhi.value()),
            tinhTinChi: Number(this.tinhTinChi.value()),
            moTaTiengAnh: getValue(this.moTaTiengAnh),
        };
        this.state.ma ? this.props.update(changes, this.hide) : this.props.create(changes, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật điểm đặc biệt' : 'Tạo mới điểm đặc biệt',
            body: <div className='row'>
                <FormTextBox ref={e => this.ma = e} label='Mã' className='col-md-12' required readOnly={this.state.ma} />
                <FormCheckbox ref={e => this.kichHoat = e} isSwitch={true} label='Kích hoạt' className='col-md-4' onChanged={value => this.changeKichHoat(value)} />
                <FormCheckbox ref={e => this.tinhTongKet = e} isSwitch={true} label='Tính tổng kết' className='col-md-4' onChanged={value => this.changeTinhTongKet(value)} />
                <FormCheckbox ref={e => this.khongTinhPhi = e} isSwitch={true} label='Không tính phí' className='col-md-4' onChanged={value => this.changeTinhPhi(value)} />
                <FormCheckbox ref={e => this.tinhTinChi = e} isSwitch={true} label='Tính tín chỉ' className='col-md-4' onChanged={value => this.changeTinhTinChi(value)} />
                <FormTabs className='col-md-12' tabs={[
                    { title: 'Mô tả', component: <FormTextBox ref={e => this.moTa = e} required /> },
                    { title: 'Mô tả tiếng anh', component: <FormTextBox ref={e => this.moTaTiengAnh = e} required /> }
                ]} />
            </div>
        });
    }
}

class DtDiemPage extends AdminPage {
    componentDidMount() {
        this.props.getDtDiemDacBietAll();
    }

    render() {
        const permission = this.getUserPermission('dtDiemDacBiet');
        let items = this.props.diemDacBiet ? this.props.diemDacBiet.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Mã</th>
                    <th style={{ width: '35%' }}>Mô tả</th>
                    <th style={{ width: '35%' }}>Mô tả tiếng anh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tính tổng kết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Không tính phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tính tín chỉ</th>
                    <th style={{ width: 'auto' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.ma} />
                    <TableCell content={item.moTa} />
                    <TableCell content={item.moTaTiengAnh} />
                    <TableCell type='checkbox' content={item.tinhTongKet} permission={permission}
                        onChanged={value => this.props.updateDtDiemDacBiet({ ma: item.ma, tinhTongKet: value ? 1 : 0 })} />
                    <TableCell type='checkbox' content={item.khongTinhPhi} permission={permission}
                        onChanged={value => this.props.updateDtDiemDacBiet({ ma: item.ma, khongTinhPhi: value ? 1 : 0 })} />
                    <TableCell type='checkbox' content={item.tinhTinChi} permission={permission}
                        onChanged={value => this.props.updateDtDiemDacBiet({ ma: item.ma, tinhTinChi: value ? 1 : 0 })} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={value => this.props.updateDtDiemDacBiet({ ma: item.ma, kichHoat: value ? 1 : 0 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={(e) => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách điểm đặc biệt',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Cấu hình điểm</Link>,
                'Điểm đặc biệt'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDtDiemDacBiet} update={this.props.updateDtDiemDacBiet} />
            </>,
            backRoute: '/user/dao-tao/grade-manage',
            onCreate: permission && permission.write ? (e) => e && e.preventDefault() || this.modal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, diemDacBiet: state.daoTao.diemDacBiet });
const mapActionsToProps = { getDtDiemDacBietAll, createDtDiemDacBiet, updateDtDiemDacBiet };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemPage);