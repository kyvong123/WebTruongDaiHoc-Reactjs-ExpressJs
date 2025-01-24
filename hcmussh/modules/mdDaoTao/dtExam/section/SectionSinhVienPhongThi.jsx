import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, TableHead, TableCell, renderTable, renderDataTable, FormSelect } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class ConfirmModal extends AdminModal {
    componentDidMount() {
    }

    onShow = (listSV, listPhong) => {
        listSV = listSV.sort((a, b) => a.stt - b.stt);
        this.setState({ listSV, listPhong, isSubmitting: false });
    };

    onSubmit = (e) => {
        e.preventDefault();
        let { listSV, listPhong } = this.state,
            { phongChuyen } = listPhong;
        this.setState({ isSubmitting: true }, () => {
            T.confirm('Xác nhận', `<div>Bạn có chắc muốn chuyển ${listSV.length} sinh viên này<br />qua ca ${phongChuyen.caThi}, phòng ${phongChuyen.phong} không?</div>`, 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.props.onSaveChuyenSinhVien(listSV, listPhong);
                    this.setState({ isSubmitting: false });
                }
            });
        });
    };

    render = () => {
        let table = renderTable({
            getDataSource: () => this.state.listSV,
            stickyHead: true,
            header: 'thead-light',
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='MSSV' />
                <TableHead content='Họ' style={{ width: '70%' }} />
                <TableHead content='Tên' style={{ width: '30%' }} />
                <TableHead content={<div>Ca thi<br />hiện tại</div>} style={{ textAlign: 'center' }} />
                <TableHead content={<div>Ca thi<br />chuyển</div>} style={{ textAlign: 'center' }} />
                <TableHead content={<div>Phòng thi<br />hiện tại</div>} style={{ textAlign: 'center' }} />
                <TableHead content={<div>Phòng thi<br />chuyển</div>} style={{ textAlign: 'center' }} />
            </tr>,
            renderRow: (item) => {
                return <tr key={item.mssv}>
                    <TableCell content={item.stt} />
                    <TableCell content={item.mssv} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.caThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.state.listPhong?.phongChuyen?.caThi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={this.state.listPhong?.phongChuyen?.phong} />
                </tr>;
            }
        });
        return this.renderModal({
            title: 'Xác nhận Chuyển sinh viên',
            size: 'large',
            isLoading: this.state.isSubmitting,
            body: <div>
                {table}
            </div>
        }
        );
    };
}
class SectionSinhVienPhongThi extends AdminPage {
    state = { listHocPhan: [], dssvTong: [], isChuyen: false, checked: false, listChosen: [], phongChuyen: null };

    componentDidMount() {
    }

    setValue = () => {
        this.setState({
            listHocPhan: this.props.listHocPhan, selected: this.props.listHocPhan[0].maHocPhan,
            caSelected: this.props.listHocPhan[0].caThi, phongSelected: this.props.listHocPhan[0].phong, dssvTong: this.props.dssvTong
        }, () => {
            let dssv = this.state.dssvTong.filter(item => item.maHocPhan == this.state.selected && item.caThi == this.state.caSelected && item.phong == this.state.phongSelected);
            this.setState({ dssv });
        });
    }

    chuyenSinhVien = () => {
        this.setState({ isChuyen: true, checked: true }, () => {
            let { listHocPhan, selected, caSelected, phongSelected } = this.state,
                itemSelected = listHocPhan.find(item => item.maHocPhan == selected && item.caThi == caSelected && item.phong == phongSelected),
                dataPhongChuyen = listHocPhan.filter(item => item != itemSelected);
            dataPhongChuyen = dataPhongChuyen.map(item => {
                return {
                    id: `${item.maHocPhan}_${item.caThi}_${item.phong}`,
                    text: `${item.maHocPhan}_Ca ${item.caThi}_${item.phong}`, item
                };
            });
            this.setState({ dataPhongChuyen });
        });
    }

    confirmChuyenSinhVien = () => {
        let { listHocPhan, caSelected, phongSelected } = this.state,
            phongCurr = listHocPhan.find(item => item.caThi == caSelected && item.phong == phongSelected),
            phongChuyen = this.phongChuyen.data().item;
        this.confirmModal.show(this.state.listChosen, { phongCurr, phongChuyen });
    }

    onSaveChuyenSinhVien = (listSV, listPhong) => {
        let { dssvTong } = this.state,
            { phongCurr, phongChuyen } = listPhong;
        for (let sinhVien of listSV) {
            let sv = dssvTong.findIndex(item => item.mssv == sinhVien.mssv && item.maHocPhan == sinhVien.maHocPhan),
                { caThi, phong, batDau, ketThuc } = phongChuyen;
            dssvTong[sv] = { ...sinhVien, caThi, phong, batDau, ketThuc };
        }
        let dssvPhongCurr = dssvTong.filter(item => item.maHocPhan == phongCurr.maHocPhan && item.caThi == phongCurr.caThi && item.phong == phongCurr.phong),
            dssvPhongChuyen = dssvTong.filter(item => item.maHocPhan == phongChuyen.maHocPhan && item.caThi == phongChuyen.caThi && item.phong == phongChuyen.phong);
        dssvTong = dssvTong.filter(item => !dssvPhongCurr.includes(item) && !dssvPhongChuyen.includes(item));

        dssvPhongCurr = dssvPhongCurr.map((item, index) => { return { ...item, stt: index + 1 }; });
        dssvPhongChuyen = dssvPhongChuyen.map((item, index) => { return { ...item, stt: index + 1 }; });
        dssvTong = [...dssvTong, ...dssvPhongCurr, ...dssvPhongChuyen].sort((a, b) => a.maHocPhan < b.maHocPhan ? -1 : (a.mssv < b.mssv ? -1 : 0));
        this.setState({
            dssvTong,
            dssv: dssvTong.filter(sv => sv.maHocPhan == phongCurr.maHocPhan && sv.caThi == phongCurr.caThi && sv.phong == phongCurr.phong)
        }, () => this.resetChuyen());
    }

    resetChuyen = () => {
        this.setState({ isChuyen: false, checked: false, listChosen: [], phongChuyen: null }, () => {
            this.confirmModal.hide();
        });
    }

    chonSinhVien = (value, sinhVien) => {
        if (!sinhVien.length) {
            this.setState({
                listChosen: value ? [...this.state.listChosen, { ...sinhVien }]
                    : this.state.listChosen.filter(item => item.mssv != sinhVien.mssv)
            }, () => this.setState({ checked: !!this.state.listChosen.length }));
        }
    }

    tableLichThiDssv = (list) => renderDataTable({
        emptyTable: 'Không có dữ liệu',
        data: list == null ? null : list,
        stickyHead: true,
        divStyle: { height: '54vh' },
        header: 'thead-light',
        renderHead: () => (<tr>
            <TableHead content='STT' />
            {this.state.isChuyen && <TableHead content='Chọn' />}
            <TableHead content='MSSV' style={{ width: 'auto' }} />
            <TableHead content='Họ' style={{ width: 'auto' }} />
            <TableHead content='Tên' style={{ width: 'auto' }} />
            <TableHead content='Mã lớp học phần' style={{ width: 'auto' }} />
            <TableHead content='Tên học phần' style={{ width: '100%' }} />
            <TableHead content='Học phí' style={{ textAlign: 'center' }} />
            <TableHead content='Trạng thái' />
        </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell style={{ textAlign: 'right' }} content={item.stt} />
                {this.state.isChuyen && <TableCell type='checkbox' isCheck content={this.state.listChosen.map(item => item.mssv).includes(item.mssv)}
                    onChanged={value => this.chonSinhVien(value, item)}
                    permission={this.getUserPermission('dtExam', ['manage', 'write', 'delete', 'import'])} />}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc)?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={!item.isThanhToan ? 'text-danger' : 'text-success'}
                    content={!item.isThanhToan ? <Tooltip title='Còn nợ học phí'>
                        <i className='fa fa-lg fa-times-circle' />
                    </Tooltip>
                        : <Tooltip title='Đã đóng đủ'>
                            <i className='fa fa-lg fa-check-circle' />
                        </Tooltip>} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<div className='text-success'><i className='fa fa-lg fa-check' />Được phép chọn lưu</div>} />
            </tr>
        )
    });

    onCreateLichThi = (e) => {
        e && e.preventDefault();
        let listHocPhan = T.stringify(this.state.listHocPhan.filter(hocPhan => this.state.dssvTong.some(item => item.caThi == hocPhan.caThi && item.phong == hocPhan.phong))),
            dssv = T.stringify(this.state.dssvTong);
        this.props.createLichThi(listHocPhan, dssv);
    };

    render() {
        let { listHocPhan, selected, caSelected, phongSelected, dssvTong, dssv, isChuyen, dataPhongChuyen } = this.state,
            className = isChuyen ? 'btn btn-success' : 'btn btn-primary',
            icon = isChuyen ? 'fa-save' : 'fa-repeat',
            textButton = isChuyen ? 'Lưu thay đổi' : 'Chuyển SV',
            display = !isChuyen ? 'flex' : (this.state.listChosen.length && this.state.phongChuyen ? 'flex' : 'none');
        return (
            <section id='config'>
                <div className='tile mb-0' style={{ boxShadow: 'none' }}>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='row col-md-11'>
                                {this.state.isChuyen && <FormSelect ref={e => this.phongChuyen = e} className='col-md-3 mb-0' label='Chọn phòng' data={dataPhongChuyen}
                                    onChange={value => this.setState({ phongChuyen: value.item })} />}
                                <div className='col-md-1' style={{ display: 'flex', gap: 10 }}>
                                    <button className='btn btn-secondary' style={{ display: isChuyen ? '' : 'none', marginLeft: '10px', height: '34px', alignSelf: 'flex-end' }}
                                        onClick={e => e.preventDefault() || this.setState({ isChuyen: false, listChosen: [], checked: false, phongChuyen: null })}>
                                        <i className='fa fa-lg fa-times' /> Huỷ
                                    </button>
                                </div>
                                <div className='col-md-1 pl-0' style={{ display, gap: 10 }}>
                                    <button className={className} style={{ height: '34px', alignSelf: 'flex-end' }} onClick={e => {
                                        e.preventDefault();
                                        if (isChuyen) this.confirmChuyenSinhVien();
                                        else this.chuyenSinhVien();
                                    }}>
                                        <i className={'fa fa-lg ' + icon} />{textButton}
                                    </button>
                                </div>
                            </div>
                            <div className='col-md-1' style={{ textAlign: 'right' }}>
                                <button className='btn btn-outline-primary' type='button' onClick={this.onCreateLichThi}>
                                    Tạo lịch thi <i className='fa fa-lg fa-save' />
                                </button>
                            </div>
                            <div className='col-md-4 px-0 nav flex-column nav-pills' aria-orientation='vertical' >
                                {listHocPhan && listHocPhan.map((item, index) => {
                                    let { batDau, ketThuc } = item,
                                        ngayThi = new Date(batDau).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                                        soLuong = dssvTong?.filter(sv => sv.maHocPhan == item.maHocPhan && sv.caThi == item.caThi && sv.phong == item.phong).length;
                                    batDau = new Date(batDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                    ketThuc = new Date(ketThuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                    return <a key={index} style={{ cursor: 'pointer' }} aria-selected='true'
                                        className={'nav-link ' + (item.maHocPhan == selected && item.caThi == caSelected && item.phong == phongSelected ? 'active bg-info' : '')}
                                        id={`${item.maHocPhan}-${item.caThi}-${item.phong}`} data-toggle='pill' role='tab' aria-controls={`${item.maHocPhan}-${item.phong}`}
                                        onClick={e => e && e.preventDefault() || this.setState({
                                            selected: item.maHocPhan, caSelected: item.caThi, phongSelected: item.phong,
                                            dssv: dssvTong?.filter(sv => sv.maHocPhan == item.maHocPhan && sv.caThi == item.caThi && sv.phong == item.phong),
                                            isChuyen: false, checked: false, listChosen: [], phongChuyen: null
                                        })}>
                                        <div>{item.maHocPhan}_Ca {item.caThi}_{item.phong}_{ngayThi}_{batDau}-{ketThuc}: {soLuong}</div>
                                    </a>;
                                })}
                            </div>
                            <div className='col-md-8 px-0 tab-content'>
                                {this.tableLichThiDssv(dssv)}
                            </div>
                        </div>
                        <ConfirmModal ref={e => this.confirmModal = e} onSaveChuyenSinhVien={this.onSaveChuyenSinhVien} />
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionSinhVienPhongThi);