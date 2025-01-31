import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, getValue } from 'view/component/AdminPage';
import { DtThoiKhoaBieuGiangVienCreate, DtThoiKhoaBieuGetGiangVienFilter } from '../redux';

class AdjustGVModal extends AdminModal {
    state = { giangVienData: [], listGiangVien: [], tuanHoc: [] }

    onShow = () => {
        let listTime = [...new Set(this.props.dataTuan.filter((_, index) => this.props.listAddTuanHoc.includes(index)).map(item => {
            return { ngayBatDau: item.ngayBatDau, ngayKetThuc: item.ngayKetThuc, id: item.idThoiKhoaBieu, idTuan: item.idTuan };
        }).flat())];

        let giangVien = [...new Set(this.props.dataTuan.filter((_, index) => this.props.listAddTuanHoc.includes(index)).map(item => {
            return item.shccGiangVien;
        }).flat())];

        let troGiang = [...new Set(this.props.dataTuan.filter((_, index) => this.props.listAddTuanHoc.includes(index)).map(item => {
            return item.shccTroGiang;
        }).flat())];

        DtThoiKhoaBieuGetGiangVienFilter(listTime, list => {
            this.setState({
                listTime,
                giangVienData: list.map(item => ({
                    id: item.shcc,
                    text: `${item.tenDonVi ? (item.tenDonVi || '').getFirstLetters().toUpperCase() + ':' : ''} ${item.trinhDo ? item.trinhDo + ' ' : ''}${item.ho?.toUpperCase() + ' ' + item.ten?.toUpperCase()}`,
                    name: `${item.trinhDo + ' ' || ''}${item.ho?.toUpperCase() + ' ' + item.ten?.toUpperCase()}`,
                }))
            }, () => {
                this.giangVien.value(giangVien);
                this.troGiang.value(troGiang);
            });
        });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const data = {
            dataTuan: this.state.listTime,
            maHocPhan: this.props.maHocPhan,
        };
        let giangVien = getValue(this.giangVien);
        let troGiang = getValue(this.troGiang);

        if (giangVien) {
            let dataGV = {
                giangVien: giangVien,
                type: 'GV',
                textGiangVien: this.state.giangVienData.filter(gv => giangVien.includes(gv.id)).map(gv => gv.name)
            };
            data.dataGV = dataGV;
        }
        if (troGiang) {
            let dataTG = {
                giangVien: troGiang,
                type: 'TG',
                textGiangVien: this.state.giangVienData.filter(tg => troGiang.includes(tg.id)).map(tg => tg.name)
            };
            data.dataTG = dataTG;
        }
        T.confirm('Lưu ý', 'Chọn giảng viên mới sẽ thay đổi toàn bộ giảng viên của các tuần được chọn. Bạn có chắc chắn muốn thay đổi giảng viên không? ', 'warning', true, isConfirm => {
            if (isConfirm) {
                try {
                    this.props.DtThoiKhoaBieuGiangVienCreate(data, () => {
                        this.hide();
                        this.props.handleUpdate();
                    });
                } catch (error) {
                    T.notify('Vui lòng kiểm tra dữ liệu các tham số!', 'danger');
                }
            }
        });
    };

    handleChooseGV = (value) => {
        if (getValue(this.troGiang).includes(value.id)) {
            T.notify('Cán bộ đã được chỉ định làm trợ giảng!', 'warning');
        }
    }

    handleChooseTG = (value) => {
        if (getValue(this.giangVien).includes(value.id)) {
            T.notify('Cán bộ đã được chỉ định làm giảng viên!', 'warning');
        }
    }

    render = () => {
        const dataTuan = this.props.dataTuan;
        return this.renderModal({
            title: 'Thêm giảng viên và trợ giảng',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.giangVien = e} className='col-md-6' label='Chọn giảng viên' data={this.state.giangVienData} allowClear={true} multiple={true} onChange={this.handleChooseGV} />
                <FormSelect ref={e => this.troGiang = e} className='col-md-6' label='Chọn trợ giảng' data={this.state.giangVienData} allowClear={true} multiple={true} onChange={this.handleChooseTG} />
                <div className='col-md-12 d-flex flex-column' style={{ height: '50vh', overflow: 'scroll' }}>
                    {dataTuan.length && this.props.listAddTuanHoc.sort((a, b) => a - b).map((id, index) => {
                        let { ngayHoc, tuanBatDau, thu, giangVien, troGiang } = dataTuan[id];
                        return (
                            <div key={index} className='bg-warning text-black my-2' style={{ width: '70%', marginLeft: '15%' }} >
                                <section className='pt-2 pb-2 pl-3 row'>
                                    <section className='col-md-4'>
                                        <div className='row'>
                                            <div className='col-md-12'>
                                                <b>Tuần {tuanBatDau} - {thu == 8 ? 'Chủ nhật' : `Thứ ${thu}`}</b><br />
                                                <i>{T.dateToText(ngayHoc, 'dd/mm/yyyy')}</i>
                                            </div>
                                        </div>
                                    </section>
                                    <section className='col-md-8' style={{ display: giangVien && giangVien.length ? '' : 'none' }}>
                                        <div className='row'>
                                            <div className='col'>
                                                {giangVien && giangVien.map((giangVien, i) => <div key={'giangVien ' + i}>{giangVien}</div>)}
                                            </div>
                                            <div className='col'>
                                                {troGiang && troGiang.map((troGiang, i) => <div key={'troGiang ' + i}>{troGiang}</div>)}
                                            </div>
                                        </div>
                                    </section>
                                </section>
                            </div>
                        );
                    })}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    DtThoiKhoaBieuGiangVienCreate
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AdjustGVModal);