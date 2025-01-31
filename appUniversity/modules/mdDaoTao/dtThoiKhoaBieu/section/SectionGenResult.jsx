import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormTabs } from 'view/component/AdminPage';
import { saveGenDtThoiKhoaBieu } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';


class SectionResult extends AdminPage {

    state = { listHocPhan: [], listTime: [] }

    componentDidMount() {
        T.socket.on('genTKB', ({ listHocPhan, listTime, status }) => {
            this.setState({ listHocPhan, listTime, status });
        });
    }

    willUnmount() {
        T.socket.off('genTKB');
    }

    genResultRoom = (data) => renderTable({
        getDataSource: () => data,
        stickyHead: data && data.length > 10,
        emptyTable: 'Không có dữ liệu.',
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã học phần</th>
            <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Số tiết</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tiết/Buổi</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết thúc</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Sức chứa</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Dự kiến</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Lớp</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            const rows = [];

            rows.push(<Tooltip arrow title={item.thoiGianPhuHop ? (item.phong ? '' : 'Không tìm thấy phòng phù hợp') : ''}>
                <tr key={item.id} style={{ backgroundColor: item.thoiGianPhuHop ? (item.phong ? '#ffffff' : '#fad08c') : '#ffffff' }}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell type='number' content={item.tongTiet} />
                    <TableCell type='number' content={item.thu == 8 ? 'CN' : item.thu} />
                    <TableCell type='number' content={item.tietBatDau} />
                    <TableCell type='number' content={item.soTietBuoi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayBatDau)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} type='date' dateFormat='dd/mm/yyyy' content={parseInt(item.ngayKetThuc)} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell type='number' content={item.sucChua ? parseInt(item.sucChua) : ''} />
                    <TableCell type='number' content={item.soLuongDuKien} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLop} />
                    <TableCell type='buttons' content={item}>
                        <Tooltip title='Chi tiết' arrow>
                            <button className='btn btn-primary' style={{ display: item.listTuanHoc && item.listTuanHoc.length ? '' : 'none' }}
                                data-toggle='collapse' data-target={`#collapse_${item.id}`} aria-expanded='true' aria-controls={`collapse_${item.id}`}
                            >
                                <i className='fa fa-lg fa-bars' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>
            </Tooltip>);

            if (item.listTuanHoc && item.listTuanHoc.length) {
                rows.push(<tr className='collapse' id={`collapse_${item.id}`}>
                    <td colSpan={13}>
                        {
                            renderTable({
                                getDataSource: () => item.listTuanHoc,
                                emptyTable: 'Chưa có thông tin tuần học!',
                                header: 'thead-light',
                                stickyHead: item.listTuanHoc.length > 10,
                                renderHead: () => <tr>
                                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                    <th style={{ width: '5%', whiteSpace: 'nowrap' }}>Tuần</th>
                                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Ngày học</th>
                                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Thứ</th>
                                    <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Phòng</th>
                                    <th style={{ width: '65%', whiteSpace: 'nowrap' }}>Tiết học</th>
                                </tr>,
                                renderRow: (tuan, index) => {
                                    return (<tr key={`${item.id}_${index}`}>
                                        <TableCell content={index + 1} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={tuan.tuanBatDau} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.convertDate(Number(tuan.ngayHoc), 'DD/MM/YYYY')} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={tuan.thu == 8 ? 'CN' : tuan.thu} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={tuan.phong} />
                                        <TableCell content={`Tiết: ${tuan.tietBatDau} - ${tuan.tietBatDau + tuan.soTietBuoi - 1} (${tuan.gioBatDau} - ${tuan.gioKetThuc})`} />
                                    </tr>);
                                }
                            })
                        }
                    </td>
                </tr>);
            }

            return rows;
        }
    })

    saveGenData = () => {
        T.confirm('Lưu kết quả', 'Bạn chắc chắn muốn lưu kết quả sinh thời khóa biểu không?', isConfirm => {
            if (isConfirm) {
                const dataSave = this.state.listHocPhan.filter(i => i.thoiGianPhuHop);
                if (!dataSave.length) return T.alert('Không có học phần để lưu!');

                T.alert('Đang thực thi lưu kết quả. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.saveGenDtThoiKhoaBieu(dataSave, () => {
                    T.alert('Lưu kết quả thành công', 'success', false, 2000);
                    this.props.handleSubmitResult();
                });
            }
        });
    }

    render() {
        const { listHocPhan, status } = this.state;
        return (
            <section id='config'>
                <div className='tile'>
                    <div className='tile-title'>
                        <h4>Bước 2: KẾT QUẢ SINH.</h4>
                        <button className='btn btn-primary' type='button' style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={this.saveGenData} disabled={status == 'gen'}>
                            {status == 'gen' ? 'Đang sinh kết quả' : 'Lưu kết quả'}&nbsp;<i className={status == 'gen' ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-save'} />
                        </button>
                    </div>
                    <div className='tile-body'>
                        <FormTabs tabs={[
                            { title: 'Danh sách các học phần đã xếp', component: <div>{this.genResultRoom(listHocPhan.filter(item => item.thoiGianPhuHop))}</div> },
                            { title: 'Danh sách các học phần không sinh được lịch', component: <div>{this.genResultRoom(listHocPhan.filter(item => !item.thoiGianPhuHop))}</div> },
                        ]} />
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtThoiKhoaBieu: state.daoTao.dtThoiKhoaBieu });
const mapActionsToProps = { saveGenDtThoiKhoaBieu };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionResult);