import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderDataTable, AdminModal, getValue, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import T from '../../../../../view/js/common';
import { SelectAdapter_CanBoDonVi, getDmChuDeDonVi, createDmChuDeDonVi } from '../../redux/qa/redux';
import { updateDmChuDeDonVi } from '../../redux/qa/redux';

class CreateModal extends AdminModal {
    onShow = () => {
        let { ten, doiTuong, thoiGianXuLy, kichHoat } = { id: '', ten: '', doiTuong: '', thoiGianXuLy: '', kichHoat: true };
        this.ten.value(ten);
        this.doiTuong.value(doiTuong.split(','));
        this.thoiGianXuLy.value(thoiGianXuLy / 3600000);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const data = {
                ten: getValue(this.ten),
                doiTuong: getValue(this.doiTuong).join(','),
                maDonVi: this.props.maDonVi,
                tenDonVi: this.props.tenDonVi,
                thoiGianXuLy: Number(getValue(this.thoiGianXuLy)),
                kichHoat: Number(getValue(this.kichHoat))
            };

            this.props.create(data, this.hide);
        } catch (error) {
            console.log('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: `Tạo mới chủ đề cho đơn vị ${this.props.tenDonVi}`,
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên chủ đề' readOnly={readOnly} placeholder='Tên chủ đề' required />
                <FormSelect className='col-12' ref={e => this.doiTuong = e} data={[
                    { id: '1', text: 'Cán bộ' },
                    { id: '2', text: 'Sinh viên' },
                ]} label='Đối tượng' multiple required />
                <FormTextBox type='number' className='col-12' ref={e => this.thoiGianXuLy = e} label='Thời gian xử lý (giờ)' readOnly={readOnly} placeholder='Thời gian xử lý (giờ)' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
            </div>
        });
    }
}

class EditCanBoListModal extends AdminModal {
    onShow = (item) => {
        let { id, ten, doiTuong, thoiGianXuLy, kichHoat, emailCanBoList } = item ? item : { id: '', ten: '', doiTuong: '', thoiGianXuLy: '', kichHoat: true, emailCanBoList: [] };
        this.setState({ id });
        this.ten.value(ten);
        this.doiTuong.value(doiTuong.split(','));
        this.thoiGianXuLy.value(thoiGianXuLy / 3600000);
        this.kichHoat.value(kichHoat);
        this.canBoPhuTrach.value(emailCanBoList ? emailCanBoList.split(',') : []);
    };

    onSubmit = (e) => {
        e.preventDefault();
        try {
            const changes = {
                doiTuong: getValue(this.doiTuong).join(','),
                thoiGianXuLy: Number(getValue(this.thoiGianXuLy)),
                kichHoat: Number(getValue(this.kichHoat)),
                canBoPhuTrach: getValue(this.canBoPhuTrach).toString()
            };

            this.props.update(this.state.id, changes, () => {
                this.hide();
            });
        } catch (error) {
            console.log('error', error);
            error.props && T.notify(`${error.props.label || 'Dữ liệu'} bị trống!`, 'danger');
        }
    };

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật danh sách cán bộ phụ trách chủ đề',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên chủ đề' readOnly={true} placeholder='Tên chủ đề' required />
                <FormSelect readOnly={readOnly} className='col-12' ref={e => this.doiTuong = e} data={[
                    { id: '1', text: 'Cán bộ' },
                    { id: '2', text: 'Sinh viên' },
                ]} label='Đối tượng' multiple required />
                <FormTextBox type='number' className='col-12' ref={e => this.thoiGianXuLy = e} label='Thời gian xử lý (giờ)' readOnly={readOnly} placeholder='Thời gian xử lý (giờ)' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }}
                    onChange={value => this.changeKichHoat(value)} required />
                <FormSelect className='col-12' multiple={true} ref={e => this.canBoPhuTrach = e} label='Cán bộ phụ trách' data={SelectAdapter_CanBoDonVi(this.props.maDonVi)} />
            </div>
        });
    }
}

class FwQuestionAnswerAssignChuDePage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tt/lien-he/assign-chu-de', () => {
            // T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            // T.showSearchBox();

            const user = this.props.system && this.props.system.user;
            const { maDonVi, isStaff } = user ? user : {};
            if (isStaff == 1 && maDonVi != null) {
                this.props.getDmChuDeDonVi();
            } else {
                T.notify('Bạn không phải cán bộ hoặc không thuộc một đơn vị nào!', 'danger');
            }
        });
    }

    showModal = (e) => {
        e.preventDefault();
    }

    mapDoiTuong = (item) => {
        let listDoiTuong = '';
        if (item.includes('0')) listDoiTuong = listDoiTuong + 'Khách';
        if (item.includes('1')) listDoiTuong = listDoiTuong + (item.includes('0') ? ', Cán bộ ' : 'Cán bộ');
        if (item.includes('2')) listDoiTuong = listDoiTuong + (item.includes('0') || item.includes('1') ? ', Sinh viên ' : 'Sinh viên');
        return listDoiTuong;
    }

    milisToDays = (milis) => {
        return Number(milis) / 3600000;
    }

    render() {
        const user = this.props.system && this.props.system.user;
        const { tenDonVi, maDonVi } = user;

        const { list } = this.props.fwQuestionAnswer && this.props.fwQuestionAnswer.dmChuDeDonViPage ?
            this.props.fwQuestionAnswer.dmChuDeDonViPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };

        const table = renderDataTable({
            data: list,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên chủ đề</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Đối tượng liên hệ</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Đơn vị phụ trách</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số giờ chờ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='text' content={this.mapDoiTuong(item.doiTuong)} />
                    <TableCell type='text' content={item.tenDonVi} />
                    <TableCell type='text' content={this.milisToDays(item.thoiGianXuLy)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={{ write: true }} onChanged={(value) => T.confirm(value ? 'Hiện chủ đề?' : 'Ẩn chủ đề?', value ? 'Bạn có chắc muốn cho phép người dùng tạo hộp thư với chủ đề này?' : 'Bạn có chắc bạn muốn ẩn chủ đề này?', 'warning', true, (isConfirm) => { isConfirm && this.props.updateDmChuDeDonVi(item.id, { kichHoat: value ? 1 : 0 }); })} />
                    <TableCell type='buttons'>
                        {<Tooltip title='Chỉnh sửa danh sách cán bộ phụ trách' arrow>
                            <button className='btn btn-secondary' onClick={() => {
                                this.setState({ currentDmChuDeId: item.id }, () => this.editCanBoList.show(item, maDonVi));
                            }}>
                                <i className='fa fa-lg fa-user-plus' />
                            </button>
                        </Tooltip>}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Phân quyền trả lời Q&A theo Chủ đề',
            breadcrumb: [
                <Link key={0} to='/user/tt/lien-he'> Liên hệ</Link>,
                'Phân quyền trả lời Q&A theo Chủ đề'
            ],
            content: <div className='tile'>
                <h3>Phân quyền trả lời Q&A theo Chủ đề cho đơn vị: {tenDonVi}</h3>
                {table}
                <CreateModal ref={e => this.createChuDe = e} maDonVi={maDonVi} tenDonVi={tenDonVi} create={this.props.createDmChuDeDonVi} />
                <EditCanBoListModal maDonVi={maDonVi} getDmChuDeDonVi={this.props.getDmChuDeDonVi} readOnly={false} ref={e => this.editCanBoList = e} update={this.props.updateDmChuDeDonVi} />
            </div>,
            backRoute: '/user/tt/lien-he',
            onCreate: () => this.createChuDe.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwQuestionAnswer: state.lienHe.fwQuestionAnswer });
const mapActionsToProps = { getDmChuDeDonVi, updateDmChuDeDonVi, createDmChuDeDonVi };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerAssignChuDePage);