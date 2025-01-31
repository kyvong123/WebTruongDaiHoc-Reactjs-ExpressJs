import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, } from 'view/component/AdminPage';
import { TableHead, renderDataTable, FormSelect, TableCell, FormTextBox, getValue } from 'view/component/AdminPage';
import { getSdhDanhSachDiemThiPage, SelectAdapter_ThiSinh, getSdhTsDiemThiThiSinh, createSdhTsDiemThiSinhMp } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import ThiSinhMode from './thiSinhModeComponent';
class NhapDiemThiSinh extends AdminPage {
    state = { thiSinhMode: false };
    diem = {};
    saveData = () => {
        this.state.listDiem.forEach(item => this.props.createSdhTsDiemThiSinhMp(item.id, getValue(this.diem[item.id]), item.diem));
    }
    getData = (value) => {
        this.props.getSdhTsDiemThiThiSinh(value.id, (items) => this.setState({ sbd: value.sbd, listDiem: items, idThiSinh: value.id }, () => this.setValue(items)));
    }
    setValue(items) {
        items.forEach(item => this.diem[item.id].value(item.diem == 'A' ? 'Vắng thi' : item.diem));
    }
    setMode = () => {
        this.setState({ thiSinhMode: '' }, () => this.triggerViewMode.value(false));
    }
    render() {
        let listDiem = this.state.listDiem ? this.state.listDiem : [];
        const hoTen = listDiem.length ? `${listDiem[0].ho} ${listDiem[0].ten}` : '';
        const { idThiSinh, sbd } = this.state;
        const permission = this.getUserPermission('sdhTsKetQuaThi');
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu điểm thi',
            stickyHead: false,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: listDiem.sort((a, b) => a.monThi - b.monThi),
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <TableHead keyCol='maPhach' content='Mã phách' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='sbd' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='hoTen' content='Họ tên' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='maMonThi' content='Mã môn thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead typeSearch='monThi' keyCol='monThi' content='Môn thi' style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='diem' content='Điểm thi' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.maPhach} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.sbd} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={`${item.ho} ${item.ten}`} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.maMonThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={item.monThi} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }} content={
                        <FormTextBox type='number' key={item.id} min={0} max={100} step={true} decimalScale={2} ref={e => this.diem[item.id] = e} style={{ textAlign: 'center' }} readOnly={item.diem == 'A' && permission.write ? true : false} />
                    } />
                </tr>
            )
        });
        return <>
            <ThiSinhMode ref={e => this.thiSinhMode = e} idThiSinh={idThiSinh} sbd={sbd} hoTen={hoTen} isDiemPublic={this.props.isDiemPublic} callBackParent={this.setMode} />
            <div className='tile' style={{ marginBottom: '2' }}>
                <div className='row'>
                    <div className='col-md-3'>
                        <FormSelect ref={e => this.mssv = e} label='Mã số thí sinh' data={SelectAdapter_ThiSinh(this.props.idDot)} onChange={value => this.getData(value)} />
                    </div>
                    <div style={{ display: idThiSinh && hoTen ? 'block' : 'none' }} className='col-md-4'>
                        <FormCheckbox ref={e => this.triggerViewMode = e} label='Góc nhìn thí sinh' onChange={(value) => this.setState({ thiSinhMode: idThiSinh }, () => {
                            value && this.thiSinhMode.show(idThiSinh);
                        })} />
                    </div>
                </div>

                {idThiSinh && table}
                {idThiSinh && <>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' type='button' onClick={() => this.saveData()}>
                            <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                        </button>
                    </div></>}
            </div>
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhDanhSachDiemThiPage, getSdhTsDiemThiThiSinh, createSdhTsDiemThiSinhMp
};
export default connect(mapStateToProps, mapActionsToProps)(NhapDiemThiSinh);
