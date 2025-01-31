import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, TableCell, renderTable, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmKhoiKienThucAll } from 'modules/mdDaoTao/dmKhoiKienThuc/redux';
import { createConditionDtNgoaiNguKC, updateConditionDtNgoaiNguKC } from './redux';

class ConditionModal extends AdminModal {

    state = { listRenderKhoa: [], listKhoaSemester: [], listKhoaLoTrinh: [] }
    soTinChi = {}

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = ({ dataKhoa, item }) => {
        const { id, semesterFrom, semesterEnd, isDangKy, isChungChi, isJuniorStudent, nhomNgoaiNgu, diemDat, ctdtDangKy, tongSoTinChi, khoiKienThuc, nhomNgoaiNguMien, diemMien } = item || { id: null, semesterFrom: '', semesterEnd: '', isDangKy: '', isChungChi: '', isJuniorStudent: '', nhomNgoaiNgu: '', diemDat: '', ctdtDangKy: '', tongSoTinChi: '', khoiKienThuc: '', nhomNgoaiNguMien: '', diemMien: '' };
        let listKhoaSemester = dataKhoa.map(i => ({ ...i, text: `NH${i.namHoc} HK${i.hocKy}` })),
            listKhoaLoTrinh = dataKhoa.map((i, index) => ({ ...i, text: `Lộ trình khóa ${index + 1}` })),
            listRenderKhoa = [], listNamHoc = '';

        if (id && ctdtDangKy) {
            listRenderKhoa = T.parse(ctdtDangKy).map(i => ({ ...i, text: listKhoaSemester.find(khoa => khoa.id == i.semester)?.text || '' }));
            listNamHoc = listRenderKhoa.map(i => i.semester);
        }

        this.setState({ listRenderKhoa, listKhoaSemester, listKhoaLoTrinh, id }, () => {
            this.semesterFrom.value(semesterFrom);
            this.semesterEnd.value(semesterEnd);
            this.isDangKy.value(isDangKy);
            this.isChungChi.value(isChungChi);
            this.isJuniorStudent.value(isJuniorStudent);
            this.nhomNgoaiNgu.value(nhomNgoaiNgu);
            this.diemDat.value(diemDat);
            this.tongSoTinChi.value(tongSoTinChi);
            this.khoiKienThuc.value(khoiKienThuc ? khoiKienThuc.split(',') : []);
            this.listNamHoc.value(listNamHoc);
            this.nhomNgoaiNguMien.value(nhomNgoaiNguMien);
            this.diemMien.value(diemMien);
        });
    }

    onSubmit = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn cấu hình điều kiện ngoại ngữ không chuyên không?', true, isConfirm => {
            if (isConfirm) {
                const data = {
                    semesterFrom: this.semesterFrom.value(),
                    semesterEnd: this.semesterEnd.value(),
                    isDangKy: Number(this.isDangKy.value()),
                    isChungChi: Number(this.isChungChi.value()),
                    isJuniorStudent: Number(this.isJuniorStudent.value()),
                    nhomNgoaiNgu: this.nhomNgoaiNgu.value(),
                    diemDat: this.diemDat.value(),
                    tongSoTinChi: this.tongSoTinChi.value(),
                    khoiKienThuc: this.khoiKienThuc.value(),
                    ctdtDangKy: this.listNamHoc.value(),
                    nhomNgoaiNguMien: this.nhomNgoaiNguMien.value(),
                    diemMien: this.diemMien.value()
                };

                data.ctdtDangKy = T.stringify(this.state.listRenderKhoa.map(i => ({ semester: i.semester, soTinChi: i.soTinChi })));
                data.khoiKienThuc = data.khoiKienThuc.toString();
                if (data.nhomNgoaiNgu && !data.isDangKy) data.isDangKy = 1;
                if (data.isJuniorStudent && !data.isChungChi) data.isChungChi = 1;
                if (!data.semesterFrom) return T.notify('Không có học kỳ bắt đầu', 'danger');
                if (data.semesterFrom && data.semesterEnd && Number(data.semesterFrom) > Number(data.semesterEnd)) return T.notify('Học kỳ bắt đầu phải nhỏ hơn học kỳ kết thúc', 'danger');

                T.alert('Đang cấu hình điều kiện ngoại ngữ. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                if (this.state.id) this.props.updateConditionDtNgoaiNguKC(this.state.id, data, () => {
                    this.hide();
                    this.props.getData();
                });
                else this.props.createConditionDtNgoaiNguKC(data, { khoaSinhVien: this.props.khoaSinhVien, loaiHinhDaoTao: this.props.loaiHinhDaoTao }, () => {
                    this.hide();
                    this.props.getData();
                });
            }
        });

    }

    handleSelectKhoa = (value) => {
        let { listRenderKhoa } = this.state;
        if (value.selected) {
            listRenderKhoa.push({ semester: value.id, text: value.text });
        } else listRenderKhoa = listRenderKhoa.filter(i => i.semester != value.id);

        listRenderKhoa.sort((a, b) => Number(a.semester) - Number(b.semester));
        this.setState({ listRenderKhoa });
    }

    handleChange = (e, item) => {
        let { listRenderKhoa } = this.state;
        let index = listRenderKhoa.findIndex(tp => tp.semester == item.semester);
        listRenderKhoa[index].soTinChi = e;
        this.setState({ listRenderKhoa });
    }

    render = () => {
        const { listRenderKhoa, listKhoaSemester, listKhoaLoTrinh, id } = this.state;

        const table = renderTable({
            getDataSource: () => listRenderKhoa,
            header: 'thead-light',
            emptyTable: '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Học kỳ dự kiến CTDT</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Số tín chỉ tối đa</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.text} />
                    <TableCell style={{ textAlign: 'center' }} content={<FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.soTinChi[item.semester] = e} placeholder='Số tín chỉ' required allowNegative={false} onChange={e => this.handleChange(e, item)} value={item.soTinChi} />} />
                </tr>;
            }
        });

        return this.renderModal({
            title: 'Xét điều kiện đăng ký ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.semesterFrom = e} className='col-md-6' data={listKhoaSemester} label='Học kỳ bắt đầu' required readOnly={!!id} />
                <FormSelect ref={e => this.semesterEnd = e} className='col-md-6' data={listKhoaSemester} label='Học kỳ kết thúc' allowClear readOnly={!!id} />


                <div className='col-md-12'><b>Đủ điều kiện môn học:</b></div>
                <FormSelect ref={e => this.nhomNgoaiNguMien = e} className='col-md-4' data={listKhoaLoTrinh} label='Nhóm khóa ngoại ngữ cần miễn' />
                <FormTextBox type='number' ref={e => this.diemMien = e} className='col-md-4' label='Điểm đạt' allowNegative={false} min={0} max={10} step={true} decimalScale={1} />

                <div className='col-md-12'><i>Hoặc:</i></div>
                <FormCheckbox ref={e => this.isDangKy = e} className='col-md-4' label='Có đăng ký ngoại ngữ' />
                <FormSelect ref={e => this.nhomNgoaiNgu = e} className='col-md-4' data={listKhoaLoTrinh} label='Nhóm khóa ngoại ngữ cần đạt' />
                <FormTextBox type='number' ref={e => this.diemDat = e} className='col-md-4' label='Điểm đạt' allowNegative={false} min={0} max={10} step={true} decimalScale={1} />

                <div className='col-md-12'><b>Đủ điều kiện chứng chỉ:</b></div>
                <FormCheckbox ref={e => this.isChungChi = e} className='col-md-6' label='Có chứng chỉ' />
                <FormCheckbox ref={e => this.isJuniorStudent = e} className='col-md-6' label='Có chứng chỉ đạt năm 3' />

                <div className='col-md-12'><b>Không đủ điều kiện:</b></div>
                <FormTextBox className='col-md-12' type='number' ref={e => this.tongSoTinChi = e} label='Tổng số tín chỉ được phép đăng ký' allowNegative={false} />
                <FormSelect ref={e => this.khoiKienThuc = e} className='col-md-12' data={SelectAdapter_DmKhoiKienThucAll()} label='Khối kiến thức' multiple />
                <FormSelect ref={e => this.listNamHoc = e} className='col-md-12' data={listKhoaSemester} label='Năm học, học kỳ CTDT' multiple onChange={this.handleSelectKhoa} />
                <div className='col-md-12'>
                    {table}
                </div>
            </div>,
        });
    }
}


const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createConditionDtNgoaiNguKC, updateConditionDtNgoaiNguKC };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ConditionModal);