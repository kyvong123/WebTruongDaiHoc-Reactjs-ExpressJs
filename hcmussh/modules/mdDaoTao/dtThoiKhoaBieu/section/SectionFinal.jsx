import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { updateDtThoiKhoaBieuGenData } from '../redux';
class SectionFinal extends AdminPage {
    state = { dataReturn: [] }

    setValue = ({ dataReturn, status }, done) => {
        this.setState({ dataReturn, status }, () => done && done());
    }

    updateGenData = () => {
        let { config } = this.props.dtThoiKhoaBieu, { dataReturn } = this.state;
        this.setState({ isWaitingUpdate: true });
        const data = dataReturn.filter(i => !i.isTrung);
        if (data.length) {
            T.alert('Vui lòng chờ trong giây lát!', 'warning', false, null, true);
            this.props.updateDtThoiKhoaBieuGenData(data, config, () => {
                this.setState({ isWaitingUpdate: false, genSuccess: true });
            });
        } else {
            T.notify('Chưa có học phần!', 'danger');
        }
    }

    handleCheck = (item, list) => {
        item.isTrung = !item.isTrung;
        this.setState({ dataReturn: list });
    }

    genResultRoom = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: data && data.length > 10,
        emptyTable: 'Không có',
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chọn</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Số tiết</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết thúc</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Sức chứa</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
        </tr>,
        renderRow: (item, index) => {
            return (<tr key={item.id} style={{ backgroundColor: item.ghiChu ? '#ffcccb' : '#ffffff' }}>
                <TableCell content={index + 1} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={!item.isTrung} permission={{ write: item.ghiChu != '' }} onChanged={() => this.handleCheck(item, data)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell type='number' content={parseInt(item.soTietLyThuyet) + parseInt(item.soTietThucHanh)} />
                <TableCell type='number' content={item.thu == 8 ? 'CN' : item.thu} />
                <TableCell type='number' content={item.tietBatDau} />
                <TableCell type='number' content={item.soTietBuoi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayBatDau)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayKetThuc)} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                <TableCell type='number' content={item.sucChua ? parseInt(item.sucChua) : ''} />
                <TableCell type='number' content={item.soLuongDuKien} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} />
            </tr>);
        }
    })

    render() {
        const { genSuccess, isWaitingUpdate, status, dataReturn } = this.state;
        if (dataReturn.length) {
            dataReturn.sort((a, b) => a.thu < b.thu ? -1 : 0);
        }
        return <section id='resultRoom'>
            <div className='tile'>
                <div className='tile-title'>
                    <h4>Kết quả tự động xếp phòng học, lịch học</h4>
                    {status == 'genDone' ? (genSuccess ?
                        <button className='btn btn-success' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={e => e.preventDefault() || this.props.history.push('/user/dao-tao/thoi-khoa-bieu')}>
                            Hoàn tất <i className='fa fa-lg fa-check' />
                        </button> : <button className='btn btn-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.updateGenData} disabled={isWaitingUpdate}>
                            {isWaitingUpdate ? 'Loading' : 'Lưu thay đổi'}&nbsp;<i className={isWaitingUpdate ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-save'} />
                        </button>) : ''}
                </div>
                <div className='tile-body'>
                    <div className='mb-3'>
                        <label>Danh sách các học phần không tìm thấy phòng phù hợp</label><br />
                        {this.genResultRoom(dataReturn.filter(item => item.isTheChat == 0 && item.phong == ''))}
                    </div>
                    <div className='mb-3'>
                        <label>Danh sách các học phần đã xếp</label><br />
                        {this.genResultRoom(dataReturn.filter(item => {
                            if (item.isTheChat == 1) {
                                return true;
                            } else {
                                return item.phong != '';
                            }
                        }))}
                    </div>
                </div>
            </div>
        </section>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    updateDtThoiKhoaBieuGenData
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionFinal);