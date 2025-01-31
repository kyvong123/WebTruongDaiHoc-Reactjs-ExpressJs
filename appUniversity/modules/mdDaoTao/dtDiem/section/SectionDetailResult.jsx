import React from 'react';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, loadSpinner, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getScanGradeResult, saveScanResults, deleteDtDiemScanGradeResult } from 'modules/mdDaoTao/dtDiem/redux';
import { Img } from 'view/component/HomePage';
import { Tooltip } from '@mui/material';


export class ResultScanImg extends React.Component {
    state = { selectedId: '', idSemester: '', idFolder: '' }
    componentDidMount() {
        let { filename, selectedId, idSemester, idFolder, isEdit } = this.props;
        this.setState({ filename, selectedId, idSemester, idFolder, isEdit });
    }
    componentDidUpdate(prevProps) {
        if (this.props && !!this.props.selectedId && !!prevProps.selectedId && prevProps.selectedId != this.props.selectedId) {
            let { filename, selectedId, idSemester, idFolder, isEdit } = this.props;
            this.setState({ filename, selectedId, idSemester, idFolder, isEdit });
        }
    }
    render() {
        let { filename, selectedId, idSemester, idFolder } = this.state;
        let src = T.url(`/api/dt/diem/folder-scan/result-image?idResult=${selectedId}&&idSemester=${idSemester}&&idFolder=${idFolder}&&filename=${filename}`);
        return selectedId ? <Img id={'resultScanImg'} src={src} style={{ display: 'block', height: 'auto', maxWidth: '95%' }} /> : <></>;
    }
}
class SectionDetailResult extends AdminPage {
    textBoxGrade = {}
    checkBoxVt = {}
    state = { isEdit: false, filterMode: 'all', imgHeight: 'calc(100vh - 170px)', rescanDataFull: {} }

    setValue = ({ idSemester, idFolder, namHoc, hocKy }) => {
        this.props.getScanGradeResult(({ idSemester, idFolder }), ({ scanResult, items: gradeResult }) => {
            this.setState({ scanResult, gradeResult, idSemester, idFolder, namHoc, hocKy }, () => {
                scanResult.length && this.handleClickResult(null, scanResult[0], 0, true);
            });
        });
    }

    handleClickResult = (e, item, index, isInit) => {
        e?.preventDefault();
        if (!isInit) {
            this.textBoxGrade = {};
            this.checkBoxVt = {};
        }

        this.setState({ isLoading: true }, () => {
            this.setState({ imgHeight: $('#resultScanImg').height() || 'calc(100vh - 170px)' });
            setTimeout(() => {
                this.setState({ isLoading: false, selectedId: item.id, count: index * 5, selectedResult: item }, () => {
                    if (item.id && item?.scanStatus != 0) {
                        this.retypeSheetCode.value(item.sheetCode || '');
                        this.threshold.value(0.1);
                    }
                    $(`#scroll-${item.id}-container`).animate({ scrollTop: 200 }, 'fast');
                });
            }, 500);
        });
    }

    handleTypeGrade = (grade, item) => {
        let { rescanDataFull, selectedId, selectedResult } = this.state, { pageScan } = this.props.dtDiem,
            rescan = rescanDataFull[selectedId],
            { loaiLamTron } = rescan ? rescan.dataRescan : (pageScan?.find(item => `0000000${item.id}`.slice(-7) == selectedResult.sheetCode) || {});
        let newGrade = null;
        if (grade != undefined) {
            if (isNaN(parseFloat(loaiLamTron))) loaiLamTron = 0.5;
            let rate = parseFloat(loaiLamTron) / 0.1;
            newGrade = Math.round(grade * (10 / rate)) / (10 / rate);
        }
        this.setState({
            gradeResult: this.state.gradeResult.map(cur => (cur.idResult == this.state.selectedId && item.mssv == cur.mssv) ? ({ ...cur, grade: newGrade }) : ({ ...cur }))
        });
    }

    handleCheckMissed = (value, item) => {
        this.setState({ gradeResult: this.state.gradeResult.map(cur => (cur.idResult == this.state.selectedId && item.mssv == cur.mssv) ? { ...cur, isMissed: Number(value) } : { ...cur }) });
    }

    deleteDataScan = () => {
        let { selectedId, gradeResult, scanResult } = this.state;
        T.confirm('Cảnh báo', 'Thao tác này sẽ xóa dữ liệu scan hiện tại. Bạn có chắc chắn muốn tiếp tục?', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteDtDiemScanGradeResult(selectedId, () => {
                    scanResult = scanResult.map(cur => cur.id == selectedId ? { ...cur, scanStatus: 1, scanResult: 'Scan thất bại' } : { ...cur });
                    gradeResult = gradeResult.filter(i => i.idResult != selectedId);
                    this.setState({ gradeResult, scanResult });
                });
            }
        });
    }

    handleRescan = () => {
        let { selectedId, idSemester, idFolder, rescanDataFull } = this.state;
        T.confirm('Cảnh báo', 'Thao tác này sẽ scan lại. Bạn có chắc chắn muốn tiếp tục?', 'warning', true, isConfirm => {
            if (isConfirm) {
                if (!this.retypeSheetCode.value()) {
                    return T.notify('Vui lòng nhập mã bảng điểm', 'danger');
                }
                T.alert('Hệ thống đang rescan. Đừng rời trang cho tới khi hoàn tất!', 'info', false, null, true);
                T.post('/api/dt/diem/folder-scan/start-rescan', {
                    id: this.retypeSheetCode.value(),
                    threshold: this.threshold.value(),
                    idResult: selectedId, idSemester, idFolder,
                }, ({ error, item }) => {
                    if (error) {
                        T.notify(error.message, 'danger');
                    } else {
                        rescanDataFull = {
                            ...rescanDataFull, [selectedId]: {
                                rescanSheetCode: this.retypeSheetCode.value(), dataRescan: item
                            }
                        };
                        this.setState({ rescanDataFull });
                    }
                });
            }
        });
    }

    renderRescanGrade = (dataUpdate, idResult, sheetCode) => {
        let { gradeResult, scanResult } = this.state;

        gradeResult = gradeResult.filter(i => i.idResult != idResult);
        gradeResult.push(...dataUpdate);

        scanResult = scanResult.map(cur => cur.id == idResult ? { ...cur, sheetCode } : { ...cur });
        this.setState({ gradeResult, scanResult });
    }

    renderGrade = (id) => {
        let { isEdit, gradeResult } = this.state, data = gradeResult?.filter(item => item.idResult == id) || [];

        return renderDataTable({
            stickyHead: true,
            divStyle: { maxHeight: isEdit ? '100%' : '65vh', maxWidth: '100%' },
            data,
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto' }} />
                <TableHead content='MSSV' style={{ width: '30%' }} />
                <TableHead content='Họ và tên' style={{ width: '50%' }} />
                <TableHead content='Tên' style={{ width: '20%' }} />
                <TableHead content='V' />
                <TableHead content='Điểm' style={{ width: 'auto' }} />
            </tr>,
            renderRow: (item, index) => {
                let isMissed = isEdit ? <FormCheckbox style={{ marginBottom: '0px' }} ref={e => this.checkBoxVt[item.mssv] = e} value={item.isMissed} onChange={value => this.handleCheckMissed(value, item)} readOnly={item.grade != null} /> : (item.isMissed ? 'x' : ''),
                    grade = !isEdit ? <strong>{item.grade}</strong>
                        : <FormTextBox type='number' step={true} style={{ marginBottom: '0px', width: '50px' }} value={item.grade == null ? '' : item.grade} allowNegative={false} decimalScale={1} min={0} max={10} onChange={e => this.handleTypeGrade(e, item)} readOnly={item.isMissed} />;
                let isFalse = !item.isMissed && isNaN(parseFloat(item.grade));
                return <tr key={index} style={{ fontSize: '0.8rem', }}>
                    <TableCell style={{ textAlign: 'center', backgroundColor: isFalse ? '#ffcccb' : '' }} content={item.indexInFile} />
                    <TableCell content={<strong>{item.mssv}</strong>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ textAlign: 'center' }} content={isMissed} />
                    <TableCell style={{ textAlign: 'center' }} content={grade} />
                </tr>;
            }
        });
    }

    classResultMap = {
        1: 'danger',
        2: 'warning',
        3: 'info',
        '-1': 'secondary',
    };

    content = () => {
        let { isLoading, selectedId, isEdit, idSemester, idFolder, rescanDataFull, selectedResult } = this.state,
            { pageScan } = this.props.dtDiem;
        let rescan = rescanDataFull[selectedId];
        let { sheetCode, filename } = selectedResult || {};
        if (rescan) sheetCode = rescan.rescanSheetCode;
        let { maHocPhan, maMonHoc, tenMonHoc, phanTramDiem = '0', kyThi: loaiDiem } = rescan ? rescan.dataRescan : (pageScan?.find(item => `0000000${item.id}`.slice(-7) == sheetCode) || {});
        return isLoading ? loadSpinner() : (
            <div className='tab-pane fade show active container-fluid ml-1 mb-0 align-top row' id={selectedId} role='tabpanel' aria-labelledby={selectedId} style={{ maxHeight: 'inherit' }}>
                <div id={`scroll-${selectedId}-container`} className='d-inline-block col-md-7 p-1 align-top' style={{ maxHeight: 'inherit', overflow: 'auto' }}>
                    <div style={{ border: 'solid' }}>
                        <ResultScanImg {...{ filename, selectedId, idSemester, idFolder, isEdit }} />
                    </div>
                </div>
                <div className={'d-inline-block col-md-5 p-1 align-top'} style={{ maxHeight: 'inherit' }}>
                    <div style={{ display: !sheetCode || !maMonHoc || isEdit ? 'none' : '', margin: '10px' }}>
                        <div>Mã lớp học phần: <strong className='text-black'>{maHocPhan}</strong></div>
                        <div>Môn học: <strong className='text-black'>{maMonHoc}: {tenMonHoc ? JSON.parse(tenMonHoc).vi : ''}</strong></div>
                        <div>Kỳ thi: <strong className='text-black'>{loaiDiem} - {phanTramDiem}%</strong></div>
                        <div style={{ display: phanTramDiem == null || phanTramDiem == '0' ? '' : 'none', color: 'red' }}>Bảng scan này sẽ không được lưu vì phần trăm điểm bằng 0</div>
                    </div>
                    <div style={{ display: !sheetCode || !maMonHoc ? 'none' : '' }}>{this.renderGrade(selectedId)}</div>
                    <h4 style={{ display: maHocPhan && !maMonHoc ? '' : 'none', color: 'red' }}>KHÔNG TỒN TẠI HỌC PHẦN {maHocPhan}</h4>
                </div>
            </div >
        );
    }

    handleSearch = (e) => {
        let curVal = e.target.value,
            { pageScan, scanResult } = this.props.dtDiem;
        if (curVal && curVal.trim()) {
            curVal = curVal.toLowerCase().trim();
            this.setState({
                scanResult: scanResult.filter(item => {
                    const { maHocPhan, maMonHoc, tenMonHoc } = pageScan?.find(ps => `0000000${ps.id}`.slice(-7) == item.sheetCode) || {};
                    return item.sheetCode.includes(curVal) || (maHocPhan && maHocPhan.toLowerCase().includes(curVal)) || (maMonHoc && maMonHoc.toLowerCase().includes(curVal)) || (tenMonHoc && JSON.parse(tenMonHoc).vi.toLowerCase().includes(curVal));
                })
            });
        } else {
            this.setState({ scanResult });
        }
    }
    handleUpdateGradeResult = (e) => {
        e.preventDefault();
        let { isEdit } = this.state;
        if (isEdit) {
            this.setState({ isEdit: false });
        } else {
            T.confirm('Cảnh báo', 'Thao tác này sẽ cập nhật kết quả scan. Bạn có chắc chắn muốn tiếp tục?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.setState({ isEdit: true });
                }
            });
        }
    }

    handleUpdateForStudent = (e) => {
        e.preventDefault();
        T.confirm('Cảnh báo', 'Thao tác này sẽ cập nhật tất cả bảng điểm được scan cho sinh viên. Bạn có chắc chắn muốn tiếp tục?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let { scanResult, namHoc, hocKy, idSemester, idFolder, rescanDataFull, gradeResult } = this.state,
                    { pageScan } = this.props.dtDiem, dataSave = [];
                for (let result of scanResult.sort((a, b) => a.responseTime - b.responseTime)) {
                    let rescan = rescanDataFull[result.id];
                    let { maHocPhan, maMonHoc, phanTramDiem, kyThi: loaiDiem, loaiLamTron, tinhTrangDiem } = rescan ? rescan.dataRescan : (pageScan?.find(item => `0000000${item.id}`.slice(-7) == result.sheetCode) || {});
                    if (maMonHoc && tinhTrangDiem != 4 && !(phanTramDiem == null || phanTramDiem == '0')) {
                        const data = gradeResult?.filter(i => i.idResult == result.id && (i.isMissed || !isNaN(parseFloat(i.grade))) && !i.dinhChiThi).map(i => ({
                            mssv: i.mssv, diemDacBiet: i.isMissed ? 'VT' : '', diem: i.isMissed ? 0 : i.grade.toString(),
                            idResult: i.idResult, isMissed: i.isMissed, grade: i.grade, idDinhChi: i.idDinhChi,
                        }));
                        dataSave.push({ maHocPhan, maMonHoc, namHoc, hocKy, data: JSON.stringify(data), loaiDiem, phanTramDiem, loaiLamTron, idSemester, idFolder });
                    }
                }
                if (dataSave.length) {
                    T.alert('Đang xử lý', 'warning', false, null, true);
                    this.props.saveScanResults(dataSave, () => {
                        T.alert('Cập nhật tất cả bảng điểm scan thành công!', 'success', true, 1000);
                    });
                } else {
                    T.alert('Không có bảng scan nào có thể lưu!', 'error', true, 1000);
                }
            }
        });
    }

    handleFilter = (e, mode) => {
        e.preventDefault();
        let data = this.props.dtDiem.scanResult;
        switch (mode) {
            case 'success':
                data = data.filter(item => item.scanStatus == '0');
                break;
            case 'error':
                data = data.filter(item => item.scanStatus != '0');
                break;
            default:
                break;
        }
        this.setState({ filterMode: mode, scanResult: data, selectedId: data[0]?.id, selectedResult: data[0], count: 0 });
    }

    onKeyDown = (e) => {
        let { scanResult, selectedId } = this.state;
        let index = scanResult.findIndex(i => i.id == selectedId);
        if (index == -1) return;
        let nextIndex = index;
        if (e.keyCode === 38) {
            nextIndex = (index === 0) ? 0 : (index - 1);
        } else if (e.keyCode === 40) {
            nextIndex = (index === scanResult.length - 1) ? (scanResult.length - 1) : (index + 1);
        } else {
            return;
        }

        const selectedItem = scanResult[nextIndex];
        this.setState({
            selectedId: selectedItem.id,
            count: nextIndex * 5,
            selectedResult: selectedItem
        }, () => {
            if (selectedItem.id && selectedItem.scanStatus !== 0) {
                this.retypeSheetCode.value(selectedItem.sheetCode || '');
                this.threshold.value(0.1);
            }
            $(`#scroll-${selectedItem.id}-container`).animate({ scrollTop: 200 }, 'fast');
        });
    }

    render() {
        let { isEdit, scanResult, selectedId, filterMode, selectedResult, idSemester, idFolder, imgHeight, rescanDataFull } = this.state,
            { scanResult: propsScanResult } = this.props.dtDiem || {}, { filename } = selectedResult || {},
            canRescan = selectedId && selectedResult?.scanStatus != 0;
        const urlResult = `/api/dt/diem-scan/download-scan-result?id=${selectedId}&&idSemester=${idSemester}&&idFolder=${idFolder}`,
            urlOrigin = `/api/dt/diem-scan/download-origin?filename=${filename}&&idSemester=${idSemester}&&idFolder=${idFolder}`;
        return scanResult ? <div className='row'>
            <div className='col-md-12 border-bottom' >
                <div className='row' style={{ marginBottom: '5px', marginLeft: '10px', gap: 10 }}>
                    {/* <FormTextBox className='col-md-2' style={{ marginBottom: '0px', display: isEdit ? 'none' : '' }} onChange={this.handleSearch} /> */}
                    <Tooltip title='Filter: Tất cả' arrow placement='top'>
                        <button className={'btn col-auto ' + (filterMode == 'all' ? 'btn-primary' : 'btn-outline-primary')} onClick={e => this.handleFilter(e, 'all')} style={{ marginBottom: '0px', display: isEdit ? 'none' : '' }} >
                            <i className={'fa fa-lg fa-list-alt'} /> ({propsScanResult.length})
                        </button>
                    </Tooltip>
                    <Tooltip title='Filter: Thành công' arrow placement='top'>
                        <button className={'btn col-auto ' + (filterMode == 'success' ? 'btn-success' : 'btn-outline-success')} onClick={e => this.handleFilter(e, 'success')} style={{ marginBottom: '0px', display: isEdit ? 'none' : '' }} >
                            <i className={'fa fa-lg fa-check-square-o'} /> ({propsScanResult.filter(item => item.scanStatus == '0').length})
                        </button>
                    </Tooltip>
                    <Tooltip title='Filter: Không hợp lệ' arrow placement='top'>
                        <button className={' mr-3 btn col-auto ' + (filterMode == 'error' ? 'btn-danger' : 'btn-outline-danger')} onClick={e => this.handleFilter(e, 'error')} style={{ marginBottom: '0px', display: isEdit ? 'none' : '' }} >
                            <i className={'fa fa-lg fa-window-close'} />  ({propsScanResult.filter(item => item.scanStatus != '0').length})
                        </button>
                    </Tooltip>
                    <Tooltip title='Download hình gốc' arrow placement='top'>
                        <button className={'btn btn-secondary col-auto'} onClick={e => e.preventDefault() || T.download(T.url(urlOrigin), filename)}>
                            <i className={'fa fa-lg fa-download'} />
                        </button>
                    </Tooltip>
                    <Tooltip title='Download hình scan' arrow placement='top'>
                        <button className={'btn btn-secondary col-auto'} onClick={e => e.preventDefault() || T.download(T.url(urlResult), 'scan_' + filename)}>
                            <i className={'fa fa-lg fa-cloud-download'} />
                        </button>
                    </Tooltip>
                    <Tooltip title='Chỉnh sửa' arrow placement='top'>
                        <button className={'btn col-auto ' + (isEdit ? 'btn-secondary' : 'btn-warning')} onClick={this.handleUpdateGradeResult}>
                            <i className={'fa fa-lg ' + (!isEdit ? 'fa-pencil' : 'fa-times')} />
                        </button>
                    </Tooltip>
                    <Tooltip title='Cập nhật điểm' arrow placement='top'>
                        <button className='btn btn-info col-auto' onClick={this.handleUpdateForStudent} style={{ display: !isEdit ? '' : 'none' }}>
                            <i className='fa fa-lg fa-save' />
                        </button>
                    </Tooltip>
                    <div className='col-auto row' style={{ display: (isEdit || !canRescan) ? 'none' : '', marginLeft: '0' }}>
                        <FormTextBox ref={e => this.retypeSheetCode = e} placeholder='Nhập ID để scan đè kết quả hiện tại' className='col-auto' style={{ marginBottom: '0', width: '400px', marginRight: '0' }} />

                        <FormSelect ref={e => this.threshold = e} placeholder='Mức độ nhận diện vùng tô' data={[
                            { id: 0.05, text: 'Mức 1: Nhỏ' },
                            { id: 0.1, text: 'Mức 2: Trung bình' },
                            { id: 0.15, text: 'Mức 3: Trung bình lớn' },
                            { id: 0.2, text: 'Mức 4: Lớn' },
                        ]} style={{ width: '200px', marginBottom: '0px' }} className='col-auto' />
                        <Tooltip title='Scan theo ID' arrow placement='top'>
                            <button className='btn btn-danger col-auto' onClick={e => e.preventDefault() || this.handleRescan()}>
                                <i className='fa fa-lg fa-refresh' />
                            </button>
                        </Tooltip>

                    </div>
                    <div className='col-auto' style={{ display: isEdit ? 'none' : '' }}>
                        <Tooltip title='Xóa dữ liệu scan' arrow placement='top'>
                            <button className='btn btn-warning' onClick={e => e.preventDefault() || this.deleteDataScan()}>
                                <i className='fa fa-lg fa-eraser' />
                            </button>
                        </Tooltip>
                    </div>
                </div>

            </div>
            <div className='col-md-2 border-right show-scrollbar' style={{ maxHeight: imgHeight, overflow: 'auto', marginTop: '5px', display: isEdit ? 'none' : '' }} onWheel={event => {
                if (scanResult && scanResult.length) {
                    let count = this.state.count || 0;
                    if (event.nativeEvent.wheelDelta > 0) {
                        count = ((count - 1) < 0) ? 0 : ((count - 1));
                    } else {
                        count = (count + 1) >= ((scanResult.length - 1) * 5) ? ((scanResult.length - 1) * 5) : (count + 1);
                    }
                    this.setState({ count, selectedId: scanResult[parseInt(count / 5)].id, selectedResult: scanResult[parseInt(count / 5)] }, () => {
                        if (canRescan) this.retypeSheetCode.value(this.state.selectedResult?.sheetCode || '');
                        $(`#scroll-${scanResult[parseInt(count / 5)].id}-container`).animate({ scrollTop: 200 }, 'fast');
                    });
                }
            }} onKeyDown={event => this.onKeyDown(event)} tabIndex="0" >
                <div className='nav flex-column nav-pills' aria-orientation='vertical'>
                    {scanResult.length ? scanResult.map((item, index) => {
                        const rescan = rescanDataFull[item.id];
                        let { maHocPhan, tinhTrangDiem } = rescan ? rescan.dataRescan : (this.props.dtDiem.pageScan?.find(ps => `0000000${ps.id}`.slice(-7) == item.sheetCode) || {});
                        return <a key={index} style={{ cursor: 'pointer' }} className={'nav-link ' + (item.id == selectedId ? `active bg-${this.classResultMap[item.scanStatus]}` : '')}
                            id={item.id} data-toggle='pill' role='tab' aria-controls={item.id} aria-selected='true' onClick={e => this.handleClickResult(e, item, index)}>
                            <div><strong>{item.filename}: {item.sheetCode}</strong></div>
                            <div style={{ fontSize: '0.7rem' }}>{maHocPhan}</div>
                            <div style={{ fontSize: '0.7rem', display: tinhTrangDiem == 4 ? '' : 'none' }}>Học phần bị khóa bảng điểm</div>
                            <i style={{ fontSize: '0.7rem' }}>{T.dateToText(new Date(item.requestTime), 'HH:MM:ss dd/mm/yy')}</i>
                        </a >;
                    }) : 'Không có kết quả'}
                </div>
            </div>
            <div className={isEdit ? 'col-12' : 'col-md-10 pl-0 pr-0'} style={{ maxHeight: imgHeight, overflow: 'hidden' }}>
                <div className='tab-content mt-2' style={{ maxHeight: 'inherit', display: scanResult.length ? '' : 'none' }}>
                    {this.content()}
                </div>
            </div>
        </div > : <>Chưa có kết quả nào.</>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getScanGradeResult, saveScanResults, deleteDtDiemScanGradeResult };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionDetailResult);