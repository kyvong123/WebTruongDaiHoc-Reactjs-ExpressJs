import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FileBox from 'view/component/FileBox';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import {
    createMultiQtKhenThuongAll
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmKhenThuongKyHieuV2 } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { SelectAdapter_DmKhenThuongChuThichV2 } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { getDmKhenThuongLoaiDoiTuongAll } from 'modules/mdDanhMuc/dmKhenThuongLoaiDoiTuong/redux';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = { id: '', doiTuong: '' };
    componentDidMount() {
        this.props.getLoaiDoiTuong(items => {
            if (items) {
                this.loaiDoiTuongTable = [];
                items.forEach(item => this.loaiDoiTuongTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { loaiDoiTuong, ma, namDatDuoc, thanhTich, chuThich, diemThiDua, soQuyetDinh } = item ? item.item : {
            loaiDoiTuong: '', ma: '', namDatDuoc: '', thanhTich: '', chuThich: '', diemThiDua: '', soQuyetDinh: ''
        }, index = item.index;

        this.setState({ doiTuong: loaiDoiTuong, index });

        setTimeout(() => {
            this.loaiDoiTuong.value(loaiDoiTuong || '');
            if (loaiDoiTuong == '02') this.maCanBo.value(ma ? ma : this.props.ma);
            else if (loaiDoiTuong == '03') this.maDonVi.value(ma ? ma : this.props.ma);

            this.namDatDuoc.value(namDatDuoc || '');
            this.danhHieu.value(thanhTich || '');
            this.chuThich.value(chuThich || '');
            this.diemThiDua.value(diemThiDua);
            this.soQuyetDinh.value(soQuyetDinh || '');
        }, 100);
    };

    onSubmit = (e) => {
        e.preventDefault();
        let ma = '-1';
        if (this.loaiDoiTuong.value() == '02') ma = this.maCanBo.value();
        if (this.loaiDoiTuong.value() == '03') ma = this.maDonVi.value();
        if (this.loaiDoiTuong.value() == '04') ma = this.maBoMon.value();

        const changes = {
            tenThanhTich: this.thanhTich.data().text,
            tenChuThich: this.chuThich.data().text,
            loaiDoiTuong: this.loaiDoiTuong.value(),
            ma: ma,
            namDatDuoc: this.namDatDuoc.value(),
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
            diemThiDua: this.diemThiDua.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
        };
        if (!this.loaiDoiTuong.value()) {
            T.notify('Loại đối tượng trống', 'danger');
            this.loaiDoiTuong.focus();
        } else if (!ma) {
            T.notify('Danh sách mã số trống', 'danger');
            if (this.loaiDoiTuong.value() == '02') this.maCanBo.focus();
            if (this.loaiDoiTuong.value() == '03') this.maDonVi.focus();
            if (this.loaiDoiTuong.value() == '04') this.maBoMon.focus();
        } else if (!this.thanhTich.value()) {
            T.notify('Thành tích trống', 'danger');
            this.thanhTich.focus();
        } else this.props.update(this.state.index, changes, this.hide);
    }

    onChangeDT = (value) => {
        this.setState({ doiTuong: value });
    }
    render = () => {
        const doiTuong = this.state.doiTuong;
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiDoiTuong = e} label='Loại đối tượng' data={this.loaiDoiTuongTable} readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo}
                    style={doiTuong == '02' ? {} : { display: 'none' }}
                    readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi}
                    style={doiTuong == '03' ? {} : { display: 'none' }}
                    readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maBoMon = e} label='Bộ môn' data={SelectAdapter_DmBoMon} style={doiTuong == '04' ? {} : { display: 'none' }} readOnly={true} />

                <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.thanhTich = e} label='Thành tích' data={SelectAdapter_DmKhenThuongKyHieuV2} readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={SelectAdapter_DmKhenThuongChuThichV2} readOnly={readOnly} />
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={readOnly} />

            </div>
        });
    }
}

class QtKhenThuongAllImportPage extends AdminPage {
    state = { qtKhenThuongAll: [], message: '', isDisplay: true, displayState: 'import' };

    componentDidMount() {
        T.ready('/user/tccb');
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.items) {
            this.setState({
                qtKhenThuongAll: response.items,
                message: `${response.items.length} hàng được tải lên thành công`,
                isDisplay: false,
                displayState: 'data'
            }, () => T.notify(this.state.message, 'success'));
        }
    };
    showEdit = (e, index, item) => {
        e.preventDefault();
        this.modal.show({ index, item });
    };

    update = (index, changes, done) => {
        const qtKhenThuongAll = this.state.qtKhenThuongAll, currentValue = qtKhenThuongAll[index];
        const updateValue = Object.assign({}, currentValue, changes);
        qtKhenThuongAll.splice(index, 1, updateValue);
        this.setState({ qtKhenThuongAll }
            , () => T.notify('Cập nhật dữ liệu thành công', 'success'));
        done && done();
    };

    delete = (e, index) => {
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa dữ liệu khen thưởng này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const qtKhenThuongAll = this.state.qtKhenThuongAll;
                qtKhenThuongAll.splice(index, 1);
                this.setState({ qtKhenThuongAll },
                    () => T.notify('Xóa dữ liệu thành công', 'success'));
            }
        });
    };

    save = (e) => {
        const doSave = () => {
            const data = this.state.qtKhenThuongAll;
            this.props.createMultiQtKhenThuongAll(data, (error, data) => {
                if (error) T.notify('Cập nhật dữ liệu bị lỗi!', 'danger');
                else {
                    this.setState({ displayState: 'import', qtKhenThuongAll: [] });
                    T.notify(`Cập nhật ${data && data.items ? data.items.length + ' ' : ''} khen thưởng thành công!`, 'success');
                    this.props.history.push('/user/tccb/qua-trinh/khen-thuong-all');
                }
            });
        };
        e.preventDefault();
        T.confirm('Cập nhật dữ liệu', 'Bạn có muốn thêm những khen thưởng này không?', 'warning', true, isConfirm => {
            isConfirm && doSave();
        });
    };

    showUpload = (e) => {
        e.preventDefault();
        this.setState({ isDisplay: true });
    }

    render() {
        const { qtKhenThuongAll, displayState } = this.state,
            permission = this.getUserPermission('qtKhenThuongAll', ['read', 'write', 'delete']);
        let table = 'Không có dữ liệu!';
        if (qtKhenThuongAll && qtKhenThuongAll.length > 0) {
            table = renderTable({
                getDataSource: () => qtKhenThuongAll, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại đối tượng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cá nhân</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tập thể</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thành tích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chú thích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.loaiDoiTuong.ten} />
                        <TableCell type='text' onClick={() => this.modal.show({ index, item })} style={{ whiteSpace: 'nowrap' }} content={(
                            item.loaiDoiTuong.ma == '02' ?
                                <>
                                    <span>{`${item.canBo?.ho || ''} ${item.canBo?.ten || ''}`.normalizedName()}</span><br />
                                    {item.maCanBo}
                                </> : null
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            item.loaiDoiTuong.ma == '01' ? 'Trường Đại học Khoa học Xã hội và Nhân Văn, TP. HCM'
                                : item.loaiDoiTuong.ma == '02' ? item.tenDonViCanBo
                                    : item.loaiDoiTuong.ma == '03' ? item.donViItem.ten
                                        : item.tenDonViBoMon
                        )} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(item.namDatDuoc)} />
                        <TableCell type='text' content={(item.thanhTichItem.ten)} />
                        <TableCell type='text' content={(item.chuThich)} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(item.soQuyetDinh || '')} />
                        <TableCell type='text' style={{ textAlign: 'right' }} content={item.diemThiDua} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            // onEdit={() => this.modal.show({ index, item })} 
                            onDelete={(e) => this.delete(e, index)} />
                    </tr>)
            });
        }

        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Import Khen thưởng',
            breadcrumb: [<Link key={0} to='/user/tccb/qua-trinh/khen-thuong-all'>Quá trình khen thưởng</Link>, 'Import'],
            content: <>
                <div className='tile rows' style={{ textAlign: 'right', display: displayState == 'import' ? 'block' : 'none' }}>
                    <FileBox postUrl='/user/upload' uploadType='KhenThuongAllDataFile' userData={'KhenThuongAllDataFile'}
                        accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                        style={{ width: '80%', margin: '0 auto' }}
                        ajax={true} success={this.onSuccess} />
                    <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/tccb/qua-trinh/khen-thuong-all/download-template')}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                    </button>
                </div>

                <div className='tile' style={{ display: displayState == 'import' ? 'none' : 'block' }}>{table}</div>
                <EditModal ref={e => this.modal = e} permission={permission} readOnly={!permission.write} update={this.update} getLoaiDoiTuong={this.props.getDmKhenThuongLoaiDoiTuongAll} />
            </>,
            onSave: displayState == 'data' ? (e) => this.save(e) : null,
            // onExport: displayState == 'import' ? () => T.download('/api/tccb/qua-trinh/khen-thuong-all/download-template') : null,
            backRoute: '/user/tccb/qua-trinh/khen-thuong-all',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {
    getDmKhenThuongLoaiDoiTuongAll, createMultiQtKhenThuongAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongAllImportPage);