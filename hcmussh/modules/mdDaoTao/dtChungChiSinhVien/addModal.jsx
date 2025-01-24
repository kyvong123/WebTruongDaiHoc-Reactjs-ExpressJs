import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, FormCheckbox, getValue, FormDatePicker, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_DtDmNgoaiNgu } from 'modules/mdDaoTao/dtDmNgoaiNgu/redux';
import { SelectAdapter_DtDmCefr } from 'modules/mdDaoTao/dtDmCefr/redux';
import { SelectAdapter_DtDmChungChiNgoaiNguFilter, createDtChungChiSinhVien, updateDtChungChiSinhVien } from './redux';
import { SelectAdapter_DtGetStudentInBangDiem } from 'modules/mdDaoTao/dtDiemInBangDiem/redux';
import FileBox from 'view/component/FileBox';
import { Img } from 'view/component/HomePage';

class CertImg extends React.Component {
    state = { fileName: '' }
    componentDidMount() {
        let { fileName } = this.props;
        this.setState({ fileName });
    }
    componentDidUpdate(prevProps) {
        if (this.props && prevProps.fileName != this.props.fileName) {
            let { fileName } = this.props;
            this.setState({ fileName });
        }
    }
    render() {
        let { fileName } = this.state;
        let src = T.url(`/api/dt/chung-chi-sinh-vien/cert-image?fileName=${fileName}`);
        return fileName ? <Img id={'certImg'} src={src} style={{ display: 'block', height: 'auto', maxWidth: '95%', margin: '0 auto' }} /> : <></>;
    }
}
class AddModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.setState({ sv: {} }, () => {
                this.mssv.value('');
                this.hoTen.value('');
                this.ngaySinh.value('');
                this.ngoaiNgu.value('');
                this.chungChi.value('');
                this.trinhDo.value('');
                this.listen.value('');
                this.read.value('');
                this.speak.value('');
                this.write.value('');
                this.score.value('');
                this.ngayCap.value('');
                this.noiCap.value('');
                this.cccd.value('');
                this.soHieuVanBang.value('');
                this.isDangKy.value(false);
                this.isJuniorStudent.value(false);
                this.isTotNghiep.value(false);
                this.isNotQualified.value(false);
                this.ghiChu.value('');
            });
        });
    }

    onShow = (item) => {
        let { id, mssv, hoTen, ngaySinh, ngoaiNgu, chungChi, tenChungChi, trinhDo, score, ngayCap, noiCap, isJuniorStudent, isTotNghiep, isDangKy, isNotQualified, fileName, ghiChu, cccd, soHieuVanBang } = item ? item
            : { id: null, mssv: '', hoTen: '', ngaySinh: '', ngoaiNgu: '', chungChi: '', tenChungChi: '', trinhDo: '', score: '', ngayCap: '', noiCap: '', isDangKy: '', isJuniorStudent: '', isTotNghiep: '', isNotQualified: '', ghiChu: '', fileName: '', cccd: '', soHieuVanBang: '' };
        this.setState({ sv: item, ngoaiNgu, chungChi: tenChungChi, fileName, edit: id || mssv }, () => {
            this.tab.tabClick(null, 0);
            score = score ? JSON.parse(score) : { L: '', R: '', S: '', W: '', score: '' };
            this.mssv.value(mssv);
            this.hoTen.value(hoTen);
            this.ngaySinh.value(ngaySinh);
            this.ngoaiNgu.value(ngoaiNgu);
            this.chungChi.value(chungChi);
            this.trinhDo.value(trinhDo);
            this.listen.value(score.L);
            this.read.value(score.R);
            this.speak.value(score.S);
            this.write.value(score.W);
            this.score.value(score.score);
            this.ngayCap.value(ngayCap);
            this.noiCap.value(noiCap || '');
            this.isDangKy.value(isDangKy || false);
            this.isJuniorStudent.value(isJuniorStudent || false);
            this.isTotNghiep.value(isTotNghiep || false);
            this.isNotQualified.value(isNotQualified || false);
            this.ghiChu.value(ghiChu || '');
            this.cccd.value(cccd);
            this.soHieuVanBang.value(soHieuVanBang);
        });
    }

    handleUploadSuccess = (result) => {
        if (result.message) {
            T.alert(result.message || 'Xảy ra lỗi trong quá trình import', 'error', true);
        } else {
            this.setState({ fileName: result.fileName }, () => T.notify('Upload ảnh thành công', 'success'));
        }
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const { sv } = this.state,
            data = {
                mssv: getValue(this.mssv),
                ngoaiNgu: getValue(this.ngoaiNgu),
                chungChi: getValue(this.chungChi),
                trinhDo: getValue(this.trinhDo),
                ngayCap: this.ngayCap.value() ? this.ngayCap.value().getTime() : '',
                noiCap: this.noiCap.value(),
                isDangKy: Number(this.isDangKy.value()),
                isTotNghiep: Number(this.isTotNghiep.value()),
                isJuniorStudent: Number(this.isJuniorStudent.value()),
                isNotQualified: Number(this.isNotQualified.value()),
                ghiChu: this.ghiChu.value(),
                status: sv.status,
                fileName: this.state.fileName || '',
                cccd: this.cccd.value(),
                soHieuVanBang: this.soHieuVanBang.value(),
            };
        let score = {
            L: this.listen.value() || '',
            R: this.read.value() || '',
            S: this.speak.value() || '',
            W: this.write.value() || '',
            score: this.score.value() || '',
        };
        data.score = JSON.stringify(score);

        if (sv.id) {
            this.props.updateDtChungChiSinhVien(sv.id, data, () => {
                this.props.getPage(1, 50, '');
                this.hide();
            });
        } else {
            this.props.createDtChungChiSinhVien(data, () => {
                this.props.getPage(1, 50, '');
                this.hide();
            });
        }
    }

    render = () => {
        let { edit, ngoaiNgu, chungChi, fileName, sv } = this.state,
            filterSv = { khoa: sv?.khoa, khoaSinhVien: sv?.khoaSinhVien, loaiHinhDaoTao: sv?.loaiHinhDaoTao };
        let tabs = [
            {
                id: 'info', title: 'Thông tin chứng chỉ', component: <div className='row'>
                    <FormSelect className={`col-md-${edit ? '4' : '5'}`} ref={e => this.mssv = e} data={SelectAdapter_DtGetStudentInBangDiem({ cheDoIn: '' })}
                        label='Mssv' required readOnly={edit}
                        onChange={value => {
                            this.hoTen.value(`${value.item?.ho} ${value.item?.ten}`);
                            this.ngaySinh.value(value.item?.ngaySinh);
                            this.setState({ sv: { ...sv, ...value.item } });
                        }} />
                    <FormTextBox className='col-md-4' ref={e => this.hoTen = e} label='Họ tên' required readOnly />
                    <FormDatePicker type='date-mask' className={`col-md-${edit ? '4' : '3'}`} ref={e => this.ngaySinh = e} label='Ngày sinh' required readOnly />
                    <FormSelect className='col-md-4' ref={e => this.ngoaiNgu = e} data={SelectAdapter_DtDmNgoaiNgu} label='Ngoại ngữ' required
                        onChange={value => this.setState({ ngoaiNgu: value.id }, () => this.chungChi.value(''))} />
                    <FormSelect className='col-md-4' ref={e => this.chungChi = e}
                        data={SelectAdapter_DtDmChungChiNgoaiNguFilter({ maNgoaiNgu: ngoaiNgu, sv: filterSv })}
                        label='Chứng chỉ' onChange={(value) => {
                            this.setState({ chungChi: value.text }, () => {
                                this.listen.value('');
                                this.read.value('');
                                this.speak.value('');
                                this.write.value('');
                                this.score.value('');
                            });
                        }} />
                    <FormSelect className='col-md-4' ref={e => this.trinhDo = e} data={SelectAdapter_DtDmCefr} label='Trình độ' />
                    <FormTextBox className='col-md-3' ref={e => this.listen = e} label='Nghe' />
                    <FormTextBox className='col-md-3' ref={e => this.read = e} label='Đọc' />
                    <FormTextBox className='col-md-3' ref={e => this.speak = e} label='Nói' />
                    <FormTextBox className='col-md-3' ref={e => this.write = e} label='Viết' />
                    <FormTextBox className='col-md-4' ref={e => this.score = e} label='Điểm' />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayCap = e} type='date' label='Ngày cấp' />
                    <FormTextBox className='col-md-4' ref={e => this.noiCap = e} label='Nơi cấp' />
                    <FormTextBox className='col-md-6' ref={e => this.cccd = e} label='CCCD' />
                    <FormTextBox className='col-md-6' ref={e => this.soHieuVanBang = e} label='Số hiệu văn bằng' />
                    <FormCheckbox className='col-md-3' ref={e => this.isDangKy = e} label='Đủ điều kiện đăng ký' onChange={value => value && (this.isNotQualified.value(false) || this.ghiChu.value(''))} />
                    <FormCheckbox className='col-md-3' ref={e => this.isJuniorStudent = e} label='Đủ điều kiện sv năm 3' onChange={value => value && (this.isNotQualified.value(false) || this.isDangKy.value(true) || this.ghiChu.value(''))} />
                    <FormCheckbox className='col-md-3' ref={e => this.isTotNghiep = e} label='Đủ điều kiện tốt nghiệp' onChange={value => value && (this.isJuniorStudent.value(true) || this.isDangKy.value(true) || this.isNotQualified.value(false) || this.ghiChu.value(''))} />
                    <FormCheckbox className='col-md-3' ref={e => this.isNotQualified = e} label='Không đủ điều kiện' onChange={value => value && (this.isJuniorStudent.value(false) || this.isTotNghiep.value(false) || this.isDangKy.value(false) || this.ghiChu.value(''))} />
                    <FormTextBox className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />
                </div>
            },
            {
                id: 'upload', title: 'Ảnh minh chứng', disabled: !(ngoaiNgu && chungChi), component: <div className='row'>
                    <div className='col-md-12'>
                        <div style={{ margin: 'auto', width: '70%' }}>
                            <FileBox uploadType='CertFile' accept='image' userData='CertFile' success={this.handleUploadSuccess} ref={e => this.uploadForm = e} postUrl={`/user/upload?mssv=${sv?.mssv}&loaiChungChi=NN&maNgoaiNgu=${ngoaiNgu}&chungChi=${this.state.chungChi}`} ajax={true} />
                        </div>
                    </div>
                    <hr style={{ width: '95%' }} />
                    <div className='col-md-12'>
                        <div className='row' style={{ maxHeight: '55vh', margin: 'auto', width: '95%' }}>
                            <div className='d-inline-block col-md-12' style={{ maxHeight: 'inherit', overflow: 'auto' }}>
                                <div style={{ border: 'solid' }}>
                                    <CertImg fileName={fileName} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        ];

        return this.renderModal({
            title: sv?.id ? 'Cập nhật chứng chỉ sinh viên' : 'Tạo mới chứng chỉ sinh viên',
            size: 'large',
            body: <FormTabs ref={e => this.tab = e} tabs={tabs} />,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createDtChungChiSinhVien, updateDtChungChiSinhVien };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);