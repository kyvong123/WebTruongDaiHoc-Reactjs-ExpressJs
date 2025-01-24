import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, } from 'view/component/AdminPage';
import { TableHead, renderDataTable, FormTextBox, TableCell, getValue, FormSelect } from 'view/component/AdminPage';
import { getSdhDanhSachDiemThiPage, getSdhTsPhongThiMaTui, createSdhTsDiemPhongThi, getSdhTsPhongThiMonThi } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import { SelectAdapter_MaTui } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';
import { SelectAdapter_MonThiByDot } from 'modules/mdSauDaiHoc/sdhTsInfoMonThi/redux';

class NhapDiemPhongThi extends AdminPage {
    state = { data: [] }
    diem = {};

    getData = (maTui) => {
        this.props.getSdhTsPhongThiMaTui(this.props.idDot, maTui, (items) => this.setState({ data: items }, () => this.setValue(items)));
    }
    getDataMonThi = (data) => {
        this.props.getSdhTsPhongThiMonThi(data, (items) => this.setState({ data: items }, () => this.setValue(items)));
    }
    setValue = (items) => {
        items.forEach(item => {
            this.diem[item.id]?.value(item.diem || '');
        });
    }
    saveData = () => {
        let diem = {};
        this.state.data.length && this.state.data.forEach(item => diem[item.id] = getValue(this.diem[item.id]));
        let data = { thiSinh: this.state.data, diem };
        this.props.createSdhTsDiemPhongThi(data);
    }
    render() {
        const permission = this.getUserPermission('sdhTsKetQuaThi');
        const isManager = this.getCurrentPermissions('manager').includes('manager:write');
        let listDiem = this.state.data ? this.state.data : [];
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu điểm thi',
            stickyHead: false,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: listDiem,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} >#</th>
                    {isManager ? <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }} /> : null}
                    <TableHead keyCol='maPhach' content='Mã phách' style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='diem' content='Điểm' style={{ width: isManager ? '30%' : '60%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    {isManager ? <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.sbd} /> : null}
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.maPhach} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={
                        <FormTextBox type='number' min={0} max={100} step={true} decimalScale={2} ref={e => this.diem[item.id] = e} style={{ textAlign: 'center' }} permission={permission} />
                    } />
                </tr>
            )
        });
        return <>
            <div className='tile'>
                <div className='row'>
                    <div className='col-md-4'>
                        <FormSelect ref={e => this.maTui = e} label='Mã túi' data={SelectAdapter_MaTui({ idDot: this.props.idDot })}
                            onChange={value => {
                                this.monThi.value('');
                                this.getData(value.id);
                            }} required />
                    </div>
                    <div className='col-md-2'>
                        <span>Hoặc</span>
                    </div>
                    <div className='col-md-4'>
                        <FormSelect ref={e => this.monThi = e} label='Môn thi' data={SelectAdapter_MonThiByDot(this.props.idDot)}
                            onChange={value => {
                                this.maTui.value('');
                                this.getDataMonThi({ idDot: this.props.idDot, maMonThi: value.maMonThi, kyNang: value.kyNang });
                            }} required />
                    </div>
                </div>
            </div>
            {this.state.data.length ? <><h5>Môn thi: {this.state.data[0].tenMon}</h5>
                <div className='tile'>
                    <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.getData(this.maTui.value())} >
                        <i className='fa fa-refresh' /> ReLoad
                    </button>
                    {table}
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' type='button' onClick={() => this.saveData()}>
                            <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                        </button>
                    </div>
                </div></>
                : null}
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhDanhSachDiemThiPage, getSdhTsPhongThiMaTui, createSdhTsDiemPhongThi, getSdhTsPhongThiMonThi
};
export default connect(mapStateToProps, mapActionsToProps)(NhapDiemPhongThi);