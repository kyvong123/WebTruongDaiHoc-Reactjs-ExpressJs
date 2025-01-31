import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, FormTextBox, TableCell, getValue } from 'view/component/AdminPage';

class SectionCaThi extends AdminPage {
    hinhThucThi = {};
    soCa = {};
    thoiGian = {};

    componentDidMount() {
    }

    setValue = () => {
        this.setState({ listHocPhan: this.props.listHocPhan }, () => {
            for (const hocPhan of this.state.listHocPhan) {
                this.soCa[hocPhan.maHocPhan]?.value(1);
                this.thoiGian[hocPhan.maHocPhan]?.value(60);
            }
        });
    }

    handleSubmitCaThi = (e) => {
        e.preventDefault();
        try {
            this.setState({ onSaveCaThi: true });
            const getSoCaThi = (soCaSelector, hocPhan) => {
                let soCa = getValue(soCaSelector);
                if (!soCa && hocPhan.soLuongDangKy) {
                    this.setState({ onSaveCaThi: false }, () => {
                        T.notify('Vui lòng nhập số ca thi!', 'warning');
                        soCaSelector.focus();
                    });
                }
                return soCa;
            };
            const getThoiGianThi = (thoiGianSelector, hocPhan) => {
                let thoiGianThi = getValue(thoiGianSelector);
                if (!thoiGianThi && hocPhan.soLuongDangKy) {
                    this.setState({ onSaveCaThi: false }, () => {
                        T.notify('Vui lòng nhập thời gian thi!', 'warning');
                        thoiGianSelector.focus();
                    });
                }
                return thoiGianThi;
            };
            let listHocPhan = this.state.listHocPhan.map(hocPhan => {
                let maHocPhan = hocPhan.maHocPhan,
                    soCa = getSoCaThi(this.soCa[maHocPhan], hocPhan),
                    thoiGianThi = getThoiGianThi(this.thoiGian[maHocPhan], hocPhan),
                    soLuongMoiCa = Math.floor(hocPhan.soLuongDangKy / soCa),
                    phanDu = hocPhan.soLuongDangKy % soCa;
                return Array.from({ length: soCa }, (_, i) => i + 1).map(index => {
                    let soLuongDangKyCa = soLuongMoiCa;
                    if (index <= phanDu) {
                        soLuongDangKyCa++;
                    }
                    return { ...hocPhan, soCa, caThi: index, thoiGianThi, soLuongDangKyCa };
                });
            });
            listHocPhan = [].concat(...listHocPhan).sort((a, b) => a.maHocPhan > b.maHocPhan ? (a.caThi > b.caThi ? -1 : 1) : 1);
            setTimeout(() => {
                if (this.state.onSaveCaThi) {
                    this.setState({ onSaveCaThi: false }, () => {
                        this.props.submitCaThi(e, listHocPhan);
                    });
                }
            }, 1000);
        } catch (input) {
            if (input) {
                this.setState({ onSaveCaThi: false }, () => {
                    T.notify(`${input.props?.label || input.props?.placeholder} bị trống`, 'danger');
                    input.focus();
                });
            }
        }
    }

    tableSettings = (list) => renderTable({
        emptyTable: 'Không có học phần để tạo lịch thi',
        getDataSource: () => list,
        stickyHead: true,
        divStyle: { height: '54vh' },
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SLĐK</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số ca thi <span className='text-danger'>*</span></th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thi (phút) <span className='text-danger'>*</span></th>
            </tr>),
        renderRow: (item, index) => {
            return (<tr key={item.maHocPhan} style={{ cursor: !item.soLuongDangKy ? 'not-allowed' : '' }}>
                <TableCell content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLuongDangKy || 0} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    <FormTextBox type='number' ref={e => this.soCa[item.maHocPhan] = e} className='mb-0' style={{ cursor: !item.soLuongDangKy ? 'not-allowed' : '' }} disabled={!item.soLuongDangKy} min={1} />
                } />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    <FormTextBox type='number' ref={e => this.thoiGian[item.maHocPhan] = e} className='mb-0' style={{ cursor: !item.soLuongDangKy ? 'not-allowed' : '' }} disabled={!item.soLuongDangKy} min={1} />
                } />
            </tr>);
        }
    });

    render() {
        let { onSaveCaThi } = this.state;
        return (
            <section id='caThi'>
                <div className='tile mb-0' style={{ boxShadow: 'none' }}>
                    <div className='tile-body'>
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.handleSubmitCaThi} disabled={onSaveCaThi}>
                                {onSaveCaThi ? 'Loading' : 'Tiếp theo'} <i className={onSaveCaThi ? 'fa fa-spin fa-lg fa-spinner' : 'fa fa-lg fa-arrow-right'} />
                            </button>
                        </div>
                        {this.tableSettings(this.state.listHocPhan)}
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = {

};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionCaThi);