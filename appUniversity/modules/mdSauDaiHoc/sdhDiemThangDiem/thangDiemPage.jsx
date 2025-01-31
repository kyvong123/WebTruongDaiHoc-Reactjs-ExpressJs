import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemThangDiemAll, createSdhDiemThangDiem, updateSdhDiemThangDiem } from './redux';
import { getSdhDiemDmXepLoaiActive } from '../sdhDiemDmXepLoai/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, CirclePageButton, FormSelect, renderDataTable } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    state = { xepLoai: [] }
    minThangMuoi = []; maxThangMuoi = [];
    minThangBon = []; maxThangBon = [];
    diemChu = []; idXepLoai = [];
    keyList = ['minThangMuoi', 'maxThangMuoi', 'minThangBon', 'maxThangBon', 'diemChu', 'idXepLoai'];
    onShow = (item) => {
        let { id, ma, diemDat, xepLoai } = item ? item : { id: '', ma: '', diemDat: '', xepLoai: [] };
        this.setState({ id, xepLoai });
        this.ma.value(ma);
        this.diemDat.value(diemDat);
    };
    onHide = () => {
        this.reset();
    }
    deleteRow = (index) => {
        let xepLoai = this.state.xepLoai;
        xepLoai.splice(index, 1);
        this.setState({ xepLoai });
    }
    addRow = () => {
        let xepLoai = this.state.xepLoai, item = {};
        this.keyList.forEach(key => {
            item[key] = this[key + 'New'].value();
        });
        xepLoai.push(item); this.setState({ xepLoai }, () => xepLoai.length < this.props.dataXepLoai.length && this.keyList.forEach(key => {
            this[key + 'New'].value('');
        }));
    }
    onSubmit = (e) => {
        e.preventDefault();
        const thangDiem = {
            ma: getValue(this.ma),
            diemDat: getValue(this.diemDat),
        };
        let thangDiemDetail = [], full = true, fromTo = true;
        for (let i = 0; i < this.state.xepLoai.length; i++) {
            let item = {};
            this.keyList.forEach(key => {
                if (!this[key][i].value()) full = false;
                item[key] = this[key][i].value();
            });
            if (!full) break;
            if (parseFloat(item.minThangMuoi) > parseFloat(item.maxThangMuoi || parseFloat(item.minThangBon) > parseFloat(item.maxThangBon))) { fromTo = false; break; }
            thangDiemDetail.push(item);
        }
        if (!full) { T.notify('Hãy nhập đầy đủ thông tin', 'danger'); return; }
        if (!fromTo) { T.notify('Thang điểm không hợp lệ. Hãy kiểm tra lại!', 'danger'); return; }
        this.state.id ? this.props.update(this.state.id, thangDiem, thangDiemDetail, this.hide)
            : this.props.create(thangDiem, thangDiemDetail, () => { this.hide(); this.props.updateThangDiemKhoaHv(); });
    }
    componentEdit = (item, index) => <>
        <tr>
            <TableCell content={index + 1} />
            <TableCell content={<div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='col-md-1'>Từ</div> <FormTextBox ref={e => this.minThangMuoi[index] = e} type='number' min={0} max={10} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} value={item.minThangMuoi} />
                <div className='col-md-1'>Đến dưới</div> <FormTextBox ref={e => this.maxThangMuoi[index] = e} type='number' min={0} max={10} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} value={item.maxThangMuoi} /> </div>
            } />
            <TableCell content={<div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='col-md-1'>Từ</div> <FormTextBox ref={e => this.minThangBon[index] = e} type='number' min={0} max={4} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} value={item.minThangBon} />
                <div className='col-md-1'>Đến dưới</div> <FormTextBox ref={e => this.maxThangBon[index] = e} type='number' min={0} max={4} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} value={item.maxThangBon} /> </div>
            } />
            <TableCell content={<FormTextBox ref={e => this.diemChu[index] = e} className='mb-0' value={item.diemChu} required />} />
            <TableCell content={<FormSelect className='mb-0' ref={e => this.idXepLoai[index] = e} data={this.props.dataXepLoai} value={item.idXepLoai} required />} />
            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                <Tooltip title='Xóa'>
                    <button className='btn btn-danger' onClick={e => e.preventDefault() || this.deleteRow(index)}>
                        <i className='fa fa-lg fa-trash' />
                    </button>
                </Tooltip>
            } />
        </tr>
    </>
    reset = () => {
        this.keyList.forEach(key => {
            this[key] = [];
        });
        this.setState({ dataDmXepLoai: [], xepLoai: [] });
    }

    renderData = () => {
        let data = this.state.xepLoai,
            dataDmXepLoai = this.props.dataXepLoai;
        const table = renderDataTable({
            data: data,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu thang điểm',
            header: 'thead-light',
            multipleTbody: true,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th rowSpan={2} style={{ width: '30%', textAlign: 'center' }}>Thang điểm 10</th>
                <th rowSpan={2} style={{ width: '30%', textAlign: 'center' }}>Thang điểm 4</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Điểm chữ</th>
                <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Xếp loại</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: <tbody>
                {data.length ? data.map((item, index) => (
                    this.componentEdit(item, index))) : null}
                {
                    (!data.length || data.length < dataDmXepLoai.length) ?
                        <tr>
                            <TableCell content={''} />
                            <TableCell content={<div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div className='col-md-1'>Từ</div> <FormTextBox ref={e => this.minThangMuoiNew = e} type='number' min={0} max={10} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} />
                                <div className='col-md-1'>Đến dưới</div> <FormTextBox ref={e => this.maxThangMuoiNew = e} type='number' min={0} max={10} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} /> </div>
                            } />
                            <TableCell content={<div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div className='col-md-1'>Từ</div> <FormTextBox ref={e => this.minThangBonNew = e} type='number' min={0} max={4} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} />
                                <div className='col-md-1'>Đến dưới</div> <FormTextBox ref={e => this.maxThangBonNew = e} type='number' min={0} max={4} className='mb-0 col-md-5' required step={0.5} decimalScale={2} allowNegative={false} /> </div>
                            } />
                            <TableCell content={<FormTextBox ref={e => this.diemChuNew = e} className='mb-0' required />} />
                            <TableCell content={<FormSelect className='mb-0' ref={e => this.idXepLoaiNew = e} data={dataDmXepLoai} required onChange={() => this.addRow()} />} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                ''
                            } />
                        </tr> : null
                }
            </tbody>

        });
        return table;
    }

    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thang điểm' : 'Tạo mới thang điểm',
            size: 'elarge',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.ma = e} label='Mã' className='col-md-8' required />
                    <FormTextBox ref={e => this.diemDat = e} label='Điểm đạt' className='col-md-4' type='number' min={0} max={10} required step={0.5} decimalScale={2} allowNegative={false} />
                </div>
                {this.renderData()}
            </>
        });
    }
}

class SdhThangDiemPage extends AdminPage {
    state = { dmXepLoai: [] };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDiemDmXepLoaiActive(items => {
                this.setState({ dmXepLoai: items ? items.map(i => ({ id: i.id, text: i.ten })) : [] });
            });
            this.props.getSdhDiemThangDiemAll();
        });
    }
    render() {
        const permission = this.getUserPermission('sdhDiemThangDiem', ['read', 'write', 'delete', 'manage']),
            list = this.props.sdhDiemThangDiem ? this.props.sdhDiemThangDiem.items : [];
        const table = renderTable({
            getDataSource: () => list,
            stickyHead: false,
            emptyTable: 'Không có dữ liệu thang điểm',
            header: 'thead-light',
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: '60%' }}>Mã thang điểm</th>
                <th style={{ width: '40%' }}>Điểm đạt</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => (
                <tr>
                    <TableCell content={index + 1} />
                    <TableCell content={item.ma} />
                    <TableCell content={item.diemDat} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={e => e && e.preventDefault() || this.modal.show(item)} />
                </tr>
            )
        });
        return (
            <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} dataXepLoai={this.state.dmXepLoai} create={this.props.createSdhDiemThangDiem} update={this.props.updateSdhDiemThangDiem} updateThangDiemKhoaHv={this.props.updateThangDiemKhoaHv} />
                <CirclePageButton type='custom' tooltip='Thêm mới' customIcon='fa fa-plus' customClassName='btn-primary' onClick={e => e && e.preventDefault() || this.modal.show()} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemThangDiem: state.sdh.sdhDiemThangDiem });
const mapActionsToProps = { getSdhDiemThangDiemAll, getSdhDiemDmXepLoaiActive, createSdhDiemThangDiem, updateSdhDiemThangDiem };
export default connect(mapStateToProps, mapActionsToProps)(SdhThangDiemPage);