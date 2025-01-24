import React from 'react';
import { getValue, FormSelect, FormTextBox, AdminModal, FormRichTextBox } from 'view/component/AdminPage';
// import FileBox from 'view/component/FileBox';
// import { Img } from 'view/component/HomePage';
import { SelectApdater_SvBoTieuChi } from 'modules/mdCongTacSinhVien/svBoTieuChi/redux';
import { MinhChungContent } from './minhChungContent';

// import { SelectAdapter_HocKy } from './redux';
// const formatDate = (numDate) => {
//     const date = new Date(numDate);
//     let day = date.getDate().toString().padStart(2, '0');
//     let month = (date.getMonth() + 1).toString().padStart(2, '0');
//     let year = date.getFullYear().toString();
//     return `${day}/${month}/${year}`;
// };

class PhucKhaoModal extends AdminModal {
    state = { maTieuChi: null, filePath: null, coMinhChung: 0, dsMinhChung: [], editItem: null, dataMinhChung: null }

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(this.onHide);
    }

    onShow = (dataMinhChung, item) => {
        this.maTieuChi.value(item?.maTieuChi);
        if (item) {
            SelectApdater_SvBoTieuChi(this.props.idBo).fetchOne(item.maTieuChi, value => {
                this.changeTieuChi(value);
            });
        }
        this.setState({ id: item?.id, item, dataMinhChung, filePath: null, coMinhChung: false });
    };

    onHide = () => {
        this.minhChungContent?.onHide();
    }

    onSuccess = (data) => {
        if (data.error) {
            T.notify(data.error, 'danger');
        } else {
            if (this.state.editItem) {
                this.saveEditMinhChung(data);
            } else {
                this.addDsMinhChung(data);
            }
            T.notify('Lưu thông tin thành công', 'success');
        }
    }

    reset = () => {
        this.tenHoatDong.value('');
        this.thoiGian.value('');
        this.ghiChu.value('');
    }

    // addDsMinhChung = (data) => {
    //     const { dataMinhChung, maTieuChi } = this.state,
    //         { mssv, namHoc, hocKy } = dataMinhChung;
    //     const dataAdd = {
    //         filePath: data.data,
    //         tenHoatDong: getValue(this.tenHoatDong) ? getValue(this.tenHoatDong) : '',
    //         thoiGian: getValue(this.thoiGian) ? Number(getValue(this.thoiGian)) : '',
    //         ghiChu: getValue(this.ghiChu) ? getValue(this.ghiChu) : '',
    //         timeAdded: Date.now(),
    //         isPhucKhao: 1,
    //     };
    //     const newDsMinhChung = this.state.dsMinhChung;
    //     newDsMinhChung.push(dataAdd);
    //     this.setState({ dsMinhChung: newDsMinhChung }, () => {
    //         this.fileBox.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}`);
    //         this.reset();
    //     });
    // }

    // addNewMinhChung = (e) => {
    //     e.preventDefault();
    //     this.fileBox.onUploadFile({ maTieuChi: this.state.maTieuChi });
    // }

    // saveEditMinhChung = (data) => {
    //     const { dsMinhChung, editItem, maTieuChi, dataMinhChung } = this.state,
    //         { namHoc, hocKy, mssv } = dataMinhChung;
    //     dsMinhChung.forEach(item => {
    //         if (item.filePath == editItem.filePath) {
    //             item.filePath = data ? data.data : item.filePath;
    //             item.tenHoatDong = getValue(this.tenHoatDong) ? getValue(this.tenHoatDong) : '';
    //             item.thoiGian = getValue(this.thoiGian) ? Number(getValue(this.thoiGian)) : '';
    //             item.ghiChu = getValue(this.ghiChu) ? getValue(this.ghiChu) : '';
    //             item.timeAdded = Date.now();
    //         }
    //     });
    //     this.setState({ dsMinhChung, editItem: null }, () => {
    //         this.reset();
    //         this.fileBox?.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${maTieuChi}`);
    //     });
    // }

    // addEditMinhChung = (e) => {
    //     e.preventDefault();
    //     if (this.fileBox.getFile()) {
    //         this.fileBox.onUploadFile({ maTieuChi: this.state.maTieuChi });
    //     } else {
    //         this.saveEditMinhChung(null);
    //     }
    // }

    // deleteMinhChung = (filePath) => {
    //     this.props.deleteMinhChung(filePath, () => {
    //         const newDsMinhChung = this.state.dsMinhChung;
    //         this.setState({ dsMinhChung: newDsMinhChung.filter(mc => mc.filePath != filePath) });
    //     });
    // }

    // editMinhChung = (item) => {
    //     const { mssv } = this.state;
    //     const editImage = `/api/sv/danh-gia-drl/minh-chung?${new URLSearchParams({ mssv, filePath: item?.filePath.split('/')[2], t: Date.now() }).toString()}`;
    //     this.setState({ editItem: item }, () => {
    //         this.tenHoatDong.value(item.tenHoatDong || '');
    //         this.thoiGian.value(item.thoiGian || '');
    //         this.ghiChu.value(item.ghiChu || '');
    //         this.fileBox.box.style.backgroundImage = `url(${editImage})`;
    //         this.fileBox.file = null;
    //     });
    // }


    onSubmit = () => {
        const { namHoc, hocKy } = this.props.dataNamHoc;
        const { dsMinhChung } = this.minhChungContent?.state ?? {};
        const lsDiemDanhGia = this.props.lsDiemDanhGia,
            diem = lsDiemDanhGia.find(item => item.maTieuChi == getValue(this.maTieuChi)),
            { diemSv, diemLt, diemF } = diem;
        const changes = {
            namHoc,
            hocKy,
            maTieuChi: getValue(this.maTieuChi),
            tinhTrang: 'N',
            dataTruoc: JSON.stringify({ diemSv, diemLt, diemF }),
            ghiChu: getValue(this.ghiChuPhucKhao),
            minhChung: (this.state.coMinhChung && dsMinhChung?.length) ? JSON.stringify(dsMinhChung) : null
        };
        this.props.createSvDrlPhucKhao(changes, () => {
            this.hide();
            this.props.onSubmit && this.props.onSubmit();
        });
    }

    changeTieuChi = (value) => {
        this.setState({ maTieuChi: value.id, coMinhChung: !!value.coMinhChung, lienKetSuKien: !!value.lienKetSuKien }, () => {
            const lsDiemDanhGia = this.props.lsDiemDanhGia,
                diem = lsDiemDanhGia.find(item => item.maTieuChi == value.id);
            //     { mssv, namHoc, hocKy } = this.state.dataMinhChung;
            // this.fileBox?.setData('svMinhChungDrl:' + `${mssv}_${namHoc}_HK${hocKy}_${value.id}`);
            this.minhChungContent?.onShow({ ma: diem.maTieuChi, minhChung: diem.minhChung }, this.state.dataMinhChung ?? {});
            if (diem) {
                this.diemSv.value(diem.diemSv || '');
                this.diemLt.value(diem.diemLt || '');
                this.diemF.value(diem.diemF || '');
                const dsMinhChung = T.parse(diem.minhChung || '[]');
                this.setState({ dsMinhChung });
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

    render = () => {
        const { coMinhChung, dsMinhChung, dataMinhChung } = this.state,
            isSuKien = this.state.lienKetSuKien,
            readOnly = this.state.id != null;
            
        return this.renderModal({
            title: 'Phúc khảo điểm rèn luyện',
            size: 'elarge',
            isShowSubmit: !readOnly,
            body: (
                <div className='row' style={dsMinhChung.length ? { maxHeight: '70vh', overflow: 'hidden auto' } : {}}>
                    <FormSelect ref={e => this.maTieuChi = e} label='Tiêu chí phúc khảo' data={SelectApdater_SvBoTieuChi(this.props.idBo)} className='col-md-12' required onChange={(value) => this.changeTieuChi(value)} readOnly={readOnly} />
                    {this.state.maTieuChi && (
                        <>
                            <FormTextBox ref={e => this.diemSv = e} label='Điểm sinh viên' className='col-md-4' readOnly={true} />
                            <FormTextBox ref={e => this.diemLt = e} label='Điểm lớp' className='col-md-4' readOnly={true} />
                            <FormTextBox ref={e => this.diemF = e} label='Điểm khoa' className='col-md-4' readOnly={true} />
                            {(coMinhChung || isSuKien) &&
                                <MinhChungContent ref={e => this.minhChungContent = e} dataMinhChung={dataMinhChung} readOnly={readOnly} isSuKien={isSuKien} deleteMinhChung={this.props.deleteMinhChung} updateLsHoatDong={this.updateLsHoatDong} deleteHoatDong={this.deleteHoatDong}/>
                            }
                        </>
                    )
                    }
                    <FormRichTextBox ref={e => this.ghiChuPhucKhao = e} label='Ghi chú' className='col-md-12' readOnly={readOnly} />
                </div >
            ),
        });
    };
}

export default PhucKhaoModal;