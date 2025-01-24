import React from 'react';
import { connect } from 'react-redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, getValue } from 'view/component/AdminPage';
import { getExecuteTaskPage, executeTaskGetTool, executeTaskRunTool } from './redux';
import { Tooltip } from '@mui/material';


class AddModal extends AdminModal {
    state = { fileNames: [] }

    componentDidMount() {
        this.onHidden(() => {
            this.tool.value('');
        });
    }

    onShow = () => {
        this.props.executeTaskGetTool(fileNames => this.setState({ fileNames }));
    }

    onSubmit = () => {
        const toolName = getValue(this.tool);
        this.props.executeTaskRunTool(toolName, this.hide);
    }

    render = () => {
        return this.renderModal({
            title: 'Select Tool',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.tool = e} data={this.state.fileNames} label='Tool' required />
            </div>
        });
    }
}

class UserPage extends AdminPage {
    state = { page: {} }

    mapperStatus = {
        '0': <><span className='text-primary font-weight-bold'><i className='fa fa-gears' /> Đang thực thi</span></>,
        '1': <><span className='text-success font-weight-bold'><i className='fa fa-check-square-o' /> Thực thi thành công</span></>,
        '2': <><span className='text-info font-weight-bold'><i className='fa fa-floppy-o' /> Hoàn tất lưu kết quả</span></>,
        '3': <><span className='text-info font-weight-bold'><i className='fa fa-floppy-o text-danger' /> Lưu kết quả và có lỗi</span></>,
        '-1': <><span className='text-danger font-weight-bold'><i className='fa fa-exclamation-triangle' /> Lỗi thực thi</span></>,
    }

    componentDidMount() {
        T.ready('/user/settings', () => {
            this.props.getExecuteTaskPage(1, 50, page => this.setState({ page }));
        });
    }

    getPage = (pageN, pageS) => {
        this.props.getExecuteTaskPage(pageN, pageS, page => this.setState({ page }));
    }

    render() {
        const { pageNumber, pageSize, list, pageTotal, totalItem } = this.state.page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            emptyTable: 'Chưa có dữ liệu hướng dẫn sử dụng',
            getDataSource: () => list,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }} >#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >ID Task</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Time request</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Time done</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Requester</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }} >Taskname</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Task</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Status</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Error</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.id} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.timeRequest, 'HH:MM dd/mm/yy')} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.timeDone, 'HH:MM dd/mm/yy')} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.requester} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.taskName} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.task} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={this.mapperStatus[item.status]} />
                        <TableCell type='text' content={item.errorMsg} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item}>
                            <Tooltip title='Tải dữ liệu gốc' arrow>
                                <button className='btn btn-warning' onClick={(e) => e.preventDefault() || T.download(`/api/execute-task/download-export?id=${item.id}&&folder=dataTask`, `dataTask_${item.id}.json`)}>
                                    <i className='fa fa-lg fa-file' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Tải dữ liệu kết quả' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || T.download(`/api/execute-task/download-export?id=${item.id}&&folder=resultTask`, `resultTask_${item.id}.json`)}>
                                    <i className='fa fa-lg fa-file-o' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            }
        });

        return this.renderPage({
            title: 'ExecuteTask',
            icon: 'fa fa-history',
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                <AddModal ref={e => this.modal = e} executeTaskGetTool={this.props.executeTaskGetTool} executeTaskRunTool={this.props.executeTaskRunTool} />
            </>,
            backRoute: '/user/settings',
            onCreate: e => e && e.preventDefault() || this.modal.show(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getExecuteTaskPage, executeTaskGetTool, executeTaskRunTool };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
