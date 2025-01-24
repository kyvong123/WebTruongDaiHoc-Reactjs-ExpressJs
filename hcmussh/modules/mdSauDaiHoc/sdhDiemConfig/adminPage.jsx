import React from 'react';
import { connect } from 'react-redux';
import { getSdhDiemConfigAll, getSdhDiemConfigBySemester, cloneSdhDiemConfig } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class CloneModal extends AdminModal {
    onShow = (item) => {
        this.setState({ item: item });
    }
    onSubmit = () => {
        let item = this.state.item,
            semester = { hocKy: item.hocKy, namHoc: item.namHoc };
        if (this.clone.value()) {
            let data = this.clone.data().data;
            if (item.configQuyChe.length || item.configThanhPhan.length) {
                T.confirm('Sao chép cấu hình', 'Học kì hiện tại đã cấu hình. Bạn có muốn ghi đè cấu hình điểm ?', true, isConfirm => {
                    isConfirm ? this.props.clone(semester, data, () => {
                        this.hide();
                        this.props.history.push({ pathname: `/user/sau-dai-hoc/grade-manage/semester/${item.ma}`, state: { ...semester, ma: item.ma } });
                    }) : this.hide();
                });
            }
            else {
                this.props.clone(semester, data, () => {
                    this.hide();
                    this.props.history.push({ pathname: `/user/sau-dai-hoc/grade-manage/semester/${item.ma}`, state: { ...semester, ma: item.ma } });
                });
            }
        }
        else T.notify('Vui lòng chọn cấu hình', 'warning');
    }

    render = () => {
        let data = this.props.data;
        return this.renderModal({
            title: 'Sao chép dữ liệu cấu hình điểm',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.clone = e} label='Chọn cấu hình điểm nguồn' data={data} required />
            </div>
        });

    }
}
class SdhDiemConfig extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhDiemConfigAll();
        });
    }

    render() {
        const permission = this.getUserPermission('sdhDiemConfig');
        let items = this.props.sdhDiemConfig ? this.props.sdhDiemConfig.items : [];
        const table = renderTable({
            getDataSource: () => items,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', textAlign: 'center' }}>Năm học</th>
                    <th style={{ width: '50%' }}>Học kỳ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.namHoc} />
                    <TableCell content={item.hocKy} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={{ pathname: `/user/sau-dai-hoc/grade-manage/semester/${item.ma}`, state: { namHoc: item.namHoc, hocKy: item.hocKy, ma: item.ma } }} >
                        {
                            <Tooltip title='Sao chép' arrow placeholder='bottom' >
                                <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.modal.show(item)}><i className='fa fa-lg fa-clone' /></a>
                            </Tooltip>
                        }
                    </TableCell>

                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Cấu hình điểm',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/quan-ly-diem'>Điểm</Link>,
                'Cấu hình điểm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <CloneModal ref={e => this.modal = e} data={this.props.sdhDiemConfig?.dataClone || []} history={this.props.history} clone={this.props.cloneSdhDiemConfig} />
            </>,
            backRoute: '/user/sau-dai-hoc/quan-ly-diem',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhDiemConfig: state.sdh.sdhDiemConfig });
const mapActionsToProps = { getSdhDiemConfigAll, getSdhDiemConfigBySemester, cloneSdhDiemConfig };
export default connect(mapStateToProps, mapActionsToProps)(SdhDiemConfig);