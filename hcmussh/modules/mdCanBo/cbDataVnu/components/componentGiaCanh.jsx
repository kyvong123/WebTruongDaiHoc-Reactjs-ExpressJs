import React from 'react';
import { AdminModal, FormDatePicker, FormTextBox, renderTable, TableCell, getValue, FormSelect } from 'view/component/AdminPage';
const { SelectAdapter_QuanHeGiaDinh, SelectAdapter_LoaiPhuCap, SelectAdapter_LoaiNhaDat, SelectAdapter_BacLuong, SelectAdapter_NgachLuong } = require('../dataSelect')();

class EditModal extends AdminModal {
    onShow = (type) => {
        this.setState({ type }, () => {
            this.quanHe && this.quanHe.value('');
            this.hoVaTen && this.hoVaTen.value('');
            this.namSinh && this.namSinh.value('');
            this.detail && this.detail.value('');
            this.batDau && this.batDau.value('');
            this.ketThuc && this.ketThuc.value('');
            this.maNgach && this.maNgach.value('');
            this.bacLuong && this.bacLuong.value('');
            this.heSoLuong && this.heSoLuong.value('');
            this.tienLuong && this.tienLuong.value('');
            this.loaiPhuCap && this.loaiPhuCap.value('');
            this.phanTramHuong && this.phanTramHuong.value('');
            this.heSoPhuCap && this.heSoPhuCap.value('');
            this.hinhThuc && this.hinhThuc.value('');
            this.tienLuong && this.tienLuong.value('');
            this.loaiNhaDat && this.loaiNhaDat.value('');
            this.dienTich && this.dienTich.value('');
            this.chungNhan && this.chungNhan.value('');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let data = {};
        if (['giaCanhBanThan', 'giaCanhGiaDinh'].includes(this.state.type)) {
            data = {
                quanHe: getValue(this.quanHe) || '',
                hoVaTen: getValue(this.hoVaTen) || '',
                namSinh: getValue(this.namSinh)?.getTime() || '',
                detail: getValue(this.detail) || '',
            };
        }
        else if (this.state.type == 'qtLuong') {
            data = {
                batDau: getValue(this.batDau)?.getTime() || '',
                ketThuc: getValue(this.ketThuc) ? getValue(this.ketThuc).getTime() : '',
                maNgach: getValue(this.maNgach) || '',
                bacLuong: getValue(this.bacLuong) || '',
                heSoLuong: getValue(this.heSoLuong) || '',
                tienLuong: getValue(this.tienLuong) || '',
            };
        }
        else if (this.state.type == 'qtPhuCap') {
            data = {
                batDau: getValue(this.batDau)?.getTime() || '',
                ketThuc: getValue(this.ketThuc) ? getValue(this.ketThuc).getTime() : '',
                loaiPhuCap: getValue(this.loaiPhuCap) || '',
                phanTramHuong: getValue(this.phanTramHuong) || '',
                heSoPhuCap: getValue(this.heSoPhuCap) || '',
                hinhThuc: getValue(this.hinhThuc) || '',
                tienLuong: getValue(this.tienLuong) || '',
            };
        }

        this.props.create({ type: this.state.type, data }, () => {
            T.notify('Thêm thông tin thành công', 'success');
            this.hide();
        });
    }

    render = () => {
        let mapTitle = {
            giaCanhBanThan: 'thành viên gia đình (phía bản thân)',
            giaCanhGiaDinh: 'thành viên gia đình (phía vợ/chồng)',
            qtLuong: 'quá trình lương',
            qtPhuCap: 'phụ cấp',
            nhaDat: 'tài sản nhà đất',
        };

        return this.renderModal({
            title: `Thông tin ${mapTitle[this.state.type] || ''}`,
            size: 'large',
            body: <div className='row'>
                {['giaCanhBanThan', 'giaCanhGiaDinh'].includes(this.state.type) && <>
                    <FormSelect className='col-md-3' ref={e => this.quanHe = e} data={SelectAdapter_QuanHeGiaDinh(this.state.type)} label='Mối quan hệ' required />
                    <FormTextBox className='col-md-6' ref={e => this.hoVaTen = e} label='Họ và tên' required />
                    <FormDatePicker className='col-md-3' ref={e => this.namSinh = e} type='year-mask' label='Năm sinh' required />
                    <FormTextBox className='col-md-12' ref={e => this.detail = e} label='Quê quán, nghề nghiệp, đơn vị,...' />
                </>}
                {['qtLuong', 'qtPhuCap'].includes(this.state.type) && <>
                    <FormDatePicker className='col-md-6' ref={e => this.batDau = e} type='month-mask' label='Bắt đầu (mm/yyyy)' required />
                    <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} type='month-mask' label='Kết thúc (mm/yyyy)' />
                </>}
                {this.state.type == 'qtLuong' && <>
                    <FormSelect className='col-md-4' ref={e => this.maNgach = e} label='Mã ngạch' data={SelectAdapter_NgachLuong} required />
                    <FormSelect className='col-md-4' ref={e => this.bacLuong = e} label='Bậc lương' data={SelectAdapter_BacLuong} required />
                    <FormTextBox type='number' decimalScale='2' step className='col-md-4' ref={e => this.heSoLuong = e} label='Hệ số lương (%)' />
                    <FormTextBox className='col-md-12' ref={e => this.tienLuong = e} label='Tiền lương' />
                </>}
                {this.state.type == 'qtPhuCap' && <>
                    <FormSelect className='col-md-12' ref={e => this.loaiPhuCap = e} data={SelectAdapter_LoaiPhuCap} label='Loại phụ cấp' required />
                    <FormTextBox type='number' className='col-md-6' ref={e => this.phanTramHuong = e} label='Phần trăm hưởng (%)' suffix='%' required />
                    <FormTextBox type='number' decimalScale='2' step className='col-md-6' ref={e => this.heSoPhuCap = e} label='Hệ số' required />
                    <FormTextBox className='col-md-6' ref={e => this.hinhThuc = e} label='Hình thức hưởng' />
                    <FormTextBox className='col-md-6' ref={e => this.tienLuong = e} label='Giá trị (VNĐ)' />
                </>}
                {this.state.type == 'nhaDat' && <>
                    <FormSelect className='col-md-12' ref={e => this.loaiNhaDat = e} data={SelectAdapter_LoaiNhaDat} label='Loại nhà đất' required />
                    <FormTextBox type='number' decimalScale='4' step className='col-md-6' ref={e => this.dienTich = e} label={<>{'Diện tích sử dụng (m'}<sup>2</sup>{')'}</>} placeholder='Diện tích sử dụng' required />
                    <FormTextBox className='col-md-6' ref={e => this.chungNhan = e} label='Giấy chứng nhận quyền sở hữu' />
                </>}
            </div>,
        });
    }
}

export default class ComponentGiaCanh extends React.Component {
    state = {}

    onCreate = (res, done) => {
        let { type, data } = res;
        let componentGiaCanh = this.state.componentGiaCanh || {};
        if (!componentGiaCanh[type]) {
            componentGiaCanh[type] = [];
        }
        componentGiaCanh[type].push(data);
        this.setState({ componentGiaCanh }, () => done && done());
    };

    onDelete = (type, index) => {
        let componentGiaCanh = this.state.componentGiaCanh || {};
        if (componentGiaCanh[type] && index < componentGiaCanh[type].length) {
            componentGiaCanh[type].splice(index, 1);
        }
        this.setState({ componentGiaCanh });
    }

    fillData = (data) => {
        const { giaCanhBanThan, giaCanhGiaDinh, qtLuong, qtPhuCap, nhaDat } = data || {};
        this.setState({ componentGiaCanh: { giaCanhBanThan, giaCanhGiaDinh, qtLuong, qtPhuCap, nhaDat } });
    }

    getValue = () => {
        let componentGiaCanh = this.state.componentGiaCanh || {};
        for (let key in componentGiaCanh) {
            if (!componentGiaCanh[key]?.length) componentGiaCanh[key] = '';
        }
        return componentGiaCanh;
    }

    render() {
        let data = this.state.componentGiaCanh;

        let tableGiaCanh = (type) => renderTable({
            getDataSource: () => data?.[type] || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu thành viên',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mối quan hệ</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm sinh</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Quê quán, nghề nghiệp, đơn vị,...</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_QuanHeGiaDinh().find(value => value.id == item.quanHe)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hoVaTen} />
                    <TableCell type='date' dateFormat='yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namSinh} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.detail} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete(type, index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>
            ),
        });

        let tableLuong = () => renderTable({
            getDataSource: () => data?.qtLuong || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu quá trình lương',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã ngạch</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Bậc lương</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hệ số</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tiền lương</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_NgachLuong.find(value => value.id == item.maNgach)?.ten || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_BacLuong.find(value => value.id == item.bacLuong)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.heSoLuong} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tienLuong} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('qtLuong', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        let tablePhuCap = () => renderTable({
            getDataSource: () => data?.qtPhuCap || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu phụ cấp',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại phụ cấp</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm hưởng</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hệ số</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình thức hưởng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>{'Giá trị (VNĐ)'}</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_LoaiPhuCap.find(value => value.id == item.loaiPhuCap)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phanTramHuong} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.heSoPhuCap} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hinhThuc} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tienLuong} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('qtPhuCap', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        let tableNhaDat = () => renderTable({
            getDataSource: () => data?.nhaDat || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu tài sản nhà đất',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại nhà đất</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>{'Diện tích sử dụng (m'}<sup>2</sup>{')'}</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Giấy chứng nhận quyền sở hữu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_LoaiNhaDat.find(value => value.id == item.loaiNhaDat)?.text || ''} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.dienTich} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.chungNhan} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('nhaDat', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        return <>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÀNH VIÊN GIA ĐÌNH (phía bản thân)'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('giaCanhBanThan')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableGiaCanh('giaCanhBanThan')} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'THÀNH VIÊN GIA ĐÌNH (phía vợ/chồng)'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('giaCanhGiaDinh')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableGiaCanh('giaCanhGiaDinh')} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'QUÁ TRÌNH LƯƠNG'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('qtLuong')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableLuong()} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'QUÁ TRÌNH HƯỞNG PHỤ CẤP'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('qtPhuCap')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tablePhuCap()} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'TÀI SẢN NHÀ ĐẤT'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('nhaDat')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableNhaDat()} </div>
                </div>
            </div>
            <EditModal ref={e => this.editModal = e} create={this.onCreate} />
        </>;
    }
}