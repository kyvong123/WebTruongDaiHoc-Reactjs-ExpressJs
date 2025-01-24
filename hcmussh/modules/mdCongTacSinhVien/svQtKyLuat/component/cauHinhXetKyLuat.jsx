import { SelectAdapter_DmDonViFaculty_V3 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import React from 'react';
import { FormCheckbox, FormSelect, getValue, loadSpinner, } from 'view/component/AdminPage';
import { SelectAdapter_DmCauHinhKyLuat } from '../../svDmQtKyLuatCauHinh/redux';
import KyLuatDanhSachSinhVien from './ketQuaComponent';

class CauHinhXetKyLuat extends React.Component {
    state = {
        ksFilter: [{}, {}, {}],
        isMoRong: false,
        mssvEdit: null, isLoading: false, isLoadingList: false, addIndex: null, dsDieuKien: [], dssvDuKien: [], dssvFilter: [], id: null, dssvThem: [], dssvXoa: []
    }
    componentDidMount = () => {
        this.danhSachTabs.tabClick(1);
    }

    setData = (id) => {
        this.setState({ isLoading: true, isLoadingList: true }, () => {
            this.props.getSvQtKyLuatCauHinhDssv(id, (data) => {
                const { id, namHoc, hocKy, khoaSinhVien, heDaoTao, khoa, dssvDuKien, dsDieuKien, dmCauHinhId } = data;
                this.setState({
                    isLoading: false, id, dsDieuKien: dsDieuKien.map((dk, index) => ({ ...dk, indexItem: index })),
                    dssvDuKien,
                    dssvFilter: [],
                    dssvThem: [], dssvXoa: [],
                    ksFilter: [{}, {}, {}]
                }, () => {
                    this.namHoc.value(namHoc || '');
                    this.hocKy.value(hocKy || '');
                    this.khoaSinhVien.value(khoaSinhVien.split(', '));
                    this.khoa.value(khoa.split(', '));
                    this.heDaoTao.value(heDaoTao.split(', '));
                    this.dmCauHinhKyLuat.value(dmCauHinhId || '');
                    this.props.getSvQtKyLuatDssvTheoCauHinh({
                        namHoc: namHoc?.toString() || '',
                        hocKy: hocKy?.toString() || '',
                        khoaSinhVien: khoaSinhVien.split(', '),
                        khoa: khoa.split(', '),
                        heDaoTao: heDaoTao.split(', '),
                        dmCauHinhKyLuat: dmCauHinhId?.toString() || '',
                    }, (data) => {
                        this.setState({ isLoadingList: false, dssvFilter: data });
                    });
                    // setTimeout(() => {
                    //     this.filterDssvTheoCauHinh();
                    // }, 500);
                });
            });
        });
    }

    resetData = () => {
        this.setState({ addIndex: null, dsDieuKien: [], dssvDuKien: [], dssvFilter: [], id: null, dssvThem: [], dssvXoa: [] }, () => {
            this.namHoc.value('');
            this.hocKy.value('');
            this.khoaSinhVien.value('');
            this.khoa.value('');
            this.heDaoTao.value('');
        });
    }

    changeKhoaSelect = () => {
        const { khoa } = this.props,
            lsKhoaSelect = this.khoa.value();
        this.setState({ lsKhoaSelect: khoa.filter(item => lsKhoaSelect.includes(item.ma.toString()) == true) }, () => {
        });
    }

    checkAll = (value) => {
        if (value == true) {
            let khoa = this.props.khoa.map(e => e.ma);
            this.khoa.value(khoa);
            this.setState({ lsKhoaSelect: this.props.khoa });
        } else {
            this.khoa.value(null);
            this.setState({ lsKhoaSelect: [] });
        }
    }

    componentCauHinh = () => {
        return (<div className='row'>
            {/* <FormTextBox ref={e => this.namHoc = e} className='col-md-6' label='Năm học' type='scholastic' required /> */}
            <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={Array.from({ length: 6 }, (_, i) => `${new Date().getFullYear() - i - 1} - ${new Date().getFullYear() - i}`)} required />
            <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required />
            <FormSelect ref={e => this.khoaSinhVien = e} className='col-md-6' label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} multiple required />
            <FormSelect ref={e => this.heDaoTao = e} className='col-md-6' label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} multiple required />
            <div className='col-md-12'>
                <div className='d-flex justifyBetween'>
                    <label>Chọn khoa</label>
                    <FormCheckbox ref={e => this.allKhoa = e} className='col-md-4' label='Chọn tất cả'
                        onChange={(value) => {
                            this.checkAll(value, 'khoa');
                        }} />
                </div>
                <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V3} multiple onChange={(value) => this.changeKhoaSelect(value)} />
            </div>
            <FormSelect ref={e => this.dmCauHinhKyLuat = e} className='col-md-12' label='Cấu hình xét kỷ luật' data={SelectAdapter_DmCauHinhKyLuat} required />
        </div>);
    }


    filterDssvTheoCauHinh = (done) => {
        const cauHinh = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            khoaSinhVien: getValue(this.khoaSinhVien),
            heDaoTao: getValue(this.heDaoTao),
            khoa: getValue(this.khoa),
            dmCauHinhKyLuat: getValue(this.dmCauHinhKyLuat),
        };
        this.setState({ isLoadingList: true }, () => {
            this.props.getSvQtKyLuatDssvTheoCauHinh(cauHinh, (data) => {
                this.setState({ isLoadingList: false, dssvFilter: data }, () => {
                    done && done();
                });
            });
        });
    }

    saveCauHinh = () => {
        // const { id, dssvThem, dssvXoa, dssvDuKien, dssvFilter } = this.state;
        const { id } = this.state;
        const { dssvThem, dssvXoa, dssvCuuXet, dssvFilter, dssvKhongTinhBoSung } = this.danhSachTabs.getData();
        const cauHinh = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            khoaSinhVien: getValue(this.khoaSinhVien),
            heDaoTao: getValue(this.heDaoTao),
            khoa: getValue(this.khoa),
            dmCauHinhId: getValue(this.dmCauHinhKyLuat),
            dssvThem, dssvXoa, dssvCuuXet,
            dssvFilter, dssvKhongTinhBoSung
        };
        this.setState({ isLoadingList: true }, () => {
            if (id) {
                this.props.updateSvQtKyLuatCauHinh(id, cauHinh, (data) => {
                    this.setData(data.id);
                });
            } else {
                this.props.createSvQtKyLuatCauHinh(cauHinh, (data) => {
                    this.setData(data.id);
                });
            }
        });
    }

    render = () => {
        const { dssvFilter, dssvDuKien, isMoRong, id } = this.state;
        return (
            this.state.isLoading ? loadSpinner() : <div className='tile'>
                <div className='row'>
                    <div className={`${isMoRong ? 'd-none' : 'col-md-4'}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h5>Cấu hình kỷ luật</h5>
                            {this.state.addIndex == null && <button className='btn btn-warning' type='button' onClick={(e) => { e.preventDefault(); this.filterDssvTheoCauHinh(() => this.danhSachTabs.tabClick(2)); }}>
                                <i className='fa fa-filter' /> Tìm kiếm
                            </button>}
                        </div>
                        {this.componentCauHinh()}
                    </div>
                    <div className={`${isMoRong ? 'col-md-12' : 'col-md-8'}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h5>Danh sách sinh viên</h5>
                            <button className='btn btn-warning' type='button' onClick={(e) => {
                                e.preventDefault();
                                this.setState({ isMoRong: !this.state.isMoRong });
                            }}>
                                <i className={`fa ${!isMoRong ? 'fa-arrows-alt' : 'fa-compress'}`} />
                            </button>
                        </div>
                        {this.state.isLoadingList ? loadSpinner() :
                            <KyLuatDanhSachSinhVien ref={e => this.danhSachTabs = e} dssvFilter={dssvFilter} dssvDuKien={dssvDuKien} id={id}
                                ghiChuSvKyLuatDssvDuKien={this.props.ghiChuSvKyLuatDssvDuKien}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default CauHinhXetKyLuat;