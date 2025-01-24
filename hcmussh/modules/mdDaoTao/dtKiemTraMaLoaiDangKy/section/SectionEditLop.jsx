import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { checkMaLoaiLop, updateMaLoaiDangKyMultiple } from 'modules/mdDaoTao/dtKiemTraMaLoaiDangKy/redux';
import { SelectAdapter_DtLop } from 'modules/mdDaoTao/dtLop/redux';

class SectionEditHocPhan extends AdminPage {

    state = { items: [] }

    componentDidMount() {
        T.socket.on('check-ma-loai-lop', ({ isDone, items, index }) => {
            if (isDone) T.alert('Kiểm tra mã loại đăng ký thành công!', 'success', false, 1000);
            else if (index == 0) T.alert('Thực thi kiểm tra mã loại đăng ký!', 'warning', false, 5000);

            this.setState({ items, isDone });
        });
        this.props.getScheduleSettings(data => {
            let { namHoc, hocKy } = data.currentSemester;
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.setState({ namHoc, hocKy });
        });
    }

    willUnmount() {
        T.socket.off('check-ma-loai-hoc-phan');
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Hiện chưa có dữ liệu nào!',
        header: 'thead-light',
        stickyHead: list.length > 15,
        divStyle: { height: '65vh' },
        renderHead: () => (<tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '10%', whiteSpace: 'nowrap' }}>MSSV</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>HỌ TÊN</th>
            <th style={{ width: '20%', whiteSpace: 'nowrap' }}>MÃ HỌC PHẦN</th>
            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>LOẠI ĐĂNG KÝ HIỆN TẠI</th>
            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>LOẠI ĐĂNG KÝ MỚI</th>
        </tr>),
        renderRow: (item, index) => {
            return (
                <tr key={index} style={{ backgroundColor: item.maLoaiDky != item.newMaLoaiDky ? '#ffcccb' : '#ffff' }}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maLoaiDky} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.newMaLoaiDky} />
                </tr>
            );
        }
    });

    handleCheck = () => {
        const data = {
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            lop: this.lop.value(),
        };
        if (!data.lop) return T.alert('Chưa có lớp sinh viên chọn!', 'error', false, 2000);
        this.props.checkMaLoaiLop(data, () => this.setState({ isCheck: 1 }));
    }

    handleSave = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn chỉnh sửa mã loại đăng ký của học phần?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang cập nhật mã loại đăng ký. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.updateMaLoaiDangKyMultiple(this.state.items.filter(i => i.maLoaiDky != i.newMaLoaiDky));
            }
        });
    }

    render() {
        const { isCheck, items, isDone } = this.state;

        return <>
            <div className='tile'>
                <div className='row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-2' label='Năm học' data={SelectAdapter_SchoolYear} required
                        onChange={value => this.setState({ namHoc: value.id })} />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required
                        onChange={value => this.setState({ hocKy: value.id })} />
                    <FormSelect ref={e => this.lop = e} className='col-md-4' label='Mã lớp' data={SelectAdapter_DtLop({ role: 'dtDangKyHocPhan' })} required />
                    <div className='col-md-4' style={{ margin: 'auto' }}>
                        <div className='d-flex justify-content-end' style={{ gap: 10 }}>
                            <button className='btn btn-info' type='button' onClick={e => e && e.preventDefault() || this.handleCheck()}>
                                <i className='fa fa-fw fa-lg fa-search' />Tính lại mã loại
                            </button>
                            <button className='btn btn-success' style={{ display: isDone ? '' : 'none' }} type='button' onClick={e => e && e.preventDefault() || this.handleSave()}>
                                <i className='fa fa-fw fa-lg fa-save' />Lưu
                            </button>
                        </div>
                    </div>
                </div>
                <div style={{ display: isCheck ? '' : 'none' }}>
                    {this.table(items)}
                </div>
            </div>
        </>;
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getScheduleSettings, checkMaLoaiLop, updateMaLoaiDangKyMultiple };
export default connect(mapStateToProps, mapActionsToProps)(SectionEditHocPhan);
