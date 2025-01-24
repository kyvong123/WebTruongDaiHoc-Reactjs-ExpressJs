import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormSelect, FormTabs } from 'view/component/AdminPage';
import EditModal from './editModal';
import { getAllSvDmFormType, updateSvDmFormType } from './redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import CreateMultipleModal from './createMultipleModal';

class AdminFormTypePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            let namHoc = T.cookie('svDmFormType:CurYear');
            if (!namHoc) {
                let year = new Date().getFullYear();
                T.cookie('svDmFormType:CurYear', `${year} - ${year + 1}`);
            }
            this.initValue();
        });
    }

    initValue = (namHoc) => {
        if (!namHoc) namHoc = T.cookie('svDmFormType:CurYear');
        this.namHoc.value(namHoc);
        this.props.getAllSvDmFormType(namHoc, () => T.cookie('svDmFormType:CurYear', namHoc));
    }

    quyetDinhTabs = () => <FormTabs
        tabs={[
            { id: 1, title: 'Quyết định ra', component: this.componentFilter(1) },
            { id: 2, title: 'Quyết định vào', component: this.componentFilter(2) },
            { id: 3, title: 'Quyết định khác', component: this.componentFilter(3) }
        ]}
    />


    componentFilter = (id) => {
        const permission = this.getUserPermission('svDmFormType'),
            items = this.props.fwDmFormType?.items || {},
            { data = [] } = items;
        return renderTable({
            getDataSource: () => data.filter(item => item.kieuForm == id),
            emptyTable: 'Chưa có dữ liệu',
            style: { display: data ? '' : 'none' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm học</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Chú thích</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.namHoc} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ma} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.ten} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.chuThich} style={{ whiteSpace: 'prewrap' }} />
                    <TableCell type='checkbox' content={item.kichHoat} onChanged={value => this.props.updateSvDmFormType(item.ma, { kichHoat: Number(value), namHoc: item.namHoc })} permission={permission} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.editModal.show(item)}>
                    </TableCell>
                </tr>
            )
        });
    }

    render() {
        const permission = this.getUserPermission('svDmFormType');
        const items = this.props.fwDmFormType?.items || {},
            { listParams = [] } = items;
        return this.renderPage({
            title: 'Loại biểu mẫu',
            icon: 'fa fa-file-text-o',
            breadcrumb: [
                <Link key={1} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Loại biểu mẫu'
            ],
            header: <FormSelect placeholder='Chọn năm học' ref={e => this.namHoc = e} style={{ width: '300px', marginBottom: '0' }} data={SelectAdapter_SchoolYear} onChange={e => this.initValue(e.id)} />,
            content: <>
                <FormTabs
                    contentClassName='tile'
                    header={<div className='d-flex justify-content-end' style={{ columnGap: '1rem' }}>
                        <Link className='btn btn-info' to='/user/ctsv/category-forms/cau-hinh'><i className='fa fa-cogs' />Cấu hình</Link>
                    </div>}
                    tabs={[
                        { id: 0, title: 'Chứng nhận', component: this.componentFilter(0) },
                        { id: 1, title: 'Quyết định', component: this.quyetDinhTabs() }
                    ]}
                />

                <EditModal ref={e => this.editModal = e} readOnly={!permission.write} listParams={listParams} />
                <CreateMultipleModal ref={e => this.copyFormModal = e} readOnly={!permission.write} />
            </>,
            backRoute: '/user/ctsv',
            collapse: [
                { icon: 'fa-plus', type: 'info', name: 'Tạo mới', onClick: () => this.editModal.show(null), permission: permission.write },
                { icon: 'fa-clone', type: 'warning', name: 'Sao chép', onClick: () => this.copyFormModal.show(null), permission: permission.write },
            ]
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwDmFormType: state.ctsv.svDmFormType });
const mapActionsToProps = {
    getAllSvDmFormType, updateSvDmFormType
};
export default connect(mapStateToProps, mapActionsToProps)(AdminFormTypePage);