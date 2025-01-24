import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import ThongTinDangKy from './section/thongTinDangKy';
import PhieuDangChoXuLy from './section/phieuChoXuLy';
import KetQuaXuLy from './section/ketQuaDangKy';
import './card.scss';
import { getSdhTsDiemThiThiSinh } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import { getSdhTsDotPhucTra, createSdhTsDonPhucTra, getSdhTsDonPhucTra, deleteSdhTsDonPhucTra } from 'modules/mdSauDaiHoc/sdhTsThiSinhDangKyPhucTra/redux';

class DangKyPhucTraPage extends AdminPage {
    state = { infoDot: {}, listDon: [], listMon: [] };
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        const { sbd, idThiSinh } = this.props.system.user;
        this.props.getSdhTsDotPhucTra(infoDot =>
            this.props.getSdhTsDiemThiThiSinh(sbd, listMon =>
                this.props.getSdhTsDonPhucTra(idThiSinh, listDon =>
                    this.setState({ listMon, infoDot, listChosen: [], listDon })
                )
            )
        );
    }

    render() {
        const { sbd = '', idThiSinh = '' } = this.props.system.user;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Đăng ký phúc tra',
            breadcrumb: [
                'Đăng ký phúc tra'
            ],
            content: <>
                <div className='timeline-item'>
                    <ThongTinDangKy sbd={sbd} idThiSinh={idThiSinh} create={this.props.createSdhTsDonPhucTra} listMon={this.state.listMon} infoDot={this.state.infoDot} getData={this.getData} />
                </div>
                <div className='timeline-item'>
                    <PhieuDangChoXuLy idThiSinh={idThiSinh} delete={this.props.deleteSdhTsDonPhucTra} listDon={this.state.listDon} getData={this.getData} />
                </div>
                <div className="timeline-item">
                    <KetQuaXuLy idThiSinh={idThiSinh} listDon={this.state.listDon} />
                </div>
            </>,
            backRoute: '/user',
        });

    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsDiemThiThiSinh, getSdhTsDotPhucTra, createSdhTsDonPhucTra, getSdhTsDonPhucTra, deleteSdhTsDonPhucTra
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DangKyPhucTraPage);
