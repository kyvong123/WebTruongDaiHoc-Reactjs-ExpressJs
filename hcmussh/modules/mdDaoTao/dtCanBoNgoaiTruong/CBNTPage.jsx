import React from 'react';
import { AdminModal, AdminPage, renderDataTable, TableCell, FormTextBox, FormSelect, getValue, CirclePageButton, TableHead } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getDtCBNgoaiTruong, createDtCBNgoaiTruong, updateDtCBNgoaiTruong, deleteDtCBNgoaiTruong } from './redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmTrinhDoV2 } from 'modules/mdDanhMuc/dmTrinhDo/redux';
import { SelectAdapter_DmChucDanhKhoaHocV2 } from 'modules/mdDanhMuc/dmChucDanhKhoaHoc/redux';
import { SelectAdapter_DmNgachCdnnV2 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
class CBNgoaiTruongModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.ho.value('');
            this.ten.value('');
            this.shcc.value('');
            this.email.value('');
            this.phone.value('');
            this.ngach.value('');
            this.donVi.value('');
            this.hocVi.value('');
            this.hocHam.value('');
        });
    }

    onShow = (item) => {
        let { shcc, ho, ten, donVi, maHocVi, maHocHam, ngach, email, phone } = item ? item : { shcc: '', ho: '', ten: '', donVi: '', maHocVi: '', maHocHam: '', ngach: '', email: '', phone: '' };
        this.setState({ shcc: item ? item.shcc : false, email, isHasEmail: Number(!!email) });

        this.ho.value(ho);
        this.ten.value(ten);
        this.shcc.value(shcc);
        this.email.value(email);
        this.phone.value(phone);
        this.ngach.value(ngach);
        this.donVi.value(donVi);
        this.hocVi.value(maHocVi);
        this.hocHam.value(maHocHam);
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            ho: getValue(this.ho),
            ten: getValue(this.ten),
            phoneNumber: getValue(this.phone),
            email: getValue(this.email),
            donVi: getValue(this.donVi),
            ngach: getValue(this.ngach),
            trinhDo: getValue(this.hocVi),
            shcc: getValue(this.shcc),
            hocHam: getValue(this.hocHam),
        };
        if (data.email && !T.validateEmail(data.email)) {
            this.email.focus();
            T.notify('Email không hợp lệ', 'danger');
            return false;
        }
        if (this.state.shcc) {
            data.isHasEmail = this.state.isHasEmail;
            this.props.update(this.props.filter, this.state.shcc, data, this.hide);
        }
        else {
            this.props.create(this.props.filter, data, this.hide);
        }
    };
    render = () => {
        const { shcc, email } = this.state;
        return this.renderModal({
            title: shcc ? 'Chỉnh sửa thông tin cán bộ' : 'Thêm mới cán bộ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.ho = e} label='Họ' required />
                <FormTextBox className='col-md-4' ref={e => this.ten = e} label='Tên' required />
                <FormTextBox className='col-md-4' ref={e => this.shcc = e} label='Số Hiệu Cán Bộ' required readOnly={shcc} />
                <FormTextBox className='col-md-6' ref={e => this.phone = e} label='SDT' />
                <FormTextBox className='col-md-6' ref={e => this.email = e} label='Email' readOnly={email} />
                <FormSelect className='col-md-6' ref={e => this.donVi = e} label='Đơn vị' data={SelectAdapter_DmDonViFaculty_V2} />
                <FormSelect className='col-md-6' ref={e => this.hocVi = e} label='Trình độ' data={SelectAdapter_DmTrinhDoV2} required />
                <FormSelect className='col-md-6' ref={e => this.hocHam = e} label='Học hàm' data={SelectAdapter_DmChucDanhKhoaHocV2} />
                <FormSelect className='col-md-6' ref={e => this.ngach = e} label='Ngạch' data={SelectAdapter_DmNgachCdnnV2} required />
            </div>
        });
    }
}

class CBNTPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtCBNgoaiTruong();
        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa cán bộ', 'Bạn có chắc bạn muốn xóa cán bộ này?', true, isConfirm =>
            isConfirm && this.props.deleteDtCBNgoaiTruong(this.state.filter, item.shcc));
    }

    onKeySearch = (value) => {
        this.setState({ filter: { ...this.state.filter, [value.split(':')[0]]: value.split(':')[1] } }, () => {
            this.props.getDtCBNgoaiTruong(this.state.filter);
        });
    }

    render() {
        let list = this.props.dtCanBoNgoaiTruong?.items || null;

        const componentCBNgoaiTruong = renderDataTable({
            data: list == null ? null : list,
            emptyTable: 'Không có dữ liệu',
            header: 'thead-light',
            stickyHead: true,
            divStyle: { height: '70vh' },
            renderHead: () => (
                <tr>
                    <TableHead style={{ width: 'auto' }} content='#' />
                    <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Số hiệu cán bộ' keyCol='shcc' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Họ và tên' keyCol='hoTen' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Ngạch' keyCol='ngach' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Email' keyCol='email' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='SDT' keyCol='sdt' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Học vị' keyCol='hocVi' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto' }} content='Học hàm' keyCol='hocHam' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: '100%' }} content='Đơn vị' keyCol='donVi' onKeySearch={this.onKeySearch} />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</TableHead>
                </tr>
            ),
            renderRow: (item, index) => {
                const permission = this.getUserPermission('dtCanBoNgoaiTruong', ['read', 'write', 'delete']);
                return (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.shcc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                            <span>{`${item.ho} ${item.ten}`}<br /></span>
                        </>} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.email} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phone} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocVi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hocHam} />
                        <TableCell content={item.tenDonVi} />
                        <TableCell type='buttons' content={item} onEdit={() => this.modal.show(item)}
                            permission={permission} onDelete={e => this.delete(e, item)}
                        />
                    </tr>
                );
            }
        });

        return (<>
            <div>
                {componentCBNgoaiTruong}
                <CBNgoaiTruongModal ref={e => this.modal = e} filter={this.state.filter} create={this.props.createDtCBNgoaiTruong} update={this.props.updateDtCBNgoaiTruong} />
            </div>
            <CirclePageButton type='create' tooltip='Thêm cán bộ mới' onClick={() => this.modal.show()} />
            <CirclePageButton style={{ right: '70px' }} type='export' tooltip='Xuất dữ liệu' onClick={e => e.preventDefault() || T.handleDownload('/api/dt/can-bo-ngoai-truong/export')} />
        </>);
    }
}

const mapStateToProps = state => ({ system: state.system, dtCanBoNgoaiTruong: state.daoTao.dtCanBoNgoaiTruong });
const mapActionsToProps = { getDtCBNgoaiTruong, createDtCBNgoaiTruong, updateDtCBNgoaiTruong, deleteDtCBNgoaiTruong };
export default connect(mapStateToProps, mapActionsToProps)(CBNTPage);