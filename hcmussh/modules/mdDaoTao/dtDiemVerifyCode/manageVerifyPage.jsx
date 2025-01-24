import { connect } from 'react-redux';
import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, renderDataTable, TableCell, CirclePageButton, FormTabs } from 'view/component/AdminPage';
import { dtDiemVerifyCodeGetValue, dtDiemVerifyCodeConfirm, dtDiemVerifyCreateNew } from './redux';
import VerifySection from './verifySection';
import FileBox from 'view/component/FileBox';
import { executeTaskGetItem } from 'modules/_default/fwExecuteTask/redux';
import { Tooltip } from '@mui/material';


class DetailModal extends AdminModal {

    onShow = (item) => {
        const { id, maHocPhan, namHoc, hocKy, maMonHoc } = item.codeFile;
        this.setState({ ...item }, () => {
            this.codeFile.value(id);
            this.maHocPhan.value(maHocPhan);
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.maMonHoc.value(maMonHoc);
        });
    }

    render = () => {
        const { listStudent = [], configThanhPhan = [] } = this.state,
            widthTP = 30 / (configThanhPhan.length + 1);

        let studentTable = renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: listStudent.length > 15,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            divStyle: { height: '60vh' },
            data: listStudent,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>MSSV</th>
                        <th style={{ width: '20%', verticalAlign: 'middle' }}>Họ và tên lót</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Tên</th>
                        {configThanhPhan.map((item, index) => (<th key={index} style={{ width: `${widthTP}%`, whiteSpace: 'nowrap', textAlign: 'center' }}>{item.tenTp}</th>))}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Điểm tổng kết</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
                    </tr>
                </>
                );
            },
            renderRow: (item, index) => {
                return (
                    <tr key={`student-${index}`}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.mssv} />
                        <TableCell content={item.ho} />
                        <TableCell content={item.ten} />
                        {listStudent.length && configThanhPhan.map(tp => {
                            let loaiThanhPhan = tp.loaiTp,
                                diem = item.diem ? item.diem[loaiThanhPhan] : '',
                                diemDacBiet = item.diemDacBiet ? item.diemDacBiet[loaiThanhPhan] : '';

                            diem = (!isNaN(parseFloat(diem))) ? parseFloat(diem).toFixed(1).toString() : diem;
                            return <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} key={`${item.mssv}_${loaiThanhPhan}`} content={diemDacBiet || diem} />;
                        })}
                        <TableCell style={{ width: 'auto', textAlign: 'center', justifyContent: 'center' }} content={(item.diem && item.diem['TK']) || ''} />
                        <TableCell style={{ width: 'auto', justifyContent: 'center' }} content={item.ghiChu || ''} />
                    </tr>
                );
            }
        });

        return this.renderModal({
            title: 'Chi tiết mã xác thực',
            size: 'large',
            isShowSubmit: false,
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.codeFile = e} className='col-md-4' label='Mã' readOnly />
                    <FormTextBox ref={e => this.namHoc = e} className='col-md-4' label='Năm học' readOnly />
                    <FormTextBox ref={e => this.hocKy = e} className='col-md-4' label='Học kỳ' readOnly />
                    <FormTextBox ref={e => this.maMonHoc = e} className='col-md-6' label='Mã môn học' readOnly />
                    <FormTextBox ref={e => this.maHocPhan = e} className='col-md-6' label='Mã học phần' readOnly />
                    <div className='col-md-12'>
                        {studentTable}
                    </div>
                </div>
            </>
        });
    }
}

class manageVerifyPage extends AdminPage {
    state = { results: [], folder: {} }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/verify-code/item/:idFolder'),
                idFolder = route.parse(window.location.pathname).idFolder;

            T.alert('Đang lấy dữ liệu. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
            this.props.dtDiemVerifyCodeGetValue(idFolder, data => this.setState({ idFolder, results: data.items, folder: data.folder, status: data.folder.status }, () => {
                T.alert('Lấy dữ liệu thành công!', 'success', false, 5000);
                this.tab.tabClick(null, 0);
            }));
            let params = T.getUrlParams(window.location.href);
            if (Object.keys(params).length) {
                let { taskId } = params;
                this.props.executeTaskGetItem(taskId, () => {
                    this.setState({ taskId });
                });
            }
        });
    }

    handleConfirm = () => {
        const { results, idFolder, taskId } = this.state;
        T.confirm('Xác nhận mã', 'Bạn có muốn xác nhận các mã đã quét này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xác nhận mã. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.dtDiemVerifyCodeConfirm(results.filter(i => !i.errorDetail).map(i => i.idCode), { idFolder, taskId }, () => this.setState({ status: 1, results: results.map(i => !i.errorDetail ? ({ ...i, status: 1 }) : ({ ...i })) }, () => T.alert('Xác nhận mã thành công!', 'success', false, 5000)));
            }
        });
    }

    handleAdd = () => {
        T.confirm('Kiểm tra mã', 'Bạn có muốn kiểm tra mã được nhập này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const code = this.verifyCode.value(),
                    { results, idFolder } = this.state;

                if (!code) return T.notify('Vui lòng nhập mã!', 'danger');
                else if (code.length != 8) return T.notify('Mã có chiều dài là 8 ký tự!', 'danger');
                else if (isNaN(Number(code))) return T.notify('Mã chỉ được phép bao gồm số!', 'danger');
                else if (results.find(i => i.idCode == code)) return T.notify('Mã không được phép trùng với các mã hiện tại!', 'danger');

                T.alert('Đang kiểm tra mã. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.dtDiemVerifyCreateNew(code, idFolder, item => {
                    results.push(item);
                    this.setState({ results: results.sort((a, b) => b.idCode - a.idCode) }, () => T.alert('Xác nhận mã thành công!', 'success', false, 5000));
                });
            }
        });
    }

    handleVerify = (item) => {
        const { results } = this.state;
        T.confirm('Xác nhận mã', `Bạn có muốn xác nhận mã ${item.idCode} không?`, 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xác nhận mã. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.dtDiemVerifyCodeConfirm(item.idCode, { idFolder: item.idFolder }, () => this.setState({ results: results.map(i => (i.idCode == item.idCode) ? ({ ...i, status: 1 }) : ({ ...i })) }, () => T.alert('Xác nhận mã thành công!', 'success', false, 5000)));
            }
        });
    }

    onSuccess = (result) => {
        if (result.error) {
            T.alert(result.error.message || 'Xảy ra lỗi trong quá trình import', 'error', true);
        }
    }

    table = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu sinh viên',
        stickyHead: list.length > 15,
        header: 'thead-light',
        loadingStyle: { backgroundColor: 'white' },
        divStyle: { height: '70vh' },
        data: list,
        renderHead: () => <tr>
            <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
            <th style={{ width: '10%', verticalAlign: 'middle' }}>Mã</th>
            <th style={{ width: '10%', verticalAlign: 'middle' }}>Mã học phần</th>
            <th style={{ width: '20%', verticalAlign: 'middle' }}>Tên môn Học</th>
            <th style={{ width: '10%', verticalAlign: 'middle' }}>Loại điểm</th>
            <th style={{ width: '10%', verticalAlign: 'middle' }}>Ca thi</th>
            <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Người xác nhận</th>
            <th style={{ width: '10%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thời gian xác nhận</th>
            <th style={{ width: '10%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Tình trạng</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Lỗi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            const icon = item.status ? 'fa fa-lg fa-check-circle' : 'fa fa-lg fa-file-o',
                text = item.status ? 'Đã xác nhận' : 'Chưa xác nhận',
                color = item.status ? 'green' : 'red',
                { codeFile, infoExam } = item,
                { maHocPhan, kyThi, idExam } = codeFile || { maHocPhan: '', kyThi: '', idExam: '' },
                { caThi, phong, batDau } = infoExam || { caThi: '', phong: '', batDau: Date.now() };
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.idCode} />
                    <TableCell content={maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={kyThi ? (kyThi == 'CK' ? 'Cuối kỳ' : 'Quá trình') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={idExam ? <>
                        {`Ca thi: ${caThi}`}<br />
                        {`Phòng: ${phong}`}<br />
                        {`Ngày: ${T.dateToText(parseInt(batDau))}`}
                    </> : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.userVerify.replaceAll('@hcmussh.edu.vn', '')} />
                    <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap' }} content={T.dateToText(item.timeVerify, 'dd/mm/yy HH:MM:ss')} />
                    <TableCell style={{ alignItems: 'center', whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.errorDetail ? <i className='text-danger'>{item.errorDetail}</i> : ''} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: ' center', cursor: 'pointer' }} content={item} >
                        <Tooltip title='Xác thực mã' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.handleVerify(item)} style={{ display: !item.status && !item.errorDetail ? '' : 'none' }}>
                                <i className='fa fa-lg fa-check' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Xem chi tiết' arrow>
                            <button className='btn btn-info' onClick={e => e.preventDefault() || this.modal.show(item)} style={{ display: !item.errorDetail ? '' : 'none' }}>
                                <i className='fa fa-lg fa-search' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr >
            );
        }
    });

    render() {
        const { folder, results, status, idFolder } = this.state,
            { folderName } = folder;

        return this.renderPage({
            icon: 'fa fa-codepen',
            title: 'Xác thực mã',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/grade-manage'>Quản lý điểm</Link>,
                'Xác thực mã'
            ],
            content: <div>
                <DetailModal ref={e => this.modal = e} />
                <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        title: 'Danh sách mã quét', component: <div className='tile'>
                            <div className='tile-title row'>
                                <h5 className='col-md-6' style={{ textAlign: 'center' }}>Folder: {folderName}</h5>
                                <h5 className='col-md-6' style={{ textAlign: 'center' }}>Số mã đã quét: {results.length}</h5>
                            </div>
                            <div className='tile-body'>
                                {this.table(results)}
                            </div>
                        </div>
                    },
                    { title: 'Xác thực mã', component: <VerifySection idFolder={idFolder} handleVerify={() => this.props.dtDiemVerifyCodeGetValue(idFolder, data => this.setState({ idFolder, results: data.items, folder: data.folder, status: data.folder.status }, () => this.tab.tabClick(null, 0)))} /> },
                    {
                        title: 'Import', component: <div className='tile row'>
                            <div className='col-md-12' style={{ margin: 'auto' }}>
                                <button className='btn btn-warning' type='button' onClick={e => e && e.preventDefault() || T.handleDownload('/api/dt/diem-verify/download-template')}>
                                    <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                                </button>
                            </div>
                            <FileBox className='col-md-12' postUrl={`/user/upload?idFolder=${idFolder}`} uploadType='ImportVerifyCode' userData='ImportVerifyCode'
                                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                style={{ width: '80%', margin: '0 auto' }} success={this.onSuccess}
                                ajax={true} />
                        </div>
                    },
                ]} />
                {!status && <CirclePageButton type='custom' tooltip='Xác nhận' customIcon='fa fa-lg fa-check-circle' customClassName='btn-info' style={{ marginRight: '20px' }} onClick={() => this.handleConfirm()} />}
            </div>,
            backRoute: '/user/dao-tao/verify-code',
        });
    }
}

const mapStateToProps = state => ({ state: state.system, verifyReducer: state.daoTao.verifyReducer });
const mapActionsToProps = { dtDiemVerifyCodeGetValue, dtDiemVerifyCodeConfirm, executeTaskGetItem, dtDiemVerifyCreateNew };
export default connect(mapStateToProps, mapActionsToProps)(manageVerifyPage);