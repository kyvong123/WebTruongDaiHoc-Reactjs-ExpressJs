import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import './home.scss';
import { confirmDangKy } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';


class BieuMauTuyenSinhSdhPage extends AdminPage {
    state = { cbhds: [], htmlCbhd: [], baiBaos: [], idDot: '', phanHe: '', hinhThuc: '', idPhanHe: '', isNotVn: false, title: '', data: { chungChiNgoaiNgu: [], baiBao: [], deTai: [] }, thacSi: false, ttBieuMau: {}, dataBieuMau: {}, nganh: '' }

    componentDidMount() {
        const { maTruyXuat } = T.getUrlParams();
        this.props.confirmDangKy(maTruyXuat, () => {
            this.props.history.push('/user');
        });
    }
    render() {
        return null;
    }
}

const mapStateToProps = state => ({ system: state.system, svTsSdh: state.sdh.svTsSdh });
const mapActionsToProps = {
    confirmDangKy
};
export default connect(mapStateToProps, mapActionsToProps)(BieuMauTuyenSinhSdhPage);
