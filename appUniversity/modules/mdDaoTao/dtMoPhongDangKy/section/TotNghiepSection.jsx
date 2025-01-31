import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import { getKetQuaTotNghiep } from 'modules/mdDaoTao/dtMoPhongDangKy/redux';

class TotNghiepSection extends AdminPage {

    state = { dataKQ: [], stuInfo: {} }

    setValue = (mssv) => {
        this.setState({ dataKQ: [] }, () => {
            this.props.getKetQuaTotNghiep(mssv, data => this.setState({ dataKQ: data.list, stuInfo: data.stuInfo[0] }));
        });
    }

    render() {
        const { dataKQ, stuInfo } = this.state,
            { mssv } = stuInfo;
        return <>
            {
                dataKQ && dataKQ.length ?
                    dataKQ.map((kq, index) => {
                        return <div key={index} className='tile'>
                            <h4 style={{ margin: '15px 5px', color: '#0139a6' }}>KẾT QUẢ XÉT TỐT NGHIỆP</h4>
                            <div className='row'>
                                <FormTextBox className='col-md-12' label='Đợt xét tốt nghiệp' value={kq.tenDot} readOnly />
                                <FormTextBox className='col-md-6' label='Họ và tên' value={kq.hoTen} readOnly />
                                <FormTextBox className='col-md-6' label='Mã số sinh viên' value={mssv} readOnly />
                                <FormTextBox className='col-md-6' label='Giới tính' value={kq.gioiTinh} readOnly />
                                <FormTextBox className='col-md-6' label='Ngày sinh' value={kq.ngaySinh} readOnly />
                                <FormTextBox className='col-md-12' label='Nơi sinh' value={kq.noiSinh} readOnly />

                                <FormTextBox className='col-md-6' label='Ngành đào tạo' value={kq.nganhDaoTao} readOnly />
                                <FormTextBox className='col-md-6' label='Chuyên ngành đào tạo' value={kq.chuyenNganh} readOnly />
                                <FormTextBox className='col-md-6' label='Chương trình học' value={kq.loaiHinh} readOnly />
                                <FormTextBox className='col-md-6' label='Hình thức đào tạo' value={kq.hinhThuc} readOnly />
                                <FormTextBox className='col-md-6' label='Điểm trung bình tích lũy toàn khóa' value={kq.diem} readOnly />
                                <FormTextBox className='col-md-6' label='Xếp loại tốt nghiệp' value={kq.xepLoai} readOnly />
                                <FormTextBox className='col-md-12' label='Kết quả' readOnlyClassName='text-primary font-italic' value={''} readOnlyEmptyText={kq.ketQua} readOnly />
                                <FormTextBox className='col-md-12' label='Lưu ý' readOnlyClassName='text-danger font-italic' value={kq.luuY} readOnlyEmptyText='Sinh viên kiểm tra các thông tin trên, trong trường hợp có điều chỉnh/ thắc mắc/ khiếu nại sinh viên liên hệ phòng Quản lý đào tạo để được giải quyết.' readOnly /> :
                            </div>
                        </div>;
                    })
                    : <div className='tile'><b className='text-danger'>Không có dữ liệu tốt nghiệp của sinh viên.</b></div>
            }
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, hocPhan: state.daoTao.hocPhan });
const mapActionsToProps = { getKetQuaTotNghiep };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TotNghiepSection);