import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getGiangVienHdEdit
} from './redux';
import CaNhanGiangVienHd from './detailPage';
import { AdminPage, CirclePageButton } from 'view/component/AdminPage';
import ComponentDetai from './componentDetai';
import Loading from 'view/component/Loading';
class GiangVienHdPage extends AdminPage {
    state = { shcc: null, load: true }
    componentDidMount() {
        T.hideSearchBox();
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/giang-vien-huong-dan/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.props.getGiangVienHdEdit(shcc, data => {
                this.setState({ shcc });
                if (data.error) {
                    T.notify('Lấy thông tin giảng viên bị lỗi!', 'danger');
                }
                else {
                    this.setState({ sdhDmGiangVienHd: data.item });
                    this.setUp(data.item);
                }
            });
        });
    }
    setUp = (item) => {
        this.componentCaNhan?.value(item);
        this.setState({ load: false });
    }


    render() {
        const permission = this.getUserPermission('sdhDmGiangVienHd');
        return this.renderPage({
            icon: 'fa fa-address-card-o',
            title: 'Hồ sơ giảng viên hướng dẫn',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/giang-vien-huong-dan'>Giảng viên hướng dẫn</Link>,
                'Hồ sơ giảng viên hướng dẫn',
            ],
            content: <>
                {this.state.load && <Loading />}
                <CaNhanGiangVienHd ref={e => this.componentCaNhan = e} readOnly={!permission.write} shcc={this.state.shcc} />
                <ComponentDetai readOnly={!permission.write} />
                {permission.write && <CirclePageButton type='custom' tooltip='Lưu thay đổi' customIcon='fa-save' customClassName='btn-success' style={{ marginRight: '5px' }} />}
            </>,
            backRoute: '/user/sau-dai-hoc/giang-vien-huong-dan',
        });
    }

}

const mapStateToProps = state => ({ system: state.system, sdhDmGiangVienHd: state.sdh.sdhDmGiangVienHd });
const mapActionsToProps = {
    getGiangVienHdEdit
};
export default connect(mapStateToProps, mapActionsToProps)(GiangVienHdPage);