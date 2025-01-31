import React from 'react';
import { AdminPage, renderDataTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { getConfigDiemByHocPhan } from 'modules/mdDaoTao/dtDiemConfig/redux';
import { getLichGiangDayStudentList } from 'modules/mdGiangVien/gvLichGiangDay/redux';
import AdjustThanhPhanDiem from 'modules/mdGiangVien/gvLichGiangDay/adjustThanhPhanDiem';
import { connect } from 'react-redux';
import { Tooltip } from '@mui/material';

class SectionHPStudent extends AdminPage {
    defaultSortTerm = 'mssv_ASC'

    diemTk = {}
    ghiChu = {}

    thanhPhanDiem = {}

    state = { filter: {}, dataConfigThanhPhan: [], dataHocPhan: {}, listStudent: [], dataThanhPhanDiem: [], dataConfigQuyChe: [] }
    mapperLoaiDangKy = {
        'KH': <span className='text-primary'><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span className='text-success'><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span className='text-warning'><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span className='text-danger'><i className='fa fa-lg fa-repeat' /> Học lại</span>,
    }

    mapperStyle = {
        'GK': 'warning',
        'CK': 'danger',
    }

    setData = (data, done) => {
        let { maMonHoc, maHocPhan, namHoc, hocKy, tinhTrangDiem, isAdjust } = data[0];
        this.props.getConfigDiemByHocPhan({ maMonHoc, maHocPhan, namHoc, hocKy }, dataState => {
            let { dataConfig, dataConfigQuyChe = [], dataConfigHocPhan = [], dataConfigMonHoc = [], dataConfigThanhPhan = [], countDiem } = dataState;

            let data = [];
            if (dataConfigHocPhan.length) {
                data = dataConfigHocPhan;
            } else if (dataConfigMonHoc.length) {
                data = dataConfigMonHoc;
            } else {
                dataConfigThanhPhan.forEach(item => {
                    let { loaiThanhPhan, tenThanhPhan, isThi, phanTramMacDinh: phanTram, loaiLamTron = 0.5, phanTramMax = 100, phanTramMin = 0, priority, isLock } = item;
                    data.push({ loaiThanhPhan, tenThanhPhan, isThi, phanTram, loaiLamTron, phanTramMax, phanTramMin, priority, isLock });
                });
            }

            if (!data.length) {
                dataConfigQuyChe = [];
            }

            let listTp = data.map(i => i.loaiThanhPhan);
            dataConfigQuyChe = dataConfigQuyChe.filter(i => listTp.length && i.loaiApDung && listTp.some(tp => i.loaiApDung.split(', ').includes(tp)));
            data.sort((a, b) => b.priority - a.priority);

            this.setState({ tinhTrangDiem, dataConfig, dataConfigQuyChe, dataConfigThanhPhan, dataThanhPhanDiem: data, dataHocPhan: { maMonHoc, maHocPhan, namHoc, hocKy }, countDiem, isAdjust }, () => {
                this.getListStudent(done);
            });
        });
    }

    getListStudent = (done) => {
        let { dataHocPhan, countDiem, dataThanhPhanDiem, isAdjust } = this.state,
            { namHoc, hocKy } = dataHocPhan || {};
        this.props.getLichGiangDayStudentList(this.props.maHocPhan, { namHoc, hocKy }, (items) => {
            this.setState({ listStudent: items }, () => {
                this.setVal(this.state.listStudent);
                done && done();
                if (!countDiem && !isAdjust) T.confirm('Cập nhật tỷ lệ điểm', 'Bạn có muốn cập nhật tỷ lệ điểm của học phần không?', true,
                    isConfirm => isConfirm && this.modal.show({ dataThanhPhanDiem }));
            });
        });
    }

    setVal = (listStudent) => {
        listStudent.forEach(student => {
            let { mssv, diem, ghiChu } = student;
            if (diem && diem['TK'] != null) {
                this.diemTk[mssv]?.value(diem['TK'].toString());
            } else {
                this.diemTk[mssv].value('');
            }
            this.ghiChu[mssv]?.value(ghiChu || '');
        });
    }

    downloadExcel = () => {
        T.handleDownload(`/api/dt/gv/lich-giang-day/download-dssv?maHocPhan=${this.props.maHocPhan}`);
    }

    downloadExcelDiemDanh = () => {
        T.handleDownload(`/api/dt/thoi-khoa-bieu/sinh-vien/download-diem-danh-hoc-phan?maHocPhan=${this.props.maHocPhan}`);
    }

    downloadFormExam = (tp) => {
        const { dataHocPhan } = this.state,
            { maHocPhan, namHoc, hocKy } = dataHocPhan,
            { loaiThanhPhan: kyThi, tenThanhPhan: tenKyThi, phanTram } = tp;

        T.handleDownload(`/api/dt/gv/lich-giang-day/danh-sach-thi?data=${T.stringify({ maHocPhan, kyThi, namHoc, hocKy, tenKyThi, phanTram })}`);
    }

    render() {
        let { dataThanhPhanDiem, listStudent, dataConfigQuyChe, readOnly, isNhapDiem, dataHocPhan, tinhTrangDiem } = this.state,
            widthTP = 30 / (dataThanhPhanDiem.length + 1);

        let studentTable = () => renderDataTable({
            emptyTable: 'Không có dữ liệu sinh viên',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: listStudent,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>MSSV</th>
                        <th style={{ width: '20%', verticalAlign: 'middle' }}>Họ và tên lót</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Tên</th>
                        <th style={{ width: '10%', verticalAlign: 'middle' }}>Lớp</th>
                        {dataThanhPhanDiem.map((item, index) => (<th key={index} style={{ width: `${widthTP}%`, whiteSpace: 'nowrap', textAlign: 'center' }}>{item.tenThanhPhan}</th>))}
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
                        <TableCell content={item.lop} />
                        {listStudent.length && dataThanhPhanDiem.map(thanhPhan => {
                            let loaiThanhPhan = thanhPhan.loaiThanhPhan,
                                diem = item.diem ? item.diem[loaiThanhPhan] : '',
                                diemDacBiet = item.diemDacBiet ? item.diemDacBiet[loaiThanhPhan] : '',
                                timeMod = item.timeModified ? parseInt(item.timeModified[loaiThanhPhan]) : '',
                                userMod = item.userModified ? item.userModified[loaiThanhPhan] : '',
                                title = userMod ? `${T.dateToText(Number(timeMod), 'dd/mm/yyyy HH:MM:ss')}-${userMod}` : '';

                            return isNhapDiem ? <Tooltip arrow title={title}>
                                <td>
                                    <div key={`${item.mssv}_${loaiThanhPhan}`} id={`${item.mssv}_${loaiThanhPhan}`}
                                        contentEditable suppressContentEditableWarning={true}
                                        onBlur={e => this.handleDiem(e, item, thanhPhan)}
                                        onKeyDown={e => this.handlePressDiem(e)}
                                        style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center', cursor: 'auto', border: '1.5px solid #ced4da', borderCollapse: 'collapse', borderRadius: '4px', fontSize: 'large', fontFamily: 'serif' }}
                                    >
                                        {diemDacBiet || diem}
                                    </div>
                                </td>
                            </Tooltip> : <Tooltip arrow title={title}>
                                <td><div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{diemDacBiet || diem}</div></td>
                            </Tooltip>;
                        })}
                        <TableCell style={{ width: 'auto', textAlign: 'center', justifyContent: 'center' }} content={<FormTextBox className='mb-0' ref={e => this.diemTk[item.mssv] = e} readOnly />} />
                        <TableCell style={{ width: 'auto', justifyContent: 'center' }} content={<FormTextBox className='mb-0' placeholder='Ghi chú' ref={e => this.ghiChu[item.mssv] = e} readOnly={readOnly || !isNhapDiem} onBlur={(e) => this.handleGhiChu(e, item.mssv)} />} />
                    </tr>
                );
            }
        });

        return (<>
            <AdjustThanhPhanDiem ref={e => this.modal = e} dataHocPhan={dataHocPhan} dataThanhPhan={dataThanhPhanDiem} handleSetData={done => {
                this.setData([{ ...dataHocPhan, tinhTrangDiem, isAdjust: 1 }], done);
            }} />
            <div style={{ textAlign: 'left', margin: '10px 0px 10px 0px' }}>
                <div className='row' style={{ fontSize: '0.8rem' }}>
                    <div className='col-md-6' style={{ display: dataConfigQuyChe.length ? '' : 'none' }}>
                        <h6>Thông tin các điểm đặc biệt: </h6>
                        {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                            {dataConfigQuyChe.map((item, index) => {
                                return <span key={`qc-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.ma}</b>: {item.moTa} (Áp dụng {item.loaiApDung})</span>;
                            })}
                        </div>}
                    </div>
                    <div className='col-md-6' style={{ display: dataThanhPhanDiem.length ? '' : 'none' }}>
                        <h6>Thông tin các điểm thành phần: </h6>
                        {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                            {dataThanhPhanDiem.map((item, index) => {
                                return <span key={`tp-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.tenThanhPhan} ({item.loaiThanhPhan})</b>: {item.phanTram}% (làm tròn {item.loaiLamTron}) </span>;
                            })}
                        </div>}
                    </div>
                </div>

                <div className='row'>
                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row-reverse', gap: 10, marginTop: '10px' }}>
                        {dataThanhPhanDiem.filter(i => i.isThi).map(tp => <Tooltip key={`printFile${tp.loaiThanhPhan}`} title={`Tải danh sách thi ${tp.tenThanhPhan}`} arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className={`btn btn-${this.mapperStyle[tp.loaiThanhPhan]}`} type='button' onClick={e => e && e.preventDefault() || this.downloadFormExam(tp)}>
                                <i className='fa fa-fw fa-lg fa-print' /> {`Danh sách thi ${tp.tenThanhPhan.toLowerCase()}`}
                            </button>
                        </Tooltip>)}
                        <Tooltip title='Tải danh sách sinh viên' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-info' type='button' onClick={this.downloadExcel}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' /> Danh sách sinh viên
                            </button>
                        </Tooltip>
                        <Tooltip title='Cấu hình phần trăm điểm' arrow placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-success' type='button' onClick={() => {
                                this.modal.show({ dataThanhPhanDiem });
                            }}>
                                <i className='fa fa-fw fa-lg fa-cogs' /> Cấu hình điểm
                            </button>
                        </Tooltip>
                        {/* <Tooltip title='Tải danh sách điểm danh' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-warning' type='button' onClick={this.downloadExcelDiemDanh}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' /> Danh sách điểm danh
                            </button>
                        </Tooltip> */}
                        {/* <Tooltip title='Tải bảng điểm tổng hợp pdf' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-secondary' type='button' onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/thoi-khoa-bieu/download-diem-tong-hop-hoc-phan/pdf?dataHocPhan=${T.stringify(dataHocPhan)}`)}>
                                <i className='fa fa-fw fa-lg fa-file-pdf-o' />
                            </button>
                        </Tooltip>
                        <Tooltip title='Tải bảng điểm tổng hợp excel' arrow={true} placement='top'>
                            <button style={{ height: 'fit-content' }} className='btn btn-success' type='button' onClick={e => e.preventDefault() || T.handleDownload(`/api/dt/thoi-khoa-bieu/download-diem-tong-hop-hoc-phan/excel?dataHocPhan=${T.stringify(dataHocPhan)}`)}>
                                <i className='fa fa-fw fa-lg fa-file-excel-o' />
                            </button>
                        </Tooltip> */}
                    </div>
                </div>
            </div>

            {studentTable()}
        </>);
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getLichGiangDayStudentList, getConfigDiemByHocPhan
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionHPStudent);
