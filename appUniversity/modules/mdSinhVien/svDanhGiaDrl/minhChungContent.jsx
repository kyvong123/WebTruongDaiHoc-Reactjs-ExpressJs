import React, { Component } from 'react';
import { getValue, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { Img } from 'view/component/HomePage';
import { updateHoatDong } from 'modules/mdSinhVien/svDanhGiaDrl/redux';

const formatDate = (numDate) => {
    const date = new Date(numDate);
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
};

export class MinhChungContent extends Component {
    state = { dsMinhChung: [], editItem: null }
    // props
    // updateLsMinhChung
    // deleteMinhChung

    onShow = (item, dataMinhChung) => {
        const { mssv, namHoc, hocKy, index, diemSv, isSuKien } = dataMinhChung;
        const dsMinhChung = item.minhChung ? T.parse(item.minhChung) : [];
        this.setState({ maTieuChi: item.ma, index, namHoc, hocKy, mssv, dsMinhChung, diemSv, isSuKien });
        this.tenHoatDong?.value('');
        this.thoiGian?.value('');
        this.ghiChu?.value('');
        this.fileBox?.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${item.ma}_${isSuKien}`);
        this.diem?.value('');
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    };

    handleBeforeUnload = (e) => {
        if (this.isLoading) {
            e.preventDefault();
            return 'Dữ liệu của bạn sẽ bị mất. Bạn có muốn tiếp tục';
        }
    }

    onHide = () => {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    onSuccess = (data) => {
        const { isSuKien } = this.props;
        if (data.error) {
            T.alert(data.error, 'danger');
        } else {
            if (this.state.editItem) {
                if (isSuKien) this.saveEditHoatDong(data);
                else this.saveEditMinhChung(data);
            } else {
                if (isSuKien) this.addDsHoatDong(data);
                else this.addDsMinhChung(data);
            }
            this.isLoading = false;
            T.alert('Lưu thông tin thành công', 'success');
        }
    }

    saveEditMinhChung = (data) => {
        const { dsMinhChung, editItem, maTieuChi, mssv, namHoc, hocKy, isSuKien } = this.state;
        dsMinhChung.forEach(item => {
            if (item.filePath == editItem.filePath) {
                item.filePath = data ? data.data : item.filePath;
                item.tenHoatDong = getValue(this.tenHoatDong) ? getValue(this.tenHoatDong) : '';
                item.thoiGian = getValue(this.thoiGian) ? Number(getValue(this.thoiGian)) : '';
                item.ghiChu = getValue(this.ghiChu) ? getValue(this.ghiChu) : '';
                item.diem = this.props.isSuKien ? getValue(this.diem) : '';
                item.timeAdded = Date.now();
            }
        });
        this.setState({ dsMinhChung, editItem: null }, () => {
            this.tenHoatDong.value('');
            this.thoiGian.value('');
            this.ghiChu.value('');
            this.diem?.value('');
            this.fileBox?.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}_${isSuKien}`);
            this.props.updateLsMinhChung && this.props.updateLsMinhChung(dsMinhChung.length ? JSON.stringify(dsMinhChung) : null, maTieuChi);
        });
    }

    saveEditHoatDong = (data) => {
        let { dsMinhChung, editItem, maTieuChi, mssv, namHoc, hocKy } = this.state,
            { isSuKien } = this.props;
        dsMinhChung = dsMinhChung.map(item => {
            if (item.filePath == editItem.filePath) {
                item.filePath = item.filePath = data ? data.data : item.filePath;
                item.tenHoatDong = item.tenHoatDong = getValue(this.tenHoatDong) ? getValue(this.tenHoatDong) : '';
                item.thoiGian = item.thoiGian = getValue(this.thoiGian) ? Number(getValue(this.thoiGian)) : '';
                item.ghiChu = item.ghiChu = getValue(this.ghiChu) ? getValue(this.ghiChu) : '';
                item.diemSv = getValue(this.diem) ? Number(getValue(this.diem)) : '';
                item.timeAdded = item.timeAdded = Date.now();
            }
            return item;
        });
        this.setState({ dsMinhChung, editItem: null }, () => {
            this.tenHoatDong.value('');
            this.thoiGian.value('');
            this.ghiChu.value('');
            this.diem?.value('');
            this.fileBox?.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}_${isSuKien}`);
            this.props.updateLsHoatDong && this.props.updateLsHoatDong(dsMinhChung, maTieuChi);
        });
    }

    getDataAdded = () => {
        return {
            tenHoatDong: getValue(this.tenHoatDong) ? getValue(this.tenHoatDong) : '',
            thoiGian: getValue(this.thoiGian) ? Number(getValue(this.thoiGian)) : '',
            ghiChu: getValue(this.ghiChu) ? getValue(this.ghiChu) : '',
            diemSv: this.props.isSuKien ? Number(getValue(this.diem)) : '',
            timeAdded: Date.now(),
        };
    }

    addDsMinhChung = (data) => {
        try {
            const { mssv, namHoc, hocKy, maTieuChi } = this.state;

            const dataAdd = this.getDataAdded();
            dataAdd.filePath = data.data;
            const newDsMinhChung = this.state.dsMinhChung;
            newDsMinhChung.push(dataAdd);
            this.setState({ dsMinhChung: newDsMinhChung }, () => {
                const { dsMinhChung } = this.state;
                this.fileBox.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}`);
                this.tenHoatDong.value('');
                this.thoiGian.value('');
                this.ghiChu.value('');
                this.props.updateLsMinhChung && this.props.updateLsMinhChung(dsMinhChung.length ? JSON.stringify(dsMinhChung) : null, maTieuChi);
            });
        } catch (input) {
            if (input.props) T.notify(`${input.props.label} bị trống!`, 'danger');
        }

    }

    addDsHoatDong = (data) => {
        try {
            let { isSuKien } = this.props;
            const { mssv, namHoc, hocKy, maTieuChi } = this.state;
            const dataAdd = this.getDataAdded();
            dataAdd.filePath = data.data;
            const newDsMinhChung = this.state.dsMinhChung;
            newDsMinhChung.push({ ...dataAdd, maTieuChi });
            this.setState({ dsMinhChung: newDsMinhChung }, () => {
                this.fileBox.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}_${isSuKien}`);
                this.tenHoatDong.value('');
                this.thoiGian.value('');
                this.ghiChu.value('');
                this.diem?.value('');
                // this.props.updateLsHoatDong && this.props.updateLsHoatDong({ mssv, namHoc, hocKy, maTieuChi, id: null, ...dataAdd });
                this.props.updateLsHoatDong && this.props.updateLsHoatDong(newDsMinhChung, maTieuChi);
            });
        } catch (input) {
            if (input.props) T.notify(`${input.props.label} bị trống!`, 'danger');
        }
    }

    // on add btn click
    addNewMinhChung = (e) => {
        try {
            e.preventDefault();
            this.isLoading = true;
            const dataAdd = this.getDataAdded();
            T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
            this.fileBox.onUploadFile({ maTieuChi: this.state.maTieuChi, ...dataAdd });
        } catch (input) {
            if (input.props) T.notify(`${input.props.label} bị trống!`, 'danger');
        }
    }

    addEditMinhChung = (e) => {
        try {
            e.preventDefault();
            if (this.fileBox.getFile()) {
                this.isLoading = true;
                const dataAdd = this.getDataAdded();
                T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
                dataAdd.oldPath = this.state.editItem?.filePath;
                this.fileBox.onUploadFile({ maTieuChi: this.state.maTieuChi, id: this.state.editItem?.id, ...dataAdd });
            } else {
                if (this.props.isSuKien) {
                    const { mssv, namHoc, hocKy, maTieuChi, editItem } = this.state;
                    this.saveEditHoatDong(null);
                    updateHoatDong({ mssv, namHoc, hocKy, maTieuChi, id: editItem?.id ? editItem.id : null }, this.getDataAdded());
                    this.props.updateLsMinhChung && this.props.updateLsMinhChung();
                }
                else {
                    this.saveEditMinhChung(null);
                }

            }
        } catch (input) {
            if (input.props) T.notify(`${input.props.label} bị trống!`, 'danger');
        }
    }

    editMinhChung = (item) => {
        const { mssv } = this.state;
        const editImage = `/api/sv/danh-gia-drl/minh-chung?${new URLSearchParams({ mssv, filePath: item?.filePath.split('/')[2], t: Date.now() }).toString()}`;
        this.setState({ editItem: item }, () => {
            this.tenHoatDong.value(item.tenHoatDong || '');
            this.thoiGian.value(item.thoiGian || '');
            this.ghiChu.value(item.ghiChu || '');
            this.props.isSuKien ? this.diem?.value(item.diemSv || '') : '';
            this.fileBox.box.style.backgroundImage = `url(${editImage})`;
            this.fileBox.file = null;
        });
    }

    deleteMinhChung = (item) => {
        T.confirm('Xác nhận xóa minh chứng?', '', isConfirm => {
            if (isConfirm) {
                const { mssv, namHoc, hocKy, maTieuChi } = this.state;
                const filePath = item?.filePath;
                if (this.props.isSuKien) {
                    this.props.deleteHoatDong({ mssv, namHoc, hocKy, maTieuChi, id: item.id }, filePath, () => {
                        const newDsMinhChung = this.state.dsMinhChung?.filter(mc => mc.filePath != filePath);
                        this.setState({ dsMinhChung: newDsMinhChung });
                        this.props.updateLsHoatDong && this.props.updateLsHoatDong(newDsMinhChung, maTieuChi);
                    });
                } else {
                    this.props.deleteMinhChung({ mssv, namHoc, hocKy, maTieuChi }, filePath, () => {
                        const newDsMinhChung = this.state.dsMinhChung;
                        this.setState({ dsMinhChung: newDsMinhChung.filter(mc => mc.filePath != filePath) }, () => {
                            const { dsMinhChung, maTieuChi } = this.state;
                            this.props.updateLsMinhChung && this.props.updateLsMinhChung(dsMinhChung.length ? JSON.stringify(dsMinhChung) : null, maTieuChi);
                        });
                    });
                }
            }
        });
    }

    onFileChange = () => {
        const file = this.fileBox.file;
        const reader = new FileReader();
        reader.onloadend = () => {
            this.fileBox.box.style.backgroundImage = `url(${reader.result})`;
            // this.setState({ imgBase64: reader.result });
        };
        reader.readAsDataURL(file);
    }

    render() {
        const { editItem, dsMinhChung, mssv, namHoc, hocKy, maTieuChi } = this.state,
            { readOnly, isSuKien = true } = this.props,
            date = new Date().getTime();
        return (
            <>
                {!readOnly ? (
                    <>
                        <div className='col-md-6'>
                            {/* {editItem && <div className='col-md-12 mb-4'>
                                    <h6 className='font-weight-bold'>Minh chứng đã có</h6>
                                    <a href={`/api/sv/danh-gia-drl/minh-chung?${new URLSearchParams({ mssv, filePath: editItem?.filePath.split('/')[2], t: date }).toString()}`} target='_blank' rel='noreferrer' >
                                        <Img src={`/api/sv/danh-gia-drl/minh-chung?${new URLSearchParams({ mssv, filePath: editItem?.filePath.split('/')[2], t: date }).toString()}`} style={{ width: '300px', height: 'auto' }} alt='Hình minh chứng' />
                                    </a>
                                </div>} */}
                            <p className='col-md-12'>{(editItem && editItem.filePath) ? 'Chỉnh sửa minh chứng (Chỉ chấp nhận file có đuôi .png, .jpg, .jpeg).' : 'Thêm minh chứng (Chỉ chấp nhận file có đuôi .png, .jpg, .jpeg)'}</p>
                            <div className='position-relative'>
                                {/* {this.fileBox?.file != null && <div style={{ position: 'absolute' }}>
                                    </div>} */}
                                <FileBox postUrl='/user/upload' uploadType='svMinhChungDrl' userData={'svMinhChungDrl'}
                                    accept='.png, .jpg'
                                    success={this.onSuccess}
                                    onFileChange={this.onFileChange}
                                    pending={true}
                                    className='col-md-12'
                                    label='Thêm minh chứng'
                                    ref={e => this.fileBox = e}
                                    style={{ display: this.props.readOnly == true ? 'none' : '' }}
                                />
                                {/* <div style={{ position: 'absolute', top: 0, width: '100%', height: '15rem', textAlign: 'center' }}>
                                        <Img src={`${this.state.imgBase64}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                                    </div> */}
                            </div>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <FormTextBox ref={(e) => this.tenHoatDong = e} type='text' className='col-md-12' label='Tên hoạt động' readOnly={readOnly} required />
                                    <div className='row m-0'>
                                        <FormDatePicker type='date-mask' ref={(e) => this.thoiGian = e} className='col-md-6' label='Thời gian tham gia' readOnly={readOnly} required />
                                        <FormTextBox ref={(e) => this.ghiChu = e} type='text' className='col-md-6' label='Ghi chú' readOnly={readOnly} />
                                    </div>
                                    {isSuKien && <FormTextBox type='number' allowNegative={false} ref={(e) => this.diem = e} className='col-md-12' label='Điểm cộng' readOnly={readOnly} required />}
                                </div>
                                <div className='col-md-12' style={{ textAlign: 'center' }}>
                                    {!editItem && <button className='btn btn-info' type='button' onClick={e => this.addNewMinhChung(e)}>
                                        <i className='fa fa-sm fa-plus' /> Lưu minh chứng
                                    </button>}
                                    {editItem && <>
                                        <button className='btn btn-info mr-2' type='button' onClick={e => this.addEditMinhChung(e)}>
                                            <i className='fa fa-sm fa-pencil' /> Lưu chỉnh sửa
                                        </button>
                                        <button className='btn btn-danger' type='button' onClick={e => {
                                            e.preventDefault(); this.setState({ editItem: null }, () => {
                                                this.tenHoatDong.value('');
                                                this.thoiGian.value('');
                                                this.ghiChu.value('');
                                                this.diem?.value('');
                                                this.fileBox.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}`);
                                            });
                                        }}>
                                            <i className='fa fa-sm fa-ban' /> Hủy chỉnh sửa
                                        </button>
                                    </>}
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
                <div className={(!readOnly ? 'col-md-6' : 'col-md-12')}>
                    <div className='row'>
                        <h6 className='col-md-12'>Danh sách minh chứng đã có ({this.state.dsMinhChung.length})</h6>
                        {dsMinhChung.length ? dsMinhChung.map((minhChung, index) => {
                            const imgUrl = new URLSearchParams({ mssv, filePath: minhChung.filePath.split('/')[2], t: date });
                            return (
                                ((minhChung.filePath != editItem?.filePath) ? <div className={(!readOnly ? 'col-md-6' : 'col-md-4')} key={index}>
                                    <div className='row'>
                                        <div className='col-md-12 mb-4'>
                                            <h6 className='font-weight-bold'>Minh chứng {index + 1}
                                                {!readOnly && <>(
                                                    <a href='#' className='text-info cursor-pointer' onClick={() => this.editMinhChung(minhChung)}>Chỉnh sửa</a> /
                                                    <a href='#' className='text-danger cursor-pointer' onClick={() => this.deleteMinhChung(minhChung)}>Xóa</a>
                                                    )</>} <br />
                                                <span className='text-success'><small>Thời gian cập nhật: {T.dateToText(minhChung.timeAdded)}</small></span>
                                            </h6>
                                            <a style={{ display: 'inline-block', width: '100%', height: '15rem', textAlign: 'left' }} href={`/api/sv/danh-gia-drl/minh-chung?${imgUrl.toString()}`} target='_blank' rel='noreferrer'>
                                                <Img src={`/api/sv/danh-gia-drl/minh-chung?${imgUrl.toString()}`} style={{ maxWidth: '100%', maxHeight: '100%' }} alt='Hình minh chứng' />
                                            </a>
                                            <div className='row mt-3'>
                                                <div className='col-md-12'><span className='font-weight-bold'>Tên hoạt động:</span> {minhChung.tenHoatDong || ''}</div>
                                                <div className='col-md-12'><span className='font-weight-bold'>Thời gian:</span> {minhChung.thoiGian ? formatDate(minhChung.thoiGian) : ''}</div>
                                                <div className='col-md-12'><span className='font-weight-bold'>Ghi chú:</span> {minhChung.ghiChu || ''}</div>
                                                {this.props.isSuKien && <div className='col-md-12'><span className='font-weight-bold'>Điểm cộng:</span> {minhChung.diemSv || ''}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div> : null)
                            );
                        }) : null}
                    </div>
                </div>
            </>
        );
    }
}
