import React from 'react';
import { AdminPage } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { UrlItem } from './AdminHeader';
import { getLatestExecuteTask } from 'modules/_default/fwExecuteTask/redux';
class ExecuteTaskItem extends AdminPage {
    componentDidMount() {
        this.getLastest();
        T.socket.on('execute-task-start', (email, taskName) => {
            if (this.props.system.user && this.props.system.user.email == email) {
                this.getLastest(() => {
                    T.notify(`Bắt đầu thực thi tiến trình: ${taskName}`, 'info');
                    // $('#execTaskLastest').show();
                });
            }
        });
        T.socket.on('execute-task-done', (email, data) => {
            if (this.props.system.user && this.props.system.user.email == email) {
                this.getLastest(() => {
                    T.notify(`Tiến trình ${data.taskName} đã ${data.error ? 'có lỗi!' : 'hoàn thành!'}`, data.error ? 'danger' : 'success');
                    // $('#execTaskLastest').show();
                });
            }
        });
    }

    willUnmount() {
        T.socket.on('execute-task-start');
        T.socket.off('execute-task-done');
    }

    getLastest = (done) => {
        this.props.getLatestExecuteTask(done);
    }

    handleOnClick = (e, item) => {
        e => e.preventDefault();
        let customUrlParam = item.customUrlParam ? JSON.parse(item.customUrlParam) : {};
        const query = `taskId=${item.id}` + Object.keys(customUrlParam).map(key => `&&${key}=${customUrlParam[key]}`).join();
        if (item.path) {
            switch (item.status) {
                case 3:
                    T.handleDownload(`/api/execute-task/export/item/${item.id}`);
                    break;
                case 2:
                    if (item.isExport) {
                        T.alert('Dữ liệu đã được tải xuống', 'info', true);
                    } else {
                        T.alert('Tiến trình đã được lưu vào cơ sở dữ liệu', 'info', true);
                    }
                    break;
                case 1:
                    if (item.isExport) {
                        T.handleDownload(`/api/execute-task/export/item/${item.id}`);
                    } else {
                        window.open(`${item.path}?${query}`, '_blank');
                    }
                    break;
                case -1:
                    T.alert('Có lỗi thực thi tiến trình', 'error', true);
                    break;
                case 0:
                    T.alert('Tiến trình đang thực thi! Vui lòng chờ hoàn thành để truy cập.', 'warning', true);
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        const execTaskList = this.props.execTask && this.props.execTask.items ? this.props.execTask.items : [];
        const execTaskListLength = execTaskList.length;
        const element = execTaskList.map((item, index) => {
            let status = '', icon = '';
            switch (item.status) {
                case 3:
                    status = <>
                        <span className='text-info font-weight-bold'>Lưu kết quả và có lỗi</span>
                        <div className='text-secondary font-weight-bold'>Click để tải file lỗi</div>
                    </>;
                    icon = <i className='fa fa-floppy-o fa-stack-2x fa-inverse text-danger' />;
                    break;
                case 2:
                    if (item.isExport) {
                        status = <><span className='text-info font-weight-bold'>Hoàn tất tải xuống dữ liệu</span></>;
                        icon = <i className='fa fa-download fa-stack-2x fa-inverse text-info' />;
                    } else {
                        status = <><span className='text-info font-weight-bold'>Hoàn tất lưu kết quả</span></>;
                        icon = <i className='fa fa-floppy-o fa-stack-2x fa-inverse text-info' />;
                    }
                    break;
                case 1:
                    status = <><span className='text-success font-weight-bold'>Thực thi thành công</span></>;
                    icon = <i className='fa fa-check-square-o fa-stack-2x fa-inverse text-success' />;
                    break;
                case -1:
                    status = <><span className='text-danger font-weight-bold'>Lỗi thực thi</span>: <span>{item.errorMsg}</span></>;
                    icon = <i className='fa fa-exclamation-triangle fa-stack-2x fa-inverse text-danger' />;
                    break;
                default:
                    status = <><span className='text-primary font-weight-bold'>Đang thực thi</span></>;
                    icon = <i className='fa fa-gears fa-stack-2x fa-inverse text-primary' />;
                    break;
            }
            return (
                <li key={index}>
                    <UrlItem onClick={e => this.handleOnClick(e, item)}>
                        <span className='app-notification__icon' style={{ display: 'flex', alignItems: 'center' }}>
                            <span className='fa-stack fa-lg'>
                                {icon}
                            </span>
                        </span>
                        <div>
                            <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.taskName}</p>
                            {status}
                            <p className='app-notification__meta'>Bắt đầu: {T.dateToText(item.timeRequest, 'HH:MM dd/mm/yy')}</p>
                            {item.timeDone && <p className='app-notification__meta' style={{}}>Thời gian thực thi: {T.fmtMSS(parseInt((item.timeDone - item.timeRequest) / 1000))}</p>}
                        </div>
                    </UrlItem>
                </li>
            );
        });

        return (
            execTaskListLength ? <li className='dropdown'>
                <a id='menu' className='app-nav__item' href='#' data-toggle='dropdown'>
                    <i className='fa fa-history fa-lg' />
                    {execTaskListLength ? <span className='badge badge-pill badge-danger' style={{ position: 'absolute', top: '6px', right: execTaskListLength >= 10 ? '-8px' : '-2px', fontSize: '87%' }}>{execTaskListLength || 0}</span> : ''}
                </a>
                <ul id='execTaskLastest' className='app-notification dropdown-menu dropdown-menu-right' style={{ top: '10px' }}>
                    {!execTaskListLength && <li className='app-notification__title'>Không có tiến trình mới!</li>}
                    <div className='app-notification__content'>
                        {element}
                    </div>
                </ul>
            </li> : ''
        );
    }
}


export default connect(state => ({ system: state.system, execTask: state.framework.execTask }), {
    getLatestExecuteTask
})(ExecuteTaskItem);
