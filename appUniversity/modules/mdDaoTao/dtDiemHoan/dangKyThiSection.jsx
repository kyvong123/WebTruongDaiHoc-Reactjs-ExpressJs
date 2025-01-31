import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
// import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
// import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getDtDiemHoanBySinhVien, getDtDinhChiThiDangKyThi, createDtDinhChiThiDangKyThi } from './redux';
import { updateDtDiemSinhVien } from 'modules/mdDaoTao/dtDiemAll/redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import { NhapDiemSvSection } from 'modules/mdDaoTao/dtDiemAll/section/nhapDiemSvSection';
import { Tooltip } from '@mui/material';

class DangKyModal extends AdminModal {
    state = { selected: '', hocPhanDangKy: [] };
    selected = {};
    mapperKyThi = { GK: 'Giữa kỳ', CK: 'Cuối kỳ' };

    componentDidMount = () => {
        this.onHidden(() => {
            for (let item of this.state.hocPhanDangKy) {
                this.selected[item.maHocPhan]?.value('');
            }
        });
    }

    onShow = (item) => {
        let filter = { maMonHoc: item.maMonHoc, namHoc: item.namHoc, hocKy: item.hocKy, kyThiHoan: item.kyThiHoan };
        this.props.get(filter, (data) => {
            this.setState({ hocPhanDangKy: data.items, item }, () => {
                this.kyThi.value(item.tenKyThiHoan);
            });
        });
    }

    handleSelect = (value, item) => {
        if (value) {
            let { selected } = this.state;
            this.selected[selected]?.value(false);
            this.setState({ selected: item.maHocPhan });
        }
    }

    onSubmit = () => {
        let { item, selected } = this.state,
            data = { mssv: item.mssv, maHocPhanHoan: item.maHocPhan, kyThi: item.kyThiHoan, maHocPhanThi: selected };

        if (!selected) return T.notify('Không có học phần chọn!', 'danger');
        this.props.create(data, () => {
            this.hide();
            this.props.getData();
        });
    }

    render = () => {
        let { hocPhanDangKy } = this.state;
        let table = renderDataTable({
            emptyTable: 'Không có học phần trong năm học, học kỳ này',
            data: hocPhanDangKy,
            stickyHead: hocPhanDangKy && hocPhanDangKy.length > 8,
            header: 'thead-light',
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto' }} />
                <TableHead content='Chọn' style={{ width: 'auto' }} />
                <TableHead content='Mã học phần' style={{ width: '30%' }} />
                <TableHead content='Tên học phần' style={{ width: '70%' }} />
            </tr>,
            renderRow: (item, index) => (
                <tr key={item.maHocPhan}>
                    <TableCell content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell content={
                        <FormCheckbox labelClassName='mb-0' ref={e => this.selected[item.maHocPhan] = e} onChange={value => this.handleSelect(value, item)} />}
                        style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableCell content={item.maHocPhan} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.tenMonHoc ? T.parse(item.tenMonHoc, { vi: '' }).vi : ''} style={{ whiteSpace: 'nowrap' }} />
                </tr>
            )
        });

        return this.renderModal({
            title: 'Đăng ký thi sinh viên',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox className='col-md-4' ref={e => this.kyThi = e} label='Kỳ thi' disabled={true} />
                    </div>
                    {table}
                </>
        });
    }
}


class DangKyThiSection extends NhapDiemSvSection {
    ghiChu = {};
    state = { dataHocPhan: [], configQC: [] }
    componentDidMount = () => {
        this.props.getDtDmLoaiDiemAll(data => {
            let dataKyThi = data.filter(item => item.isThi).map(item => {
                return { id: item.ma, text: item.ten };
            });
            this.setState({ dataKyThi });
        });
    }

    getData = () => {
        const { mssv } = this.state;
        if (mssv) {
            T.alert('Đang lấy dữ liệu', 'info', false, null, true);
            this.props.getDtDiemHoanBySinhVien({ mssv }, result => {
                const data = result.items.filter(i => i.isThi != 1);
                this.setState({ dataHocPhan: data, thanhPhanDiem: result.loaiDiem, isShow: !!mssv }, () => {
                    T.alert('Tải dữ liệu thành công!', 'success', false, 1000);
                });
            });
        }
    }

    save = () => {
        const { dataHocPhan } = this.state;
        for (let hocPhan of dataHocPhan) {
            hocPhan.ghiChu = this.ghiChu[hocPhan.maHocPhan].value();
        }

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn cập nhật điểm của sinh viên này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang lưu điểm sinh viên', 'info', false, null, true);
                T.alert('Lưu điểm thành công!', 'success', false, 1000);
            }
        });
    }

    render() {
        let { dataHocPhan, thanhPhanDiem, dataKyThi, isShow } = this.state;

        let table = renderDataTable({
            emptyTable: 'Không có học phần đăng ký',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: dataHocPhan,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                        <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên học phần</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kỳ thi hoãn</th>
                        {thanhPhanDiem && thanhPhanDiem.map(item => {
                            return <th key={item.ma} style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>{item.ten}</th>;
                        })}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Thao tác</th>
                    </tr>
                </>);
            },
            renderRow: (item, index) => {
                let diem = item.diem ? T.parse(item.diem) : {};
                return <tr key={index} >
                    <TableCell content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell content={thanhPhanDiem.find(i => i.ma == item.kyThiHoan)?.ten || item.kyThiHoan} />
                    {thanhPhanDiem && thanhPhanDiem.map(item => {
                        return <td key={item.ma} style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>{isNaN(diem[item.ma]) ? (diem[item.ma] || '') : Number(diem[item.ma]).toFixed(1)}</td>;
                    })}
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi && item.noHocPhi < 0 ? 'text-danger' : 'text-success'}
                        content={item.tinhPhi && item.noHocPhi < 0
                            ? <Tooltip title='Còn nợ học phí'>
                                <i className='fa fa-lg fa-times-circle' />
                            </Tooltip>
                            : <Tooltip title='Đã đóng đủ'>
                                <i className='fa fa-lg fa-check-circle' />
                            </Tooltip>} />
                    <TableCell type='buttons' content={item}>
                        <Tooltip title='Đăng ký thi' arrow>
                            <button className='btn btn-primary' onClick={e => e.preventDefault() || this.modal.show({ ...item, tenKyThiHoan: thanhPhanDiem.find(i => i.ma == item.kyThiHoan)?.ten })} >
                                <i className='fa fa-lg fa-plus' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>;
            }
        });

        return <>
            <DangKyModal ref={e => this.modal = e} get={this.props.getDtDinhChiThiDangKyThi} getData={this.getData} create={this.props.createDtDinhChiThiDangKyThi} dataKyThi={dataKyThi} />
            <div className='tile row'>
                <FormSelect className='col-md-6' label='Mssv' data={SelectAdapter_DangKyHocPhanStudent} onChange={value => this.setState({ mssv: value.id }, this.getData)} />
            </div>
            <div style={{ display: isShow ? '' : 'none' }} className='tile'>
                {table}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtDiemHoanBySinhVien, getDtDinhChiThiDangKyThi, createDtDinhChiThiDangKyThi, getDtDmLoaiDiemAll, updateDtDiemSinhVien };
export default connect(mapStateToProps, mapActionsToProps)(DangKyThiSection);