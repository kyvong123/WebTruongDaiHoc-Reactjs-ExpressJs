import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import DetailSection from './detailSection';
import ListSection from './listSection';
import { getListNhomTuongDuong, getApDungNhomTuongDuong } from './redux';

class MonTuongDuongPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getListNhomTuongDuong();
            this.props.getApDungNhomTuongDuong();
        });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Môn tương đương',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/graduation'>Xét tốt nghiệp</Link>,
                'Môn tương đương'
            ],
            content: <>
                <FormTabs tabs={[
                    { title: 'Danh sách nhóm môn tương đương', component: <DetailSection /> },
                    { title: 'Danh sách áp dụng', component: <ListSection /> }
                ]} />
            </>,
            backRoute: '/user/dao-tao/graduation',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tuongDuong: state.daoTao.tuongDuong });
const mapActionsToProps = { getListNhomTuongDuong, getApDungNhomTuongDuong };
export default connect(mapStateToProps, mapActionsToProps)(MonTuongDuongPage);