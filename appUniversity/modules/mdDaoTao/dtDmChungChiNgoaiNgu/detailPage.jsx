import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DtDmCefr } from 'modules/mdDaoTao/dtDmCefr/redux';
import { getDtTrinhDoTuongDuongAll, getDtDmChungChiNgoaiNgu, createDtTrinhDoTuongDuong, deleteDtTrinhDoTuongDuong, updateDtTrinhDoTuongDuong } from './redux';
import { AdminPage, AdminModal, TableCell, renderDataTable, FormTextBox, FormSelect } from 'view/component/AdminPage';
class EditModal extends AdminModal {
    componentDidMount() {
    }

    onShow = (item) => {
        let { id, idChungChi, tenDiem, trinhDo, tenChungChi, diemDat } = item ? item
            : { id: null, idChungChi: this.props.idChungChi, tenDiem: '', trinhDo: '', tenChungChi: this.props.tenChungChi, diemDat: '' };
        this.setState({ id, idChungChi, item }, () => {
            this.tenChungChi.value(tenChungChi);
            this.trinhDo.value(trinhDo);
            this.diemDat.value(diemDat);
            this.tenDiem.value(tenDiem);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            idChungChi: this.state.idChungChi,
            trinhDo: this.trinhDo.value(),
            tenDiem: this.tenDiem.value(),
            diemDat: this.diemDat.value(),
        };
        if (changes.trinhDo == '') {
            T.notify('Chưa chọn trình độ!', 'danger');
            this.trinhDo.focus();
        } else if (changes.diemDat == '') {
            T.notify('Chưa nhập điểm đạt!', 'danger');
            this.diemDat.focus();
        } else this.state.id ? this.props.update(this.state.id, this.state.idChungChi, changes, this.hide) : this.props.create(this.state.idChungChi, changes, this.hide);
    };

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật chứng chỉ ngoại ngữ' : 'Tạo mới chứng chỉ ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-6' ref={e => this.tenChungChi = e} label='Tên chứng chỉ ngoại ngữ' readOnly={true} />
                <FormSelect className='col-md-6' ref={e => this.trinhDo = e} label='Trình độ' data={SelectAdapter_DtDmCefr} required />
                <FormTextBox className='col-md-6' ref={e => this.diemDat = e} label='Điểm đạt' required />
                <FormTextBox className='col-md-6' ref={e => this.tenDiem = e} label='Tên điểm' />
            </div>
        });
    };
}

class DetailPage extends AdminPage {
    state = { id: null, item: {} }
    componentDidMount() {
        let id = this.props.match.params.id;
        this.props.getDtDmChungChiNgoaiNgu(id, item => {
            this.setState({ id, item }, () => this.props.getDtTrinhDoTuongDuongAll(id));
        });

    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa trình độ chứng chỉ ngoại ngữ này?', true, isConfirm =>
            isConfirm && this.props.deleteDtTrinhDoTuongDuong(item.id, this.state.id));
    }

    render() {
        const permission = this.getUserPermission('dtDmChungChiNgoaiNgu', ['manage', 'write', 'delete']);
        let { id, item } = this.state,
            items = this.props.dtDmChungChiNgoaiNgu ? this.props.dtDmChungChiNgoaiNgu.items : [];

        const table = renderDataTable({
            data: items,
            header: 'thead-light',
            stickyHead: items && items.length > 10 ? true : false,
            emptyTable: 'Chứng chỉ chưa có khung trình độ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên chứng chỉ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngoại ngữ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Trình độ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm đạt</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên điểm</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenChungChi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenNgoaiNgu} />
                    <TableCell style={{ textAlign: 'center' }} content={item.trinhDo} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diemDat} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenDiem} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách trình độ chứng chỉ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                <Link key={1} to='/user/dao-tao/chung-chi-ngoai-ngu'>Chứng chỉ ngoại ngữ</Link>,
                'Detail'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} idChungChi={id} tenChungChi={item.ten} readOnly={!permission.write} create={this.props.createDtTrinhDoTuongDuong} update={this.props.updateDtTrinhDoTuongDuong} />
            </>,
            backRoute: '/user/dao-tao/chung-chi-ngoai-ngu',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmChungChiNgoaiNgu: state.daoTao.dtDmChungChiNgoaiNgu });
const mapActionsToProps = {
    getDtTrinhDoTuongDuongAll, getDtDmChungChiNgoaiNgu, createDtTrinhDoTuongDuong, deleteDtTrinhDoTuongDuong, updateDtTrinhDoTuongDuong
};
export default connect(mapStateToProps, mapActionsToProps)(DetailPage);