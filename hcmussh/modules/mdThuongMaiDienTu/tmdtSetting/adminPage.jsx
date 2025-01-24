import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getAllTmdtSetting } from './redux';
import SpConfigSection from './section/SpConfigSection';

class TmdtSetting extends AdminPage {
    componentDidMount() {
        T.ready('/user/tmdt', () => {
            this.props.getAllTmdtSetting(items => {
                this.configSchedule.setValue(items);
            });
        });
    }

    render() {
        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-sliders',
            breadcrumb: [
                <Link key={0} to='/user/tmdt/y-shop'>Y-Shop</Link>,
                'Cấu hình'
            ],
            backRoute: '/user/tmdt/y-shop',
            content: <div className='row'>
                <div className='col-md-4'>
                    <div className='row'><div className='col'>
                        <SpConfigSection ref={e => this.configSchedule = e} />
                    </div></div>
                </div>
            </div>,
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getAllTmdtSetting };
export default connect(mapStateToProps, mapActionsToProps)(TmdtSetting);