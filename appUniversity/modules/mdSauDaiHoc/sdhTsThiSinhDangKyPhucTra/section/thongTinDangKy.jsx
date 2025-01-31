import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell } from 'view/component/AdminPage';

class ThongTinDangKy extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { listChosen: [] };

    onSave() {
        const { infoDot, idThiSinh } = this.props;
        const listChosen = this.state.listChosen;
        if (idThiSinh) {
            const data = {
                idDotPhucTra: infoDot.id,
                idThiSinh,
                listMon: listChosen,
                tinhTrang: 1,  //1: chờ xử lý, 2: đang xử lý, 3: đã xử lý, 4: từ chối
            };
            this.props.create(data, () => this.props.getData());
            this.setState({ listChosen: [] });
        } else {
            return T.notify('Xin vui lòng đăng nhập lại hệ thống', 'danger');
        }

    }
    render() {
        const { listMon, infoDot } = this.props;
        const listChosen = this.state.listChosen;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu điểm thi',
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            stickyHead: false,
            data: listMon.length ? listMon.sort((a, b) => a.phucTra - b.phucTra) : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Môn thi</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Cơ sở</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Phòng thi</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Ngày thi</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Điểm thi</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell key={item.id} type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.map(i => i.id).includes(item.id)} onChanged={(value) => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.id != item.id) })} permission={{ write: !infoDot || item.phucTra == 1 || !item.diem ? false : true }} readOnly={this.props.readOnly} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.monThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.coSo} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phongThi} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayThi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.diem} />
                </tr>
            )
        });
        return <>
            <div className='tile' >
                <h5>1. Nhập thông tin đăng ký</h5>
                <div className='row'>
                    {infoDot ? <>
                        <div className='col-md-3' style={{ textAlign: 'right' }} ><strong>Đợt phúc tra</strong></div>
                        <div className='col-md-9' >{infoDot?.tenDot}</div>
                        <div className='col-md-3' style={{ textAlign: 'right' }} ><strong>Mã đợt</strong></div>
                        <div className='col-md-9' >{infoDot?.maDot}</div>
                        <div className='col-md-3' style={{ textAlign: 'right' }}><strong>Thời gian đăng ký</strong></div>
                        <div className='col-md-9' style={{ color: 'green' }} >{T.dateToText(infoDot?.startDate, 'dd/mm/yyyy HH:MM') + ' - ' + T.dateToText(infoDot?.endDate, 'dd/mm/yyyy HH:MM')}</div>
                    </> : <div className='col-md-3' style={{ textAlign: 'left', color: 'red', margin: '3px' }} ><strong>Không có đợt phúc tra đang mở</strong></div>}
                </div>
                {table}
                <div style={{ display: this.state.listChosen.length ? 'block' : 'none' }}>
                    <button className='btn btn-success' type='button' onClick={() => this.onSave()} disabled={this.props.readOnly}>
                        <i className='fa fa-paper-plane'></i>Đăng ký
                    </button>
                </div>
            </div>
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps)(ThongTinDangKy);
