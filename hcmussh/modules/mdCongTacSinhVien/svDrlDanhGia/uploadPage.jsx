import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTabs, renderTable, TableCell, TableHead } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { executeTaskGetItem } from 'modules/_default/fwExecuteTask/redux';
// import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import Pagination from 'view/component/Pagination';

export class DiemRenLuyenUploadPage extends AdminPage {

    state = { dsSinhVien: [], failed: [], pageNumber: 1, pageSize: 50, pageTotal: 0, list: [] }
    filter = {}

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            const { taskId } = T.getUrlParams() || {};
            this.setState({ isUpload: taskId == null });
            if (taskId) {
                this.props.executeTaskGetItem(taskId, (data) => {
                    const { items = [], failed = [], namHoc, hocKy, error } = data || {};
                    // const pageTotal = Math.ceil(items.length / pageSize);
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                    this.setState({ namHoc, hocKy, dsSinhVien: items, failed: error ? [{ message: 'Xảy ra lỗi khi thực thi!' }] : failed }, () => this.getPage());
                });
            } else {
                this.props.getScheduleSettings(({ currentSemester }) => {
                    const { namHoc, hocKy } = currentSemester ?? {};
                    this.setState({ namHoc, hocKy });
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                });
            }
        });
    }

    getPage = (pageNumber, pageSize) => {
        let { pageNumber: number, pageSize: size, dsSinhVien } = this.state;
        pageNumber ??= number;
        pageSize ??= size;
        const filteredList = this.filterList(dsSinhVien);
        const totalItem = filteredList.length;
        const pageTotal = Math.ceil(totalItem / pageSize);
        this.setState({ pageNumber, pageSize, pageTotal, totalItem, list: filteredList.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) });
    }

    onKeySearch = (keyValue) => {
        const [key, value] = keyValue.split(':');
        this.filter[key] = value;
        this.getPage();
    }
    filterList = (list) => {
        const { ks_mssv } = this.filter;
        return Array.isArray(list) ? list.filter(item => !ks_mssv || new RegExp(ks_mssv).test(item.mssv)) : [];
    }

    componentForm = () => {
        return <div className='tile'><div className='row mt-3'>
            <div className='col-md-12'>
                Thêm file excel danh sách sinh viên. Tải file mẫu tại <a href='#' onClick={e => e.preventDefault() || T.download('/api/ctsv/danh-gia-drl/download-template')}>đây</a>
            </div>
            <FileBox className='col-md-12' postUrl={`/user/upload?namHoc=${this.state.namHoc}&hocKy=${this.state.hocKy}`} uploadType='DsDrlCtsvData' userData={'DsDrlData'}
                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' label='Nhấn hoặc kéo thả file excel chứa danh sách sinh viên'
                ajax={true} success={this.onSuccess} />
            {/* <FormSelect multiple ref={e => this.listStudent = e} label='Thêm sinh viên' className='col-md-12' data={SelectAdapter_FwStudentsManageForm} readOnly={readOnly} onChange={this.changeListStudent} /> */}
        </div></div>;
    }

    componentKetQua = () => {
        const failedLength = this.state.failed?.length;
        return <FormTabs id='ket-qua-tab' ref={e => this.tabs = e} contentClassName='tile' tabs={[
            { title: 'Thành công', component: this.componentTable() },
            { title: <>Thất bại <span className='badge badge-danger'>{failedLength}</span></>, component: this.componentError() },
        ]} />;
    }

    componentError = () => (
        <div style={{ height: 'calc(100vh - 200px)' }}>
            <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '100%' }}>
                {this.state.failed?.map((item, index) => (
                    <div key={index} className='row'>
                        <p className={`col-md-3 text-${item.color}`}>{item.rowNumber ? `Hàng ${item.rowNumber}` : ''}:</p>
                        <p className={`col-md-9 text-${item.color}`}>{item.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )

    componentTable = () => {
        const { list, pageNumber, pageSize, pageTotal, totalItem } = this.state;
        const renderDiem = (content, strikeThrough) => <div className='position-relative'>
            {content}
            {strikeThrough && content != strikeThrough ? <span className='ml-2 position-absolute'><s>{strikeThrough}</s></span> : null}
            {/* <span className='ml-1 position-absolute'><s>{thongTinDrlSave?.tkSubmit}</s></span> */}
        </div>;
        return <div className=''>
            <div className='d-flex justify-content-between align-items-end'>
                <div className='d-flex justify-content-start align-items-baseline'>
                    <button className='btn btn-info' type='button' onClick={() => this.setState({ isUpload: true })}><i className='fa fa-upload' />Tải lại</button>
                    <p className='ml-3'>Danh sách này có tổng cộng {totalItem} sinh viên.</p>
                </div>
                <div className='d-flex justify-content-end'>
                    <Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPage} />
                </div>
            </div>
            {renderTable({
                getDataSource: () => [{}],
                emptyTable: 'Không có dữ liệu',
                stickyHead: true,
                renderHead: () => <tr style={{ width: '100%', position: 'sticky' }}>
                    <th style={{ width: 'auto' }}>#</th>
                    <TableHead style={{ minWidth: '200px', whiteSpace: 'nowrap' }} content='MSSV' keyCol='mssv' onKeySearch={this.onKeySearch} />
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Họ tên</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Hệ đào tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm lớp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm khoa</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm tổng kết</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Ghi chú khoa</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Ghi chú CTSV</th>
                </tr>,
                renderRow: () => list.map((item, index) => {
                    const thongTinDrlSave = item.thongTinDrlSave;
                    return <tr key={index}>
                        <TableCell content={(pageNumber - 1) * pageSize + index + 1} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.mssv} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.hoTen} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.loaiHinhDaoTao} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={renderDiem(item.svSubmit, thongTinDrlSave?.svSubmit)} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={renderDiem(item.ltSubmit, thongTinDrlSave?.ltSubmit)} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={renderDiem(item.fSubmit, thongTinDrlSave?.fSubmit)} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        {/* <TableCell content={item.tkSubmit} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />  */}
                        <TableCell content={renderDiem(item.tkSubmit, thongTinDrlSave?.tkSubmit)} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={item.lyDoF} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={item.lyDoTk} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    </tr>;
                })
            })}
        </div>;
    }

    render() {
        const { isUpload } = this.state;
        return this.renderPage({
            title: 'Tải lên dữ liệu điểm rèn luyện',
            icon: 'fa fa-upload',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                <Link key={0} to='/user/ctsv/danh-gia-drl'>Quản lý điểm rèn luyện</Link>,
                'Tải lên dữ liệu'
            ],
            content: <>
                <div className='row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={({ id }) => this.setState({ namHoc: id })} readOnly={!isUpload} />
                    <FormSelect ref={e => this.hocKy = e} label='Học kỳ' className='col-md-6' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={({ id }) => this.setState({ hocKy: id })} readOnly={!isUpload} />
                </div>
                {isUpload ? this.componentForm() : this.componentKetQua()}
                {/* <FormTabs id='upload-tab' ref={e => this.tabs = e}
                    tabs={[
                        { title: 'Tải lên', component: <div className='tile'>{this.componentForm()}</div> },
                        { title: 'Kết quả', component: this.componentKetQua() },
                    ]} /> */}
            </>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });

const mapDispatchToProps = { executeTaskGetItem };

export default connect(mapStateToProps, mapDispatchToProps)(DiemRenLuyenUploadPage);