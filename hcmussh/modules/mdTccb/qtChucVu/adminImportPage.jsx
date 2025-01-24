import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { Link } from 'react-router-dom';

class ImportBoNhiemThoiChucVu extends AdminPage {
    state = {
        displayState: 'import', boNhiemItems: [], thoiChucVuItems: [], failedBoNhiemItems: [], failedThoiChucVuItems: []
    }

    handleReload = (e) => {
        e.preventDefault();
        this.setState({
            displayState: 'import', boNhiemItems: [], thoiChucVuItems: [], failedBoNhiemItems: [], failedThoiChucVuItems: []
        });
    }

    handleSave = (e) => {
        e.preventDefault();
        if (!this.state.validItemGroupsByDonVi || this.state.validItemGroupsByDonVi.length === 0) {
            T.alert('Chưa có dữ liệu để nhập về hệ thống', 'warning', false, 1000);
        } else {
            T.confirm('Xác nhận', 'Bạn có chắc muốn import dữ liệu bổ nhiệm/thôi chức vụ?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                    T.post('/api/tccb/qua-trinh/chuc-vu/bo-nhiem-thoi-chuc-vu', { data: this.state.validItemGroupsByDonVi }, (result) => {
                        if (result.error) {
                            T.alert('Xử lý các quyết định bổ nhiệm/thôi chức vụ bị lỗi', 'warning', false, 1000);
                            console.error(result.error);
                        } else {
                            T.alert('Xử lý các quyết định bổ nhiệm/thôi chức vụ thành công', 'success', false, 1000);
                            this.props.history.push('/user/tccb/qua-trinh/chuc-vu');
                        }
                    });
                }
            });
        }
    }

    onSuccess = (result) => {
        if (result.error) {
            T.alert('Xảy ra lỗi trong quá trình import', 'danger', true);
        } else {
            let { invalidBoNhiemItems, invalidThoiChucVuItems, validItemGroupsByDonVi, failedItemGroups } = result;
            this.setState({ invalidBoNhiemItems, invalidThoiChucVuItems, validItemGroupsByDonVi, failedItemGroups, displayState: 'data' }, () => {
                T.alert('Import thành công! Vui lòng kiểm tra lại dữ liệu trước khi lưu', 'success');
            });
        }
    }

    render() {
        const permission = this.getUserPermission('qtChucVu', ['manage', 'write', 'read', 'import', 'export']);
        let { invalidBoNhiemItems, invalidThoiChucVuItems, validItemGroupsByDonVi, failedItemGroups } = this.state;

        const validItemGroupsByDonViTable = renderDataTable({
            data: validItemGroupsByDonVi,
            stickyHead: true,
            divStyle: { height: '63vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => <>
                <tr>
                    <TableHead style={{ width: '20%', verticalAlign: 'middle' }} rowSpan={2} content='STT' />
                    <TableHead style={{ width: '20%', verticalAlign: 'middle' }} rowSpan={2} content='Tên đơn vị' />
                    <TableHead style={{ width: '80%', verticalAlign: 'middle', textAlign: 'center' }} colSpan={11} content='Dữ liệu liên quan' />
                </tr>
                <tr>
                    <TableHead style={{ width: 'auto' }} content='Loại quyết định' />
                    <TableHead style={{ width: 'auto' }} content='Mã số cán bộ' />
                    <TableHead style={{ width: 'auto' }} content='Họ' />
                    <TableHead style={{ width: 'auto' }} content='Tên' />
                    <TableHead style={{ width: 'auto' }} content='Tên chức vụ' />
                    <TableHead style={{ width: 'auto' }} content='Tên đơn vị' />
                    <TableHead style={{ width: 'auto' }} content='Tên bộ môn' />
                    <TableHead style={{ width: 'auto' }} content='Chức vụ chính? (1/0)' />
                    <TableHead style={{ width: 'auto' }} content='Số quyết định' />
                    <TableHead style={{ width: 'auto' }} content='Ngày quyết định' />
                    <TableHead style={{ width: 'auto' }} content='Ghi chú thêm' />
                </tr>
            </>,
            renderRow: (item, index) => {
                return <React.Fragment key={index}>
                    <tr>
                        <TableCell rowSpan={item.itemsNum} content={index + 1} />
                        <TableCell rowSpan={item.itemsNum} content={item.tenDonVi} />
                        <TableCell content={item.itemGroup[0].chucVuChinh == undefined ? 'Thôi chức vụ' : 'Bổ nhiệm'} />
                        <TableCell content={item.itemGroup[0].mscb} />
                        <TableCell content={item.itemGroup[0].ho} />
                        <TableCell content={item.itemGroup[0].ten} />
                        <TableCell content={item.itemGroup[0].tenChucVu} />
                        <TableCell content={item.itemGroup[0].tenDonVi} />
                        <TableCell content={item.itemGroup[0].tenBoMon} />
                        <TableCell content={item.itemGroup[0].chucVuChinh ? item.itemGroup[0].chucVuChinh : ''} />
                        <TableCell content={item.itemGroup[0].soQuyetDinh} />
                        <TableCell content={item.itemGroup[0].ngayQuyetDinh ? T.dateToText(item.itemGroup[0].ngayQuyetDinh, 'dd/mm/yyyy') : ''} />
                        <TableCell content={
                            (item.itemGroup[0].infoDetail).map((info, index) => <div key={index} style={{ color: 'lightblue' }}><i className='fa fa-lg fa-info-circle' /> {info}</div>)
                        } />
                    </tr>
                    {
                        item.itemGroup.slice(1).map((dongDuLieu, index2) => <tr key={index2}>
                            <TableCell content={dongDuLieu.chucVuChinh == undefined ? 'Thôi chức vụ' : 'Bổ nhiệm'} />
                            <TableCell content={dongDuLieu.mscb} />
                            <TableCell content={dongDuLieu.ho} />
                            <TableCell content={dongDuLieu.ten} />
                            <TableCell content={dongDuLieu.tenChucVu} />
                            <TableCell content={dongDuLieu.tenDonVi} />
                            <TableCell content={dongDuLieu.tenBoMon} />
                            <TableCell content={dongDuLieu.chucVuChinh ? dongDuLieu.chucVuChinh : ''} />
                            <TableCell content={dongDuLieu.soQuyetDinh} />
                            <TableCell content={dongDuLieu.ngayQuyetDinh ? T.dateToText(dongDuLieu.ngayQuyetDinh, 'dd/mm/yyyy') : ''} />
                        </tr>)
                    }
                </React.Fragment>;
            }
        });

        const failedItemGroupsTable = renderDataTable({
            data: failedItemGroups,
            stickyHead: true,
            divStyle: { height: '63vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (<>
                <tr>
                    <TableHead content='STT' rowSpan={2} style={{ width: 'auto', verticalAlign: 'middle' }} />
                    <TableHead style={{ width: '400px', textAlign: 'center', verticalAlign: 'middle' }} content='Ghi chú lỗi' rowSpan={2} />
                    <TableHead style={{ width: '970px', textAlign: 'center' }} content='Dữ liệu liên quan' colSpan={10} />
                </tr>
                <tr>
                    <TableHead content='Loại quyết định' />
                    <TableHead content='Mã số cán bộ' style={{ width: '80px' }} />
                    <TableHead content='Họ' style={{ width: '120px' }} />
                    <TableHead content='Tên' style={{ width: '80px' }} />
                    <TableHead content='Tên chức vụ' style={{ width: '150px' }} />
                    <TableHead content='Tên đơn vị' style={{ width: '150px' }} />
                    <TableHead content='Tên bộ môn' style={{ width: '150px' }} />
                    <TableHead content='Chức vụ chính? (1/0)' style={{ width: 'auto' }} />
                    <TableHead content='Số quyết định' style={{ width: '120px' }} />
                    <TableHead content='Ngày quyết định' style={{ width: '120px' }} />
                </tr>
            </>),
            renderRow: (item, index) => <React.Fragment key={index}>
                <tr>
                    <TableCell type='text' content={index + 1} rowSpan={item.itemGroup.length} />
                    <TableCell type='text' content={<div className='text-danger'><i className='fa fa-lg fa-times' /> {item.message}</div>} rowSpan={item.itemGroup.length} />
                    <TableCell type='text' content={item.itemGroup[0].chucVuChinh != undefined ? 'Bổ nhiệm' : 'Thôi chức vụ'} />
                    <TableCell type='text' content={item.itemGroup[0].mscb} />
                    <TableCell type='text' content={item.itemGroup[0].ho} />
                    <TableCell type='text' content={item.itemGroup[0].ten} />
                    <TableCell type='text' content={item.itemGroup[0].tenChucVu} />
                    <TableCell type='text' content={item.itemGroup[0].tenDonVi} />
                    <TableCell type='text' content={item.itemGroup[0].tenBoMon} />
                    <TableCell type='text' content={item.itemGroup[0].chucVuChinh != undefined ? item.itemGroup[0].chucVuChinh : ''} />
                    <TableCell type='text' content={item.itemGroup[0].soQuyetDinh} />
                    <TableCell type='text' content={item.itemGroup[0].ngayQuyetDinh ? T.dateToText(item.itemGroup[0].ngayQuyetDinh, 'dd/mm/yyyy') : ''} />
                </tr>
                {
                    item.itemGroup.slice(1).map((dongDuLieu, index2) => <tr key={index2}>
                        <TableCell type='text' content={dongDuLieu.chucVuChinh != undefined ? 'Bổ nhiệm' : 'Thôi chức vụ'} />
                        <TableCell type='text' content={dongDuLieu.mscb} />
                        <TableCell type='text' content={dongDuLieu.ho} />
                        <TableCell type='text' content={dongDuLieu.ten} />
                        <TableCell type='text' content={dongDuLieu.tenChucVu} />
                        <TableCell type='text' content={dongDuLieu.tenDonVi} />
                        <TableCell type='text' content={dongDuLieu.tenBoMon} />
                        <TableCell type='text' content={dongDuLieu.chucVuChinh != undefined ? dongDuLieu.chucVuChinh : ''} />
                        <TableCell type='text' content={dongDuLieu.soQuyetDinh} />
                        <TableCell type='text' content={dongDuLieu.ngayQuyetDinh ? T.dateToText(dongDuLieu.ngayQuyetDinh, 'dd/mm/yyyy') : ''} />
                    </tr>)
                }
            </React.Fragment>
        });

        const invalidBoNhiemItemsTable = renderDataTable({
            data: invalidBoNhiemItems,
            stickyHead: true,
            divStyle: { height: '50vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => <tr>
                <TableHead content='STT' style={{ width: 'auto' }} />
                <TableHead content='Mã số cán bộ' style={{ width: '80px' }} />
                <TableHead content='Họ' style={{ width: '120px' }} />
                <TableHead content='Tên' style={{ width: '80px' }} />
                <TableHead content='Tên chức vụ' style={{ width: '150px' }} />
                <TableHead content='Tên đơn vị' style={{ width: '150px' }} />
                <TableHead content='Tên bộ môn' style={{ width: '150px' }} />
                <TableHead content='Chức vụ chính? (1/0)' style={{ width: 'auto' }} />
                <TableHead content='Số quyết định' style={{ width: '120px' }} />
                <TableHead content='Ngày quyết định' style={{ width: '120px' }} />
                <TableHead content='Ghi chú lỗi' style={{ width: '500px' }} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.mscb} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.ho} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.ten} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.tenChucVu} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.tenDonVi} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.tenBoMon} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.chucVuChinh} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.soQuyetDinh} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : ''} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={
                    (item.errorDetail && item.errorDetail.map((error, i) => <div key={i} className='text-danger'><i className='fa fa-lg fa-times' /> {error}</div>))
                } />
            </tr>
        });

        const invalidThoiChucVuItemsTable = renderDataTable({
            data: invalidThoiChucVuItems,
            stickyHead: true,
            divStyle: { height: '50vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => <tr>
                <TableHead content='STT' style={{ width: 'auto' }} />
                <TableHead content='Mã số cán bộ' style={{ width: '80px' }} />
                <TableHead content='Họ' style={{ width: '150px' }} />
                <TableHead content='Tên' style={{ width: '120px' }} />
                <TableHead content='Tên chức vụ' style={{ width: '150px' }} />
                <TableHead content='Tên đơn vị' style={{ width: '150px' }} />
                <TableHead content='Tên bộ môn' style={{ width: '150px' }} />
                <TableHead content='Số quyết định' style={{ width: '120px' }} />
                <TableHead content='Ngày quyết định' style={{ width: '120px' }} />
                <TableHead content='Ghi chú lỗi' style={{ width: '500px' }} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.mscb} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.ho} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.ten} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.tenChucVu} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.tenDonVi} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.tenBoMon} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.soQuyetDinh} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : ''} />
                <TableCell type='text' style={{ textAlign: 'nowrap' }} content={
                    (item.errorDetail && item.errorDetail.map((error, i) => <div key={i} className='text-danger'><i className='fa fa-lg fa-times' /> {error}</div>))
                } />
            </tr>
        });

        const dataTabs = [
            {
                title: 'Quyết định bổ nhiệm/thôi chức vụ import thành công',
                component: <>
                    <div className='tile'>
                        <h3 style={{ textAlign: 'left' }}>Quyết định bổ nhiệm/thôi chức vụ</h3>
                        {validItemGroupsByDonViTable}
                    </div>
                </>
            },
            {
                title: 'Lỗi quyết định bổ nhiệm/thôi chức vụ sai nghiệp vụ',
                component: <>
                    <div className='tile'>
                        <h3 style={{ textAlign: 'left' }}>Dữ liệu bị lỗi nghiệp vụ</h3>
                        {failedItemGroupsTable}
                    </div>
                </>
            },
            {
                title: 'Lỗi quyết định bổ nhiệm/thôi chức vụ do sai format data ',
                component: <>
                    <div className='tile'>
                        <h3 style={{ textAlign: 'left' }}>Dữ liệu bổ nhiệm sai format</h3>
                        {invalidBoNhiemItemsTable}
                    </div>
                    <div>
                        <h3 style={{ textAlign: 'left' }}>Dữ liệu thôi chức vụ sai format</h3>
                        {invalidThoiChucVuItemsTable}
                    </div>
                </>
            }
        ];

        return this.renderPage({
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/qua-trinh/chuc-vu'>Qúa trình chức vụ</Link>,
                'Import dữ liệu bổ nhiệm, thôi chức vụ'
            ],
            title: 'Bổ nhiệm / Thôi chức vụ Import',
            backRoute: '/user/tccb/qua-trinh/chuc-vu',
            content: <>
                <div className='tile' style={{ display: this.state.displayState == 'import' ? 'block' : 'none' }}>
                    <div className='rows'>
                        <h3 style={{ marginBottom: '20px' }}>Upload file thông tin quyết định bổ nhiêm, thôi chức vụ</h3>
                        <FileBox postUrl='/user/upload/' uploadType='tccbQtChucVuBoNhiemThoiChucVu' userData='tccbQtChucVuBoNhiemThoiChucVu'
                            accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                            style={{ width: '80%', margin: '0 auto' }}
                            ajax={true} success={this.onSuccess}
                            description='Nhập dữ liệu vào file TEMPLATE_BO_NHIEM_THOI_CHUC_VU.xlsx (nút tải ở dưới) rồi kéo thả (hoặc nhấp chọn) vào ô trên'
                        />
                    </div>
                </div>

                <div className='tile' style={{ display: this.state.displayState == 'import' ? 'block' : 'none' }}>
                    <div className='row'>
                        <h3 className='col-12' style={{ marginBottom: '20px' }}>Template điền thông tin và các sheet dữ liệu hỗ trợ</h3>
                        <div className='col-12'>
                            <button className='btn btn-warning m-1' type='button' onClick={e => {
                                e.preventDefault();
                                T.download('/api/tccb/bo-nhiem-thoi-chuc-vu-template', 'TEMPLATE_BO_NHIEM_THOI_CHUC_VU.xlsx');
                            }}>
                                <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file template và các sheet dữ liệu hỗ trợ đi kèm tại đây
                            </button>
                        </div>
                    </div>
                </div>

                <div className='tile' style={{ textAlign: 'right', display: this.state.displayState == 'import' ? 'none' : 'block' }}>
                    <FormTabs ref={e => this.tab = e} tabs={dataTabs} />.
                </div>
            </>,
            collapse: [
                { icon: 'fa-save', name: 'Lưu dữ liệu import', permission: permission && permission.import, onClick: this.handleSave, type: 'success' },
                { icon: 'fa-refresh', name: 'Re-upload', permission: true, onClick: this.handleReload, type: 'warning' },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtChucVu: state.tccb.qtChucVu });
const mapActionToProps = {};

export default connect(mapStateToProps, mapActionToProps)(ImportBoNhiemThoiChucVu);