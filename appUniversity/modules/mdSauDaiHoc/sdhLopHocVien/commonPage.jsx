import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getLopCommonPage } from './redux';
import CreateClassModal from './createClassModal';
import { Tooltip } from '@mui/material';

class CommonPageSdh extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getLopCommonPage(1, 50);
        });
    }
    render() {
        const permission = this.getUserPermission('sdhLopHocVien');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list = [] } = this.props.sdhLopHocVien && this.props.sdhLopHocVien.commonPage ? this.props.sdhLopHocVien.commonPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: list && list.length > 10,
            header: 'thead-light',
            getDataSource: () => list,
            renderHead: () => <tr>
                <th style={{ width: 'auto' }}>STT</th>
                <th style={{ width: '50%' }}>Khoá sinh viên</th>
                <th style={{ width: '50%' }}>Hệ đào tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                <TableCell content={item.khoaSinhVien} />
                <TableCell content={item.heDaoTao} />
                <TableCell permission={permission}
                    content={
                        <Tooltip title='Chỉnh sửa' arrow placeholder='bottom'>
                            <Link to={`/user/sau-dai-hoc/lop/item?khoa=${item.khoaSinhVien}&heDaoTao=${item.ma}`} className='btn btn-primary' target='_blank'><i className='fa fa-lg fa-edit' /></Link>
                        </Tooltip>
                    }
                />
            </tr>
        });
        return this.renderPage({
            subTitle: 'Danh sách các khoá theo hệ',
            title: 'Lớp sinh viên',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>
                    Sau đại học
                </Link>,
                'Lớp sinh viên',
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getCtsvLopCommonPage} />
                <CreateClassModal ref={e => this.modal = e} />
            </>,
            backRoute: '/user/sau-dai-hoc',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, type: 'warning', name: 'Tạo mới', onClick: () => this.modal.show() },
                // { icon: 'fa-upload', permission: permission.write, type: 'light', name: 'Tải lên', onClick: () => this.importModal.show() },
                // { icon: 'fa-arrow-left', type: 'secondary', permission: permission.write, name: 'Quay lại', onClick: () => this.props.history.push('/user/dao-tao') }
            ]
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, sdhLopHocVien: state.sdh.sdhLopHocVien });
const mapActionsToProps = {
    getLopCommonPage
};
export default connect(mapStateToProps, mapActionsToProps)(CommonPageSdh);