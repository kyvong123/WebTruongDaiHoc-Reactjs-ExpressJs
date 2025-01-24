import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { getNguoiUyQuyen } from './redux/uyQuyen';
import { Img } from 'view/component/HomePage';


class AdminLichUyQuyen extends AdminPage {
    state = { listUyQuyen: [] }

    componentDidMount() {
        this.props.getNguoiUyQuyen(items => this.setState({ listUyQuyen: items }));
    }

    render() {
        const { listUyQuyen } = this.state;
        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-calendar',
            title: 'Quản lịch công tác ủy quyền',
            breadcrumb: [
                <Link key={0} to='/user/van-phong-dien-tu'>Văn phòng điện tử</Link>,
                'Lịch công tác ủy quyền'
            ],
            content: <>
                <div className='row' style={{ gap: 10 }}>
                    {
                        listUyQuyen.map(item => <div key={item.id} className='col-md-3 px-2'>
                            <Link className='treeview-item' to={`/user/vpdt/uy-quyen/lich-cong-tac/${item.shcc}`} style={{ backgroundColor: 'white', height: '10vh', gap: 10 }}>
                                <Img className='app-sidebar__user-avatar' src={item.image} alt='Avatar' style={{ margin: 'auto 0' }} />
                                <div className='d-flex flex-column'>
                                    <h5 className='text-dark'>{item.ho} {item.ten}</h5>
                                    <i className='text-dark'>{item.tenDonVi}</i>
                                </div>
                            </Link>
                        </div>)
                    }
                </div>
            </>,
            backRoute: '/user/van-phong-dien-tu',
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const mapActionsToProps = { getNguoiUyQuyen };
export default connect(mapStateToProps, mapActionsToProps)(AdminLichUyQuyen);