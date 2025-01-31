import React from 'react';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getNamHocHocKy, cloneNhom } from './redux';
import { Tooltip } from '@mui/material';
import { CloneNhom } from './modal/CloneNhomModal';

export class TcNhom extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/finance', () => {
            this.props.getNamHocHocKy(this.initData);
        });
    }
    initData = (result) => {
        this.setState({ data: result.item.rows });
    }
    render() {

        let table = renderTable({
            getDataSource: () => this.state.data,
            stickyHead: true,
            //header: 'thead-light',
            renderHead: () => (<tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm học</th>
                <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Học kỳ</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => {

                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namHoc} />
                        <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.hocKy} />
                        <TableCell type='buttons' onEdit={() => this.props.history.push(`/user/finance/nhom/${item.namHoc}/${item.hocKy}`)} permission={{}} >
                            <Tooltip title='Sao chép nhóm ngành' arrow>
                                <button className='btn btn-success' onClick={e => e.preventDefault() || this.cloneNhomModal.show(item)}><i className='fa fa-clone' /></button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            }
        });
        return this.renderPage({
            title: 'Nhóm ngành',
            icon: 'fa fa-object-group',
            breadcrumb: ['Năm học'],
            content: <div class='row'>
                <div className='col-md-12' style={{ flex: 1 }}>
                    <div className='tile'>
                        {table}
                    </div>
                </div>
                <CloneNhom ref={e => this.cloneNhomModal = e} cloneNhom={this.props.cloneNhom} />
            </div>,
        });
    }
}

// Chi tiet theo NamHocHocKy


const mapStateToProps = state => ({ system: state.system, tcNhom: state.finance.tcNhom });
const mapActionsToProps = { getNamHocHocKy, cloneNhom };
export default connect(mapStateToProps, mapActionsToProps)(TcNhom);
