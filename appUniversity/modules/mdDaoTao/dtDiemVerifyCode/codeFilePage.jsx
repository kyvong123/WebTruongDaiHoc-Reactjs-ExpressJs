import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, TableCell, TableHead, renderDataTable, CirclePageButton } from 'view/component/AdminPage';
import { dtDiemVerifySearchPage, dtDiemVerifyVerify, dtDiemVerifyCancel } from './redux';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Tooltip } from '@mui/material';
import Pagination from 'view/component/Pagination';


class CodeFilePage extends AdminPage {

    state = { dataRender: [], fullData: [], statusCode: [], listChosen: [] }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getScheduleSettings(data => {
                let { namHoc, hocKy } = data.currentSemester,
                    { maDonVi } = this.props.system.user;
                this.namFilter.value(namHoc);
                this.hocKyFilter.value(hocKy);
                this.khoaSinhVienFilter.value(parseInt(namHoc));
                this.khoaDangKyFilter.value(maDonVi || '');
                this.loaiHinhDaoTaoFilter.value('CQ');
                this.setState({
                    filter: { ...this.state.filter, namHoc, hocKy, khoaSinhVien: parseInt(namHoc), loaiHinhDaoTao: 'CQ', searchTerm: '', khoaDangKy: maDonVi }
                }, () => {
                    T.alert('Đang lấy dữ liệu!', 'warning', false, null, true);
                    this.getData(1, 25, () => T.alert('Lấy dữ liệu thành công', 'success', false, 1000));
                });
            });
        });
    }

    getData = (pageN, pageS, done) => {
        const { filter } = this.state;
        this.props.dtDiemVerifySearchPage(pageN, pageS, filter, data => {
            this.setState({ dataRender: data.items.filter(i => i.thanhPhan && (!filter.status || Number(filter.status) == Number(i.isVerified || 0))), fullData: data.items, statusCode: data.statusCode, listChosen: [] }, () => done && typeof done === 'function' && done());
        });
    }

    handleChange = (value, key, pageNumber, pageSize) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.getData(pageNumber, pageSize);
        });
    }

    handleKeySearch = (data) => {
        const { filter } = this.state,
            [key, value] = data.split(':');

        this.setState({ filter: { ...filter, [key]: value } }, () => {
            this.getData();
        });
    }

    handleCancel = data => {
        T.confirm('Hủy bảng điểm', 'Thao tác này sẽ hủy các mã bảng điểm và điểm của sinh viên. Bạn có chắc chắn muốn hủy bảng điểm?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang hủy bảng điểm!', 'warning', false, null, true);
                this.props.dtDiemVerifyCancel([data], () => {
                    this.getData(null, null, () => T.alert('Hủy bảng điểm thành công', 'success', false, 1000));
                });
            }
        });
    }

    handleVerify = data => {
        T.confirm('Xác nhận điểm', 'Bạn có chắc chắn muốn xác nhận điểm không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xác nhận điểm!', 'warning', false, null, true);
                this.props.dtDiemVerifyVerify([data], () => {
                    this.getData(null, null, () => T.alert('Xác nhận điểm thành công', 'success', false, 1000));
                });
            }
        });
    }

    multipleVerify = () => {
        const { listChosen } = this.state,
            data = listChosen.filter(i => !i.isVerified);
        T.confirm('Xác nhận điểm', 'Bạn có chắc chắn muốn xác nhận điểm không?', true, isConfirm => {
            if (isConfirm) {
                if (!data.length) return T.alert('Chỉ có thể xác nhận những học phần chưa được xác nhận mã!', 'error', false, 2000);
                T.alert('Đang xác nhận điểm!', 'warning', false, null, true);
                this.props.dtDiemVerifyVerify(data, () => {
                    this.getData(null, null, () => T.alert('Xác nhận điểm thành công', 'success', false, 1000));
                });
            }
        });
    }

    multipleCancel = () => {
        const { listChosen } = this.state,
            data = listChosen.filter(i => i.idCode);
        T.confirm('Hủy bảng điểm', 'Thao tác này sẽ hủy các mã bảng điểm và điểm của sinh viên. Bạn có chắc chắn muốn hủy bảng điểm?', true, isConfirm => {
            if (isConfirm) {
                if (!data.length) return T.alert('Chỉ có thể hủy những học phần đã có mã!', 'error', false, 2000);
                T.alert('Đang hủy bảng điểm!', 'warning', false, null, true);
                this.props.dtDiemVerifyCancel(data, () => {
                    this.getData(null, null, () => T.alert('Hủy bảng điểm thành công', 'success', false, 1000));
                });
            }
        });
    }

    table = (dataAssignRole) => renderDataTable({
        emptyTable: 'Không có thời khóa biểu!',
        stickyHead: true,
        header: 'thead-light',
        loadingStyle: { backgroundColor: 'white' },
        divStyle: { height: '60vh' },
        data: Object.keys(dataAssignRole),
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} />
                <TableHead style={{ width: '40%', whiteSpace: 'nowrap' }} content='Tên học phần' keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chọn</th>
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Loại điểm' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Phần trăm' />
                <TableHead style={{ width: '20%', whiteSpace: 'nowrap' }} content='Ca thi' />
                <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Mã xác thực' />
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Người nhập điểm</th>
                <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thời gian tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>;
        },
        renderRow: (item, index) => {
            const rows = [], { listChosen } = this.state;
            let listHocPhan = dataAssignRole[item] || [],
                rowSpan = listHocPhan.length;

            if (rowSpan) {
                for (let i = 0; i < rowSpan; i++) {
                    const hocPhan = listHocPhan[i],
                        icon = hocPhan.isVerified ? 'fa fa-lg fa-check-circle' : 'fa fa-lg fa-file-o',
                        text = hocPhan.isVerified ? 'Đã xác nhận' : 'Chưa xác nhận',
                        color = hocPhan.isVerified ? 'green' : 'red',
                        isCheck = listChosen.find(i => i.maHocPhan == hocPhan.maHocPhan && i.thanhPhan == hocPhan.thanhPhan && i.idExam == hocPhan.idExam),
                        listRest = listChosen.filter(i => !(i.maHocPhan == hocPhan.maHocPhan && i.thanhPhan == hocPhan.thanhPhan && i.idExam == hocPhan.idExam));

                    if (i == 0) {
                        rows.push(
                            <tr key={`${item}-${rows.length}`} style={{ backgroundColor: '#fff' }}>
                                <TableCell rowSpan={rowSpan} content={index + 1} />
                                <TableCell rowSpan={rowSpan} content={hocPhan.maHocPhan} />
                                <TableCell rowSpan={rowSpan} content={T.parse(hocPhan.tenMonHoc, { vi: '' })?.vi} />
                                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={isCheck} permission={{ write: true }}
                                    onChanged={value => this.setState({ listChosen: value ? [...listChosen, hocPhan] : listRest })} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thanhPhan == 'CK' ? hocPhan.tenThanhPhan : 'Quá trình'} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thanhPhan == 'CK' ? hocPhan.phanTram : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.idExam ? <>
                                    {`Ca thi: ${hocPhan.caThi}`}<br />
                                    {`Phòng: ${hocPhan.phong}`}<br />
                                    {`Ngày: ${T.dateToText(parseInt(hocPhan.batDau))}`}
                                </> : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.idCode} />
                                <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.userPrint} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.printTime ? T.dateToText(parseInt(hocPhan.printTime)) : ''} />
                                <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: ' center', cursor: 'pointer' }} content={item} >
                                    <Tooltip title='Xác nhận điểm' arrow>
                                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.handleVerify(hocPhan)} style={{ display: !hocPhan.isVerified ? '' : 'none' }}>
                                            <i className='fa fa-lg fa-check' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Hủy bảng điểm' arrow>
                                        <button className='btn btn-danger' onClick={e => e.preventDefault() || this.handleCancel(hocPhan)} style={{ display: hocPhan.idCode ? '' : 'none' }}>
                                            <i className='fa fa-lg fa-ban' />
                                        </button>
                                    </Tooltip>
                                </TableCell>
                            </tr>
                        );
                    } else {
                        rows.push(
                            <tr key={`${item}-${rows.length}`} style={{ backgroundColor: '#fff' }}>
                                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={isCheck} permission={{ write: true }}
                                    onChanged={value => this.setState({ listChosen: value ? [...listChosen, hocPhan] : listRest })} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.thanhPhan == 'CK' ? hocPhan.tenThanhPhan : 'Quá trình'} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.thanhPhan == 'CK' ? hocPhan.phanTram : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.idExam ? <>
                                    {`Ca thi: ${hocPhan.caThi}`}<br />
                                    {`Phòng: ${hocPhan.phong}`}<br />
                                    {`Ngày: ${T.dateToText(parseInt(hocPhan.batDau))}`}
                                </> : ''} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.idCode} />
                                <TableCell style={{ whiteSpace: 'nowrap', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.userPrint} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={hocPhan.printTime ? T.dateToText(parseInt(hocPhan.printTime)) : ''} />
                                <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: ' center', cursor: 'pointer' }} content={item} >
                                    <Tooltip title='Xác nhận điểm' arrow>
                                        <button className='btn btn-success' onClick={e => e.preventDefault() || this.handleVerify(hocPhan)} style={{ display: !hocPhan.isVerified ? '' : 'none' }}>
                                            <i className='fa fa-lg fa-check' />
                                        </button>
                                    </Tooltip>
                                    <Tooltip title='Hủy bảng điểm' arrow>
                                        <button className='btn btn-danger' onClick={e => e.preventDefault() || this.handleCancel(hocPhan)} style={{ display: hocPhan.idCode ? '' : 'none' }}>
                                            <i className='fa fa-lg fa-ban' />
                                        </button>
                                    </Tooltip>
                                </TableCell>
                            </tr>
                        );
                    }
                }
            }
            return rows;
        }
    });

    render() {
        const adapterTinhTrang = [{ id: '0', text: 'Chưa xác nhận' }, { id: '1', text: 'Đã xác nhận' }],
            { dataRender } = this.state,
            { pageNumber, pageSize, pageTotal, totalItem } = dataRender && dataRender[0] ? dataRender[0] : { pageNumber: 1, pageSize: 25, pageTotal: 0, totalItem: 0 };
        return <div className='tile'>
            <div className='row'>
                <FormSelect ref={e => this.namFilter = e} data={SelectAdapter_SchoolYear} className='col-md-2' label='Năm học' onChange={value => this.handleChange(value.id, 'namHoc')} />
                <FormSelect ref={e => this.hocKyFilter = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.handleChange(value?.id, 'hocKy')} />
                <FormSelect ref={e => this.khoaSinhVienFilter = e} className='col-md-2' label='Khoá' data={SelectAdapter_DtKhoaDaoTao} onChange={value => this.handleChange(value?.id, 'khoaSinhVien')} allowClear />
                <FormSelect ref={e => this.loaiHinhDaoTaoFilter = e} className='col-md-2' label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={value => this.handleChange(value?.id, 'loaiHinhDaoTao')} allowClear />
                <FormSelect ref={e => this.khoaDangKyFilter = e} className='col-md-2' label='Đơn vị tổ chức' data={SelectAdapter_DtDmDonVi()} onChange={value => this.handleChange(value?.id, 'khoaDangKy')} allowClear />
                <FormSelect ref={e => this.status = e} className='col-md-2' label='Tình trạng' data={adapterTinhTrang} onChange={value => this.handleChange(value?.id, 'status')} allowClear />
            </div>
            <div>
                <div style={{ margin: '5px 0' }}>
                    <Pagination style={{ marginLeft: '', position: 'initial' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                        getPage={this.getData} pageRange={5} />
                </div>
                {this.table(dataRender.groupBy('maHocPhan'))}
            </div>
            <CirclePageButton type='custom' tooltip='Xác nhận điểm' customIcon='fa fa-check' customClassName='btn-primary' onClick={e => e && e.preventDefault() || this.multipleVerify()} />
            <CirclePageButton type='custom' tooltip='Hủy bảng điểm' customIcon='fa fa-ban' customClassName='btn-danger' onClick={e => e && e.preventDefault() || this.multipleCancel()} style={{ right: '70px' }} />
            <CirclePageButton type='export' tooltip='Xuất dữ liệu' onClick={e => e && e.preventDefault() || T.get('/api/dt/diem-verify/export', { filter: T.stringify(this.state.filter) })} style={{ right: '130px' }} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings, dtDiemVerifySearchPage, dtDiemVerifyVerify, dtDiemVerifyCancel };
export default connect(mapStateToProps, mapActionsToProps)(CodeFilePage);