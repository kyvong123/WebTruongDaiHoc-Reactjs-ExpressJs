import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderDataTable, TableCell, TableHead, FormCheckbox, AdminModal, getValue, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmGioiTinhV2 } from 'modules/mdDanhMuc/dmGioiTinh/redux';
import { SelectAdapter_DmDanTocV2 } from 'modules/mdDanhMuc/dmDanToc/redux';
import Pagination from 'view/component/Pagination';
import { getSdhTsInfoTime } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { exportPdf, createTsSdhAdmin, SelectAdapter_NoiSinh, getSbdSettingTsSdh, updateSbdSettingTsSdh, sdhTsSendMailPhanHoi, sdhTsSendMailPhanHoiMultiple, getSdhDanhSachTSPage, autoGenSbdTsSdh, genSbdTsSdh, deleteThiSinh, multiDeleteThiSinh, updateThiSinh, updateMultiThiSinh, lockEditDsts, resetPassword } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { getSdhTsThongTinBieuMau } from 'modules/mdSauDaiHoc/sdhTsThongTinBieuMau/redux';
import { SelectAdapter_NganhByDot } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import { getSdhTsInfoPhanHeData } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { SelectAdapter_SdhHinhThucTuyenSinh } from 'modules/mdSauDaiHoc/sdhTsHinhThuc/redux';
import { SelectAdapter_PhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { ajaxSelectQuanHuyen } from 'modules/mdDanhMuc/dmDiaDiem/reduxQuanHuyen';
import { ajaxSelectPhuongXa } from 'modules/mdDanhMuc/dmDiaDiem/reduxPhuongXa';
import { Tooltip } from '@mui/material';
import { getAllSdhMonThiNgoaiNgu, SelectAdapter_SdhTsMonThiNgoaiNguV2 } from 'modules/mdSauDaiHoc/sdhMonThiTuyenSinh/redux';
import { ModalNewHoSo } from './modal/ModalNewHoSo';
import { copyHsdk } from 'modules/mdSauDaiHoc/sdhTsThiSinhHoSo/redux';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';
import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';
import ExportModal from './modal/ExportModal';
import ViewAccount from './section/ComponentPassword';
class PhanHoiModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();

    }
    onShow = (item) => {
        this.setState({ item }, () => {
            this.email.value(item.email);
        });

    };
    onSend = () => {
        const data = {
            emailTo: this.email.value(),
            tieuDe: this.tieuDe.value(),
            noiDung: this.noiDung.value(),
        };
        if (!data.emailTo) {
            T.notify('Lỗi lấy dữ liệu email', 'danger');
            this.hide();
        } if (!data.tieuDe) {
            T.notify('Tiêu đề không được trống', 'danger');
        } else if (!data.noiDung) {
            T.notify('Nội dung không được trống', 'danger');
        } else {
            this.props.send(data, this.hide);
        }
    };
    render = () => {
        const { ho, ten } = this.state.item ? this.state.item : { ho: '', ten: '' };
        return this.renderModal({
            title: `Phản hồi đến thí sinh ${ho} ${ten}`,
            size: 'large',
            isShowSubmit: false,
            postButtons: <button className='btn btn-success' onClick={this.onSend}>
                <i className='fa fa-lg fa-send' /> Gửi
            </button>,
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.email = e} label='Email nhận' readOnly />
                <FormTextBox className='col-12' ref={e => this.tieuDe = e} label='Tiêu đề' required />
                <FormRichTextBox className='col-12' rows={25} ref={e => this.noiDung = e} label='Nội dung' required />
            </div>
        }
        );
    };
}
class PhanHoiMultipleModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
    }
    onShow = (listItem) => {
        const bcc = listItem.map(item => item.email).join(',');
        this.setState({ bcc }, () => {
            this.bcc?.value(bcc);
        });

    };
    onSend = () => {
        const data = {
            bcc: this.bcc.value(),
            tieuDe: this.tieuDe.value(),
            noiDung: this.noiDung.value(),
        };
        if (!data.bcc) {
            T.notify('Lỗi lấy dữ liệu email', 'danger');
            this.hide();
        } if (!data.tieuDe) {
            T.notify('Tiêu đề không được trống', 'danger');
        } else if (!data.noiDung) {
            T.notify('Nội dung không được trống', 'danger');
        } else {
            this.props.send(data, () => {
                this.tieuDe = '';
                this.noiDung = '';
                this.hide();
            });
        }
    };
    render = () => {
        return this.renderModal({
            title: 'Phản hồi nhiều thí sinh',
            size: 'large',
            isShowSubmit: false,
            postButtons: <button className='btn btn-success' onClick={() => T.confirm('Gửi email đồng loạt', 'Xác nhận gửi email tới hàng loạt thí sinh?', true,
                isConfirm => isConfirm && this.onSend())}>
                <i className='fa fa-lg fa-send' /> Gửi
            </button>,
            body: <div className='row'>
                <FormTextBox className='col-12' ref={e => this.bcc = e} label='Email nhận' readOnly={true} />
                <FormTextBox className='col-12' ref={e => this.tieuDe = e} label='Tiêu đề' required />
                <FormRichTextBox className='col-12' rows={25} ref={e => this.noiDung = e} label='Nội dung' required />
            </div>
        }
        );
    };
}
class SbdSetting extends AdminModal {
    inValue = {};
    numPostfix = '';
    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(() => {
            let { data } = this.state ? this.state : { data: '', sbdSetting: '' };
            Array.isArray(data) && this.props.getDataGen(data);
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.idDot != this.props.idDot) {
            const { idDot } = this.props;
            this.props.getSdhTsInfoPhanHeData(idDot, (data) => {
                this.setState({ phanHe: data });
            });
        }
    }
    onShow = (sbdSetting, data) => {
        const { numPrefix, numPostfix, inValue, startValue } = sbdSetting ? T.parse(sbdSetting) : { numPrefix: 2, numPostfix: 5, inValue: { '01': 9, '02': 9, '03': '8', '04': 7 }, startValue: 0 };
        const { soBaoDanh, maDot, maNganh, maVietTatNganh, tenVietTatPhanHe, tenVietTatHinhThuc } = data ? data : { soBaoDanh: '', maDot: '', maNganh: '', maTsNganh: '', phVietTat: '', htVietTat: '' };
        this.setState({ sbdSetting: T.parse(sbdSetting), data, numPostfix }, () => {
            if (data && data.length) {
                this.numPrefix.value(numPrefix);
                this.numPostfix.value(numPostfix);
                for (const ma in inValue) {
                    this.inValue[ma]?.value(inValue[ma]);
                }
                this.start.value(startValue);
            } else {
                this.sbd.value(soBaoDanh);
                this.maDot.value(maDot);
                this.maNganh.value(maNganh);
                this.maTsNganh.value(maVietTatNganh);
                this.phVietTat.value(tenVietTatPhanHe);
                this.htVietTat.value(tenVietTatHinhThuc);
            }
        });
    };

    onApply = () => {
        let { data } = this.state ? this.state : { data: '', sbdSetting: '' };
        if (data && data.length) {
            for (const key in this.inValue) {
                this.inValue[key] = getValue(this.inValue[key]);
            }
            const changes = {
                numPrefix: getValue(this.numPrefix),
                numPostfix: getValue(this.numPostfix),
                inValue: this.inValue,
                startValue: Number(getValue(this.start)),
            };
            let maxPostfix = Number('9'.repeat(Number(changes.numPostfix)));

            if (!changes.inValue) {
                T.notify('Trung tố không được trống', 'danger');
            } else if (Number(changes.numPrefix) + Number(changes.numPostfix) > 19) {
                T.notify('Tổng số ký tự của sbd quá dài!', 'danger');
            }
            else if (changes.startValue > maxPostfix) {
                T.notify('Số tự động có số ký tự lớn hơn cấu hình', 'danger');
            }

            else {
                this.props.updateSbdSettingTsSdh({ ...changes, startValue: Number(getValue(this.start)) }, () => {
                    this.hide();
                    this.props.getDataGen(data);
                });
            }
        }
        else {
            const changes = {
                sbd: this.sbd.value(),
            };
            if (!changes.sbd) {
                T.confirm('Xoá số báo danh', 'Số báo danh hiện đang trống, xác nhận thay đổi?', true,
                    isConfirm => isConfirm && this.props.genSbdTsSdh(data.id, changes, true, () => {
                        this.props.getPage();
                        this.hide();
                    })
                );
            } else {
                this.props.genSbdTsSdh(data.id, changes, false, () => {
                    this.props.getPage();
                    this.hide();
                });
            }
        }
    };
    render = () => {
        const { data, phanHe, isLockDsts } = this.state ? this.state : { data: '', phanHe, isLockDsts };
        const permission = this.props.permission;

        return this.renderModal({
            title: data && data.length ? 'Đánh số báo danh tự động' : 'Đánh số báo danh tuỳ chỉnh',
            size: 'large',
            isShowSubmit: false,
            postButtons: <button className='btn btn-success' onClick={this.onApply}>
                <i className='fa fa-lg fa-arrow-right' /> Áp dụng
            </button>,
            body: data && data.length ? <>
                <div className='row'>
                    <strong className='text-danger text-center' style={{ padding: '15px', textAlight: 'center' }}>{'Format SBD: <Mã viết tắt ngành><Số tuỳ chọn><Số tự động> '}</strong>
                    <FormTextBox type='number' max={19} min={0} allowNegative={false} ref={e => this.numPrefix = e} label='Số ký tự <Mã viết tắt ngành>' className='col-md-6' readOnly={isLockDsts || !permission.write} required />
                    <FormTextBox type='number' max={19} min={0} allowNegative={false} ref={e => this.numPostfix = e} label='Số ký tự <Số tự động>' className='col-md-6' readOnly={isLockDsts || !permission.write} onChange={(value) => this.setState({ numPostfix: value })} required />
                    {phanHe?.filter(item => item.id != null && item.ma != '03').map(item => {//chỉ xử lý ncs và ch, dbts nhập thẳng khi trúng tuyển
                        return (<>
                            <FormTextBox type='number' max={9} min={0} ref={e => this.inValue[item.ma] = e} label={`Số tuỳ chọn ${item.ten}`} className='col-md-6' readOnly={isLockDsts || !permission.write} required />
                        </>);
                    })}
                    <FormTextBox type='number' max={Number('9'.repeat(Number(this.state.numPostfix)))} min={0} allowNegative={false} ref={e => this.start = e} label='Số tự động chạy từ' className='col-md-6' readOnly={isLockDsts || !permission.write} required />

                </div>

            </>
                :
                <div className='row'>
                    <FormTextBox ref={e => this.maDot = e} label='Mã đợt' className='col-md-4' readOnly />
                    <FormTextBox ref={e => this.maNganh = e} label='Mã ngành' className='col-md-4' readOnly />
                    <FormTextBox ref={e => this.maTsNganh = e} label='Mã viết tắt ngành' className='col-md-4' readOnly />
                    <FormTextBox ref={e => this.phVietTat = e} label='Tên viết tắt phân hệ' className='col-md-4' readOnly />
                    <FormTextBox ref={e => this.htVietTat = e} label='Tên viết tắt hình thức' className='col-md-4' readOnly />
                    <FormTextBox ref={e => this.sbd = e} label='Số báo danh' className='col-md-12' readOnly={isLockDsts || !permission.write} />
                </div>
        });
    };
}
class DanhSachTSPage extends AdminPage {
    defaultSortTerm = 'maNganh_ASC'
    ghiChu = {};
    state = { title: '', idDot: '', filter: {}, sortTerm: 'maNganh_ASC', listChosen: [], checked: false, isKeySearch: true, isFixCol: false, isCoDinh: true };
    componentDidMount() {
        this.isCoDinh.value(this.state.isCoDinh);
        this.isFixCol.value(this.state.isFixCol);
        this.isKeySearch.value(this.state.isKeySearch);
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.lockEditDsts.value(data.isLockDsts ? 1 : 0);
                    this.setState({ idDot: data.id, title: 'Danh sách tuyển sinh đợt ' + data.maDot, isLockDsts: data.isLockDsts });
                    this.getPage();
                    T.socket.on('export-phieu-bao-dot-process', ({ process, requester }) => {
                        if (requester == this.props.system.user.email) {
                            this.setState({ process });
                        }
                    });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
                }
            });
        });
    }
    componentWillUnmount() {
        T.socket.off('export-phieu-bao-dot-process');
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        let sT = data.split(':')?.length > 2 ? T.parse(data?.slice(data?.indexOf(':') + 1))?.maNganh : data.split(':')[1];
        let filter = { ...this.state.filter, [data.split(':')[0]]: sT };
        if (data.split(':')[0] == 'ks_tinh') {
            filter.ks_quan = '';
            filter.ks_phuong = '';
        }
        if (data.split(':')[0] == 'ks_quan') {
            filter.ks_phuong = '';
        }
        this.setState({ filter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (data.split(':')[0] == 'ks_tinh') {
                    this.quan.reloadAjax();
                    this.phuong.reloadAjax();
                }
                if (data.split(':')[0] == 'ks_quan') {
                    this.phuong.reloadAjax();
                }
                this.setState({ listChosen: page.list?.filter(item => this.state.listChosen?.map(item => item.id)?.includes(item.id)), filter }, () => {
                    if (page.list?.length && this.state.listChosen?.length == page.list?.length) {
                        this.checkAll.value(true);
                    } else {
                        this.checkAll.value(false);
                    }
                });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, maKyThi: this.state.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachTSPage(pageN, pageS, pageC, filter, this.state?.sortTerm || this.defaultSortTerm, done);
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    downloadExcel = () => {
        const filter = { ...this.state.filter, maKyThi: this.state.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        T.handleDownload(`/api/sdh/dsts/download-excel?filter= ${JSON.stringify(filter)}`);
        // xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.dsts')), 'Danh sách tuyển sinh.xlsx');
    }

    handleCheck = () => {
        this.setState({ listChosen: [] });
        this.checkAll.value(false);
    }

    getDataGen = (data) => {
        this.props.getSbdSettingTsSdh(_data => {
            _data ? T.confirm3('Đánh số báo danh', 'Tìm thấy cấu hình số báo danh có sẵn, xác nhận áp dụng?<br>Nếu không rõ cấu hình, hãy chọn <b>Cấu hình số báo danh</b>!', 'warning', 'Cấu hình số báo danh', 'Áp dụng', isApply => {
                if (isApply !== null) {
                    if (!isApply) {
                        this.modalSbd.show(_data.sbdSetting, data);
                    } else {
                        this.props.autoGenSbdTsSdh(_data.sbdSetting, data, false, () => {
                            let sbdSetting = _data.sbdSetting ? T.parse(_data.sbdSetting) : { numPrefix: 2, numPostfix: 5, inValue: { '01': 9, '02': 9, '03': 8, '04': 7 }, startValue: 0 };
                            const changes = {
                                ...sbdSetting,
                                startValue: Number(sbdSetting.startValue) + data.length
                            };
                            this.props.updateSbdSettingTsSdh(changes);
                            this.getPage();
                        });
                    }
                }
            }) :
                T.confirm('Đánh số báo danh', 'Không tìm thấy cấu hình số báo danh có sẵn, thiết lập?', 'warning', isConfirm => isConfirm && this.modalSbd.show('', data)
                );
        });
    }

    handleGen = (data, genNull = false) => {
        if (genNull) {
            const changes = {
                sbd: null
            };
            if (!data.length) {
                this.props.genSbdTsSdh(data.id, changes, genNull, () => this.getPage());
            } else {
                this.props.autoGenSbdTsSdh('', data, genNull, () => {
                    this.getPage();
                });
            }
        }
        else {
            if (!data.length) {
                this.modalSbd.show('', data);
            } else {
                this.getDataGen(data);
            }
        }

    }

    handleDelete = (data) => {
        if (typeof data == 'number') {
            T.confirm('Xóa thông tin thí sinh', 'Bạn đang thực hiện xóa thông tin của thí sinh bao gồm các thông tin cơ bản và các thông tin đăng ký kèm theo, xác nhận tiếp tục?', true,
                isConfirm => isConfirm && this.props.deleteThiSinh(data, () => {
                    this.getPage();
                })
            );
        }
        else {
            const listId = data.map(item => item.id);
            T.confirm('Xóa thông tin thí sinh', `Bạn đang thực hiện xóa thông tin của ${data.length} thí sinh bao gồm các thông tin cơ bản và các thông tin đăng ký kèm theo, xác nhận tiếp tục?`, true,
                isConfirm => isConfirm && this.props.multiDeleteThiSinh(listId, () => {
                    this.handleCheck();
                    this.getPage();
                })
            );
        }
    }

    handleEdit = (item) => {

        this.props.getSdhTsThongTinBieuMau(item.maPhanHe, data => {
            if (!data) {
                T.notify('Lấy thông tin bị lỗi', 'danger');
            } else {
                // this.props.getSdhTsInfoPhanHeData(this.state.idDot, items => {
                // const idPhanHe = items.find(i => i.ma == item.maPhanHe)?.id || '';
                const newWindow = window.open('', '_blank');
                newWindow.location.href = `/user/sau-dai-hoc/thi-sinh/item/${item.id}`;
                // this.props.history.push(`/user/sau-dai-hoc/thi-sinh/item/${item.id}`, { idDot: this.state.idDot, maPhanHe: item.maPhanHe, maHinhThuc: item.maHinhThuc, idPhanHe });
                // });

            }
        });

    }
    mapperStyle = {
        0: 'btn-secondary',
        1: 'btn-success',
        2: 'btn-danger',
    }

    mapperIcon = {
        0: <i className='fa fa-ellipsis-h' />,
        1: <i className='fa fa-check-square-o' />,
        2: <i className='fa fa-ban' />,
    }

    selectXetDuyet = [{ id: 0, text: 'Chờ duyệt' }, { id: 1, text: 'Duyệt' }, { id: 2, text: 'Không duyệt' }]
    selectBtkt = [{ id: 0, text: 'KHÔNG' }, { id: 1, text: 'CÓ' }]
    selectHeDaoTao = [{ id: 0, text: 'Trống' }, { id: 1, text: 'Chính quy' }, { id: 2, text: 'Không chính quy' }];
    selectLoaiTotNghiep = [{ id: 0, text: 'Trống' }, { id: 1, text: 'Trung bình' }, { id: 2, text: 'Trung bình khá' }, { id: 3, text: 'Khá' }, { id: 4, text: 'Giỏi' }, { id: 5, text: 'Xuất sắc' }];


    handleTinhTrang = (item, permission) => {
        let list = this.props.svTsSdh.page?.list;

        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle ' + this.mapperStyle[item.isXetDuyet || 0]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <Tooltip title={this.selectXetDuyet.find(i => i.id == item.isXetDuyet)?.text || 'Chờ duyệt'} arrow placement='right-end'>
                        <span>
                            {this.mapperIcon[item.isXetDuyet || 0]}
                        </span>
                    </Tooltip>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1' style={{ position: 'absolute' }}>
                    {
                        this.selectXetDuyet.map((_item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={_item.id}
                                    onClick={() => permission.write && T.confirm('Xác nhận cập nhật trạng thái', '', 'info', (isConfirm) => isConfirm && this.preCheckSelectedEmail([item], list, _item.id) && this.props.updateThiSinh(item.id, { dataCoBan: { isXetDuyet: _item.id, sbd: _item.id != 1 ? '' : item.sbd } }, () => {
                                        this.getPage();
                                    }))}>
                                    {_item.text}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    preCheckSelectedEmail = (listChosen, list, flag) => {
        if (flag == '1') {
            //check trùng trong listChosen
            let objEmail = listChosen.map(item => ({ ...item, email: item.email?.toLowerCase() }))?.groupBy('email');
            if (Object.keys(objEmail).length) {
                for (const _email in Object.keys(objEmail)) {
                    if (Array.isArray(objEmail[_email]) && objEmail[_email].length > 2) {
                        T.notify('Tồn tại nhiều hơn 2 email giống nhau, không thể cấp tài khoản thí sinh. Vui lòng xác nhận duy nhất một hồ sơ');
                        return false;
                    } else if (Array.isArray(objEmail[_email]) && objEmail[_email].length == 2) {
                        const dup = listChosen.filter(item => item.email == _email);
                        if (dup[0].phanHe == dup[1].phanHe) {
                            T.notify('Tồn tại email giống nhau có cùng phân hệ, không thể cấp tài khoản thí sinh. Vui lòng xác nhận duy nhất một hồ sơ');
                            return false;
                        }
                    }
                }
            }

            for (const item in list) {
                if (item.isXetDuyet == 0) continue;
                let tempEmail = item.email?.toLowerCase(), tempPh = item.phanHe;
                if (listChosen.find(i => i.email == tempEmail && i.phanHe == tempPh)) {
                    T.notify('Tồn tại email giống nhau có cùng phân hệ, không thể cấp tài khoản thí sinh. Vui lòng xác nhận duy nhất một hồ sơ');
                    return false;
                } else continue;
            }

        }
        return true;
    }



    checkChanges = (listChosen, idXetDuyet) => {
        let list = listChosen.filter(item => item.isXetDuyet != idXetDuyet);
        if (!list.length) {
            T.notify('Không có thay đổi mới!', 'success');
            return false;
        }
        return true;
    }

    cssMaker = (item, list) => {
        let listEmail = list.filter(item => item.isXetDuyet == 1)?.map(item => ({ ...item, email: item.email?.toLowerCase() }))?.groupBy('email');
        if (item.isXetDuyet == 1 && item.email && listEmail[item.email]?.length > 1 && Object.keys(listEmail)?.includes(item.email))
            return 'red';
        return '';
    }
    render() {
        let permission = this.getUserPermission('sdhDsTs', ['read', 'write', 'delete', 'export', 'import', 'adminManage']);
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.svTsSdh && this.props.svTsSdh.page ?
            this.props.svTsSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const { ks_tinh, ks_quan } = this.state.filter || {};
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let { listChosen, idDot, isLockDsts } = this.state;
        permission.write = !isLockDsts && permission.write;
        permission.delete = !isLockDsts && permission.write;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu thí sinh',
            stickyHead: this.state.isCoDinh,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'dsts table-fix-col' : 'dsts',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => this.setState({ listChosen: value ? list : [] })} readOnly={isLockDsts} />
                    </th>
                    <TableHead typeSearch='admin-select' ref={e => this.phanHe = e} keyCol='phanHe' content='Phân hệ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', minwidth: '180px' }} onKeySearch={onKeySearch} onSort={onSort} data={SelectAdapter_PhanHe(this.state.idDot)} />
                    <TableHead typeSearch='admin-select' keyCol='hinhThuc' content='Hình thức' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} data={SelectAdapter_SdhHinhThucTuyenSinh} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='xetDuyet' content='Xét duyệt' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} data={this.selectXetDuyet} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='maNganh' content='Ngành' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', minWidth: '200' }} data={SelectAdapter_NganhByDot(idDot)} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='soBaoDanh' content='Số báo danh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ho' content='Họ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: 'auto', minWidth: '100px', textAlign: 'center', whiteSpace: 'wrap' }}
                        onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='gioiTinh' typeSearch='admin-select' content='Giới tính' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} data={SelectAdapter_DmGioiTinhV2} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='date' keyCol='ngaySinh' content='Ngày sinh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='noiSinh' data={SelectAdapter_NoiSinh} content='Nơi sinh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='email' content='Email' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='danToc' typeSearch='admin-select' content='Dân tộc' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} data={SelectAdapter_DmDanTocV2} onKeySearch={onKeySearch} onSort={onSort} />

                    <TableHead keyCol='ngheNghiep' content='Nghề nghiệp' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='donVi' content='Đơn vị' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead ref={e => this.tinh = e} typeSearch='admin-select' keyCol='tinh' data={ajaxSelectTinhThanhPho} content='Tỉnh/Thành phố' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead ref={e => this.quan = e} typeSearch='admin-select' keyCol='quan' data={ks_tinh ? ajaxSelectQuanHuyen(ks_tinh) : []} content='Quận/Huyện' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead ref={e => this.phuong = e} typeSearch='admin-select' keyCol='phuong' data={ks_quan ? ajaxSelectPhuongXa(ks_quan) : []} content='Phường/Xã' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='soNhaDuong' content='Số nhà đường' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />

                    <TableHead keyCol='dienThoai' content='Điện thoại' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />

                    <TableHead keyCol='truongTnDh' content='Trường TN Đại học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='nganhTnDh' content='Ngành TN Đại học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='namTnDh' typeSearch='year' content='Năm TN Đại học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='heDh' typeSearch='admin-select' data={this.selectHeDaoTao} content='Hệ Đại học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='diemDh' decimalScale content='Điểm TB Đại học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='xepLoaiDh' typeSearch='admin-select' data={this.selectLoaiTotNghiep} content='Xếp loại Đại học' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='truongTnThs' content='Trường TN Thạc sỹ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='nganhTnThs' content='Ngành TN Thạc sỹ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='namTnThs' typeSearch='year' timeFormat content='Năm TN Thạc sỹ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='heThs' typeSearch='admin-select' data={this.selectHeDaoTao} content='Hệ Thạc sỹ' style={{ width: 'auto', textAlign: 'center', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='diemThs' content='Điểm TB Thạc sỹ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='xepLoaiThs' typeSearch='admin-select' data={this.selectLoaiTotNghiep} content='Xếp loại' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='xtNgoaiNgu' typeSearch='admin-select' data={SelectAdapter_SdhTsMonThiNgoaiNguV2} content='Ngoại ngữ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maChungChi' content='Mã chứng chỉ' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='btkt' typeSearch='admin-select' data={this.selectBtkt} content='BTKT' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tenDeTai' content='Tên đề tài' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='cbhd' content='Người hướng dẫn' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} />
                    <TableHead keyCol='ghiChu' content='Ghi chú' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} />
                    <TableHead onSort={onSort} keyCol='ngayDangKy' content='Ngày đăng ký' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} />
                    <TableHead onSort={onSort} keyCol='latestUpdate' content='Chỉnh sửa lần cuối bởi thí sinh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} />
                    <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} />
                </tr>
            ),
            renderRow: (item, index) => {
                let contentStyle = { color: this.cssMaker(item, list) };
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.map(item => item.id).includes(item.id)} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.id != item.id) }, () => this.checkAll.value(this.state.listChosen.length == list.length))} permission={permission} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phanHe} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.hinhThuc} />
                        <TableCell style={{ textAlign: 'center' }} content={this.handleTinhTrang(item, permission)} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} type='link' content={item.maNganh && item.tenNganh ? `${item.maNganh} - ${item.tenNganh}` : ''} onClick={() => item.maKy && item.maDot && this.props.history.push(`/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh/setting/${item.maKy}/${item.idDot}`)} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.soBaoDanh} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ho} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ten} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={T.parse(item.gioiTinh)?.vi || ''} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngaySinh} />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.noiSinhTinh || item.noiSinhQuocGia} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='link' contentStyle={contentStyle} content={item.email} onClick={() => {
                            const newWindow = window.open('', '_blank');
                            newWindow.location.href = `/user/sau-dai-hoc/thi-sinh/item/${item.id}`;
                        }} />
                        <TableCell style={{ width: 'auto', whiteSpace: 'nowrap' }} content={item.danToc} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngheNghiep} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.donVi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenTinhThanhPho} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenQuanHuyen} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenPhuongXa} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soNhaDuong} />
                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={`${item.dienThoai?.startsWith('0') ? '\'' + item.dienThoai : item.dienThoai}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.truongTnDh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhTnDh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTnDh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectHeDaoTao.find(i => i.id == item.heDh)?.text || item.heDh || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diemDh} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectLoaiTotNghiep.find(i => i.id == item.xepLoaiDh)?.text || item.xepLoaiDh || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.truongTnThs} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganhTnThs} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTnThs} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectHeDaoTao.find(i => i.id == item.heThs)?.text || item.heThs || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.diemThs} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={this.selectLoaiTotNghiep.find(i => i.id == item.xepLoaiThs)?.text || item.xepLoaiThs || ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.xtNgoaiNgu || T.parse(item.listMonThi)?.map(i => i.tenMonThi).join(', ')} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maChungChi} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.btkt ? 'CÓ' : 'KHÔNG'} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenDeTai} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.cbhdList ? T.parse(item.cbhdList)?.map(i => i.hoTenGhiChu ?
                            `${i.hoTenGhiChu || ''} - ${i.vaiTro || ''}` : `${i.hocHam || ''} ${item.hocVi || ''} ${i.hoShcc || ''} ${i.tenShcc || ''} - ${i.vaiTro}`).join(', ') : ''} />

                        <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px', marginBottom: 0 }} content={
                            <FormTextBox key={item.id} ref={e => this.ghiChu[item.id] = e} value={item.ghiChu} style={{ textAlign: 'center', marginBottom: 0 }} permission={permission} onKeyDown={e => e.code === 'Enter' && this.props.updateThiSinh(item.id, { dataCoBan: { ghiChu: getValue(this.ghiChu[item.id]) } })} />
                        } />
                        {/*  view đến cột đề tài, cột cbhd, bài báo xử lý sau nếu cần thiết  */}

                        {/* <TableCell style={{ whiteSpace: 'nowrap' }} content={item.baiBaoList || T.parse(item.baiBaoList)?.map(i => i.tenBaiBao).join(', ')} /> */}



                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ngayDangKy} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.latestUpdate} />
                        <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'right' }} permission={{ write: permission.write, delete: permission.delete }} content={item} onEdit={e => e.preventDefault() || this.handleEdit(item)} onDelete={e => e.preventDefault() || this.handleDelete(item.id)} >
                            {permission.write ?
                                <>
                                    {permission.adminManage ? <button className='btn btn-secondary' style={{ backgroundColor: 'green', display: item.isXetDuyet == 1 ? '' : 'none' }} title='Đánh số báo danh' onClick={e => e.preventDefault() || this.handleGen(item, false)}>
                                        <i className='fa fa-lg fa-cog' />
                                    </button> : <></>}
                                    {T.validateEmail(item.email) ? <button className='btn btn-secondary' style={{ backgroundColor: 'blue' }} title='Phản hồi' onClick={e => e.preventDefault() || this.modalPhanHoi.show(item)}>
                                        <i className="fa fa-lg fa-envelope-open-o" />
                                    </button> : null}
                                    {/* Tạm ẩn  */}
                                    {/* <button className='btn btn-secondary' style={{ backgroundColor: '#1bd1c8' }} title='Sao chép' onClick={e => e.preventDefault() || this.newHoSoModal.show(item)}>
                                        <i className='fa fa-lg fa-clone' />
                                    </button> */}
                                    <button className='btn btn-secondary' style={{ backgroundColor: '#1bd1c8' }} title='Reset password' onClick={e => e.preventDefault() || T.confirm('Cập nhật mật khẩu', `Bạn có chắc chắn muốn cập nhật mật khẩu cho thí sinh ${item.ho} ${item.ten} không?`, true,
                                        isConfirm => isConfirm && this.props.resetPassword({ name: `${item.ho} ${item.ten}`, idThiSinh: item.id, email: item.email }))}>
                                        <i className='fa fa-lg fa-key' />
                                    </button>
                                </>
                                : null
                            }
                        </TableCell>
                    </tr>
                );
            }
        });
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: this.state.title,
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Danh sách tuyển sinh'
            ],
            content: <>
                <ViewAccount ref={e => this.ViewAccountModal = e} />
                <div className='tile'>
                    <FormCheckbox isSwitch={true} label='Khóa hồ sơ' ref={e => this.lockEditDsts = e}
                        onChange={value => this.props.lockEditDsts({ value, idDot }, () => {
                            this.setState({ isLockDsts: value });
                        })}
                    />

                    <hr></hr>
                    <div style={{ marginBottom: '10px' }}>
                        Kết quả: {<b>{totalItem}</b>} Thí sinh
                    </div>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2px' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} ref={e => this.isKeySearch = e} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} ref={e => this.isFixCol = e} style={{ marginBottom: '0' }} />
                                <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />

                            </div>

                            <div style={{ gap: 10, display: listChosen.length ? 'flex' : 'none' }}>
                                {permission.delete && <Tooltip title={`Xoá ${listChosen.length} thí sinh`} arrow>
                                    <button className='btn btn-danger' type='button' onClick={() => permission.delete && this.handleDelete(listChosen)}>
                                        <i className='fa fa-sm fa-trash' />
                                    </button>
                                </Tooltip>}
                                {permission.adminManage ? <Tooltip title={`Xoá số báo danh cho ${listChosen.filter(item => item.soBaoDanh).length} thí sinh`} arrow>
                                    <button id='deleteSbd' style={{ display: listChosen.filter(item => item.soBaoDanh).length ? 'inline-block' : 'none' }} type='button' className='btn btn-danger' onClick={() =>
                                        T.confirm('Xoá số báo danh', 'Bạn có chắc chắn muốn xóa số báo danh không?', true,
                                            isConfirm => isConfirm && permission.write && this.handleGen(listChosen, true))} >
                                        <i className='fa fa-lg fa-trash' /> Xoá SBD
                                    </button>
                                </Tooltip> : <></>}
                                {permission.adminManage ? <Tooltip title={`Đánh số báo danh cho ${listChosen.filter(item => item.isXetDuyet == 1).length} thí sinh`} arrow>
                                    <button id='updateMultiSbd' type='button' style={{ display: listChosen.filter(item => item.isXetDuyet == 1).length ? 'inline-block' : 'none' }} className='btn btn-secondary' onClick={() => permission.write && this.handleGen(listChosen?.filter(item => item.isXetDuyet == 1), false)}>
                                        <i className='fa fa-lg fa-cogs' /> Đánh SBD
                                    </button>
                                </Tooltip> : <></>}
                                {<Tooltip title={`Cập nhật tình trạng ${listChosen.length} hồ sơ đăng ký`} arrow>
                                    <button id='updateStatus' type='button' className='btn btn-primary dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                        <i className='fa fa-lg fa-id-card-o' />
                                    </button>
                                </Tooltip>}
                                {permission.write && <Tooltip title={`Gửi mail cho ${listChosen.length} thí sinh`} arrow>
                                    <button id='sendMailMultiple' type='button' className='btn btn-primary' onClick={() => this.modalPhanHoiMultiple.show(listChosen)}>
                                        <i className='fa fa-lg fa-send' />
                                    </button>
                                </Tooltip>}
                                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1' style={{ position: 'absolute' }}>
                                    {
                                        this.selectXetDuyet.map((_item) => {
                                            return (
                                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={_item.id}
                                                    onClick={() => permission.write && this.checkChanges(listChosen, _item.id) && this.preCheckSelectedEmail(listChosen, list, _item.id) && this.props.updateMultiThiSinh(listChosen, { dataCoBan: { isXetDuyet: Number(_item.id) } }, () => {
                                                        this.getPage();
                                                        this.setState({ listChosen: this.state.listChosen.map(item => ({ ...item, isXetDuyet: _item.id })) });
                                                    })}>
                                                    {_item.text}
                                                </p>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                        </div>
                    </div>
                    {table}
                    <hr></hr>
                    <button id='newId' type='button' className='btn btn-primary' aria-haspopup='true' aria-expanded='false' onClick={() => this.newHoSoModal.show()}>
                        <i className='fa fa-lg fa-plus' /> Thêm hồ sơ
                    </button>
                    <PreviewPdf ref={e => this.previewPdf = e} />
                    <ModalNewHoSo ref={e => this.newHoSoModal = e} idDot={idDot} copy={this.props.copyHsdk} create={this.props.createTsSdhAdmin} history={this.props.history} permission={permission} />
                    <PhanHoiModal ref={e => this.modalPhanHoi = e} send={this.props.sdhTsSendMailPhanHoi} getPage={this.getPage} permission={permission} />
                    <PhanHoiMultipleModal ref={e => this.modalPhanHoiMultiple = e} send={this.props.sdhTsSendMailPhanHoiMultiple} getPage={this.getPage} permission={permission} />
                    <SbdSetting ref={e => this.modalSbd = e} idDot={this.state.idDot} getSdhTsInfoPhanHeData={this.props.getSdhTsInfoPhanHeData} genSbdTsSdh={this.props.genSbdTsSdh} autoGenSbdTsSdh={this.props.autoGenSbdTsSdh} getDataSbd={this.props.getDataSbd} getPage={this.getPage} getSbdSettingTsSdh={this.props.getSbdSettingTsSdh} updateSbdSettingTsSdh={this.props.updateSbdSettingTsSdh} getDataGen={this.getDataGen} permission={permission} />
                    <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                    <ExportModal ref={e => this.exportModal = e} idDot={idDot} exportPdf={this.props.exportPdf} previewPdf={this.previewPdf} processModal={this.processModal} user={this.props.system.user.email} />
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            collapse: [
                { icon: 'fa-download', name: 'Export excel', permission: permission.export, onClick: this.downloadExcel, type: 'success' },
                { icon: 'fa-upload', name: 'Import', permission: permission.import, onClick: () => this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/danh-sach-tuyen-sinh/upload'), type: 'danger' },
                { icon: 'fa-print', name: 'Print', permission: permission.export, onClick: e => e.preventDefault() || this.exportModal.show(), type: 'success' },

            ],
        });
    }
}
const mapStateToProps = state => ({ system: state.system, svTsSdh: state.sdh.svTsSdh });
const mapActionsToProps = {
    exportPdf, copyHsdk, createTsSdhAdmin, lockEditDsts, getAllSdhMonThiNgoaiNgu, getSdhTsProcessingDot, getSbdSettingTsSdh, updateSbdSettingTsSdh, sdhTsSendMailPhanHoi, sdhTsSendMailPhanHoiMultiple, getSdhTsInfoTime, getSdhDanhSachTSPage, genSbdTsSdh, autoGenSbdTsSdh, getSdhTsThongTinBieuMau, deleteThiSinh, multiDeleteThiSinh, getSdhTsInfoPhanHeData, updateThiSinh, updateMultiThiSinh, resetPassword
};
export default connect(mapStateToProps, mapActionsToProps)(DanhSachTSPage);
