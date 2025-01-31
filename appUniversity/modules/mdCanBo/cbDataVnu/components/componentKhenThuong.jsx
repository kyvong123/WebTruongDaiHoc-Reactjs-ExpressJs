import React from 'react';
import { AdminModal, FormDatePicker, FormTextBox, renderTable, TableCell, getValue, FormSelect } from 'view/component/AdminPage';
const { SelectAdapter_XepLoaiChuyenMon, SelectAdapter_HinhThucKhenThuong, SelectAdapter_HinhThucKyLuat } = require('../dataSelect')();

class EditModal extends AdminModal {
    onShow = (type) => {
        this.setState({ type });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let data = {};
        if (this.state.type == 'khenThuong') {
            data = {
                nam: getValue(this.nam)?.getTime() || '',
                xepLoaiChuyenMon: getValue(this.xepLoaiChuyenMon) || '',
                xepLoaiThiDua: getValue(this.xepLoaiThiDua) || '',
                hinhThucKhenThuong: getValue(this.hinhThucKhenThuong) || '',
            };
        }
        else if (this.state.type == 'kyLuat') {
            data = {
                batDau: getValue(this.batDau)?.getTime() || '',
                ketThuc: getValue(this.ketThuc) ? getValue(this.ketThuc).getTime() : '',
                hinhThucKyLuat: getValue(this.hinhThucKyLuat) || '',
                hanhVi: getValue(this.hanhVi) || '',
                coQuan: getValue(this.coQuan) || '',
            };
        }
        this.props.create({ type: this.state.type, data }, () => {
            T.notify('Thêm thông tin thành công', 'success');
            this.hide();
        });
    }

    render = () => {
        return this.renderModal({
            title: `Thông tin ${this.state.type == 'khenThuong' ? 'Khen thưởng' : (this.state.type == 'kyLuat' ? 'Kỷ luật' : '')}`,
            size: 'large',
            body: <div className='row'>
                {this.state.type == 'khenThuong' && <>
                    <FormDatePicker className='col-md-4' ref={e => this.nam = e} type='year-mask' label='Năm' required />
                    <FormSelect className='col-md-8' ref={e => this.xepLoaiChuyenMon = e} data={SelectAdapter_XepLoaiChuyenMon} label='Xếp loại chuyên môn' required />
                    <FormTextBox className='col-md-12' ref={e => this.xepLoaiThiDua = e} label='Xếp loại thi đua' />
                    <FormSelect className='col-md-12' ref={e => this.hinhThucKhenThuong = e} data={SelectAdapter_HinhThucKhenThuong} label='Hình thức khen thưởng' />
                </>}
                {this.state.type == 'kyLuat' && <>
                    <FormDatePicker className='col-md-6' ref={e => this.batDau = e} type='month-mask' label='Bắt đầu (mm/yyyy)' required />
                    <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} type='month-mask' label='Kết thúc (mm/yyyy)' />
                    <FormSelect className='col-md-12' ref={e => this.hinhThucKyLuat = e} data={SelectAdapter_HinhThucKyLuat} label='Hình thức kỷ luật' required />
                    <FormTextBox className='col-md-12' ref={e => this.hanhVi = e} label='Hành vi vi phạm' />
                    <FormTextBox className='col-md-12' ref={e => this.coQuan = e} label='Cơ quan quyết định' />
                </>}
            </div>,
        });
    }
}

export default class ComponentKhenThuong extends React.Component {
    state = {}

    onCreate = (res, done) => {
        let { type, data } = res;
        let componentKhenThuong = this.state.componentKhenThuong || {};
        if (!componentKhenThuong[type]) {
            componentKhenThuong[type] = [];
        }
        componentKhenThuong[type].push(data);
        this.setState({ componentKhenThuong }, () => done && done());
    };

    onDelete = (type, index) => {
        let componentKhenThuong = this.state.componentKhenThuong || {};
        if (componentKhenThuong[type] && index < componentKhenThuong[type].length) {
            componentKhenThuong[type].splice(index, 1);
        }
        this.setState({ componentKhenThuong });
    }

    fillData = (data) => {
        const { khenThuong, kyLuat } = data || {};
        this.setState({ componentKhenThuong: { khenThuong, kyLuat } });
    }

    getValue = () => {
        let componentKhenThuong = this.state.componentKhenThuong || {};
        for (let key in componentKhenThuong) {
            if (!componentKhenThuong[key]?.length) componentKhenThuong[key] = '';
        }
        return componentKhenThuong;
    }

    render() {
        let data = this.state.componentKhenThuong;

        let tableKhenThuong = () => renderTable({
            getDataSource: () => data?.khenThuong || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu khen thưởng',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Xếp loại chuyên môn</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Xếp loại thi đua</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình thức khen thưởng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.nam} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_XepLoaiChuyenMon.find(value => value.id == item.xepLoaiChuyenMon)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.xepLoaiThiDua} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_HinhThucKhenThuong.find(value => value.id == item.hinhThucKhenThuong)?.text || ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('khenThuong', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>
            ),
        });

        let tableKyLuat = () => renderTable({
            getDataSource: () => data?.kyLuat || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu kỷ luật',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hành vi vi phạm</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cơ quan quyết định</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_HinhThucKyLuat.find(value => value.id == item.hinhThucKyLuat)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hanhVi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.coQuan} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('kyLuat', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>
            ),
        });

        return <>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'KHEN THƯỞNG'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('khenThuong')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableKhenThuong()} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'KỶ LUẬT'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('kyLuat')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableKyLuat()} </div>
                </div>
            </div>
            <EditModal ref={e => this.editModal = e} create={this.onCreate} />
        </>;
    }
}