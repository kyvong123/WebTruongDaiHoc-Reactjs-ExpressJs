import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderDataTable, FormTabs, TableHead } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getData } from './redux';

class QuanLyRedis extends AdminPage {

    state = { data: {}, dataFull: {} }

    allKeys = ['CTDT:*|*', 'DOT:*', 'settingTKB', 'settingDiem', 'semester', 'listMonHoc',
        'DIEM:*', 'SiSo:*|*', 'SLDK:*|*', 'infoHocPhan:*|*', 'dataMaHocPhan|*'];

    componentDidMount() {
        this.props.getData(data => this.setState({
            data: data.data,
            dataFull: data.data,
        }));
    }

    render() {
        let tabs = [];

        let table = (list, key) => renderDataTable({
            data: list || [],
            stickyHead: list?.length > 20,
            header: 'thead-light',
            divStyle: { 'height': '75vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <TableHead style={{ width: '30%' }} content='Key' keyCol='key' onKeySearch={data => {
                        let dataFull = Object.assign({}, this.state.dataFull);
                        let dataRet = Object.assign({}, this.state.data);
                        dataRet[key] = dataFull[key].filter(item => item.key.toLowerCase().includes(data.split(':')[1].toLowerCase()));
                        this.setState({ data: dataRet });
                    }} />
                    <th content='Value' style={{ width: '70%' }}>Value</th>
                </tr>),
            renderRow: (item, index) => {
                return (
                    <tr key={index} >
                        <TableCell style={{ width: 'auto' }} content={index + 1} />
                        <TableCell style={{ width: 'auto' }} content={item.key} />
                        <TableCell style={{ width: 'auto' }} content={item.value} />
                    </tr >
                );
            }
        });

        for (let key of this.allKeys) {
            tabs.push({
                title: key,
                component: <>{table(this.state.data[key], key)}</>,
            });
        }

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Quản lý redis',
            content: <div className='tile'>
                <FormTabs tabs={tabs} />
            </div>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý redis'
            ],
            backRoute: '/user/dao-tao/edu-schedule'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, });
const mapActionsToProps = { getData };
export default connect(mapStateToProps, mapActionsToProps)(QuanLyRedis);
