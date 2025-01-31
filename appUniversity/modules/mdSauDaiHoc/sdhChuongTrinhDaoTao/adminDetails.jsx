import React from 'react';
import { connect } from 'react-redux';
import { createSdhChuongTrinhDaoTao, getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, downloadWord, updateKhungDaoTao, updateSdhChuongTrinhDaoTaoMultiple } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTabs, FormTextBox, AdminModal, CirclePageButton } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DmNganhSdh } from '../dmNganhSauDaiHoc/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import Loading from 'view/component/Loading';
import { SelectAdapter_SdhCauTrucKhungDaoTao } from '../sdhCauTrucKhungDaoTao/redux';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdSauDaiHoc/dmKhoaSauDaiHoc/redux';
import { getSdhLopHocVien } from 'modules/mdSauDaiHoc/sdhLopHocVien/redux';
import { getDmNganhSdh } from 'modules/mdSauDaiHoc/dmNganhSauDaiHoc/redux';
import { getSdhKhoaDaoTao, getSdhKhoaDaoTaoAll } from 'modules/mdSauDaiHoc/sdhKhoaDaoTao/redux';
import { SelectAdapter_SdhLopHocVien } from '../sdhLopHocVien/redux';
import { SelectAdapter_SemesterData } from '../sdhSemester/redux';

class HocKyModal extends AdminModal {

    onShow = (item) => {
        this.data = item;
    };

    onSubmit = (e) => {
        e.preventDefault();

        const id = this.data.id;
        const soHocKy = this.soHocKy.value();
        if (!soHocKy) {
            T.notify('Hãy chọn số học kì', 'danger');
        }
        else {
            let changes = { soHocKy: parseInt(soHocKy) };
            this.props.updateKhungDaoTao(id, changes, () => this.props.history.push(`/user/sau-dai-hoc/ke-hoach-dao-tao/${id}`));
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Chọn số học kì đào tạo',
            submitText: 'Xác nhận',
            body: <>
                <div>
                    <FormSelect ref={e => this.soHocKy = e} label='Số học kỳ' data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} required allowClear />
                </div>
            </>
        });
    }
}
class SdhChuongTrinhDaoTaoDetails extends AdminPage {
    state = {
        isLoading: true,
        // mucTieuDaoTao: {},
        chuongTrinhDaoTao: {},
        khungDaoTao: {},
    };
    mucTieu = {};
    chuongTrinh = {};
    listMonHocChosen = [];
    rawUniqueMaMon = [];

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/chuong-trinh-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            const khoaSdh = query.get('khoaSdh');
            if (this.ma !== 'new') {
                this.getData(this.ma);
            } else {
                if (id >= 0 && khoaSdh >= 0) {
                    this.getData(id, true, khoaSdh);
                    return;
                }
                this.maKhoa = this.props.system.user.staff ? this.props.system.user.staff.maDonVi : '';
                this.khoa.value(this.maKhoa == 37 ? '' : this.maKhoa);
            }
            this.props.getSdhKhungDaoTao(this.ma, result => this.setState({ khungDaoTao: result.item }));
        });
    }

    pushMonHocChosen = (maMonHoc) => {
        if (maMonHoc) {
            if (this.listMonHocChosen.includes(maMonHoc)) {
                T.notify(`Trùng môn học <b>${maMonHoc}<b/>, vui lòng chọn môn học khác`, 'danger');
                return false;
            } else {
                this.listMonHocChosen.push(maMonHoc);
                return true;
            }
        }
        return false;
    }

    removeMonHoc = (maMonHoc) => {
        if (maMonHoc) {
            if (this.rawUniqueMaMon[maMonHoc] && this.rawUniqueMaMon[maMonHoc].isDuyet) {
                return false;
            }
            else {
                this.listMonHocChosen = this.listMonHocChosen.filter(item => item != maMonHoc);
                return true;
            }
        }
    }

    getData = (id, isClone = false, khoaSdh) => {
        this.trinhDoDaoTao.value('SDH');
        id && this.props.getSdhKhungDaoTao(id, (data) => {
            let item = data.item, lop = data.lop;
            this.maKhung.value(item.maKhung || '');
            this.khoa.value(item.maKhoa);
            this.maNganh.value(item.maNganh);
            this.setState({ maNganh: item.maNganh });
            this.maCTDT.value(item.maCtdt);
            this.khoaDaoTao.value(item.khoaHocVien);
            this.dotTrungTuyen.value(item.tenDotTuyenSinh || 'Không có đợt trúng tuyển');
            this.phanHe.value(item.bacDaoTao);
            this.lopHocVien.value(lop && lop.ma ? lop.ma : '');
            this.tenNganhVi.value((item.tenNganh && T.parse(item.tenNganh).vi) || '');
            this.tenNganhEn.value((item.tenNganh && T.parse(item.tenNganh).en) || '');
            this.thoiGianDaoTao.value(item.thoiGianDaoTao || '');
            this.tenVanBangVi.value((item.tenVanBang && T.parse(item.tenVanBang).vi) || '');
            this.tenVanBangEn.value((item.tenVanBang && T.parse(item.tenVanBang).en) || '');
            this.hocKyBatDau.value(item.hocKyBatDau);
            this.idInfoPhanHe = item.idInfoPhanHe || '';
            const mucTieu = T.parse(data.item.mucTieu || '{}');
            this.idCauTrucKhung = !isClone ? item.maKhung : khoaSdh;
            this.props.getSdhChuongTrinhDaoTao(id, (ctsdh) => {
                const uniqueCTSDH = ctsdh.filter(item => {
                    if (!this.rawUniqueMaMon[item.maMonHoc]) {
                        this.rawUniqueMaMon[item.maMonHoc] = { ...item };
                        return item;
                    }
                });
                this.idCauTrucKhung && SelectAdapter_SdhCauTrucKhungDaoTao.fetchOne(this.idCauTrucKhung, (rs) => {
                    this.setNamDaoTao(rs, mucTieu, uniqueCTSDH);
                });
            });
        });
    }

    validation = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValue = () => {
        try {
            const mucTieu =
                Object.keys(this.mucTieu).map(key => {
                    return { id: key, value: this.mucTieu[key]?.value() };
                });
            let data = {
                maKhung: this.validation(this.maKhung),
                maCtdt: this.validation(this.maCTDT),
                khoaHocVien: this.validation(this.khoaDaoTao),
                dotTrungTuyen: this.idInfoPhanHe,
                maNganh: this.validation(this.maNganh),
                tenNganhVi: this.validation(this.tenNganhVi),
                tenNganhEn: this.validation(this.tenNganhEn),
                tenNganh: T.stringify({ vi: this.tenNganhVi.value(), en: this.tenNganhEn.value() }),
                trinhDoDaoTao: this.validation(this.trinhDoDaoTao),
                bacDaoTao: this.validation(this.phanHe),
                thoiGianDaoTao: this.validation(this.thoiGianDaoTao),
                tenVanBangVi: this.validation(this.tenVanBangVi),
                tenVanBangEn: this.validation(this.tenVanBangEn),
                tenVanBang: T.stringify({ vi: this.tenVanBangVi.value(), en: this.tenVanBangEn.value() }),
                maKhoa: this.validation(this.khoa),
                hocKyBatDau: this.validation(this.hocKyBatDau),
                mucTieu: T.stringify(mucTieu),
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    handleNganh = (value) => {
        this.tenNganhVi.value(value.name);
        this.khoa.value(value.khoa);
    }


    //get info have in lopSinhVien
    handleLopHocVien = (ma) => {
        this.props.getSdhLopHocVien(ma, item => {
            this.props.getSdhKhoaDaoTaoAll(item.idKhoaDaoTao, '', result => {
                this.dotTrungTuyen.value(result[0].tenDotTuyenSinh || 'Không có đợt trúng tuyển');
                this.idInfoPhanHe = result[0].idInfoPhanHe || '';
            });
            this.phanHe.value(item.heDaoTao);
            this.maNganh.value(item.nganh);
            this.khoaDaoTao.value(item.khoaSinhVien);

        });
    }

    save = () => {
        let data = this.getValue();
        const hocKy = 0;
        if (data) {
            const kienThucs =
                Object.keys(this.chuongTrinh).map(key => {
                    return (this.chuongTrinh[key]?.getValue() || { updateDatas: [], deleteDatas: [] })?.updateDatas;
                });
            let updateItems = [];
            kienThucs.forEach(kienThuc => {
                updateItems = [...updateItems, ...kienThuc];
            });
            const updateDatas = { items: updateItems, ...{ id: this.ma, data }, maLopHocVien: this.lopHocVien.value() };
            const deleteDatas =
                Object.keys(this.chuongTrinh).map(key => {
                    return (this.chuongTrinh[key]?.getValue() || { updateDatas: [], deleteDatas: [] })?.deleteDatas;
                });
            let deleteItems = [];
            deleteDatas.forEach(item => {
                deleteItems = deleteItems.concat(item);
            });
            const deleteList = { items: deleteItems };
            this.ma == 'new' ? (updateItems.length && this.props.createSdhChuongTrinhDaoTao(updateDatas, (item) => {
                window.location = `/user/sau-dai-hoc/chuong-trinh-dao-tao/${item.id}`;
            })) : (updateItems.length && this.props.updateSdhChuongTrinhDaoTaoMultiple(this.ma, updateDatas, deleteList, hocKy, () => {
            }));
        }
    }

    setNamDaoTao = (value, mucTieu, uniqueCTSDH) => {
        const { data, id } = value;
        this.idCauTrucKhung = id;
        const mucCha = T.parse(data.mucCha, {
            chuongTrinhDaoTao: {}
        });
        const mucCon = T.parse(data.mucCon, {
            chuongTrinhDaoTao: {}
        });
        this.setState({
            namHoc: value.id,
            chuongTrinhDaoTao: { parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao }
        }, () => {
            !uniqueCTSDH && this.maNganh.focus();
            Object.keys(this.chuongTrinh).forEach(key => {
                const childs = mucCon.chuongTrinhDaoTao[key] || null;
                const data = uniqueCTSDH?.filter(item => item.maKhoiKienThuc === parseInt(mucCha.chuongTrinhDaoTao[key].id));
                this.chuongTrinh[key]?.setVal(data, this.maKhoa, childs);
            });
            mucTieu?.forEach(mt => {
                this.mucTieu[mt.id]?.value(mt.value);
            });
        });
    }

    downloadWord = (e) => {
        e.preventDefault();
        if (!this.ma) return;
        const khoaDaoTao = this.validation(this.khoaDaoTao);
        const maNganh = this.validation(this.maNganh);
        this.props.downloadWord(this.ma, data => {
            T.FileSaver(new Blob([new Uint8Array(data.data)]), khoaDaoTao + '_' + maNganh + '.docx');
        });
    }

    render() {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        const readOnly = !(permission.write || permission.manage),
            isSdh = permission.write;

        const {
            // mucTieuDaoTao,
            chuongTrinhDaoTao } = this.state;
        return this.renderPage({
            icon: 'fa fa-university',
            title: this.ma !== 'new' ? 'Chỉnh sửa chương trình đào tạo' : 'Tạo mới chương trình đào tạo',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/chuong-trinh-dao-tao'>Chương trình đào tạo</Link>,
                this.ma !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>1. Thông tin chung CTĐT</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect style={{ marginTop: '35px' }} ref={e => this.trinhDoDaoTao = e} label='Trình độ đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' required readOnly />
                            <FormSelect ref={e => this.maKhung = e} label='Khung CTĐT' data={SelectAdapter_SdhCauTrucKhungDaoTao} className='col-md-4' required readOnly={readOnly} onChange={value => value && this.setNamDaoTao(value)} />
                            <FormTextBox label='Mã chương trình đào tạo' ref={e => this.maCTDT = e} placeholder='Mã chương trình đào tạo' className='col-md-4' required readOnly={readOnly} />
                            <FormSelect ref={e => this.lopHocVien = e} label='Lớp học viên' data={SelectAdapter_SdhLopHocVien} className='col-md-6' required readOnly={readOnly} onChange={value => value && value.id ? this.handleLopHocVien(value.id) : null} />
                            <FormTextBox style={{ marginTop: '35px' }} ref={e => this.khoaDaoTao = e} label='Khóa đào tạo' className='col-md-2' required readOnly />
                            <FormTextBox style={{ marginTop: '35px' }} label='Đợt' ref={e => this.dotTrungTuyen = e} placeholder='Đợt trúng tuyển' className='col-md-4' required readOnly />
                            <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DmNganhSdh()} label='Mã ngành' className='col-md-6' onChange={this.handleNganh} required disabled />
                            <FormSelect ref={e => this.phanHe = e} label='Phân hệ đào tạo' data={SelectAdapter_DmHocSdhVer2} className='col-md-6' required disabled />
                            <FormSelect data={[
                                { id: 4, text: '4 năm' },
                                { id: 3.5, text: '3,5 năm' }
                            ]} ref={e => this.thoiGianDaoTao = e} label='Thời gian đào tạo' className='col-md-6' required readOnly={readOnly} />
                            <FormSelect ref={e => this.hocKyBatDau = e} data={SelectAdapter_SemesterData} label='Học kì bắt đầu' className='col-md-6' required readOnly={readOnly} />

                            <div style={{ marginBottom: '0' }} className='form-group col-md-12'>
                                <FormTabs tabs={[
                                    {
                                        title: <>Tên ngành tiếng Việt  <span style={{ color: 'red' }}>*</span> </>,
                                        component: <FormTextBox style={{ left: '10px' }} ref={e => this.tenNganhVi = e} placeholder='Tên ngành (tiếng Việt)' required readOnly={readOnly} />
                                    },
                                    {
                                        title: <>Tên ngành tiếng Anh</>,
                                        component: <FormTextBox ref={e => this.tenNganhEn = e} placeholder='Tên ngành (tiếng Anh)' readOnly={readOnly} />
                                    }
                                ]} />
                            </div>

                            <div className='form-group col-md-12'>
                                <label>Tên văn bằng sau khi tốt nghiệp: </label>
                                <FormTabs tabs={[
                                    {
                                        title: <>Tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormTextBox ref={e => this.tenVanBangVi = e} placeholder='Tên văn bằng (tiếng Việt)' required />
                                    },
                                    {
                                        title: <>Tiếng Anh</>,
                                        component: <FormTextBox ref={e => this.tenVanBangEn = e} placeholder='Tên văn bằng (tiếng Anh)' />
                                    }
                                ]} />
                            </div>
                            <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmKhoaSdh} label='Nơi đào tạo' className='col-12' readOnly={!isSdh} />
                        </div>
                    </div>
                </div>
                {
                    chuongTrinhDaoTao && chuongTrinhDaoTao.parents && Object.keys(chuongTrinhDaoTao.parents).map((key) => {
                        const childs = chuongTrinhDaoTao.childs;
                        const pIdx = `${this.idCauTrucKhung}_${key}`;
                        const { id, text } = chuongTrinhDaoTao.parents[key];
                        return (
                            <ComponentKienThuc key={pIdx} title={text} khoiKienThucId={id} childs={childs[key]} ref={e => this.chuongTrinh[key] = e} pushMonHocChosen={this.pushMonHocChosen} removeMonHoc={this.removeMonHoc} />
                        );
                    })
                }
                {this.ma !== 'new' && <CirclePageButton type='custom' tooltip='Tải về chương trình đào tạo' customIcon='fa-file-word-o' customClassName='btn-warning' style={{ marginRight: '60px' }} onClick={(e) => this.downloadWord(e)} />}
                {this.ma !== 'new' && <CirclePageButton type='custom' tooltip='Kế hoạch đào tạo' customIcon='fa fa-lg fa-list' customClassName='btn-info' style={{ marginRight: '120px' }} onClick={() => this.state.khungDaoTao.soHocKy ? this.props.history.push(`/user/sau-dai-hoc/ke-hoach-dao-tao/${this.ma}`) : this.modal.show(this.state.khungDaoTao)} />}
                < HocKyModal permission={permission} ref={e => this.modal = e} updateKhungDaoTao={this.props.updateKhungDaoTao} history={this.props.history} />
            </>,
            backRoute: '/user/sau-dai-hoc/chuong-trinh-dao-tao',
            onSave: permission.write || permission.manage ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.sdh.sdhChuongTrinhDaoTao });
const mapActionsToProps = { getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, createSdhChuongTrinhDaoTao, downloadWord, updateKhungDaoTao, updateSdhChuongTrinhDaoTaoMultiple, getSdhLopHocVien, getDmNganhSdh, getSdhKhoaDaoTao, getSdhKhoaDaoTaoAll };
export default connect(mapStateToProps, mapActionsToProps)(SdhChuongTrinhDaoTaoDetails);