import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, renderTable, TableCell, FormTextBox, FormEditor, TableHead, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import { getPageEmailTask, getEmailTask, resendEmailTask, resendEmailListTask } from './redux';
import Pagination from 'view/component/Pagination';
// import { EaseDateRangePicker } from 'view/component/EaseDatePicker';
import { Tooltip } from '@mui/material';

class EmailTaskModal extends AdminModal {
    onShow = (item) => {
        const { id } = item || {};
        getEmailTask(id, item => {
            const { mailSubject, mailFrom, mailTo, mailCc, mailBcc, mailHtml, mailText } = item || {};
            this.setState({ id, item });
            this.mailSubject.value(mailSubject || '');
            this.mailFrom.value(mailFrom || '');
            this.mailTo.value(mailTo || '');
            this.mailCc.value(mailCc?.replaceAll(',', ', ') || '');
            this.mailBcc.value(mailBcc?.replaceAll(',', ', ') || '');
            // this.mailText.value(mailText || '');
            this.mailHtml.value(mailHtml ?? mailText ?? '');
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Chi tiết email',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.mailSubject = e} label='Tiêu đề' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.mailFrom = e} label='Từ' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.mailTo = e} label='Đến' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.mailCc = e} label='CC' readOnly />
                <FormTextBox className='col-md-12' ref={e => this.mailBcc = e} label='BCC' readOnly />
                {/* <FormRichTextBox className='col-md-12' ref={e => this.mailText = e} label='Nội dung' readOnly /> */}
                <FormEditor className='col-md-12' ref={e => this.mailHtml = e} label='Nội dung' readOnly />
            </div>
        });
    }
}

export class EmailTaskPage extends AdminPage {
    filter = {}
    ref = {}
    componentDidMount() {
        T.ready('/user/settings', () => {
            this.getPage();
            T.socket.on('emailTask:done', (data) => {
                if (data.state != 'waiting') this.getPage();
            });
        });

    }

    componentWillUnmount() {
        T.socket.off('emailTask:done');
    }

    getPage = (pageNumber, pageSize, condition, done) => {
        this.props.getPageEmailTask(pageNumber, pageSize, condition, this.filter, done);
    }

    stateMapper = (stateCode) => {
        switch (stateCode) {
            case 'waiting':
                return <span className='font-weight-bold text-secondary'><i className='mr-1 fa fa-clock-o' />Chờ đợi</span>;
            case 'success':
                return <span className='font-weight-bold text-success'><i className='mr-1 fa fa-check' />Thành công</span>;
            case 'error':
                return <span className='font-weight-bold text-danger'><i className='mr-1 fa fa-check' />Thất bại</span>;
        }
    }

    onChangeFilter = (value) => {
        if (value.id == 'all') {
            delete this.filter.state;
        } else {
            this.filter.state = value.id;
        }
        this.getPage();
    }

    resend = (id) => {
        T.confirm('Xác nhận gửi lại mail?', '', isConfirm => isConfirm && this.props.resendEmailTask(id));
    }

    onKeySearch = (keyValue) => {
        const [key, value] = keyValue.split(':');
        this.filter[key] = value;
        this.getPage();
    }

    onChangeTimeRange = ({ timeFrom, timeTo }) => {
        if (isNaN(timeFrom) && isNaN(timeTo)) return;
        const { timeFrom: preFrom, timeTo: preTo } = this.filter;
        timeFrom = timeFrom ?? preFrom;
        timeTo = timeTo ?? preTo;
        Object.assign(this.filter, {
            timeFrom, timeTo,
        });
        this.getPage();
    }

    onCheckAll = (value) => {
        this.props.emailTask?.page?.list?.map(i => console.log(i.id, value) || this.ref[i.id]?.value(value));
    }

    onResend = () => {
        let list = this.props.emailTask?.page?.list?.filter(i => this.ref[i.id]?.value()) || [];
        list = list.map(i => i.id);
        this.props.resendEmailListTask(list);
    }

    render() {
        const { pageNumber, pageSize, pageTotal, list = [] } = this.props.emailTask?.page || {};
        return this.renderPage({
            title: 'Email Task',
            icon: 'fa fa-envelope',
            content: <><div className='tile'><div className='tile-body'>
                <div className='d-flex align-items-end' style={{ gap: 10 }}>
                    <div className='d-flex justify-content-start align-items-baseline' style={{ flex: 1 }}>
                        <FormDatePicker style={{ width: '10rem', marginRight: '1rem' }} ref={e => this.timeFrom = e} label='Bắt đầu' onChange={(value) => this.onChangeTimeRange({ timeFrom: value?.getTime() })} />
                        <FormDatePicker style={{ width: '10rem', marginRight: '1rem' }} ref={e => this.timeTo = e} label='Kết thúc' onChange={(value) => this.onChangeTimeRange({ timeTo: value?.getTime() })} />
                    </div>
                    <button className='btn btn-primary' style={{ marginBottom: '1rem' }} onClick={this.onResend}>
                        <i className='fa fa-undo' /> Gửi lại
                    </button>
                    <Pagination style={{ position: 'unset', width: 'auto', justifyContent: 'end', marginBottom: '1rem' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPage} />
                </div>
                {renderTable({
                    getDataSource: () => [{}],
                    stickyHead: true, header: 'thead-light',
                    renderHead: () => <tr>
                        <th style={{ textAlign: 'center' }} ><FormCheckbox ref={e => this.checkAll = e} onChange={(v) => this.onCheckAll(v)} /></th>
                        <th style={{ textAlign: 'center' }} >ID</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian tạo</th>
                        <TableHead style={{ width: '60%', whiteSpace: 'pre-line' }} content='Tiêu đề' keyCol='subject' onKeySearch={this.onKeySearch} />
                        <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Người gửi' keyCol='mailFrom' onKeySearch={this.onKeySearch} />
                        <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Người nhận' keyCol='mailTo' onKeySearch={this.onKeySearch} />
                        <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} typeSearch='admin-select' content='Tình trạng' data={[
                            { id: 'success', text: 'Thành công' },
                            { id: 'error', text: 'Thất bại' },
                            { id: 'waiting', text: 'Chờ đợi' },
                        ]} keyCol='state' onKeySearch={this.onKeySearch} />
                        {/* <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Trạng thái</th> */}
                        <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>,
                    renderRow: list.map((item) => <tr key={item.id}>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormCheckbox ref={e => this.ref[item.id] = e} />} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.id} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy HH:MM:ss' content={item.createDate} />
                        <TableCell style={{ whiteSpace: 'pre-line' }} content={item.mailSubject} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mailFrom} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mailTo} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={this.stateMapper(item.state)} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} type='buttons' onEdit={() => this.modal.show(item)}>
                            {item.state == 'error' && <Tooltip title='Thử lại'><button className='btn btn-danger' type='button' onClick={() => this.resend(item.id)}><i className='fa fa-refresh' /></button></Tooltip>}
                        </TableCell>
                    </tr>)
                })}</div></div>
                <EmailTaskModal ref={e => this.modal = e} />
            </>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, emailTask: state.framework.emailTask, });
const mapDispatchToProps = { getPageEmailTask, resendEmailTask, resendEmailListTask };
export default connect(mapStateToProps, mapDispatchToProps)(EmailTaskPage);