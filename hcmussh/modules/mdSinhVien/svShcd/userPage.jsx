import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getDataSvShcd, setSvShcdDiemDanh } from './redux';
import LichShcd from 'modules/mdCongTacSinhVien/ctsvShcd/components/LichShcd';
import T from 'view/js/common';

class SinhVienShcdPage extends AdminPage {
    componentDidMount() {
        T.ready('/user', () => {
            this.getData();
        });
    }

    getData = () => {
        this.props.getDataSvShcd(this.props.system?.user?.mssv);
    }

    render() {
        const permission = this.getUserPermission('student');
        return this.renderPage({
            title: <span>
                Sinh hoạt công dân <br />
            </span>,
            icon: 'fa fa-users',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Sinh hoạt công dân'
            ],
            backRoute: '/user',
            content: <>
                <div className='row'>
                    <div className='col-md-12'>
                        <LichShcd getData={this.getData} setShcdDiemDanh={this.props.setSvShcdDiemDanh} permission={permission} />
                    </div>
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svShcd: state.student.svShcd });
const mapActionsToProps = {
    getDataSvShcd, setSvShcdDiemDanh
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienShcdPage);