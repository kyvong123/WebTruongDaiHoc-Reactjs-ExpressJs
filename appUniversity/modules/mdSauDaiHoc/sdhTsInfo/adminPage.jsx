import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, FormTextBox, getValue, renderTable, TableCell, AdminPage } from 'view/component/AdminPage';
import { getSdhKyThiTsAll, createSdhKyThiTs, updateSdhKyThiTs, deleteSdhKyThiTs } from 'modules/mdSauDaiHoc/sdhTsInfo/redux';
import InputMask from 'react-input-mask';
import T from 'view/js/common.js';
import { Tooltip } from '@mui/material';
class SdhKyThiTuyenSinhModal extends AdminModal {
    state = {};
    onShow = (item) => {
        let { ma, ten, namTuyenSinh } = item ? item : { ma: '', ten: '', namTuyenSinh: '' };
        this.ma.setInputValue(ma?.toUpperCase());
        this.nam.value(namTuyenSinh);
        this.ten.value(ten);
        this.setState({ ma: item ? item.ma : null });
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        let data = {
            ma: this.ma?.value?.toUpperCase(),
            namTuyenSinh: getValue(this.nam),
            ten: getValue(this.ten)
        }, { listMa } = this.props;
        if (!data.ma || data.ma.length < 'TSxy'.length) {
            T.notify('Vui lòng nhập đúng format, vd: TS23, TS24', 'danger');
        } else if (listMa.length && listMa.filter(item => item != this.state.ma).includes(data.ma)) {
            T.notify('Mã kỳ đã tồn tại!', 'danger');
        } else if (this.state.ma) {
            this.props.update(this.state.ma, data, this.hide);
        } else {
            this.props.create(data, this.hide);
        }
    }
    render = () => {
        const permission = this.props.permission;
        const readOnly = !permission?.write;
        return this.renderModal({
            title: this.state.ma ? 'Chỉnh sửa kỳ tuyển sinh' : 'Thêm kỳ tuyển sinh mới',
            size: 'large',
            body: <div className='row'>
                <div className={'form-group col-md-6'}>
                    <><label onClick={() => this.ma.focus()}>{'Mã kỳ'}{!readOnly ?
                        <span style={{ color: 'red' }}> *</span> : ''}</label></>
                    <InputMask ref={e => this.ma = e} className='form-control' mask={'TSxy'} style={{ display: readOnly ? 'none' : '' }}
                        formatChars={{ 'T': 'T', 'S': 'S', 'x': '[1-3]', 'y': '[0-9]' }} readOnly={readOnly}
                        placeholder={'TSxy'} />

                </div>
                <FormTextBox type='year' ref={e => this.nam = e} label='Năm' className='col-md-6' readOnly={readOnly} required />
                <FormTextBox type='text' ref={e => this.ten = e} label='Tên' className='col-md-12' readOnly={readOnly} required />
            </div>
        });
    }
}
class SdhKyThiTuyenSinh extends AdminPage {
    state = { kyThi: [], selectedPH: [], existNganh: false, edit: false, maKyThi: '', step: '0', kyThiHienTai: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getSdhKyThiTsAll(items => this.setState({ kyThi: items }));

        });
    }
    delete = (item) => {
        T.confirm('Xóa kỳ tuyển sinh', `Bạn có chắc bạn muốn xóa kỳ tuyển sinh ${item.ten} không?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhKyThiTs(item.ma);
        });
    }
    handleActive = (ma, value) => {
        this.props.updateSdhKyThiTs(ma, { kichHoat: value });
    }
    render() {
        let list = this.props.sdhKyThiTs ? this.props.sdhKyThiTs.items : [];
        const permission = this.getUserPermission('sdhTsInfo', ['manage', 'write']);
        let table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Chưa có dữ liệu kỳ tuyển sinh',
            header: 'thead-light',
            stickyHead: false,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Mã </th>
                <th style={{ width: '10%', textAlign: 'center' }}>Năm</th>
                <th style={{ width: '70%', textAlign: 'center' }}>Tên </th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
            </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                        <TableCell content={item.ma} style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={item.namTuyenSinh} style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell content={item.ten} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                            <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.SdhKyThiTuyenSinhModal.show(item)}>
                                    <i className='fa fa-lg fa-pencil-square-o' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Xóa kỳ tuyển sinh' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.delete(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            }
        });
        return this.renderPage(
            {
                icon: 'fa fa-calendar',
                title: 'Kỳ tuyển sinh',
                breadcrumb: [
                    <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                    <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                    'Kỳ'
                ],
                content: <>
                    <div className='tile'>
                        <div className='tile-body'>
                            {table}
                            <SdhKyThiTuyenSinhModal ref={e => this.SdhKyThiTuyenSinhModal = e} listMa={list.map(item => item.ma)} create={this.props.createSdhKyThiTs} update={this.props.updateSdhKyThiTs} permission={permission} />
                        </div>
                    </div>
                </>,
                onCreate: e => e.preventDefault() || this.SdhKyThiTuyenSinhModal.show(),
                backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhKyThiTs: state.sdh.sdhKyThiTs });
const mapActionsToProps = { getSdhKyThiTsAll, createSdhKyThiTs, updateSdhKyThiTs, deleteSdhKyThiTs };
export default connect(mapStateToProps, mapActionsToProps)(SdhKyThiTuyenSinh);