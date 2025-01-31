import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { renderTable, TableCell, AdminModal } from 'view/component/AdminPage';
import { createSession } from '../redux';

class CreateSession extends AdminModal {
    onShow = (list) => {
        this.setState({ list, isLoading: false });
    }

    onSubmit = () => {
        const fileList = this.state.list.map(item => item.id);
        this.setState({ isLoading: true }, () => {
            this.props.createSession({ fileList, signType: 'KY_XAC_THUC' }, this.hide, () => this.setState({ isLoading: false }));
        });
    }

    render = () => {
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu văn bản đi',
            getDataSource: () => this.state.list,
            stickyHead: true,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            style: { maxHeight: '70vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                    <th style={{ width: '20%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tên văn bản</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Số văn bản</th>
                    <th style={{ width: '80%', verticalAlign: 'middle' }}>Trích yếu</th>
                </tr>),
            renderRow: (item) => {
                return (
                    <tr key={item.R} >
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.R} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.ten} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`${this.props.baseUrl}/${item.id}`} target='_blank' rel='noreferrer noopener'>{item.soVanBan || 'Chưa có số văn bản'} </Link>} />
                        <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ width: '100%', minWidth: '250px' }} content={item.trichYeu || ''} />
                    </tr>
                );
            }
        });

        return this.renderModal({
            size: 'elarge',
            title: 'Tạo session ký',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        });
    }
}


const stateToProps = state => ({ system: state.system });
const actionsToProps = { createSession };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(CreateSession);
