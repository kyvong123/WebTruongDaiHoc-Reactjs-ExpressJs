import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, FormSelect, FormTextBox, renderDataTable, TableHead, TableCell, loadSpinner } from 'view/component/AdminPage';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { SelectAdapter_DtChuyenNganhFilter } from '../dtChuyenNganh/redux';
import { SelectAdapter_DtDmThoiGianDaoTaoAll } from '../dtDmThoiGianDaoTao/redux';
import { SelectAdapter_DtNganhDaoTaoFilterPage } from '../dtNganhDaoTao/redux';
import ComponentKienThuc from './componentKienThuc';
import { getDtKhungDaoTao, getDtChuongTrinhDaoTao, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, updateKeHoachChuyenNganh } from './redux';
import { getDtDmHocKyAll } from '../dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from '../dtKhoaDaoTao/redux';
import { getDtNganhDaoTao } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DtKhoa } from '../dtKhoaDaoTao/redux';
import DssvTab from './DssvTab';
// import TinChiTab from './TinChiTab';
import TyLeDiemModal from './TyLeDiemModal';
import KhungTinChi from './KhungTinChiTab';

class CtdtDetailPage extends AdminPage {
    state = { oldKhoaSv: '', newKhoaSv: '', dssv: [] }
    chuongTrinh = {};
    listMonHocChosen = [];
    listMonCtdtChon = [];

    componentDidMount() {
        this.setState({ isLoading: false });
        this.tab.tabClick(null, 0);
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmHocKyAll('', items => {
                this.setState({ dataHocKy: items });
            });
            const route = T.routeMatcher('/user/dao-tao/chuong-trinh-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.trinhDoDaoTao.value('DH');
            if (this.ma !== 'new') {
                let idClone = new URLSearchParams(this.props.location.search).get('clone-from');
                idClone = idClone || this.ma;
                this.getData(this.ma, idClone);
                this.khungTinChi.setData(this.ma);
            }
            // this.tinChiTab.getCtdt(this.ma);
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
            let index = this.listMonHocChosen.findIndex(item => item == maMonHoc);
            if (index != -1) {
                this.listMonHocChosen.splice(index, 1);
            }
        }
    }

    setKhung = (value, ctdt, cauTrucKDT) => {
        const { data } = value;
        const mucCha = T.parse(data?.mucCha, {
            chuongTrinhDaoTao: {}
        });
        const mucCon = T.parse(data?.mucCon, {
            chuongTrinhDaoTao: {}
        });

        this.setState({
            chuongTrinhDaoTao: { parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao },
            dataKhoaSinhVien: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + 1 - i)
        }, () => {
            this.khoaSinhVien.value(this.state.khoaSinhVien);
            if (!ctdt) {
                this.khoaSinhVien.value('');
                this.khoaSinhVien.focus();
                this.chuyenNganh.value('');
            }
            this.setState({
            }, () => {
                Object.keys(this.chuongTrinh).forEach(key => {
                    const childs = mucCon.chuongTrinhDaoTao[key] || null;
                    const data = ctdt?.filter(item => item.maKhoiKienThuc === parseInt(mucCha.chuongTrinhDaoTao[key].id));
                    this.chuongTrinh[key]?.setVal(data, this.maKhoa, childs);
                });
            });
        });
        this.khungCtdt = { value, ctdt };
        this.handleThoiGianDaoTao({ id: cauTrucKDT?.thoiGianDaoTao });
        // this.tinChiTab?.getKhung(value.id);
    }

    getData = (id, idClone, khoaDt) => {
        id && this.props.getDtKhungDaoTao(id, data => {
            this.setState({
                id, chuyenNganh: data?.chuyenNganh || '', maNganh: data?.maNganh, khoaSinhVien: khoaDt || data?.khoaSinhVien,
                dataKhoaSinhVien: Array.from({ length: 10 }, (_, i) => (khoaDt || data?.khoaSinhVien || new Date().getFullYear()) - i),
                dssv: data.dssv, loaiHinhDaoTao: data?.loaiHinhDaoTao, dotTrungTuyen: data?.maDotTrungTuyen
            }, () => {
                this.maNganh.value(data?.maNganh || '');
                this.khoaSinhVien.value(khoaDt || data?.khoaSinhVien || -1);
                this.chuyenNganh.value(data?.chuyenNganh || '');
                this.tenNganhVi.value(data?.tenNganh ? T.parse(data?.tenNganh, { vi: '' })?.vi : '');
                this.tenNganhEn.value(data?.tenNganh ? T.parse(data?.tenNganh, { en: '' })?.en : '');
                let maCtdt = `${khoaDt || data?.khoaSinhVien}${data?.loaiHinhDaoTao}${data?.chuyenNganh || data?.maNganh}`;
                this.maCtdt.value(data?.maCtdt || maCtdt || '');
                this.dotTrungTuyen.value(data?.dotTrungTuyen || '');
                this.loaiHinhDaoTao.value(data?.loaiHinhDaoTao || '');
                this.thoiGianDaoTao.value(data?.thoiGianDaoTao || '');
                this.tenVanBangVi.value(data?.tenVanBang ? T.parse(data?.tenVanBang, { vi: '' })?.vi : '');
                this.tenVanBangEn.value(data?.tenVanBang ? T.parse(data?.tenVanBang, { en: '' })?.en : '');
                this.khoa.value(data?.maKhoa || '');
                this.listLop.value(data.listLop);
                this.getDataMonHoc(id, idClone, data);
            });
        });
    }

    getDataMonHoc = (id, idClone, data) => {
        if (!idClone || id == idClone) {
            this.khungDaoTao.value(data?.maKhung || '');
            this.props.getDtChuongTrinhDaoTao(id, ctdt => {
                ctdt = ctdt = ctdt.sort((a, b) => !a.namHocDuKien && !b.namHocDuKien ? 0 : (!a.namHocDuKien && b.namHocDuKien ? 1 : (a.namHocDuKien && !b.namHocDuKien ? -1 : (a.namHocDuKien > b.namHocDuKien ? (a.hocKyDuKien > b.hocKyDuKien ? -1 : 1) : 1))));
                this.setState({ listMonCtdt: ctdt, listMonCtdtFilter: ctdt });
                this.listMonHocChosen = ctdt.map(item => item.maMonHoc);
                SelectAdapter_DtCauTrucKhungDaoTao.fetchOne(data?.maKhung, (rs) => {
                    this.setKhung(rs, ctdt, data);
                });
            });
        } else {
            this.props.getDtKhungDaoTao(idClone, dataClone => {
                this.khungDaoTao.value(dataClone?.maKhung || '');
                this.setState({ oldKhoaSv: dataClone.khoaSinhVien, newKhoaSv: data.khoaSinhVien });
                this.props.getDtChuongTrinhDaoTao(idClone, ctdt => {
                    ctdt = ctdt.sort((a, b) => !a.namHocDuKien && !b.namHocDuKien ? 0 : (!a.namHocDuKien && b.namHocDuKien ? 1 : (a.namHocDuKien && !b.namHocDuKien ? -1 : (a.namHocDuKien > b.namHocDuKien ? (a.hocKyDuKien > b.hocKyDuKien ? -1 : 1) : 1))));
                    T.alert(`Sao chép từ CTĐT ${dataClone.chuyenNganh || dataClone.maNganh} (${dataClone.loaiHinhDaoTao} - ${dataClone.khoaSinhVien})`, 'success', false, 2000);
                    this.setState({ listMonCtdt: ctdt, listMonCtdtFilter: ctdt });
                    this.listMonHocChosen = ctdt.map(item => item.maMonHoc);
                    SelectAdapter_DtCauTrucKhungDaoTao.fetchOne(dataClone?.maKhung, (rs) => {
                        this.setKhung(rs, ctdt, dataClone);
                    });
                });
            });
        }

    }
    handleNganh = (value) => {
        this.tenNganhVi.value(value.name);
        this.khoa.value(value.khoa);
        this.tenVanBangVi.value('Cử nhân ' + value.name);
        this.setState({ tenNganhVi: value.name, maNganh: value.id }, () => {
            this.chuyenNganh.value('');
            this.chuyenNganh.focus();
            if (this.khoaSinhVien.value() && this.loaiHinhDaoTao.value()) {
                this.maCtdt.value(`${this.khoaSinhVien.value()}${this.loaiHinhDaoTao.value()}${this.chuyenNganh.value() || value.id}`);
            }
            this.dotTrungTuyen.value('');
            this.thoiGianDaoTao.value('');
        });
    }

    handleChuyenNganh = (value) => {
        this.setState({ chuyenNganh: value?.text || '' }, () => {
            if (this.maCtdt.value() && this.khoaSinhVien.value() && this.maNganh.value()) {
                this.maCtdt.value(`${this.khoaSinhVien.value()}${this.loaiHinhDaoTao.value()}${value?.id || this.maNganh.value()}`);
            }
            this.dotTrungTuyen.value('');
            this.thoiGianDaoTao.value('');
        });
    }

    changeSelectAdapterNamHocHocKy = (khoaSinhVien, dotTrungTuyen, thoiGianDaoTao) => {
        let dataSelect = [], { dataHocKy } = this.state;
        let start = khoaSinhVien;
        if (dotTrungTuyen == 1) {
            let namHoc = `${start} - ${start + 1}`;
            for (let hocKy of dataHocKy) {
                let item = `${hocKy.ten}, ${namHoc}`;
                dataSelect.push({
                    id: item,
                    text: item,
                    hocKyDuKien: hocKy.ma,
                    namHocDuKien: namHoc
                });
            }
            for (let i = 1; i < parseInt(thoiGianDaoTao); i++) {
                let namHoc = `${start + i} - ${start + i + 1}`;
                for (let hocKy of dataHocKy) {
                    let item = `${hocKy.ten}, ${namHoc}`;
                    dataSelect.push({
                        id: item,
                        text: item,
                        hocKyDuKien: hocKy.ma,
                        namHocDuKien: namHoc
                    });
                }
            }
            if (!Number.isInteger(thoiGianDaoTao)) {
                thoiGianDaoTao = parseInt(thoiGianDaoTao);
                let namHoc = `${start + thoiGianDaoTao} - ${start + thoiGianDaoTao + 1}`,
                    hocKy = dataHocKy.find(hk => hk.ma == 1),
                    item = `${hocKy.ten}, ${namHoc}`;
                dataSelect.push({
                    id: item,
                    text: item,
                    hocKyDuKien: hocKy.ma,
                    namHocDuKien: namHoc
                });
            }
        } else if (dotTrungTuyen == 2) {
            let namHoc = `${start} - ${start + 1}`;
            for (let hocKy of dataHocKy) {
                let item = `${hocKy.ten}, ${namHoc}`;
                hocKy.ma >= 2 && dataSelect.push({
                    id: item,
                    text: item,
                    hocKyDuKien: hocKy.ma,
                    namHocDuKien: namHoc
                });
            }
            if (!Number.isInteger(thoiGianDaoTao)) {
                for (let i = 1; i < thoiGianDaoTao; i++) {
                    let namHoc = `${start + i} - ${start + i + 1}`;
                    for (let hocKy of dataHocKy) {
                        let item = `${hocKy.ten}, ${namHoc}`;
                        dataSelect.push({
                            id: item,
                            text: item,
                            hocKyDuKien: hocKy.ma,
                            namHocDuKien: namHoc
                        });
                    }
                }
            } else {
                for (let i = 1; i < thoiGianDaoTao; i++) {
                    let namHoc = `${start + i} - ${start + i + 1}`;
                    for (let hocKy of dataHocKy) {
                        let item = `${hocKy.ten}, ${namHoc}`;
                        dataSelect.push({
                            id: item,
                            text: item,
                            hocKyDuKien: hocKy.ma,
                            namHocDuKien: namHoc
                        });
                    }
                }
                let namHoc = `${start + thoiGianDaoTao} - ${start + thoiGianDaoTao + 1}`,
                    hocKy = dataHocKy.find(hk => hk.ma == 1),
                    item = `${hocKy.ten}, ${namHoc}`;
                dataSelect.push({
                    id: item,
                    text: item,
                    hocKyDuKien: hocKy.ma,
                    namHocDuKien: namHoc
                });
            }
        }
        return dataSelect;
    }

    handleDotTrungTuyen = (value) => {
        let dataSelect = [],
            { dotTrungTuyen, thoiGianDaoTao } = value,
            { khoaSinhVien } = this.state;
        if (!parseInt(khoaSinhVien)) this.khoaSinhVien.focus();
        else {
            dataSelect = this.changeSelectAdapterNamHocHocKy(khoaSinhVien, dotTrungTuyen, Number(thoiGianDaoTao));
            const data = this.khungCtdt.value.data;
            const mucCha = T.parse(data?.mucCha, {
                chuongTrinhDaoTao: {}
            });
            const mucCon = T.parse(data?.mucCon, {
                chuongTrinhDaoTao: {}
            });
            this.setState({
                namHoc_hocKy: dataSelect, dotTrungTuyen, thoiGianDaoTao,
                chuongTrinhDaoTao: { parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao }
            }, () => {
                this.thoiGianDaoTao.value(thoiGianDaoTao);
                if (this.maCtdt.value() || (this.khoaSinhVien.value() && this.maNganh.value() && this.loaiHinhDaoTao.value())) {
                    if (this.loaiHinhDaoTao.value() != 'CQ' && this.loaiHinhDaoTao.value() != 'CLC') {
                        if (this.chuyenNganh.value()) {
                            this.maCtdt.value(`${this.khoaSinhVien.value()}${this.loaiHinhDaoTao.value()}${this.chuyenNganh.value()}_${dotTrungTuyen}`);
                        }
                        else {
                            this.maCtdt.value(`${this.khoaSinhVien.value()}${this.loaiHinhDaoTao.value()}${this.maNganh.value()}_${dotTrungTuyen}`);
                        }
                    }
                }
                this.handleThoiGianDaoTao({ id: thoiGianDaoTao });
                Object.keys(this.chuongTrinh).forEach(key => {
                    const childs = mucCon.chuongTrinhDaoTao[key] || null;
                    const data = this.khungCtdt.ctdt?.filter(item => item.maKhoiKienThuc === parseInt(mucCha.chuongTrinhDaoTao[key].id));
                    this.chuongTrinh[key]?.setVal(data, this.maKhoa, childs);
                });
            });
        }
    }

    handleThoiGianDaoTao = (value) => {
        let thoiGianDaoTao = value.id,
            { khoaSinhVien, namHoc_hocKy } = this.state,
            dotTrungTuyen = this.state?.dotTrungTuyen;
        if (!khoaSinhVien) this.khoaSinhVien.focus();
        else {
            namHoc_hocKy = this.changeSelectAdapterNamHocHocKy(khoaSinhVien, dotTrungTuyen, Number(thoiGianDaoTao));
            const { data } = this.khungCtdt.value;
            const mucCha = T.parse(data.mucCha, {
                chuongTrinhDaoTao: {}
            });
            const mucCon = T.parse(data.mucCon, {
                chuongTrinhDaoTao: {}
            });
            this.setState({
                namHoc_hocKy, thoiGianDaoTao,
                chuongTrinhDaoTao: { parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao }
            }, () => {
                Object.keys(this.chuongTrinh).forEach(key => {
                    const childs = mucCon.chuongTrinhDaoTao[key] || null;
                    const data = this.khungCtdt.ctdt?.filter(item => item.maKhoiKienThuc === parseInt(mucCha.chuongTrinhDaoTao[key].id));
                    this.chuongTrinh[key]?.setVal(data, this.maKhoa, childs);
                });
            });
        }
    }

    setKhoaSinhVien = (value) => {
        this.khoaSinhVien.value(parseInt(value.text));
        if (this.loaiHinhDaoTao.value() && this.maNganh.value()) {
            this.maCtdt.value(`${value.text}${this.loaiHinhDaoTao.value()}${this.chuyenNganh.value() || this.maNganh.value()}`);
        }
        this.setState({ khoaSinhVien: value.id }, () => {
            this.dotTrungTuyen.value('');
            this.thoiGianDaoTao.value('');
        });
    }
    handleLoaiHinhDaoTao = (value) => {
        if (this.khoaSinhVien.value() && this.maNganh.value()) {
            this.maCtdt.value(`${this.khoaSinhVien.value()}${value.id}${this.chuyenNganh.value() || this.maNganh.value()}`);
        }
        this.setState({ loaiHinhDaoTao: value.id }, () => {
            this.dotTrungTuyen.value('');
            this.thoiGianDaoTao.value('');
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
            // const mucTieu =
            //     Object.keys(this.mucTieu).map(key => {
            //         return { id: key, value: this.mucTieu[key]?.value() };
            //     });
            let data = {
                maNganh: this.validation(this.maNganh),
                khoaSinhVien: this.validation(this.khoaSinhVien),
                tenNganhVi: this.validation(this.tenNganhVi),
                tenNganhEn: this.validation(this.tenNganhEn),
                tenNganh: T.stringify({ vi: this.tenNganhVi.value(), en: this.tenNganhEn.value() }),
                maKhung: this.validation(this.khungDaoTao),
                maCtdt: this.validation(this.maCtdt),
                dotTrungTuyen: this.validation(this.dotTrungTuyen),
                trinhDoDaoTao: this.validation(this.trinhDoDaoTao),
                loaiHinhDaoTao: this.validation(this.loaiHinhDaoTao),
                thoiGianDaoTao: this.validation(this.thoiGianDaoTao),
                tenVanBangVi: this.validation(this.tenVanBangVi),
                tenVanBangEn: this.validation(this.tenVanBangEn),
                tenVanBang: T.stringify({ vi: this.tenVanBangVi.value(), en: this.tenVanBangEn.value() }),
                maKhoa: this.validation(this.khoa),
                // mucTieu: T.stringify(mucTieu),
                chuyenNganh: this.validation(this.chuyenNganh),
                listLop: this.validation(this.listLop),
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    createCTDT = (updateDatas) => {
        T.confirm('Xác nhận', 'Bạn có chắc muốn tạo mới chương trình đào tạo này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createDtChuongTrinhDaoTao(updateDatas, ctdt => {
                    if (ctdt.error) T.alert('Tạo mới thất bại', 'warning', false, 1000, true);
                    else {
                        T.alert('Tạo mới thành công', 'success', false, 1000, true);
                        window.location = `/user/dao-tao/chuong-trinh-dao-tao/${ctdt.item.id}`;
                    }
                });
            }
        });
    }

    updateCTDT = (updateDatas) => {
        T.confirm('Xác nhận', 'Bạn có chắc muốn sửa đổi thông tin của chương trình đào tạo này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.updateDtChuongTrinhDaoTao(this.ma, updateDatas, (ctdt) => {
                    if (ctdt.error) T.alert('Cập nhật thất bại', 'warning', false, 1000, true);
                    else {
                        this.props.getDtChuongTrinhDaoTao(this.ma, ctdt => {
                            ctdt = ctdt.sort((a, b) => !a.namHocDuKien && !b.namHocDuKien ? 0 : (!a.namHocDuKien && b.namHocDuKien ? 1 : (a.namHocDuKien && !b.namHocDuKien ? -1 : (a.namHocDuKien > b.namHocDuKien ? (a.hocKyDuKien > b.hocKyDuKien ? -1 : 1) : 1))));
                            this.setState({ listMonCtdtFilter: ctdt }, () => T.alert('Cập nhật thành công', 'success', false, 1000, true));
                        });
                    }
                });
            }
        });
    }

    save = () => {
        let data = this.getValue();
        if (data) {
            const kienThucs =
                Object.keys(this.chuongTrinh).map(key => {
                    return (this.chuongTrinh[key]?.getValue() || { updateDatas: [], deleteDatas: [] })?.updateDatas;
                });
            let updateItems = [];
            kienThucs.forEach(kienThuc => {
                updateItems = [...updateItems, ...kienThuc];
            });
            const updateDatas = { items: updateItems, ...{ id: this.ma, data } };
            this.ma == 'new' ? this.createCTDT(updateDatas) : this.updateCTDT(updateDatas);
        }
    }

    saveNamHocHocKy = () => {
        let data = this.getValue();
        if (data) {
            if (!this.namHocHocKy.value()) return T.alert('Chưa chọn năm học, học kỳ dự kiến!', 'error', false, 2000);
            let items = this.state.listMonCtdt.map(item => {
                if (this.listMonCtdtChon.includes(item.maMonHoc)) {
                    item.hocKyDuKien = this.namHocHocKy.data().hocKyDuKien;
                    item.namHocDuKien = this.namHocHocKy.data().namHocDuKien;
                }
                return item;
            });
            const updateDatas = { items, ...{ id: this.ma, data } };
            this.updateCTDT(updateDatas);
        }
    }

    import = (e) => {
        e.preventDefault();
        if (!this.khungDaoTao.value()) {
            T.notify('Vui lòng chọn khung CTĐT!', 'warning');
            this.khungDaoTao.focus();
        } else {
            if (this.ma == 'new') {
                this.props.history.push('/user/dao-tao/chuong-trinh-dao-tao/import', { maKhung: this.khungDaoTao.value(), data: this.getValue() });
            } else {
                T.confirm('Xác nhận', '<div>Việc import sẽ ghi đè lên chương trình đào tạo hiện tại.<br />Bạn có chắc chắn muốn import không?</div>', 'warning', true, isConfirm => {
                    if (isConfirm) {
                        this.props.history.push(`/user/dao-tao/chuong-trinh-dao-tao/import?id=${this.ma}`, { maKhung: this.khungDaoTao.value(), data: this.getValue() });
                    }
                });
            }
        }
    }

    export = (e) => {
        e.preventDefault();
        T.handleDownload(`/api/dt/chuong-trinh-dao-tao/export?maKhung=${this.ma}`);
    }

    handleKeySearch = (data) => {
        let { listMonCtdt } = this.state,
            ctdtFilter = listMonCtdt, [ks, value] = data.split(':');
        if (ks == 'ks_maMonHoc') {
            ctdtFilter = ctdtFilter.filter(mon => mon.maMonHoc.toLowerCase().includes(value.toLowerCase()));
        } else if (ks == 'ks_tenMonHoc') {
            ctdtFilter = ctdtFilter.filter(mon => mon.tenMonHoc.toLowerCase().includes(value.toLowerCase()));
        } else if (ks == 'ks_tuChon') {
            ctdtFilter = ctdtFilter.filter(mon => value == '' || mon.loaiMonHoc == parseInt(value));
        } else if (ks == 'ks_tinChi') {
            ctdtFilter = ctdtFilter.filter(mon => value == '' || mon.soTinChi == parseInt(value));
        } else if (ks == 'ks_tietLt') {
            ctdtFilter = ctdtFilter.filter(mon => value == '' || mon.soTietLyThuyet == parseInt(value));
        } else if (ks == 'ks_tietTh') {
            ctdtFilter = ctdtFilter.filter(mon => value == '' || mon.soTietThucHanh == parseInt(value));
        } else if (ks == 'ks_tongTiet') {
            ctdtFilter = ctdtFilter.filter(mon => value == '' || mon.tongSoTiet == parseInt(value));
        } else if (ks == 'ks_hkNh') {
            let [hocKy, namHoc] = value.split(', ');
            hocKy = parseInt(hocKy.slice(-1));
            ctdtFilter = ctdtFilter.filter(mon => value == '' || (mon.namHocDuKien == namHoc && mon.hocKyDuKien == hocKy));
        }
        this.setState({ listMonCtdtFilter: ctdtFilter });
    }

    onSort = (data) => {
        const { listMonCtdt } = this.state;
        let ctdtFilter = listMonCtdt;
        if (data) {
            let [sortTerm, sortMode] = data.split('_');
            if (sortMode == 'ASC') {
                if (sortTerm == 'maMonHoc') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.maMonHoc > b.maMonHoc ? 1 : -1);
                } else if (sortTerm == 'tenMonHoc') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.tenMonHoc > b.tenMonHoc ? 1 : -1);
                } else if (sortTerm == 'tuChon') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.loaiMonHoc > b.loaiMonHoc ? 1 : -1);
                } else if (sortTerm == 'tinChi') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.soTinChi > b.soTinChi ? 1 : -1);
                } else if (sortTerm == 'tietLt') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.soTietLyThuyet > b.soTietLyThuyet ? 1 : -1);
                } else if (sortTerm == 'tietTh') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.soTietThucHanh > b.soTietThucHanh ? 1 : -1);
                } else if (sortTerm == 'tongTiet') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.tongSoTiet > b.tongSoTiet ? 1 : -1);
                } else if (sortTerm == 'hkNh') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.namHocDuKien > b.namHocDuKien ? 1 : (a.hocKyDuKien > b.hocKyDuKien ? 1 : -1));
                }
            } else if (sortMode == 'DESC') {
                if (sortTerm == 'maMonHoc') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.maMonHoc > b.maMonHoc ? -1 : 1);
                } else if (sortTerm == 'tenMonHoc') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.tenMonHoc > b.tenMonHoc ? -1 : 1);
                } else if (sortTerm == 'tuChon') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.loaiMonHoc > b.loaiMonHoc ? -1 : 1);
                } else if (sortTerm == 'tinChi') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.soTinChi > b.soTinChi ? -1 : 1);
                } else if (sortTerm == 'tietLt') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.soTietLyThuyet > b.soTietLyThuyet ? -1 : 1);
                } else if (sortTerm == 'tietTh') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.soTietThucHanh > b.soTietThucHanh ? -1 : 1);
                } else if (sortTerm == 'tongTiet') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.tongSoTiet > b.tongSoTiet ? -1 : 1);
                } else if (sortTerm == 'hkNh') {
                    ctdtFilter = ctdtFilter.sort((a, b) => a.namHocDuKien > b.namHocDuKien ? -1 : (a.hocKyDuKien > b.hocKyDuKien ? -1 : 1));
                }
            }
            this.setState({ listMonCtdtFilter: ctdtFilter });
        } else {
            ctdtFilter = ctdtFilter.sort((a, b) => a.namHocDuKien > b.namHocDuKien ? -1 : (a.hocKyDuKien > b.hocKyDuKien ? -1 : 1));
            this.setState({ listMonCtdtFilter: ctdtFilter });
        }
    }

    chonMonCtdt = (item, list) => {
        item.isChon = !item.isChon;
        this.countMonCtdt(item);
        this.setState({ listMonCtdtFilter: list, thaoTac: this.listMonCtdtChon.length > 0 });
    }

    countMonCtdt = (item) => {
        let check = false;
        if (item.isChon == true) {
            this.listMonCtdtChon.forEach(itemSV => {
                if (item.maMonHoc == itemSV) check = true;
            });
            if (check == false) this.listMonCtdtChon.push(item.maMonHoc);
        } else if (item.isChon == false) {
            for (let i = 0; i < this.listMonCtdtChon.length; i++) {
                if (item.maMonHoc == this.listMonCtdtChon[i]) this.listMonCtdtChon.splice(i, 1);
            }
        }
    }

    tableCtdt = (list) => renderDataTable({
        emptyTable: 'Không có môn trong CTĐT',
        data: list,
        header: 'thead-light',
        divStyle: { height: '65vh' },
        stickyHead: true,
        renderHead: () => <tr>
            <th style={{ width: 'auto', verticalAlign: 'middle' }} content='#'>#</th>
            <TableHead style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }} content='Mã môn học' keyCol='maMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            <TableHead style={{ width: '100%', verticalAlign: 'middle' }} content='Tên môn học' keyCol='tenMonHoc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            <TableHead style={{ minWidth: '130px', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }} content='Tự chọn' keyCol='tuChon' onKeySearch={this.handleKeySearch} typeSearch='select' data={[{ id: 0, text: 'Bắt buộc' }, { id: 1, text: 'Tự chọn' }]} onSort={this.onSort} />
            <TableHead style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} content='Tín chỉ' keyCol='tinChi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            <TableHead style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} content='Tiết LT' keyCol='tietLt' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            <TableHead style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} content='Tiết TH' keyCol='tietTh' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            <TableHead style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} content='Tổng tiết' keyCol='tongTiet' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
            <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }} content='HK, NH dự kiến' keyCol='hkNh' onKeySearch={this.handleKeySearch} typeSearch='select' data={this.state.namHoc_hocKy} onSort={this.onSort} />
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tỷ lệ điểm</th>
        </tr>,
        renderRow: (item, index) => {
            let namHoc_hocKy = this.state.namHoc_hocKy?.find(data => data.namHocDuKien == item.namHocDuKien && data.hocKyDuKien == item.hocKyDuKien);
            const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage', 'import', 'export']);
            const readOnly = !(permission.write || permission.manage);
            const tyLeDiem = item.tyLeDiem ? T.parse(item.tyLeDiem) : [];

            return <tr key={index} style={{ backgroundColor: item.isChon ? '#cfe2ff' : null, cursor: 'pointer' }} onClick={() => !readOnly && this.chonMonCtdt(item, list)}>
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.maMonHoc} />
                <TableCell style={{ textAlign: 'left' }} content={item.tenMonHoc} nowrap />
                <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-fw fa-lg fa-check' /> : ''} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTinChi} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTietLyThuyet} />
                <TableCell style={{ textAlign: 'center' }} content={item.soTietThucHanh} />
                <TableCell style={{ textAlign: 'center' }} content={item.tongSoTiet} />
                <TableCell style={{ textAlign: 'center' }} content={namHoc_hocKy ? namHoc_hocKy.id : ''} nowrap />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{tyLeDiem.sort((a, b) => parseInt(a.phanTram) - parseInt(b.phanTram)).map(i => <div key={`${index}${i.loaiThanhPhan}`}><b>{i.loaiThanhPhan}</b>: {i.phanTram}%</div>)}</>} />
            </tr>;
        },
    })

    handleKeHoachChuyenNganh = () => {
        T.confirm('Xác nhận', 'Bạn có chắc cập nhật kế hoạch đào tạo cho chương trình chuyên ngành không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang cập nhật thành kế hoạch đào tạo chuyên ngành!', 'warning', false, null, true);
                this.props.updateKeHoachChuyenNganh({ items: this.listMonCtdtChon, maKhungDaoTao: this.ma });
            }
        });

    }

    render() {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage', 'import', 'export']);
        const readOnly = !(permission.write || permission.manage),
            isPhongDaoTao = Number(this.props.system?.user?.isPhongDaoTao);

        const { chuongTrinhDaoTao, thaoTac } = this.state;
        let khoaSinhVien = null, loaiHinhDaoTao = null;
        if (this.state?.khoaSinhVien) {
            khoaSinhVien = this.state?.khoaSinhVien;
        } else if (this.khoaSinhVien?.value()) {
            khoaSinhVien = this.khoaSinhVien?.value();
        }
        if (this.state?.loaiHinhDaoTao) {
            loaiHinhDaoTao = this.state?.loaiHinhDaoTao;
        } else if (this.loaiHinhDaoTao?.value()) {
            loaiHinhDaoTao = this.loaiHinhDaoTao?.value();
        }
        const tabThongTinChung = {
            title: 'Thông tin chung',
            component: <><div className='tile' >
                <h5 className='tile-title'>Thông tin chung</h5>
                <div className='tile-body'>
                    <div className='row'>
                        <FormSelect ref={e => this.trinhDoDaoTao = e} label='Trình độ đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-2' required readOnly />
                        <FormSelect ref={e => this.khungDaoTao = e} className='col-md-2' label='Khung CTĐT' data={SelectAdapter_DtCauTrucKhungDaoTao} required readOnly={readOnly} onChange={value => this.setKhung(value)} />
                        <FormSelect ref={e => this.khoaSinhVien = e} label='Khoá sinh viên' data={SelectAdapter_DtKhoaDaoTaoFilter('dtEduProgram')} className='col-md-2' required readOnly={readOnly} onChange={value => this.setKhoaSinhVien(value)} />
                        <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtEduProgram')} className='col-md-2' required readOnly={readOnly} onChange={this.handleLoaiHinhDaoTao} />
                        <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoFilterPage} label='Ngành' className='col-md-2' onChange={this.handleNganh} required readOnly={readOnly} />
                        <FormSelect ref={e => this.chuyenNganh = e} data={SelectAdapter_DtChuyenNganhFilter(this.state.maNganh)} label='Chuyên ngành' className='col-md-2' readOnly={readOnly} onChange={value => this.handleChuyenNganh(value)} />
                        <FormSelect ref={e => this.dotTrungTuyen = e} data={SelectAdapter_DtKhoa(khoaSinhVien, loaiHinhDaoTao)} label='Đợt trúng tuyển' className='col-md-3' required readOnly={readOnly} onChange={this.handleDotTrungTuyen} />
                        <FormSelect ref={e => this.thoiGianDaoTao = e} data={SelectAdapter_DtDmThoiGianDaoTaoAll} label='Thời gian đào tạo' className='col-md-3' required readOnly={readOnly} onChange={this.handleThoiGianDaoTao} />
                        <FormTextBox ref={e => this.maCtdt = e} label='Mã chương trình đào tạo' className='col-md-3' required readOnly={readOnly} />
                        <FormTextBox ref={e => this.listLop = e} className='col-md-3' label='Lớp sinh viên' readOnly />
                        <div style={{ marginBottom: '0' }} className='form-group col-md-12'>
                            <label>Tên ngành: </label>
                            <FormTabs tabs={[
                                {
                                    title: <>Tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                    component: <FormTextBox ref={e => this.tenNganhVi = e} placeholder='Tên ngành (tiếng Việt)' required />
                                },
                                {
                                    title: <>Tiếng Anh</>,
                                    component: <FormTextBox ref={e => this.tenNganhEn = e} placeholder='Tên ngành (tiếng Anh)' />
                                }
                            ]} />
                        </div>
                        <div style={{ marginBottom: '0' }} className='form-group col-md-12'>
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
                        <FormSelect style={{ marginBottom: '0' }} ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Nơi đào tạo' className='col-12' readOnly={!isPhongDaoTao} value={!isPhongDaoTao ? this.props.system?.user?.maDonVi || '' : ''} />
                        <div className='form-group col-md-12'>

                        </div>

                    </div>
                </div>
            </div>
                {
                    chuongTrinhDaoTao && chuongTrinhDaoTao.parents && Object.keys(chuongTrinhDaoTao.parents).map((key) => {
                        const childs = chuongTrinhDaoTao.childs;
                        const pIdx = `${this.khoaDt}_${key}`;
                        const { id, text } = chuongTrinhDaoTao.parents[key];
                        return (
                            <ComponentKienThuc key={pIdx} title={text} khoiKienThucId={id} childs={childs[key]} ref={e => this.chuongTrinh[key] = e}
                                listMonCtdt={this.state.listMonCtdt || []} pushMonHocChosen={this.pushMonHocChosen} removeMonHoc={this.removeMonHoc}
                                thoiGianDaoTao={this.thoiGianDaoTao.data()} SelectAdapter_NamHocHocKy={this.state.namHoc_hocKy} maKhungCtdt={this.ma} getKhoaSinhVien={({ newKhoaSv: this.state.newKhoaSv, oldKhoaSv: this.state.oldKhoaSv })} />
                        );
                    })
                }
            </>
        }, tabMonCtdt = {
            title: 'Danh sách môn CTĐT',
            component: <div className='tile'>
                <TyLeDiemModal ref={e => this.tyLeModal = e} listMonCtdtChon={this.listMonCtdtChon} ma={this.ma} handleSave={(done) => {
                    this.props.getDtChuongTrinhDaoTao(this.ma, ctdt => {
                        ctdt = ctdt.sort((a, b) => a.namHocDuKien > b.namHocDuKien ? (a.hocKyDuKien > b.hocKyDuKien ? -1 : 1) : 1);
                        this.setState({ listMonCtdtFilter: ctdt }, () => done && done());
                    });
                }} />
                <div className='row mb-2' style={{ display: readOnly ? 'none' : '' }}>
                    {thaoTac ?
                        <FormSelect ref={e => this.namHocHocKy = e} className='col-md-4' data={this.state.namHoc_hocKy} placeholder='Học kỳ, năm học' style={{ marginBottom: 0, height: 'fit-content' }} />
                        : null}

                    <div className={thaoTac ? 'col-md-8' : 'col-md-12'}>
                        <div className='rows' style={{ textAlign: 'right' }}>
                            {this.listMonCtdtChon.length == 0 ?
                                <button className='btn btn-success' type='button' onClick={e => {
                                    e.preventDefault();
                                    let list = this.state.listMonCtdtFilter;
                                    list.map(item => {
                                        item.isChon = true;
                                        return item;
                                    });
                                    list.forEach(item => this.countMonCtdt(item));
                                    this.setState({ listMonCtdtFilter: list, thaoTac: true });
                                }}>
                                    <i className='fa fa-fw fa-lg fa-check' /> Chọn tất cả
                                </button> :
                                <button className='btn btn-danger' type='button' onClick={e => {
                                    e.preventDefault();
                                    let list = this.state.listMonCtdtFilter;
                                    list.map(item => {
                                        item.isChon = false;
                                        return item;
                                    });
                                    list.forEach(item => this.countMonCtdt(item));
                                    this.setState({ listMonCtdtFilter: list, thaoTac: false });
                                }}>
                                    <i className='fa fa-fw fa-lg fa-times' /> Bỏ chọn {this.listMonCtdtChon.length} môn học
                                </button>}
                            {thaoTac ?
                                <>
                                    <button className='btn btn-primary ml-2' type='button' onClick={(e) => e.preventDefault() || this.handleKeHoachChuyenNganh()}>
                                        <i className='fa fa-fw fa-lg fa-wrench' /> Cập nhật chuyên ngành
                                    </button>
                                    <button className='btn btn-info ml-2' type='button' onClick={(e) => e.preventDefault() || this.tyLeModal.show()}>
                                        <i className='fa fa-fw fa-lg fa-pencil' /> Cập nhật tỷ lệ điểm
                                    </button>
                                    <button className='btn btn-success ml-2' type='button' onClick={(e) => e.preventDefault() || this.saveNamHocHocKy()}>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                </>
                                : null}
                        </div>
                    </div>
                </div>
                {this.state.listMonCtdtFilter ? this.tableCtdt(this.state.listMonCtdtFilter) : loadSpinner()}
            </div>
        }, tabDssv = {
            title: 'Danh sách sinh viên',
            component: <div className='tile'>
                <DssvTab dssv={this.state.dssv} maKhung={this.ma} />
            </div>
        },
            // tabTinChi = {
            // title: 'Tín chỉ trong CTDT',
            // component: <div className='tile'>
            //     <TinChiTab ref={e => this.tinChiTab = e} maKhung={this.ma} />
            // </div>
            // },
            tabKhungTinChi = {
                title: 'Tín chỉ trong CTDT',
                component: <div>
                    <KhungTinChi ref={e => this.khungTinChi = e} maKhung={this.ma} />
                </div>
            };
        const tabs = [tabThongTinChung];
        if (this.ma != 'new') {
            // tabs.push(tabTinChi);
            tabs.push(tabKhungTinChi);
            tabs.push(tabMonCtdt);
            tabs.push(tabDssv);
        }
        let collapse = [
            { icon: 'fa-save', name: 'Lưu', type: 'success', permission: permission.write, onClick: e => e.preventDefault() || this.save() }
        ];
        if (this.ma == 'new') {
            collapse.push({ icon: 'fa-upload', name: 'Import', type: 'info', permission: permission.import, onClick: e => this.import(e) });
        } else {
            collapse.push({ icon: 'fa-upload', name: 'Import', type: 'info', permission: permission.import, onClick: e => this.import(e) });
            this.state.listMonCtdt?.length && collapse.push({ icon: 'fa-download', name: 'Export', type: 'warning', permission: permission.export, onClick: e => this.export(e) });
        }
        return this.renderPage({
            title: this.ma !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            icon: 'fa fa-university',
            content: <>
                <FormTabs ref={e => this.tab = e} tabs={tabs} onChange={tab => this.setState({ savedConfig: !!tab.tabIndex })} />
            </>,
            collapse: !this.state.savedConfig ? collapse : null,
            backRoute: '/user/dao-tao/chuong-trinh-dao-tao'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = {
    getDtKhungDaoTao, getDtChuongTrinhDaoTao, getDtDmHocKyAll, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, getDtNganhDaoTao, updateKeHoachChuyenNganh
};
export default connect(mapStateToProps, mapActionsToProps)(CtdtDetailPage);