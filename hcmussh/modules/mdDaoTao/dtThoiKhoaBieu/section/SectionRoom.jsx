import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableHead, TableCell, renderDataTable } from 'view/component/AdminPage';
import { GetAllDmPhongInCoSo } from 'modules/mdDanhMuc/dmPhong/redux';
import { dtThoiKhoaBieuGenRoom } from '../redux';
class SectionRoom extends AdminPage {
    state = { isWaitingGenRoom: false }

    setVal = () => {
        let config = this.props.dtThoiKhoaBieu.config;
        this.props.GetAllDmPhongInCoSo(config.coSo, danhSachPhong =>
            this.setState({
                danhSachPhong: danhSachPhong.map(item => ({ ...item, isGen: true })),
                danhSachRender: danhSachPhong.map(item => ({ ...item, isGen: true })),
            }));
    }

    onKeySearch = (data) => {
        let dataCurrent = this.state.danhSachPhong;
        let listPhong = dataCurrent.filter(item => item.ten.toLowerCase().includes(data.split(':')[1].toLowerCase()));
        this.setState({ danhSachRender: listPhong });
    }

    genListRoomOfBuilding = () => renderDataTable({
        data: this.state.danhSachRender || [],
        stickyHead: true,
        header: 'thead-light',
        renderHead: () => <tr>
            <TableHead style={{ width: '30%', whiteSpace: 'nowrap' }} content='Cơ sở' keyCol='coSo' />
            <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Phòng' keyCol='phong' onKeySearch={this.onKeySearch} />
            <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'right' }}>Sức chứa</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chọn</th>
        </tr>,
        renderRow: (item, index) => <tr key={index}>
            <TableCell content={item.tenCoSo} nowrap />
            <TableCell content={item.ten} nowrap />
            <TableCell type='number' content={parseInt(item.sucChua)} nowrap />
            <TableCell type='checkbox' content={item.isGen} permission={{ write: true }} onChanged={value => this.handleToggleRoom(item.ten, value)} />
        </tr>
    })

    handleToggleRoom = (ten, value) => {
        let currentStateRoom = [...this.state.danhSachPhong], curRender = [...this.state.danhSachRender];
        currentStateRoom.forEach(item => {
            if (item.ten == ten) item.isGen = value;
        });
        curRender.forEach(item => {
            if (item.ten == ten) item.isGen = value;
        });
        this.setState({ danhSachPhong: currentStateRoom, danhSachRender: curRender });
    }

    handleGenRoom = () => {
        this.setState({ isWaitingGenRoom: true });
        let listRoom = this.state.danhSachPhong.filter(item => item.isGen == 1).map(item => ({ ten: item.ten, sucChua: item.sucChua }));
        let listRoomNotGen = this.state.danhSachPhong.filter(item => item.isGen == 0).map(item => ({ ten: item.ten, sucChua: item.sucChua }));

        this.props.dtThoiKhoaBieuGenRoom({
            listData: this.props.dtThoiKhoaBieu.dataCanGen.filter(item => item.xepPhong == 1),
            config: this.props.dtThoiKhoaBieu.config,
            listRoom, listRoomNotGen,
        }, () => this.setState({ isWaitingGenRoom: false }),
            () => {
                this.setState({ isWaitingGenRoom: false });
            });
    }
    render() {
        const { isWaitingGenRoom } = this.state;
        return (<section id='configRoom'>
            <div className='tile'>
                <div className='tile-title'>
                    <h4>Bước 5: Cấu hình phòng học.</h4>
                    <div style={{ fontSize: '0.8rem' }}>
                        <i>- Hệ thống mặc định xếp vào các phòng của cơ sở đã chọn. Nếu</i><br />
                        <i>Nếu không chọn tiết nào hoặc khoa/bộ môn nào, hệ thống sẽ mặc định là tất cả.</i>
                    </div>
                    <button className='btn btn-outline-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.handleGenRoom} disabled={isWaitingGenRoom} >
                        {isWaitingGenRoom ? 'Loading' : 'Xếp phòng'} <i className={isWaitingGenRoom ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                    </button>
                </div>
                <div className='tile-body'>
                    {this.genListRoomOfBuilding()}
                </div>
            </div>
        </section>
        );
    }
}


const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = {
    GetAllDmPhongInCoSo, dtThoiKhoaBieuGenRoom
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionRoom);