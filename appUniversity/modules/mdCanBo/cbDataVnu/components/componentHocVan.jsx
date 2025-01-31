import React from 'react';
import { AdminModal, FormDatePicker, FormSelect, FormTextBox, renderTable, TableCell, getValue } from 'view/component/AdminPage';
const { SelectAdapter_CoSoDaoTao, SelectAdapter_ChuyenNganhChuyenMon, SelectAdapter_HinhThucDaoTao, SelectAdapter_HocVi, SelectAdapter_LoaiVanBang_ChinhTri, SelectAdapter_LoaiNgoaiNgu } = require('../dataSelect')();

class EditModal extends AdminModal {
    onShow = (type) => {
        this.setState({ type }, () => {
            this.batDau.value('');
            this.ketThuc.value('');
            this.coSo.value('');
            this.chuyenNganh && this.chuyenNganh.value('');
            this.hinhThuc && this.hinhThuc.value('');
            this.vanBang && this.vanBang.value('');
            this.ngoaiNgu && this.ngoaiNgu.value('');
            this.chungChi && this.chungChi.value('');
            this.diemSo && this.diemSo.value('');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let data = {
            batDau: getValue(this.batDau)?.getTime() || '',
            ketThuc: getValue(this.ketThuc) ? getValue(this.ketThuc).getTime() : '',
            coSo: getValue(this.coSo) || '',
        };
        this.chuyenNganh && (data.chuyenNganh = getValue(this.chuyenNganh) || '');
        this.hinhThuc && (data.hinhThuc = getValue(this.hinhThuc) || '');
        this.vanBang && (data.vanBang = getValue(this.vanBang) || '');
        this.ngoaiNgu && (data.ngoaiNgu = getValue(this.ngoaiNgu) || '');
        this.chungChi && (data.chungChi = getValue(this.chungChi) || '');
        this.diemSo && (data.diemSo = getValue(this.diemSo) || '');

        this.props.create({ type: this.state.type, data }, () => {
            T.notify('Thêm thông tin thành công', 'success');
            this.hide();
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Thông tin quá trình học vấn',
            size: 'large',
            body: <div className='row'>
                <FormDatePicker className='col-md-6' ref={e => this.batDau = e} type='month-mask' label='Bắt đầu đào tạo (mm/yyyy)' required />
                <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} type='month-mask' label='Kết thúc đào tạo (mm/yyyy)' />
                <FormSelect className='col-md-12' ref={e => this.coSo = e} data={SelectAdapter_CoSoDaoTao} label='Cơ sở đào tạo' required />
                {this.state.type == 'chuyenMon' && <FormSelect className='col-md-12' ref={e => this.chuyenNganh = e} data={SelectAdapter_ChuyenNganhChuyenMon} label='Chuyên ngành' required />}
                {['chuyenMon', 'chinhTri'].includes(this.state.type) && <FormSelect className='col-md-12' ref={e => this.hinhThuc = e} data={SelectAdapter_HinhThucDaoTao} label='Hình thức đào tạo' required />}
                {['chuyenMon', 'chinhTri'].includes(this.state.type) && <FormSelect className='col-md-12' ref={e => this.vanBang = e} data={this.state.type == 'chuyenMon' ? SelectAdapter_HocVi : SelectAdapter_LoaiVanBang_ChinhTri} label='Văn bằng' required />}
                {this.state.type == 'ngoaiNgu' && <FormSelect className='col-md-12' ref={e => this.ngoaiNgu = e} data={SelectAdapter_LoaiNgoaiNgu} label='Ngoại ngữ' required />}
                {['ngoaiNgu', 'tinHoc'].includes(this.state.type) && <FormTextBox className='col-md-12' ref={e => this.chungChi = e} label='Chứng chỉ' />}
                {this.state.type == 'ngoaiNgu' && <FormTextBox className='col-md-12' ref={e => this.diemSo = e} label='Điểm số' />}
            </div>,
        });
    }
}

export default class ComponentHocVan extends React.Component {
    state = {}

    onCreate = (res, done) => {
        let { type, data } = res;
        let componentHocVan = this.state.componentHocVan || {};
        if (!componentHocVan[type]) {
            componentHocVan[type] = [];
        }
        componentHocVan[type].push(data);
        this.setState({ componentHocVan }, () => done && done());
    };

    onDelete = (type, index) => {
        let componentHocVan = this.state.componentHocVan || {};
        if (componentHocVan[type] && index < componentHocVan[type].length) {
            componentHocVan[type].splice(index, 1);
        }
        this.setState({ componentHocVan });
    }

    fillData = (data) => {
        const { chuyenMon, chinhTri, ngoaiNgu, tinHoc } = data || {};
        this.setState({ componentHocVan: { chuyenMon, chinhTri, ngoaiNgu, tinHoc } });
    }

    getValue = () => {
        let componentHocVan = this.state.componentHocVan || {};
        for (let key in componentHocVan) {
            if (!componentHocVan[key]?.length) componentHocVan[key] = '';
        }
        return componentHocVan;
    }

    render() {
        let data = this.state.componentHocVan;

        let tableChuyenMon = () => renderTable({
            getDataSource: () => data?.chuyenMon || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu văn bằng chuyên môn',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc đào tạo</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chuyên ngành</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình thức</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Văn bằng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_CoSoDaoTao.find(value => value.id == item.coSo)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_ChuyenNganhChuyenMon.find(value => value.id == item.chuyenNganh)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_HinhThucDaoTao.find(value => value.id == item.hinhThuc)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_HocVi.find(value => value.id == item.vanBang)?.text || ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('chuyenMon', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        let tableChinhTri = () => renderTable({
            getDataSource: () => data?.chinhTri || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu văn bằng lý luận chính trị',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc đào tạo</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình thức</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Văn bằng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_CoSoDaoTao.find(value => value.id == item.coSo)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_HinhThucDaoTao.find(value => value.id == item.hinhThuc)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_LoaiVanBang_ChinhTri.find(value => value.id == item.vanBang)?.text || ''} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('chinhTri', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        let tableNgoaiNgu = () => renderTable({
            getDataSource: () => data?.ngoaiNgu || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu văn bằng ngoại ngữ',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc đào tạo</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngoại ngữ</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chứng chỉ</th>
                    <th type='number' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm số</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_CoSoDaoTao.find(value => value.id == item.coSo)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_LoaiNgoaiNgu.find(value => value.id == item.ngoaiNgu)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.chungChi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diemSo} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('ngoaiNgu', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        let tableTinHoc = () => renderTable({
            getDataSource: () => data?.tinHoc || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu văn bằng tin học',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc đào tạo</th>
                    <th style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chứng chỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={SelectAdapter_CoSoDaoTao.find(value => value.id == item.coSo)?.text || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.chungChi} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('tinHoc', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>),
        });

        return <>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'CHUYÊN MÔN'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('chuyenMon')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableChuyenMon()} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'LÝ LUẬN CHÍNH TRỊ'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('chinhTri')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableChinhTri()} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'NGOẠI NGỮ'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('ngoaiNgu')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableNgoaiNgu()} </div>
                </div>
            </div>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'TIN HỌC'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('tinHoc')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableTinHoc()} </div>
                </div>
            </div>
            <EditModal ref={e => this.editModal = e} create={this.onCreate} />
        </>;
    }
}