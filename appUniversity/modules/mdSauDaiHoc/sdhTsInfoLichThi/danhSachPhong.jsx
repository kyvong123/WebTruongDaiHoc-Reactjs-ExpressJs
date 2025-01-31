import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, getValue } from 'view/component/AdminPage';
import { FormSelect, FormTextBox, FormDatePicker, TableHead, renderDataTable, FormCheckbox, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { createSdhTsInfoLichThi, getSdhDanhSachLichThiPage, updateSdhTsInfoLichThi, deleteSdhTsInfoLichThi, deleteSdhTsInfoLichThiMultiple, exportScanDanhSachDanPhong } from './redux';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_CanBoGiamThi } from 'modules/mdDaoTao/dtCanBoNgoaiTruong/redux';
import { SelectAdapter_DangThucThi } from 'modules/mdSauDaiHoc/sdhTsDangThucThi/redux';
import { getSdhDanhSachThemThiSinhTuyChonPage, sdhUpdateDstc, getSdhDsdxPage } from 'modules/mdSauDaiHoc/sdhTsInfoCaThiThiSinh/redux';
import { ProcessModal } from './processModal';
import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';
import { SelectAdapter_NganhByDot } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import { SelectAdapter_SdhLoaiMonThi } from 'modules/mdSauDaiHoc/sdhLoaiMonThi/redux';

class SdhPhongThiSinhModal extends AdminModal {
    defaultSortTerm = 'ten_ASC'
    state = { lichThi: null, maxNum: null, curNum: 0, listChosen: [], isKeySearch: false, isCoDinh: false, };
    componentDidMount() {
        this.onShown(() =>
            this.getPage(undefined, undefined, undefined, (page) =>
                this.setState({ listChosen: page.list.filter(i => i.idLichThi == this.state.item?.id) })
            )
        );
    }
    onShow = (item) => {
        item && this.setState({ item }, () => {
            this.ngayThi.value(item.ngayThi || '');
            this.thoiLuong.value(item.thoiLuong || '');
            this.dangThuc.value(item.dangThucThi || '');
            this.maGiamThiMot.value(item.maGiamThiMot || '');
        });
    }

    onXepTs = (e) => {
        e && e.preventDefault();
        this.hide();
        this.props.handleModalShow(this.state.item);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let condition = {
            idNganh: this.state.item?.idNganh || null,
            idLichThi: this.state.item?.id || null
        };
        let filter = { ...this.state.filter, ...condition, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDsdxPage(pageN, pageS, pageC, filter, this.state?.sortTerm || this.defaultSortTerm, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render = () => {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhDsTsCaThi && this.props.sdhDsTsCaThi.dsdxPage ? this.props.sdhDsTsCaThi.dsdxPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let { maxSize } = this.state.item ? this.state.item : { maxSize: 0 };
        const permission = this.props.permission;
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thí sinh',
            stickyHead: this.state.isCoDinh || list.length < 8,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list.sort((a, b) => a.ten < b.ten ? -1 : 1),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ho' content='Họ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maNganh' content='Mã ngành' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='phanHe' content='Phân hệ dự tuyển' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='hinhThuc' content='Hình thức dự tuyển' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='date' keyCol='ngaySinh' content='Ngày sinh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='select' keyCol='gioiTinh' content='Giới tính' data={SelectAdapter_DmGioiTinhV2} style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} />
                    <TableHead keyCol='ngheNghiep' content='Nghề nghiệp' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='donVi' content='Đơn vị' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='dienThoai' content='Điện thoại' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='email' content='Email' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soBaoDanh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maNganh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phanHe} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hinhThuc} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.parse(item.gioiTinh).vi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngheNghiep} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.donVi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.dienThoai} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.email} />
                </tr>
            )
        });
        return this.renderModal({
            title: 'Thông tin phòng và thí sinh',
            size: 'elarge',
            postButtons: <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={this.onXepTs} disabled={!permission.write}>
                <i className='fa fa-lg fa-arrow-right' /> Xếp thí sinh
            </button>,
            isShowSubmit: false,
            body:
                <>
                    <div className='tile'>
                        <h5>Thông tin phòng {this.state.item?.tenPhong}</h5>
                        <div className='row'>
                            <FormDatePicker type='time' ref={e => this.ngayThi = e} label='Thời gian thi' className='col-md-6' required readOnly />
                            <FormTextBox type='text' ref={e => this.thoiLuong = e} label='Thời lượng thi (phút)' className='col-md-6' required readOnly />
                            <FormSelect ref={e => this.dangThuc = e} label='Dạng thức thi' className='col-md-4' data={SelectAdapter_DangThucThi} readOnly />
                            <FormSelect ref={e => this.maGiamThiMot = e} label='Giám thị' className='col-md-4' data={SelectAdapter_CanBoGiamThi} readOnly />
                        </div>
                    </div>
                    <div className='tile'>
                        <h5>Danh sách thí sinh</h5>
                        <div style={{ marginBottom: '10px' }}>
                            Tìm thấy: {<b>{totalItem}</b>} Thí sinh
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            Đã sắp: {<b>{this.state.listChosen.length}</b>} Thí sinh
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            Có thể thêm: {<b>{maxSize - (this.state.listChosen.length)}</b>} Thí sinh
                        </div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div style={{ gap: 10 }} className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                            </div>
                        </div>
                        {table}

                    </div>
                </>
        });
    }
}
class SdhThemThiSinhTuyChonModal extends AdminModal {
    defaultSortTerm = 'ten_ASC'
    state = { lichThi: null, maxNum: null, curNum: 0, listChosen: [], isKeySearch: false, isCoDinh: false, };
    componentDidMount() {
        this.onShown(() =>
            this.getPage(undefined, undefined, undefined, (page) => {
                const list = page.list;
                const listChosen = list.filter(item => item.daXep == '1');
                this.setState({ listChosen });
            }
            )
        );
    }
    onShow = (item) => {
        item && this.setState({ item });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const { listChosen } = this.state;
        const { id, maxSize } = this.state.item;
        const { list } = this.props.sdhDsTsCaThi && this.props.sdhDsTsCaThi.dstcPage ? this.props.sdhDsTsCaThi.dstcPage : { list: [] };
        let curNum = listChosen.length;
        const changes = {
            add: list.filter(item => listChosen.map(item => item.id).includes(item.id)) || [],
            remove: list.filter(item => !listChosen.map(item => item.id).includes(item.id)) || []
        };
        if ((changes.add.length || changes.remove.length) && id != null && curNum <= maxSize) {
            this.props.update(id, changes, () => {
                this.setState({ listChosen: [] });
                this.props.getPage();
                this.hide();
            });
        } else if (curNum > maxSize) {
            T.confirm('Thêm thí sinh vào phòng thi', 'Số lượng thí sinh nhiều hơn sức chứa phòng được thiết lập, xác nhận tiếp tục?', true, isConfirm => isConfirm && this.props.update(id, changes, () => {
                this.setState({ listChosen: [] });
                this.props.getPage();
                this.hide();
            }));
        }
        else {
            T.notify('Lỗi lấy dữ liệu', 'danger');
        }
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }
    onChange = (value, item, maxSize) => {
        if (value) {
            if ([...this.state.listChosen, item].length > maxSize) return T.notify('Thí sinh vượt quá số lượng thí sinh tối đa', 'danger');
            this.setState({ listChosen: [...this.state.listChosen, item] });
        } else this.setState({ listChosen: this.state.listChosen.filter(i => i.id != item.id) });
    }
    getPage = (pageN, pageS, pageC, done) => {
        let condition = {
            idNganh: this.state.item?.idNganh || '',
            idLichThi: this.state.item?.id || '',
        };
        let filter = { ...this.state.filter, ...condition, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachThemThiSinhTuyChonPage(pageN, pageS, pageC, filter, this.state?.sortTerm || this.defaultSortTerm, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render = () => {
        const { permission } = this.props;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhDsTsCaThi && this.props.sdhDsTsCaThi.dstcPage ? this.props.sdhDsTsCaThi.dstcPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let { maxSize } = this.state.item ? this.state.item : { maxSize: 0 };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thí sinh',
            stickyHead: this.state.isCoDinh || list.length < 8,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list.sort((a, b) => a.ten < b.ten ? -1 : 1),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => {
                            if (value && list.length > maxSize) {
                                return T.notify('Thí sinh vượt quá số lượng thí sinh tối đa', 'danger');
                            }
                            return this.setState({ listChosen: value ? list.filter(item => item.daXep != '2') : [] });
                        }} checked={this.state.listChosen.length == list.length} />
                    </th>
                    <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ho' content='Họ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maNganh' content='Mã ngành' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='phanHe' content='Phân hệ dự tuyển' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='hinhThuc' content='Hình thức dự tuyển' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='date' keyCol='ngaySinh' content='Ngày sinh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='select' keyCol='gioiTinh' content='Giới tính' data={SelectAdapter_DmGioiTinhV2} style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} />
                    <TableHead keyCol='ngheNghiep' content='Nghề nghiệp' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='donVi' content='Đơn vị' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='dienThoai' content='Điện thoại' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='email' content='Email' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.listChosen.map(item => item.id).includes(item.id)} onChanged={(value) => this.onChange(value, item, maxSize)} permission={item.daXep == '2' ? { ...permission, write: false } : permission} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soBaoDanh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.maNganh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phanHe} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hinhThuc} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.parse(item.gioiTinh).vi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngheNghiep} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.donVi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.dienThoai} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.email} />
                </tr>
            )
        });
        return this.renderModal({
            title: 'Danh sách thí sinh',
            size: 'elarge',
            body:
                <div style={{ height: '75vh', overflow: 'auto' }}>
                    <div className='tile'>
                        <h5>Danh sách thí sinh</h5>
                        <div style={{ marginBottom: '10px' }}>
                            Tìm thấy: {<b>{totalItem}</b>} Thí sinh
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            Đã sắp: {<b>{this.state.listChosen.length}</b>} Thí sinh
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            Có thể thêm: {<b>{maxSize - (this.state.listChosen.length)}</b>} Thí sinh
                        </div>
                        <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                            <div className='title'>
                                <div style={{ gap: 10, display: 'inline-flex' }}>
                                    <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                    <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                                </div>
                            </div>
                            <div style={{ gap: 10 }} className='btn-group'>
                                <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                            </div>
                        </div>
                        {table}
                    </div>
                </div>
        });
    }
}
class ExportPhongThiModal extends AdminModal {
    componentDidMount() {
        // this.props.system.user.email
        T.socket.on('export-ds-dan-phong-sdh-ts-done', ({ buffer, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show(buffer);
            }
        });
        T.socket.on('export-ds-dan-phong-sdh-ts-error', ({ err, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                T.notify(err, 'danger');
            }
        });

    }
    componentWillUnmount() {
        T.socket.off('export-ds-dan-phong-sdh-ts-done');
        T.socket.off('export-ds-dan-phong-sdh-ts-error');
    }
    onShow = (dataExport) => {
        this.type?.value('');
        this.setState({ dataExport });
    }
    onSubmit = () => {
        const { type } = this.state;
        const data = { ...this.state.dataExport, type };
        this.props.exportPdf(data, () => {
            this.hide();
            this.props.processModal.show();
        });

    }


    render = () => {
        return this.renderModal({
            title: 'Xuất danh sách phòng thi',
            size: 'large',
            isShowSubmit: this.state.type,
            submitText: 'In danh sách phòng thi',
            body: <div className='row' >
                <FormSelect className='col-md-4' ref={e => this.type = e} data={[{ id: 'danPhong', text: 'In danh sách dán phòng' }, { id: 'kyTen', text: 'In danh sách ký tên' }]} label='Loại danh sách phòng thi' required onChange={value => this.setState({ type: value.id })} />
            </div>
        });
    }

}
class DanhSachLichThiPage extends AdminPage {
    defaultSortTerm = 'id_DESC'
    state = { maPhanHe: '', filter: {}, sortTerm: 'id_DESC', listChosen: [], checked: false, isKeySearch: false, isFixCol: false, isCoDinh: false, process: '0%' };
    componentDidMount() {
        this.isCoDinh.value(this.state.isCoDinh);
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            this.getPage(undefined, undefined, '');
            T.socket.on('export-ds-dan-phong-sdh-ts-one', ({ process, requester }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ process });
                }
            });
        });
    }
    componentWillUnmount() {
        T.socket.off('export-ds-dan-phong-sdh-ts-one');
    }
    callBackParent() {
        if (this.state.listChosen && this.state.listChosen.length) {
            this.props.updateState(false, this.state.listChosen);
        } else this.props.updateState(true, this.state.listChosen);
    }
    handleModalShow = (item) => {
        this.tuyChinhModal.show(item);
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }
    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachLichThiPage(pageN, pageS, pageC, filter, done);
    }
    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    render() {
        const permission = this.props.permission;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhTsLichThi && this.props.sdhTsLichThi.page ?
            this.props.sdhTsLichThi.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const listChosen = this.state.listChosen;
        const dataExport = { listPhong: listChosen.map(i => i.id), idDot: this.props.idDot };
        const user = this.props.system.user.email;
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            stickyHead: this.state.isCoDinh || list.length < 8,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => this.setState({ listChosen: value ? list : [] })} />
                    </th>
                    <TableHead keyCol='tenCumPhong' content='Tên cụm phòng thi' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='phong' content='Phòng thi' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='coSo' content='Cơ sở' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_NganhByDot(this.props.idDot)} keyCol='nganh' style={{ width: '30%', textAlign: 'center' }} content='Ngành dự tuyển'
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead typeSearch='admin-select' data={SelectAdapter_SdhLoaiMonThi} keyCol='monThi' content='Môn thi' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch} onSort={onSort} />

                    <TableHead keyCol='ngayThi' typeSearch='date' content='Ngày thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onSort={onSort}
                        onKeySearch={onKeySearch}
                    />
                    <TableHead keyCol='thoiLuong' content='Thời lượng' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                    />
                    <TableHead keyCol='maxSize' content='Thí sinh tối đa' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                    />
                    <TableHead keyCol='dangThucThi' content='Dạng thức thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='giamThiMot' content='Giám thị' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}
                        onKeySearch={onKeySearch}
                        onSort={onSort}
                    />
                    <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.map(item => item.id).includes(item.id)} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.id != item.id) }, () => this.checkAll.value(this.state.listChosen.length == list.length))} permission={permission} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.tenCumPhong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tenPhong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.coSo} />
                    <TableCell type='text' style={{ textAlign: 'center', minWidth: '120px' }} content={item.tenNganh} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.loaiMonThi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.ngayThi} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.thoiLuong} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.daSap ? item.daSap : 0} / ${item.maxSize}`} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.dangThucThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.giamThiMot} />
                    <TableCell type='buttons' permission={permission} content={item} onDelete={e => e.preventDefault() || T.confirm('Xoá phòng thi', 'Bạn có chắc chắn muốn xóa phòng thi, xác nhận tiếp tục?', true, isConfirm => isConfirm && this.props.deleteSdhTsInfoLichThi(item.id, this.props.idDot))} >
                        <button className='btn btn-primary' title='Xem danh sách thí sinh' onClick={(e) => e.preventDefault() || this.thongTinModal.show(item)}>
                            <i className='fa fa-lg fa-eye' />
                        </button>
                        {
                            permission.write ? <button className='btn btn-primary' title='Chỉnh sửa' onClick={(e) => e.preventDefault() || this.SdhTuyenSinhCaThiModal.show(item)}>
                                <i className='fa fa-lg fa-edit' />
                            </button> : ''
                        }
                    </TableCell>
                </tr>
            )
        });
        return <>
            <div className='tile'>
                <PreviewPdf ref={e => this.previewPdf = e} />
                <SdhTuyenSinhCaThiModal ref={e => this.SdhTuyenSinhCaThiModal = e} idDot={this.props.idDot} create={this.props.createSdhTsInfoLichThi} update={this.props.updateSdhTsInfoLichThi} permission={permission} />
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                <ExportPhongThiModal previewPdf={this.previewPdf} ref={e => this.exportPdfModal = e} exportPdf={this.props.exportScanDanhSachDanPhong} processModal={this.processModal} user={user} />
                <div style={{ marginBottom: '10px' }}>
                    Kết quả: {<b>{totalItem}</b>} phòng thi
                </div>
                <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                    <div className='title'>
                        <div style={{ gap: 10, display: 'inline-flex' }}>
                            <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                        </div>
                        <div style={{ gap: 10, display: this.state.listChosen.length ? 'flex' : 'none' }}>
                            <Tooltip title={`Xoá ${this.state.listChosen.length} phòng thi`} arrow>
                                <button className='btn btn-danger' type='button' onClick={() => T.confirm('Xoá phòng thi', 'Bạn có chắc chắn muốn xóa phòng thi, xác nhận tiếp tục?', true, isConfirm => isConfirm && this.props.deleteSdhTsInfoLichThiMultiple(this.state.listChosen?.map(i => i.id), this.props.idDot, () => this.setState({ listChosen: [] })))}>
                                    <i className='fa fa-sm fa-trash' />
                                </button>
                            </Tooltip>
                            <Tooltip title='In danh sách ký tên' arrow>
                                <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.exportPdfModal.show(dataExport)}>
                                    <i className='fa fa-sm fa-print' />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                    <div style={{ gap: 10 }} className='btn-group'>
                        <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                            getPage={this.getPage} />
                    </div>
                </div>
                {table}
                <SdhPhongThiSinhModal ref={e => this.thongTinModal = e} sdhDsTsCaThi={this.props.sdhDsTsCaThi} getSdhDsdxPage={this.props.getSdhDsdxPage} idDot={this.props.idDot} getPage={this.getPage} handleModalShow={this.handleModalShow} permission={permission} />
                <SdhThemThiSinhTuyChonModal ref={e => this.tuyChinhModal = e} sdhDsTsCaThi={this.props.sdhDsTsCaThi} getSdhDanhSachThemThiSinhTuyChonPage={this.props.getSdhDanhSachThemThiSinhTuyChonPage} idDot={this.props.idDot} update={this.props.sdhUpdateDstc} getPage={this.getPage} permission={this.props.permission} />
            </div>
        </>;
    }
}

class SdhTuyenSinhCaThiModal extends AdminModal {
    state = { nganh: [] };
    componentDidMount() {
        this.onHidden(this.onHide);
    }
    onHide = () => {
        this.setState({ id: null });
    }
    onShow = (item) => {
        const { idNganh, ngayThi, thoiLuong, giamThiMot, dangThucThi, maxSize: siSo } = item ? item : { idNganh: [], ngayThi: '', thoiLuong: '', giamThiMot: '', dangThucThi: '', maxSize: '' };
        // this.nganh.value(idNganh.split(','));
        this.ngayThi.value(ngayThi);
        this.thoiLuong.value(thoiLuong);
        this.maGiamThiMot.value(giamThiMot);
        this.siSo.value(siSo);

        this.dangThuc.value(dangThucThi);
        item && item.id ? this.setState({ id: item.id, nganh: idNganh ? idNganh.split(',') : [] }) : null;
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        let data = {
            ngayThi: getValue(this.ngayThi).getTime(),
            thoiLuong: getValue(this.thoiLuong),
            idNganh: this.state.idSelectedNganh,
            dangThucThi: getValue(this.dangThuc),
            siSo: getValue(this.siSo),
            maGiamThiMot: getValue(this.maGiamThiMot),
            kichHoat: '1'
        };
        this.state.id ? this.props.update(this.state.id, data, this.props.idDot) : this.props.create(data, this.props.idDot);
        this.hide();
    }
    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: this.state.id ? 'Chỉnh sửa thông tin lịch thi tuyển sinh' : 'Thêm lịch thi tuyển sinh',
            size: 'large',
            body: <div className='row'>
                <FormDatePicker type='time' ref={e => this.ngayThi = e} label='Thời gian thi' className='col-md-6' required readOnly={!permission.write} />
                <FormTextBox type='text' ref={e => this.thoiLuong = e} label='Thời lượng thi (phút)' className='col-md-3' readOnly={!permission.write} />
                <FormTextBox type='number' ref={e => this.siSo = e} label='Số lượng tối đa' className='col-md-3' readOnly={!permission.write} />

                <FormSelect ref={e => this.dangThuc = e} label='Dạng thức thi' className='col-md-6' readOnly={!permission.write} data={SelectAdapter_DangThucThi} />
                <FormSelect ref={e => this.maGiamThiMot = e} label='Giám thị' className='col-md-6' readOnly={!permission.write} data={SelectAdapter_CanBoGiamThi} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsLichThi: state.sdh.sdhTsLichThi, sdhDsTsCaThi: state.sdh.sdhDsTsCaThi });
const mapActionsToProps = {
    createSdhTsInfoLichThi, getSdhDanhSachLichThiPage, updateSdhTsInfoLichThi, deleteSdhTsInfoLichThi, deleteSdhTsInfoLichThiMultiple, getSdhDanhSachThemThiSinhTuyChonPage, sdhUpdateDstc, getSdhDsdxPage, exportScanDanhSachDanPhong
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DanhSachLichThiPage);
