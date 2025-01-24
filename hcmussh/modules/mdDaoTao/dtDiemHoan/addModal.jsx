import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { createDtDiemHoan } from './redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { getDataDiem } from 'modules/mdDaoTao/dtDiemAll/redux';


class AddModal extends AdminModal {

    componentDidMount() {
        this.onHidden(() => {
            this.mssv?.value('');
            this.namHoc?.value('');
            this.hocKy?.value('');
        });
        this.disabledClickOutside();
    }

    handleHoan = ({ mssv, thanhPhan, phanTram, maHocPhan, namHoc, hocKy, maMonHoc, configQC }) => {
        const dacbiet = configQC.find(i => i.ma == 'I');
        if (!dacbiet) {
            return T.notify('Năm học, học kỳ chưa có cấu hình điểm đặc biệt hoãn thi!', 'danger');
        } else if (!dacbiet.loaiApDung.includes(thanhPhan)) {
            return T.notify('Điểm hoãn thi không áp dụng cho thành phần!', 'danger');
        }

        this.props.createDtDiemHoan({ mssv, thanhPhan, phanTram, maHocPhan, diem: Number(dacbiet.tinhTongKet) ? 'I' : '0.0', namHoc, hocKy, maMonHoc, ghiChu: this.ghiChu.value() }, () => {
            this.props.getPage(1, 50, '');
        });
    }

    getValue = () => {
        const { mssv, namHoc, hocKy } = this.state;
        mssv && namHoc && hocKy && this.props.getDataDiem({ mssv, namHoc, hocKy }, data => {
            data = data.map(item => {
                let tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault,
                    diem = item.diem ? T.parse(item.diem) : {},
                    diemDacBiet = item.diemDacBiet ? T.parse(item.diemDacBiet) : {},
                    configQC = item.configQC ? T.parse(item.configQC) : [];

                tpDiem = tpDiem ? T.parse(tpDiem) : [];
                return { ...item, tpDiem, diem, diemDacBiet, configQC };
            });
            this.setState({ dataHocPhan: data });
        });
    }

    render = () => {
        const { dataHocPhan } = this.state;

        let table = renderTable({
            emptyTable: 'Không có học phần đăng ký',
            stickyHead: dataHocPhan?.length > 5,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            divStyle: { height: '40vh' },
            getDataSource: () => dataHocPhan,
            renderHead: () => (<tr>
                <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên học phần</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thành phần</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phần trăm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>),
            renderRow: (item, index) => {
                const rowSpan = item.tpDiem.length;
                const rows = [];

                if (!rowSpan) {
                    rows.push(<tr key={index} style={{ backgroundColor: '#fff' }}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.maHocPhan} />
                        <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} />
                    </tr>);
                } else {
                    item.tpDiem.sort((a, b) => Number(a.phanTram) - Number(b.phanTram)).forEach((tp, idx) => {
                        const thanhPhan = tp.thanhPhan,
                            data = {
                                mssv: item.mssv, thanhPhan, phanTram: tp.phanTram, maHocPhan: item.maHocPhan,
                                namHoc: item.namHoc, hocKy: item.hocKy, maMonHoc: item.maMonHoc, configQC: item.configQC,
                                diem: item.diem, diemDacBiet: item.diemDacBiet,
                            };

                        if (idx == 0) {
                            rows.push(
                                <tr key={index + idx} style={{ backgroundColor: '#fff' }}>
                                    <TableCell content={index + idx + 1} rowSpan={rowSpan} />
                                    <TableCell content={item.maHocPhan} rowSpan={rowSpan} />
                                    <TableCell content={T.parse(item.tenMonHoc, { vi: '' }).vi} rowSpan={rowSpan} />
                                    <TableCell content={tp.tenThanhPhan} />
                                    <TableCell content={tp.phanTram} />
                                    <TableCell content={item.diemDacBiet[thanhPhan] || item.diem[thanhPhan]} />
                                    <TableCell type='buttons' permission={{ write: true }} onEdit={() => this.handleHoan(data)} />
                                </tr>
                            );
                        } else {
                            rows.push(<tr>
                                <TableCell content={tp.tenThanhPhan} style={{ backgroundColor: '#fff' }} />
                                <TableCell content={tp.phanTram} />
                                <TableCell content={item.diemDacBiet[thanhPhan] || item.diem[thanhPhan]} />
                                <TableCell type='buttons' permission={{ write: true }} onEdit={() => this.handleHoan(data)} />
                            </tr>
                            );
                        }
                    });
                }

                return rows;
            }
        });

        return this.renderModal({
            title: 'Cập nhật điểm hoãn sinh viên',
            size: 'large',
            isShowSubmit: false,
            body:
                <>
                    <div className='row'>
                        <FormSelect ref={e => this.mssv = e} className='col-md-12' label='Chọn sinh viên' data={SelectAdapter_DangKyHocPhanStudent} required
                            onChange={value => this.setState({ mssv: value.id }, this.getValue)} />
                        <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} onChange={value => this.setState({ namHoc: value.id }, this.getValue)} />
                        <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ hocKy: value.id }, this.getValue)} />
                        <div className='col-md-12'>
                            {dataHocPhan && table}
                        </div>
                        <FormTextBox ref={e => this.ghiChu = e} className='col-md-12' label='Ghi chú' style={{ marginTop: '10px' }} />
                    </div>
                </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, diemHoan: state.daoTao.diemHoan });
const mapActionsToProps = { createDtDiemHoan, getDataDiem };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddModal);