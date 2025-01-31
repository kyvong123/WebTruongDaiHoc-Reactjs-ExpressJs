import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, TableHead, AdminModal, FormSelect } from 'view/component/AdminPage';
import { getDtDiemConfigAll, cloneDtDiemConfig } from './redux';
import { Tooltip } from '@mui/material';


class CloneModal extends AdminModal {

    onShow = (item) => {
        let { idSemester, namHoc, hocKy } = item;
        this.setState({ idSemester, namHoc, hocKy });
    };

    onSubmit = (e) => {
        e.preventDefault();
        if (this.cloneFrom.value()) {
            let { idSemester, namHoc, hocKy } = this.state;
            let { configQuyChe, configThanhPhan } = this.cloneFrom.data().data;

            T.alert('Đang xử lý', 'warning', false, null, true);
            this.props.clone({ idSemester, namHoc, hocKy, configQuyChe, configThanhPhan }, () => {
                this.hide();
                this.props.history.push({ pathname: `/user/dao-tao/grade-manage/setting/${idSemester}`, state: { namHoc, hocKy, idSemester } });
                T.alert('Đang xử lý', 'warning', false, 1000);
            });
        } else {
            T.notify('Vui lòng chọn cấu hình nguồn', 'danger');
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Sao chép dữ liệu cấu hình điểm',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.cloneFrom = e} label='Chọn cấu hình điểm nguồn' data={this.props.dataClone} required />
            </div>
        });
    }
}


class DtDiemConfigPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDiemConfigAll();
        });
    }

    renderListSemester = (data) => {
        return renderDataTable({
            data,
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='Năm học' style={{ width: '50%' }} />
                <TableHead content='Học kỳ' style={{ width: '50%' }} />
                <TableHead content='Thao tác' style={{ width: 'auto' }} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={index + 1} />
                <TableCell content={item.namHoc} />
                <TableCell content={item.hocKy} />
                <TableCell type='buttons' onEdit={{ pathname: `/user/dao-tao/grade-manage/setting/${item.idSemester}`, state: { namHoc: item.namHoc, hocKy: item.hocKy, idSemester: item.idSemester, diemDat: item.diemDat } }} permission={{ write: false }}>
                    <Tooltip title='Sao chép' arrow>
                        <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.cloneModal.show(item)}>
                            <i className='fa fa-lg fa-clone ' />
                        </a>
                    </Tooltip>
                </TableCell>
            </tr>
        });
    }

    render() {
        let { dtDiemConfig } = this.props || {};

        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-cogs',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Điểm</Link>,
                'Cấu hình'
            ],
            content: <>
                <CloneModal ref={e => this.cloneModal = e} dataClone={dtDiemConfig?.dataClone || []} history={this.props.history} clone={this.props.cloneDtDiemConfig} />
                <div className='tile'>
                    {this.renderListSemester(dtDiemConfig?.items || [])}
                </div>
            </>,
            backRoute: '/user/dao-tao/grade-manage'
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtDiemConfig: state.daoTao.dtDiemConfig });
const mapActionsToProps = { getDtDiemConfigAll, cloneDtDiemConfig };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemConfigPage);