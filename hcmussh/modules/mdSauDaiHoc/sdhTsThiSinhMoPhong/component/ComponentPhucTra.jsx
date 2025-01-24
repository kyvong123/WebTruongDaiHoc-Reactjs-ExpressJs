import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import ThongTinDangKy from 'modules/mdSauDaiHoc/sdhTsThiSinhDangKyPhucTra/section/thongTinDangKy';
import PhieuDangChoXuLy from 'modules/mdSauDaiHoc/sdhTsThiSinhDangKyPhucTra/section/phieuChoXuLy';
import KetQuaXuLy from 'modules/mdSauDaiHoc/sdhTsThiSinhDangKyPhucTra/section/ketQuaDangKy';
import 'modules/mdSauDaiHoc/sdhTsThiSinhDangKyPhucTra/card.scss';
import { getSdhTsDiemThiThiSinh } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import { getSdhTsDotPhucTra, createSdhTsDonPhucTra, getSdhTsDonPhucTra, deleteSdhTsDonPhucTra } from 'modules/mdSauDaiHoc/sdhTsThiSinhDangKyPhucTra/redux';

class ComponentPhucTra extends AdminPage {
    state = { infoDot: {}, listDon: [], listMon: [] };
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        const { id } = this.props.user;
        this.props.getSdhTsDotPhucTra(infoDot =>
            this.props.getSdhTsDiemThiThiSinh(id, listMon =>
                this.props.getSdhTsDonPhucTra(id, listDon =>
                    this.setState({ listMon, infoDot, listChosen: [], listDon })
                )
            )
        );
    }

    render() {
        const { sbd = '', id = '' } = this.props.user;
        return <>
            <div className='timeline-item'>
                <ThongTinDangKy readOnly={true} sbd={sbd} idThiSinh={id} create={this.props.createSdhTsDonPhucTra} listMon={this.state.listMon} infoDot={this.state.infoDot} getData={this.getData} />
            </div>
            <div className='timeline-item'>
                <PhieuDangChoXuLy readOnly={true} idThiSinh={id} delete={this.props.deleteSdhTsDonPhucTra} listDon={this.state.listDon} getData={this.getData} />
            </div>
            <div className="timeline-item">
                <KetQuaXuLy readOnly={true} idThiSinh={id} listDon={this.state.listDon} />
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getSdhTsDiemThiThiSinh, getSdhTsDotPhucTra, createSdhTsDonPhucTra, getSdhTsDonPhucTra, deleteSdhTsDonPhucTra
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentPhucTra);
