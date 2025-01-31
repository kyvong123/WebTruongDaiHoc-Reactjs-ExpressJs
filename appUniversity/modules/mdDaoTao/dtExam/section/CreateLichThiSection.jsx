import React from 'react';
import { connect } from 'react-redux';
import { FormTabs } from 'view/component/AdminPage';
import { getDtExamGetSinhVienDangKy } from 'modules/mdDaoTao/dtExam/redux';
import SectionCaThi from 'modules/mdDaoTao/dtExam/section/SectionCaThi';
import SectionNgayPhongThi from 'modules/mdDaoTao/dtExam/section/SectionNgayPhongThi';
import SectionSinhVienPhongThi from 'modules/mdDaoTao/dtExam/section/SectionSinhVienPhongThi';
import SectionSoLuongPhongThi from './SectionSoLuongPhongThi';

class CreateLichThiSection extends React.Component {
    state = { dssv: null, items: null };
    componentDidMount() {
    }

    setValue = (loaiKyThi) => {
        this.setState({ items: this.props.listChosen.map(item => { return { ...item, loaiKyThi }; }), step: 1, dssvTong: [], filter: this.props.filter }, () => {
            this.tab.tabClick(null, this.state.step - 1);
            this.caThiRef.setValue();
        });
    }

    submitCaThi = (e, items) => {
        this.setState({ step: 2, listHocPhanCaThi: items.filter(item => item.soLuongDangKy) }, () => {
            this.tab.tabClick(e, 1);
            this.ngayPhongThiRef.setValue();
        });
    }

    submitNgayPhongThi = (items) => {
        this.setState({ step: 3, listHocPhanCaPhongThi: items }, () => {
            this.tab.tabClick(null, 2);
            this.soLuongPhongThiRef.setValue();
        });
    }

    submitSoLuongPhongThi = (items, dssvTong) => {
        this.setState({ step: 4, listHocPhanCaSoLuongPhongThi: items, dssvTong }, () => {
            this.tab.tabClick(null, 3);
            this.soLuongPhongThiRef.resetSinhVien();
            this.sinhVienPhongThiRef.setValue();
        });
    }

    submitLichThi = () => {
        this.setState({ step: 1, items: [], dssvTong: [] }, () => {
            this.tab.tabClick(null, 0);
            this.soLuongPhongThiRef.resetSinhVien();
        });
    }

    render = () => {
        const listSections = [
            {
                title: <b>1. CẤU HÌNH SỐ CA THI</b>,
                component: <SectionCaThi ref={e => this.caThiRef = e} listHocPhan={this.state.items} filter={this.state.filter}
                    submitCaThi={this.submitCaThi} />
            },
            {
                title: <b>2. PHÂN BỐ NGÀY THI, PHÒNG THI</b>,
                component: <SectionNgayPhongThi ref={e => this.ngayPhongThiRef = e} listHocPhan={this.state.listHocPhanCaThi} filter={this.state.filter}
                    submitNgayPhongThi={this.submitNgayPhongThi} getSinhVien={this.props.getDtExamGetSinhVienDangKy} />,
                disabled: this.state.step < 2
            },
            {
                title: <b>3. ĐIỀU CHỈNH SỐ LƯỢNG PHÒNG THI</b>,
                component: <SectionSoLuongPhongThi ref={e => this.soLuongPhongThiRef = e} listHocPhan={this.state.listHocPhanCaPhongThi} filter={this.state.filter}
                    submitSoLuongPhongThi={this.submitSoLuongPhongThi} getSinhVien={this.props.getDtExamGetSinhVienDangKy} />,
                disabled: this.state.step < 3
            },
            {
                title: <b>4. ĐIỀU CHỈNH SINH VIÊN</b>,
                component: <SectionSinhVienPhongThi ref={e => this.sinhVienPhongThiRef = e} listHocPhan={this.state.listHocPhanCaSoLuongPhongThi} dssvTong={this.state.dssvTong} createLichThi={this.props.createLichThi} />,
                disabled: this.state.step < 4
            },
        ];

        return <div className='tile'>
            <FormTabs ref={e => this.tab = e} tabs={listSections} tabClassName='nav-fill' onChange={tab => this.setState({ step: tab.tabIndex + 1 })} />
        </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = { getDtExamGetSinhVienDangKy };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CreateLichThiSection);