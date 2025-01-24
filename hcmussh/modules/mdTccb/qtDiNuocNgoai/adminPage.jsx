import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, renderDataTable, TableHead, TableCell, FormCheckbox, renderTable, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, FormFileBox } from 'view/component/AdminPage';
import { getQtDiNuocNgoaiPage, deleteQtDiNuocNgoai, updateQtDiNuocNgoai, getThongKeMucDich, createMultipleQtDiNuocNgoai, deleteFile, getQtDiNuocNgoaiGroupPage } from './redux';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';
import { SelectAdapter_DmTiepNhanVeNuocV2 } from 'modules/mdDanhMuc/dmTiepNhanVeNuoc/redux';
import { SelectAdapter_SoDangKyAlternative } from 'modules/mdHanhChinhTongHop/hcthSoDangKy/redux/soDangKy';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};
export class EditModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
        tiepNhan: false,
        daTiepNhan: false,
        baoCaoTinhTrang: 0,
        listFile: [],
        noNeedTiepNhan: false,
        shcc: '',
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoNgayNop, baoCaoTinhTrang, baoCaoLyDoTraVe }


    onChangeSoQuyetDinh = (value) => {
        value && this.setState({ idVanBan: value.idVanBan });
    }

    onShow = (item) => {
        let { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoTinhTrang, baoCaoLyDoTraVe, idVanBan, idSoVanBan } = item ? item : {
            id: '', shcc: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null, soQdTiepNhan: '', ngayQdTiepNhan: null, noiDungTiepNhan: '', ngayVeNuoc: null, baoCaoTen: '[]', baoCaoTinhTrang: 0, baoCaoLyDoTraVe: '',
        };
        let listFile = T.parse(baoCaoTen, []);

        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe,
            tiepNhan: soQdTiepNhan ? true : false,
            daTiepNhan: soQdTiepNhan ? true : false,
            baoCaoTinhTrang,
            listFile, idVanBan, idSoVanBan,
            noNeedTiepNhan: ngayDi && ngayVe ? (T.dayDiff(new Date(ngayDi), new Date(ngayVe)) < 30 ? true : false) : false,
            shcc,
        }, () => {
            this.shcc.value(shcc);
            if (quocGia) {
                quocGia = quocGia.split(',');
                this.quocGia.value(quocGia);
            } else this.quocGia.value('');
            this.mucDich.value(mucDich);
            this.noiDung.value(noiDung || '');
            this.chiPhi.value(chiPhi || '');
            this.ghiChu.value(ghiChu || '');
            this.soQuyetDinh?.value(soQuyetDinh || '');
            this.idSoVanBan?.value(idSoVanBan || '', (item) => {
                this.setState({ idVanBan: item.idVanBan });
            });
            this.ngayQuyetDinh.value(ngayQuyetDinh || '');

            this.ngayDiType.setText({ text: ngayDiType ? ngayDiType : 'dd/mm/yyyy' });
            this.ngayDi.setVal(ngayDi || '');
            this.ngayVeType.setText({ text: ngayVeType ? ngayVeType : 'dd/mm/yyyy' });
            this.ngayVe.setVal(ngayVe || '');
            if (this.state.tiepNhan || this.state.noNeedTiepNhan) {
                this.tiepNhanCheck.value(true);
                if (this.state.noNeedTiepNhan) $('#tiepNhan').hide();
                else $('#tiepNhan').show();
            } else {
                $('#tiepNhan').hide();
                this.tiepNhanCheck.value(false);
            }
            if (baoCaoTinhTrang == 2) {
                this.baoCaoCheck.value(true);
                $('#baoCaoText').show();
            } else {
                this.baoCaoCheck.value(false);
                $('#baoCaoText').hide();
            }
            this.soQdTiepNhan.value(soQdTiepNhan || '');
            this.ngayQdTiepNhan.value(ngayQdTiepNhan || '');
            this.noiDungTiepNhan.value(noiDungTiepNhan || '');
            this.ngayVeNuoc.value(ngayVeNuoc || '');
            this.baoCaoLyDoTraVe.value(baoCaoLyDoTraVe || '');
            this.fileBox?.setData('baoCaoDiNuocNgoaiStaffFile:' + shcc);
        });
    };

    deleteFile = (e, data) => {
        const { index, shcc, file } = data;
        e.preventDefault();
        T.confirm('Xóa dữ liệu', 'Bạn có muốn xóa tập tin này không?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteFile(shcc, file, () => {
                let listFile = this.state.listFile;
                listFile.splice(index, 1);
                this.setState({ listFile });
            });
        });
    };

    onSuccess = (response) => {
        if (response.data) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.data);
            this.setState({ listFile });
        } else if (response.error) T.notify(response.error, 'danger');
    }

    // format: /shcc/dateCreated_nameFile
    split = (input) => {
        let arr = input.split('/');
        let shcc = arr[1];
        let suffix = arr[2];
        let date = suffix.split('_')[0];
        let name = suffix.substring(date.length + 1);
        return { shcc, date, name };
    };
    tableListFile = (data, permission) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            emptyTable: 'Chưa có file báo cáo nào!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%' }}>Tên tập tin</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày upload</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let { shcc, date, name } = this.split(item);
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ wordBreak: 'break-all' }} content={<>
                            <a href={'/api/tccb/di-nuoc-ngoai/download' + item} download>{name}</a>
                        </>
                        } />
                        <TableCell style={{ textAlign: 'center' }} content={T.dateToText(parseInt(date), 'dd/mm/yyyy HH:MM')}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, { index, shcc, file: item })}>
                            <a className='btn btn-info' href={'/api/tccb/di-nuoc-ngoai/download' + item} download>
                                <i className='fa fa-lg fa-download' />
                            </a>
                        </TableCell>
                    </tr>
                );
            }
        });
    }

    getBaoCaoTinhTrang = () => {
        if (this.state.listFile.length == 0) return 0;
        if (this.baoCaoCheck.value()) return 2;
        return 3;
    }
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            quocGia: this.quocGia.value().toString(),
            mucDich: this.mucDich.value(),
            noiDung: this.noiDung.value(),
            chiPhi: this.chiPhi.value(),
            ghiChu: this.ghiChu.value(),
            soQuyetDinh: this.soQuyetDinh?.value(),
            idVanBan: this.state.idVanBan,
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            ngayDiType: this.state.ngayDiType,
            ngayDi: this.ngayDi.getVal(),
            ngayVeType: this.state.ngayVeType,
            ngayVe: this.ngayVe.getVal(),

            soQdTiepNhan: this.state.tiepNhan ? this.soQdTiepNhan.value() : null,
            ngayQdTiepNhan: this.state.tiepNhan ? Number(this.ngayQdTiepNhan.value()) : null,
            noiDungTiepNhan: this.state.tiepNhan ? this.noiDungTiepNhan.value() : null,
            ngayVeNuoc: this.state.tiepNhan ? this.ngayVeNuoc.value() : null,

            baoCaoTinhTrang: this.getBaoCaoTinhTrang(),
            baoCaoTen: T.stringify(this.state.listFile, '[]'),
            baoCaoLyDoTraVe: this.getBaoCaoTinhTrang() == 2 ? this.baoCaoLyDoTraVe.value() : '',
        };
        if (!this.shcc.value()) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value().length) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else if (this.state.tiepNhan && !this.soQdTiepNhan.value()) {
            T.notify('Số quyết định tiếp nhận trống', 'danger');
            this.soQdTiepNhan.focus();
        } else if (this.state.tiepNhan && !this.ngayQdTiepNhan.value()) {
            T.notify('Ngày quyết định tiếp nhận trống', 'danger');
            this.soQdTiepNhan.focus();
        } else if (this.baoCaoCheck.value() && !this.baoCaoLyDoTraVe.value()) {
            T.notify('Lý do báo cáo bị trả về bị trống', 'danger');
            this.baoCaoLyDoTraVe.focus();
        } else {
            this.props.update(this.state.id, changes, this.hide);
            this.quocGia.value('');
        }
    }

    handleTiepNhan = (value) => {
        this.tiepNhanCheck.value(value);
        if (value) {
            this.setState({ tiepNhan: true }, () => {
                $('#tiepNhan').show();
            });
        } else {
            this.setState({ tiepNhan: false }, () => {
                $('#tiepNhan').hide();
            });
        }
    }

    handleBaoCao = (value) => {
        this.baoCaoCheck.value(value);
        value ? $('#baoCaoText').show() : $('#baoCaoText').hide();
    }

    handleCanBo = (value) => {
        this.setState({ shcc: value.id }, () => {
            this.fileBox.setData('baoCaoDiNuocNgoaiStaffFile:' + value.id);
        });
    }
    render = () => {
        const permission = {
            write: true,
            delete: true
        };
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required onChange={this.handleCanBo} />
                {!this.state.idVanBan && <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly={readOnly} />}
                {this.state.idVanBan && <FormSelect className='col-md-3' ref={e => this.idSoVanBan = e} label='Số quyết định' data={SelectAdapter_SoDangKyAlternative([30], 'TRUONG', ['QĐ'], 1)} readOnly={readOnly} onChange={this.onChangeSoQuyetDinh} />}
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={readOnly} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)' />
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
                <FormCheckbox label={this.state.noNeedTiepNhan ? 'Mặc định tiếp nhận do đi dưới 30 ngày' : (this.state.daTiepNhan ? 'Đã tiếp nhận' : this.state.tiepNhan ? 'Đang nhập dữ liệu tiếp nhận' : 'Bấm vào đây nếu muốn tạo mới tiếp nhận')} onChange={this.handleTiepNhan} className='form-group col-md-6' ref={e => this.tiepNhanCheck = e} readOnly={this.state.noNeedTiepNhan ? true : readOnly} />
                <div className='row form-group col-12' id='tiepNhan'>
                    <FormTextBox className='col-md-4' ref={e => this.soQdTiepNhan = e} label='Số quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayQdTiepNhan = e} type='date-mask' label='Ngày quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayVeNuoc = e} type='date-mask' label='Ngày về nước' readOnly={readOnly} />
                    <FormSelect className='col-md-12' ref={e => this.noiDungTiepNhan = e} readOnly={readOnly} label='Nội dung tiếp nhận' data={SelectAdapter_DmTiepNhanVeNuocV2} />
                </div>
                <div className='form-group col-12'>
                    <h3 className='tile-title'>Danh sách tập tin báo cáo</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-md-7'>
                            {this.tableListFile(this.state.listFile, permission)}
                        </div>
                        {this.state.shcc && !readOnly && <FormFileBox className='col-md-5' ref={e => this.fileBox = e} label={'Tải lên tập tin báo cáo (định dạng .xls, .xlsx, .doc, .docx, .pdf, .png, .jpg)'} postUrl='/user/upload' uploadType='baoCaoDiNuocNgoaiStaffFile' userData='baoCaoDiNuocNgoaiStaffFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} readOnly={readOnly} />}
                    </div>
                </div>
                <FormCheckbox label={'Bấm vào đây nếu báo cáo không hợp lệ'} onChange={this.handleBaoCao} className='form-group col-md-6' ref={e => this.baoCaoCheck = e} readOnly={readOnly} />
                <div className='row form-group col-12' id='baoCaoText'>
                    <FormRichTextBox className='col-md-12' rows={2} ref={e => this.baoCaoLyDoTraVe = e} label='Lý do báo cáo bị trả về' readOnly={readOnly} required />
                </div>
            </div>
        });
    }

}

export class CreateModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc, baoCaoTen, baoCaoNgayNop, baoCaoTinhTrang, baoCaoLyDoTraVe }

    onShow = (data = {}) => {
        this.setState({ ...data }, () => {
            this.shcc.value(data.shcc || '');
            this.quocGia.value('');
            this.mucDich.value('');
            this.noiDung.value(data.noiDung || '');
            this.chiPhi.value('');
            this.ghiChu.value('');
            this.state.idSoVanBan && this.idSoVanBan.value(this.state.idSoVanBan, (item) => {
                this.setState({ idVanBan: item.idVanBan });
            });
            // this.soQuyetDinh.value('');
            this.ngayQuyetDinh.value(data.ngayQuyetDinh || '');

            this.ngayDiType.setText({ text: 'dd/mm/yyyy' });
            this.ngayDi.setVal('');
            this.ngayVeType.setText({ text: 'dd/mm/yyyy' });
            this.ngayVe.setVal('');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            listShcc: this.shcc.value(),
            quocGia: this.quocGia.value().toString(),
            mucDich: this.mucDich.value(),
            noiDung: this.noiDung.value(),
            chiPhi: this.chiPhi.value(),
            ghiChu: this.ghiChu.value(),
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            ngayDiType: this.state.ngayDiType,
            ngayDi: this.ngayDi.getVal(),
            ngayVeType: this.state.ngayVeType,
            ngayVe: this.ngayVe.getVal(),

            soQdTiepNhan: null,
            ngayQdTiepNhan: null,
            noiDungTiepNhan: null,
            ngayVeNuoc: null,

            baoCaoTinhTrang: 0,
            baoCaoTen: '[]',
            baoCaoLyDoTraVe: '',
            idVanBan: this.state.idVanBan
        };
        if (!this.shcc.value().length) {
            T.notify('Danh sách cán bộ trống', 'danger');
            this.shcc.focus();
        } else if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value().length) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else {
            this.props.create(changes, this.hide);
        }
    }

    onChangeSoQuyetDinh = (value) => {
        value && this.setState({ idVanBan: value.idVanBan });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required multiple={true} />
                <FormSelect className='col-md-3' ref={e => this.idSoVanBan = e} label='Số quyết định' data={SelectAdapter_SoDangKyAlternative([30], 'TRUONG', ['QĐ'], 1)} readOnly={readOnly} disabled={this.state.idSoVanBan} onChange={this.onChangeSoQuyetDinh} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={readOnly} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)' />
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
            </div>
        });
    }
}

class ThongKeMucDichModal extends AdminModal {
    state = {
        data: [],
        totalItem: 0,
    }

    tableListMucDich = (data) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '100%' }}>Mục đích</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số lượng</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ color: 'blue', whiteSpace: 'nowrap' }} content={item.id} />
                        <TableCell style={{ textAlign: 'center' }} content={item.len} />
                    </tr>
                );
            }
        });
    }

    setUp = (data = [], keyGroup) => {
        let dataGroupBy = data.groupBy(keyGroup);
        let filterData = [];
        let totalItem = 0;
        Object.keys(dataGroupBy).filter(item => dataGroupBy[item].length > 0).map(item => {
            filterData.push({ id: item, len: dataGroupBy[item].length });
            totalItem += dataGroupBy[item].length;
        });
        filterData.sort(function (a, b) { //sắp xếp theo số lượng giảm dần
            return -(a.len - b.len);
        });
        return [filterData, totalItem];
    }

    onShow = () => {
        this.props.thongKeMucDich(this.props.pageC, this.props.filter, data => {
            let dataSetUp = this.setUp(data, 'tenMucDich');
            this.setState({
                data: dataSetUp[0],
                totalItem: dataSetUp[1]
            });
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Thống kê',
            size: 'large',
            body: <div className='row'>
                <div className='form-group col-md-12' style={{ marginTop: '20px' }}>
                    <div>{this.tableListMucDich(this.state.data)}</div>
                    <big style={{ texAlign: 'right' }}><b>{'Tổng cộng: ' + this.state.totalItem.toString()}</b></big>
                </div>
            </div>
        });
    }
}

class QtDiNuocNgoaiPage extends AdminPage {
    defaultSort = 'lastModified_DESC'
    state = { filter: { sortKey: 'lastModified', sortMode: 'DESC' } }

    mapperTinhTrangCongTac = {
        1: <span style={{ whiteSpace: 'nowrap' }} className='text-success'><b><i className='fa fa-lg fa-check' /> Đã tiếp nhận về nước</b></span>,
        2: <span style={{ whiteSpace: 'nowrap' }} className='text-secondary'><b><i className='fa fa-lg fa-times-circle' /> Hết hạn và chưa tiếp nhận </b> </span>,
        3: <span style={{ whiteSpace: 'nowrap' }} className='text-primary'><b><i className='fa fa-lg fa-globe' /> Đang ở nước ngoài</b></span>,
        4: <span style={{ whiteSpace: 'nowrap' }}><b><i className='fa fa-lg fa-clock-o' /> Chưa diễn ra</b></span>,
    }

    mapperTinhTrangBaoCao = {
        0: <span className='text-primary'>CHƯA NỘP</span>,
        1: <span>ĐANG CHỜ DUYỆT</span>,
        2: <span className='text-danger'>BÁO CÁO BỊ TRẢ LẠI</span>,
        3: <span className='text-success'>ĐÃ NỘP</span>,
    }

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
        });
        this.getPage();
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sortKey: (sortTerm).split('_')[0], sortMode: (sortTerm).split('_')[1] } }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDiNuocNgoaiPage(pageN, pageS, pageC, this.state.filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    showCreateModal = (e) => {
        e.preventDefault();
        this.createModal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đi nước ngoài', 'Bạn có chắc bạn muốn xóa quá trình đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDiNuocNgoai(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá quá trình đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá quá trình đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const permission = this.getUserPermission('qtDiNuocNgoai', ['read', 'write', 'delete', 'manage', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page ? this.props.qtDiNuocNgoai.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list,
            divStyle: { height: '80vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (<tr>
                <TableHead style={{ width: 'auto', textAlign: 'center' }} content='STT' />
                <TableHead style={{ width: '100px', whiteSpace: 'nowrap' }} content='Số quyết định' keyCol='soQuyetDinh' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Cán bộ' keyCol='hoTen' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='MSCB' keyCol='shcc' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Học vị' keyCol='tenHocVi' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Chức danh' keyCol='tenChucDanhNgheNghiep' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Đơn vị công tác' keyCol='tenDonVi' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Chức vụ' keyCol='tenChucVu' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: '120px', whiteSpace: 'nowrap' }} content='Ngày quyết định' keyCol='ngayQuyetDinh' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Nơi đến' keyCol='quocGia' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mục đích' keyCol='tenMucDich' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Nội dung' keyCol='noiDung' onKeySearch={onKeySearch} onSort={this.onSort} />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngày đi' keyCol='ngayDi' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Ngày về' keyCol='ngayVe' onKeySearch={onKeySearch} onSort={this.onSort} typeSearch='date' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Tình trạng công tác' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Tình trạng báo cáo' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thao tác' />
            </tr>),
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell style={{ textAlign: 'center' }} content={item.soQuyetDinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={((item.hoCanBo ? item.hoCanBo : '') + ' ' + (item.tenCanBo ? item.tenCanBo : '')).toUpperCase()} />
                <TableCell style={{ textAlign: 'center' }} content={item.shcc} />
                <TableCell style={{ textAlign: 'center' }} content={item.tenHocVi} />
                <TableCell style={{ textAlign: 'center' }} content={item.tenChucDanhNgheNghiep} />
                <TableCell style={{ textAlign: 'center' }} content={item.tenDonVi} />
                <TableCell style={{ textAlign: 'center' }} content={item.tenChucVu} />
                <TableCell style={{ textAlign: 'center' }} content={item.ngayQuyetDinh ? new Date(item.ngayQuyetDinh).ddmmyyyy() : ''} />
                <TableCell style={{ textAlign: 'center' }} content={item.danhSachQuocGia} />
                <TableCell style={{ textAlign: 'center' }} content={item.tenMucDich} />
                <TableCell style={{ textAlign: 'left' }} contentClassName='multiple-lines-5' content={item.noiDung} />
                <TableCell style={{ textAlign: 'center' }} content={item.ngayDi ? new Date(item.ngayDi).ddmmyyyy() : ''} />
                <TableCell style={{ textAlign: 'center' }} content={item.ngayVe ? new Date(item.ngayVe).ddmmyyyy() : ''} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.mapperTinhTrangCongTac[item.tinhTrangCongTac]} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={this.mapperTinhTrangBaoCao[item.baoCaoTinhTrang]} />
                <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                    onEdit={() => permission.write ? this.modal.show(item) : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning')} onDelete={permission.write ? this.delete : T.notify('Vui lòng liên hệ phòng Tổ chức - Cán bộ', 'warning')} >
                </TableCell>
            </tr>
        });
        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình đi nước ngoài',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình đi nước ngoài'
            ],
            content: <>
                <div className='tile'>
                    <div className='tile-title-w-btn' style={{ marginBottom: '5' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                            </div>
                        </div>
                        <div className='btn-group'>
                            {permission.export ? <button className='btn btn-info' type='button' style={{ marginRight: '10px' }} onClick={e => e.preventDefault() || this.thongKeMucDich.show()}>
                                <i className='fa fa-fw fa-lg fa-th-list' />Thống kê mục đích
                            </button> : null}
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={3} />
                            <EditModal ref={e => this.modal = e} readOnly={!permission.write} deleteFile={this.props.deleteFile}
                                update={this.props.updateQtDiNuocNgoai}
                            />
                            <CreateModal ref={e => this.createModal = e} readOnly={!permission.write}
                                create={this.props.createMultipleQtDiNuocNgoai}
                            />
                            <ThongKeMucDichModal ref={e => this.thongKeMucDich = e} thongKeMucDich={this.props.getThongKeMucDich} filter={this.state.filter} pageC={pageCondition} />
                        </div>
                    </div>
                    {table}
                </div>
            </>,
            backRoute: '/user/tccb',
            collapse: [
                { icon: 'fa-plus-square', name: 'Thêm quá trình đi nước ngoài mới', permission: permission.write, type: 'info', onClick: (e) => this.showCreateModal(e) },
                {
                    icon: 'fa-print', name: 'Export', permission: permission.export, onClick: (e) => {
                        e.preventDefault();
                        let { pageCondition } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.page ? this.props.qtDiNuocNgoai.page : { pageCondition: {} };
                        pageCondition = typeof pageCondition === 'string' ? pageCondition : '';
                        if (pageCondition.length == 0) pageCondition = null;

                        const filter = T.stringify(this.state.filter);
                        this.state.filter && this.state.filter.timeType == 4 ? T.download(T.url(`/api/tccb/qua-trinh/tiep-nhan-ve-nuoc/download-excel/${filter}/${pageCondition}`), 'DANH SACH VE NUOC.xlsx') : T.download(T.url(`/api/tccb/qua-trinh/di-nuoc-ngoai/download-excel/${filter}/${pageCondition}`), 'dinuocngoai.xlsx');
                    }
                },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = { getQtDiNuocNgoaiPage, deleteQtDiNuocNgoai, updateQtDiNuocNgoai, getThongKeMucDich, createMultipleQtDiNuocNgoai, deleteFile, getQtDiNuocNgoaiGroupPage };
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoaiPage);