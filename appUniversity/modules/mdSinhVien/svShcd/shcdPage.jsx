import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { getDataCtsvShcd, setShcdDiemDanh, getDataSinhHoatCongDan } from './redux';
import T from 'view/js/common';

class SinhVienShcdPage extends AdminPage {
    componentDidMount() {
        T.ready('/user', () => {
            this.getData();
        });
    }

    getData = () => {
        this.props.getDataSinhHoatCongDan();
    }

    render() {
        const list = this.props.svShcd?.item;
        return this.renderPage({
            title: <span>
                Quản lý sinh hoạt công dân <br />
            </span>,
            icon: 'fa fa-users',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Quản lý sinh hoạt công dân'
            ],
            backRoute: '/user',
            content: <div className='tile'>{renderTable({
                getDataSource: () => list || [],
                renderHead: () => <tr>
                    <th>#</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ whiteSpace: 'nowrap', width: '60%' }}>Khóa sinh viên</th>
                    <th style={{ whiteSpace: 'nowrap', width: '40%' }}>Thời gian</th>
                </tr>,
                renderRow: (item, index) => <tr key={index}>
                    <td>{index + 1}</td>
                    <TableCell type='link' style={{ whiteSpace: 'nowrap', width: '60%' }} url={`/user/student/quan-ly-shcd/${item.id}`} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap', width: '40%' }} content={item.khoaSinhVien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                        <span><b>Từ:  </b>{T.dateToText(item.timeStart, 'dd/mm/yyyy')}</span><br />
                        <span><b>Đến: </b>{T.dateToText(item.timeEnd, 'dd/mm/yyyy')}</span>
                    </>} />
                </tr>
            })}
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, svShcd: state.student.svShcd });
const mapActionsToProps = {
    getDataCtsvShcd, setShcdDiemDanh, getDataSinhHoatCongDan
};
export default connect(mapStateToProps, mapActionsToProps)(SinhVienShcdPage);