import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, FormTextBox, renderDataTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DangKyHocPhanStudent } from 'modules/mdDaoTao/dtDangKyHocPhan/redux';
import { getDtDiemHoanBySinhVien } from './redux';
import { updateDtDiemSinhVien } from 'modules/mdDaoTao/dtDiemAll/redux';
import { NhapDiemSvSection } from 'modules/mdDaoTao/dtDiemAll/section/nhapDiemSvSection';
import { Tooltip } from '@mui/material';


class NhapDiemSection extends NhapDiemSvSection {
    ghiChu = {};
    state = { dataHocPhan: [], configQC: [] }

    getData = () => {
        const { mssv, namHoc, hocKy } = this.state;
        if (mssv && namHoc && hocKy) {
            T.alert('Đang lấy dữ liệu', 'info', false, null, true);
            this.props.getDtDiemHoanBySinhVien({ mssv, namHoc, hocKy }, result => {
                const data = result.items,
                    configQC = data[0] && data[0].configQC ? JSON.parse(data[0].configQC) : [],
                    listTp = data.flatMap(item => {
                        let tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
                        tpDiem = tpDiem ? T.parse(tpDiem) : [];
                        return tpDiem.map(i => i.thanhPhan);
                    });

                this.setState({ dataHocPhan: data, configQC, loaiDiem: result.loaiDiem.filter(item => listTp.includes(item.ma)), isNhapDiem: false, isShow: mssv && namHoc && hocKy }, () => {
                    for (let hocPhan of this.state.dataHocPhan) {
                        this.ghiChu[hocPhan.maHocPhan]?.value(hocPhan.ghiChu);
                    }
                    T.alert('Tải dữ liệu thành công!', 'success', false, 1000);
                });
            });
        }
    }

    save = () => {
        const { mssv, namHoc, hocKy, dataHocPhan } = this.state;
        for (let hocPhan of dataHocPhan) {
            hocPhan.ghiChu = this.ghiChu[hocPhan.maHocPhan].value();
        }

        T.confirm('Cảnh báo', 'Bạn có chắc chắn muốn cập nhật điểm của sinh viên này không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang lưu điểm sinh viên', 'info', false, null, true);
                this.props.updateDtDiemSinhVien({ mssv, namHoc, hocKy }, JSON.stringify(dataHocPhan), () => {
                    this.props.getDtDiemHoanBySinhVien({ mssv, namHoc, hocKy }, (data) => {
                        this.setState({ dataHocPhan: data.items, isNhapDiem: false }, () => {
                            T.alert('Lưu điểm thành công!', 'success', false, 1000);
                        });
                    });
                });
            }
        });
    }

    render() {
        let { dataHocPhan, isShow, isNhapDiem, configQC, loaiDiem } = this.state,
            className = isNhapDiem ? 'btn btn-success' : 'btn btn-primary',
            icon = isNhapDiem ? 'fa-save' : 'fa-pencil',
            textButton = isNhapDiem ? 'Lưu' : 'Nhập điểm';

        let table = () => renderDataTable({
            emptyTable: 'Không có học phần đăng ký',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: dataHocPhan,
            renderHead: () => {
                return (<>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                        <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên học phần</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>{'Điểm thành phần (%)'}</th>
                        {loaiDiem && this.state.loaiDiem.map(item => {
                            return <th key={item.ma} style={{ width: 'auto', whiteSpace: 'nowrap' }}>{item.ten}</th>;
                        })}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng kết</th>
                        <th style={{ width: '40%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ghi chú</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phí</th>
                    </tr>
                </>
                );
            },
            renderRow: (item, index) => {
                let diem = item.diem ? T.parse(item.diem) : { GK: '', CK: '' },
                    diemDacBiet = item.diemDacBiet ? T.parse(item.diemDacBiet) : { GK: '', CK: '' };
                let tpDiem = item.tpHocPhan || item.tpMonHoc || item.configDefault;
                tpDiem = tpDiem ? T.parse(tpDiem) : [];
                let thanhPhan = tpDiem.sort((a, b) => Number(a.phanTram) - Number(b.phanTram)).map(tp => (`${tp.thanhPhan}:${Number(tp.phanTram)}`));

                return (
                    <tr key={index}>
                        <TableCell content={index + 1} />
                        <TableCell content={item.maHocPhan} />
                        <TableCell content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={thanhPhan.join(' - ')} />
                        {loaiDiem && loaiDiem.map((loai) => {
                            let diemSv = diemDacBiet[loai.ma] || (!isNaN(parseFloat(diem[loai.ma])) ? parseFloat(diem[loai.ma]).toFixed(1).toString() : diem[loai.ma]);

                            return isNhapDiem ? (tpDiem.find(tp => tp.thanhPhan == loai.ma) ? (
                                <td>
                                    <div key={`${item.maHocPhan}_${loai.ma}`} id={`${item.maHocPhan}_${loai.ma}`} contentEditable suppressContentEditableWarning={true}
                                        onBlur={e => this.lamTronDiem(e, { diem, diemDacBiet }, tpDiem.find(tp => tp.thanhPhan == loai.ma), index)}
                                        onKeyDown={this.handlePressDiem}
                                        style={{ whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center', cursor: 'auto', border: '1.5px solid #ced4da', borderCollapse: 'collapse', borderRadius: '4px', fontSize: 'large', fontFamily: 'serif' }}
                                    >
                                        {diemSv}
                                    </div>
                                </td>)
                                : <TableCell style={{ cursor: 'not-allowed', backgroundColor: '#e9ecef' }} content='' />)
                                : <td><div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{diemSv}</div></td>;
                        })}
                        <td id={`${item.maHocPhan}_TK`} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} >{(!isNaN(parseFloat(diem['TK']))) ? parseFloat(diem['TK']).toFixed(1).toString() : diem['TK']}</td>
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={isNhapDiem ?
                            <FormTextBox ref={e => this.ghiChu[item.maHocPhan] = e} className='mb-0' />
                            : item.ghiChu} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} contentClassName={item.tinhPhi && item.noHocPhi < 0 ? 'text-danger' : 'text-success'}
                            content={item.tinhPhi && item.noHocPhi < 0
                                ? <Tooltip title='Còn nợ học phí'>
                                    <i className='fa fa-lg fa-times-circle' />
                                </Tooltip>
                                : <Tooltip title='Đã đóng đủ'>
                                    <i className='fa fa-lg fa-check-circle' />
                                </Tooltip>} />
                    </tr>
                );
            }
        });

        return <>
            <div className='tile row'>
                <FormSelect className='col-md-6' label='Mssv' data={SelectAdapter_DangKyHocPhanStudent} onChange={value => this.setState({ mssv: value.id }, this.getData)} />
                <FormSelect className='col-md-2' label='Năm học' data={SelectAdapter_SchoolYear} onChange={value => this.setState({ namHoc: value.id }, this.getData)} />
                <FormSelect className='col-md-2' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ hocKy: value.id }, this.getData)} />
                {
                    !!isShow && <div className='col-md-2 px-0' style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
                        <button className={className} style={{ height: '34px', alignSelf: 'flex-end' }} onClick={e => {
                            e.preventDefault();
                            if (isNhapDiem) this.save();
                            else this.nhapDiemSinhVien();
                        }}>
                            <i className={'fa fa-lg ' + icon} />{textButton}
                        </button>
                        <button className='btn btn-secondary' style={{ display: isNhapDiem ? '' : 'none', marginLeft: '10px', height: '34px', alignSelf: 'flex-end' }}
                            onClick={e => e.preventDefault() || this.setState({ isNhapDiem: false })}>
                            <i className='fa fa-lg fa-times' /> Huỷ
                        </button>
                    </div>
                }
            </div>
            <div style={{ display: isShow ? '' : 'none' }} className='tile'>
                <div className='col-md-12' style={{ display: configQC.length ? '' : 'none' }}>
                    <h6>Thông tin các điểm đặc biệt: </h6>
                    {<div className='d-flex flex-wrap' style={{ padding: 'inherit' }}>
                        {configQC.map((item, index) => {
                            return <span key={`qc-${index}`} style={{ marginRight: 'auto', whiteSpace: 'nowrap' }}>- <b>{item.ma}</b>: {item.moTa} (Áp dụng {item.loaiApDung})</span>;
                        })}
                    </div>}
                </div>
                <div>
                    {table()}
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtDiemHoanBySinhVien, updateDtDiemSinhVien };
export default connect(mapStateToProps, mapActionsToProps)(NhapDiemSection);