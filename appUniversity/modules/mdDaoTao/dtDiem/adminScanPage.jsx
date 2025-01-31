import React from 'react';
import { createDtDiemMultiple } from './redux';
import { connect } from 'react-redux';
// import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableHead, TableCell, FormUpload, FormTabs, FormSelect } from 'view/component/AdminPage';
import { getListScanResult } from './redux';
// import { Tooltip } from '@mui/material';
import SectionDetailResult from './section/SectionDetailResult';
// import { ProcessModal } from '../dtCauHinhDotDkhp/adjustPage';
class DtThoiKhoaBieuScanPage extends AdminPage {
    state = { indexRow: null, dataDiem: [], message: '', displayState: 'import', isDisplay: true, validFiles: [], filter: {}, process: '0', caption: '', total: 0, current: 0 };

    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        let stateHistory = this.props.history.location.state;
        T.ready('/user/dao-tao', () => {
            if (!stateHistory) {
                this.props.history.push('/user/dao-tao/grade-manage/import');
            } else {
                this.tab.tabClick(null, 0);
                this.setState({ filter: stateHistory }, () => this.getPage());
            }
        });
        T.socket.on('grade-rescan-result', ({ requester, idSemester, idFolder, dataRescan, idResult, sheetCode }) => {
            if (idSemester == this.state.filter.idSemester && idFolder == this.state.filter.idFolder && requester == this.props.system.user.email) {
                T.alert('Scan đè hoàn tất', 'success', false, 1000);
                this.sectionDetail.renderRescanGrade(dataRescan || [], idResult, sheetCode);
                this.tab.tabClick(null, 0);
            }
        });
        T.socket.on('grade-scan-start', ({ total, error, requester, idFolder, idSemester }) => {
            if (idFolder == this.state.filter.idFolder && idSemester == this.state.filter.idSemester && requester == this.props.system.user.email) {
                if (error) {
                    // this.processModal.hide();
                    T.alert(error, 'danger', true);
                } else {
                    this.setState({ total }, () => {
                        T.alert('Hệ thống đang scan.Đừng rời trang cho tới khi hoàn tất!', 'info', false, null, true);
                    });
                }
            }
        });
        T.socket.on('grade-scan-result', ({ requester, idSemester, idFolder, isDone }) => {
            if (isDone && idSemester == this.state.filter.idSemester && idFolder == this.state.filter.idFolder && requester == this.props.system.user.email) {
                T.alert(`Scan hoàn tất ${this.state.total} bảng`, 'success', false, 2000);
                this.setState({ validFiles: [], current: 0, total: 0, displayState: 'import' }, () => {
                    this.tab.tabClick(null, 0);
                    this.getPage(() => {
                        this.sectionDetail.setValue(stateHistory);
                        this.uploadForm.showFilesUploaded([], true);
                    });
                });
            }
        });
        T.socket.on('save-scan-diem-sinh-vien', ({ requester, idSemester, idFolder, maHocPhan, isDone }) => {
            if (idSemester == this.state.filter.idSemester && idFolder == this.state.filter.idFolder && requester == this.props.system.user.email) {
                if (!isDone) T.alert(`Đang lưu điểm của lớp học phần ${maHocPhan}!`, 'info', false, null, true);
                else T.alert('Lưu điểm scan thành công!', 'success', true, 5000);
            }
        });
    }

    getPage = (done) => {
        this.props.getListScanResult(this.state.filter, done);
        this.sectionDetail.setValue(this.state.filter);
    }

    componentWillUnmount() {
        T.socket.off('grade-scan-start');
        T.socket.off('grade-scan-result');
        T.socket.off('grade-rescan-result');
        T.socket.off('save-scan-diem-sinh-vien');
    }

    handleUploadComplete = () => {
    }

    handleUploadSuccess = (data) => {
        let { validFiles } = data;
        validFiles = validFiles.map(item => ({
            name: item.originalFilename,
            size: item.size,
            type: 'image/jpeg'
        }));
        if (!validFiles.length) {
            T.alert('File không hợp lệ! Vui lòng tải file jpg/jpeg', 'error', true);
        } else {
            let currentFiles = this.state.validFiles;
            const filterFiles = currentFiles.length ? validFiles.filter(item => currentFiles.some(cur => cur.name != item.name || cur.size != item.size)) : validFiles;
            filterFiles.length ?
                this.setState({ stateScan: 'readyToScan', validFiles: [...currentFiles, ...filterFiles] }, () => {
                    this.threshold.value(0.1);
                    this.uploadForm.showFilesUploaded(filterFiles);
                }) : T.notify('Trùng file! Vui lòng upload file khác hoặc xoá file hiện tại!');
        }

    }

    handleUploadError = (error) => {
        T.alert(`Upload các file scan bị lỗi: ${error}`, 'error', true);
    }

    handleStartScan = (e) => {
        e.preventDefault();
        let { validFiles, filter } = this.state;
        T.post('/api/dt/diem/folder-scan/start-origin', { validFiles, filter, threshold: this.threshold.value() }, (result) => {
            if (result.error) T.alert('Lỗi hệ thống', 'danger', false, 2000);
        });
    }

    renderResultScan = (list) => {
        return renderDataTable({
            data: list,
            stickyHead: list && list.length > 10,
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto' }} />
                <TableHead content='ID' style={{ width: 'auto' }} />
                <TableHead content='Mã lớp học phần' style={{ width: '20%' }} />
                <TableHead content='Mã môn học' style={{ width: '20%' }} />
                <TableHead content='Tên học phần' style={{ width: '40%' }} />
                <TableHead content='Sỉ số' style={{ width: 'auto' }} />
                <TableHead content='Thứ tự danh sách' style={{ width: '20%' }} />
                <TableHead content='Số lần scan' style={{ width: 'auto' }} />
                <TableHead content='Lần scan cuối' style={{ width: 'auto' }} />
                {/* <TableHead content='Thao tác' style={{ width: 'auto' }} /> */}
            </tr>,
            renderRow: (item, index) => {
                let stuIdIndex = JSON.parse(item.stuIdIndex),
                    first = Object.keys(stuIdIndex)[0],
                    last = Object.keys(stuIdIndex).pop();
                return <React.Fragment key={index}>
                    <tr>
                        <TableCell content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`0000000${item.id}`.slice(-7)} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maMonHoc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.siSo} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${first} - ${last}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLanScan} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.lastScan ? T.dateToText(new Date(item.lastScan), 'HH:MM:ss dd/mm/yyyy') : ''} />
                        {/* <TableCell type='buttons' permission={{ write: !!item.soLanScan }} onEdit={() => { }}>
                            <Tooltip title='Scan lại' arrow >
                                <button className='btn btn-warning'>
                                    <i className='fa fa-lg fa-refresh' />
                                </button>
                            </Tooltip>
                        </TableCell> */}
                    </tr>
                </React.Fragment>;
            }
        });
    }
    render() {
        // let { pageScan } = this.props.dtDiem || {};
        const { filter: { idSemester, idFolder }, stateScan } = this.state;
        const tabs = [
            {
                title: 'Kết quả scan',
                component: <div className='tile'>
                    <SectionDetailResult ref={e => this.sectionDetail = e} />
                </div>
            },
            // {
            //     title: 'Danh sách bảng scan',
            //     component: <div className='tile'>
            //         <div className='tile-body'>
            //             {this.renderResultScan(pageScan)}
            //         </div>
            //     </div>
            // },
            {
                title: 'Upload Box',
                component: <div className='tile'>
                    <div className='tile-body'>
                        <FormUpload uploadType='GradeScanFile' userData='GradeScan' onSuccess={this.handleUploadSuccess} onComplete={this.handleUploadComplete} onError={this.handleUploadError} ref={e => this.uploadForm = e} postUrl={`/user/upload?idFolder=${idFolder}&&idSemester=${idSemester}`} />
                    </div>
                    <div style={{ display: stateScan == 'readyToScan' ? '' : 'none' }} className='tile-footer'>
                        <div className='row' style={{ justifyContent: 'flex-end', marginRight: '0px', gap: 20 }}>
                            <FormSelect ref={e => this.threshold = e} placeholder='Mức độ nhận diện vùng tô' data={[
                                { id: 0.05, text: 'Mức 1: Nhỏ' },
                                { id: 0.1, text: 'Mức 2: Trung bình' },
                                { id: 0.15, text: 'Mức 3: Trung bình lớn' },
                                { id: 0.2, text: 'Mức 4: Lớn' },
                            ]} style={{ width: '200px', marginBottom: '0px' }} />
                            <button className='btn btn-warning' onClick={this.handleStartScan}>
                                <i className='fa fa-send fa-lg' /> Scan
                            </button>
                        </div>
                    </div>
                    {/* <ProcessModal ref={e => this.processModal = e} caption={'Hệ thống đang scan. Đừng rời trang cho tới khi hoàn tất!'} /> */}
                </div>
            },
        ];

        return this.renderPage(
            {
                hideTitleSection: true,
                icon: 'fa fa-tags',
                title: 'Quản lý nhập điểm' + (idSemester ? ': Scan hình tô bảng điểm' : ''),
                content: <>
                    <FormTabs ref={e => this.tab = e} tabs={tabs} />
                </>,
                backRoute: '/user/dao-tao/grade-manage/import'
            }
        );
    }
}


const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { createDtDiemMultiple, getListScanResult };
export default connect(mapStateToProps, mapActionsToProps)(DtThoiKhoaBieuScanPage);
