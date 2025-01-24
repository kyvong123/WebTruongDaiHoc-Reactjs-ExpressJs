import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTabs, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { getDssvMienGiam, multiCreateDssvTcMienGiam } from './redux';
// import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { getScheduleSettings } from 'modules/mdCongTacSinhVien/ctsvDtSetting/redux';
import { Tooltip } from '@mui/material';

class TranserMienGiamModal extends AdminModal {
    state = { items: null, failed: null }

    componentDidMount() {
        this.disabledClickOutside();
    }

    // Handle Event ===============================================================================================
    onShow = (filter) => {
        const { namHoc: preNamHoc, hocKy } = filter;
        const namHoc = `${preNamHoc} - ${parseInt(preNamHoc) + 1}`;
        this.setState({ namHoc, hocKy }, () => {
            this.namHoc.value(namHoc);
            this.hocKy.value(hocKy);
            this.searchDsmg();
        });
    }

    onSubmit = (e, overwrite = 0) => {
        e.preventDefault();
        T.confirm('Xác nhận chốt danh sách miễn giảm', overwrite ? '<p class="text-danger">Những sinh viên đã áp dụng miễn giảm sẽ bị ghi đè</p>' : null, isConfirm => {
            if (isConfirm) {
                const { namHoc, hocKy, items } = this.state,
                    chunkSize = 1000;
                this.setState({ failed: [] });
                T.alert('Vui lòng chờ trong giây lát!', 'info', false, null, true);
                const fetchChunk = (i) => {
                    if (i < items.length) {
                        const chunk = items.slice(i, i + chunkSize);
                        this.props.multiCreateDssvTcMienGiam(namHoc, hocKy, chunk, overwrite, subFailed => {
                            this.setState(prevState => ({
                                failed: (prevState.failed || []).concat(subFailed)
                            }));
                            fetchChunk(i + chunkSize);
                        }, error => {
                            T.alert(error.message || 'Cập nhật danh sách sinh viên miễn giảm bị lỗi', 'error', true);
                        });
                    } else {
                        T.alert('Xử lý thành công', 'success', false, 2000);
                        this.props.getPage();

                    }
                };
                fetchChunk(0);
            }
        });
    }

    // Method ==============================================================================================

    searchDsmg = () => {
        const { namHoc, hocKy } = this.state;
        if (namHoc && hocKy) {
            this.props.getDssvMienGiam(namHoc, hocKy, items => this.setState({ items, failed: null }, () => this.tabs.tabClick(null, 0)));
        }
    }
    // Tab Component ==============================================================================================

    componentPreview = () => <div>
        {renderTable({
            getDataSource: () => this.state.items || [],
            stickyHead: this.state.items.length > 15,
            divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <th style={{ whiteSpace: 'nowrap' }}>#</th>
                <th style={{ whiteSpace: 'nowrap' }}>Số quyết định</th>
                <th style={{ whiteSpace: 'nowrap' }}>MSSV</th>
                <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Loại đối tượng</th>
                <th style={{ whiteSpace: 'nowrap' }}>%</th>
                <th style={{ whiteSpace: 'nowrap' }}><i className='fa fa-exclamation text-danger' /></th>
            </tr>,
            renderRow: (item, index) => (<tr key={index} style={{ backgroundColor: item.tcMucGiam && parseInt(item.tcMucGiam) < parseInt(item.phanTramMienGiam) ? '#FFFFE0' : '' }}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soQuyetDinh} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                <TableCell content={item.doiTuong} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.phanTramMienGiam} />
                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tcMucGiam && parseInt(item.tcMucGiam) < parseInt(item.phanTramMienGiam) ? (
                    <Tooltip title={`Mức cũ: ${item.tcMucGiam}%`} ><i className='fa fa-exclamation text-danger' /></Tooltip>
                ) : ''} />
            </tr >)
        })}
        {this.state.items.length > 0 ? <p>Danh sách có <b>{this.state.items.length}</b> sinh viên</p> : null}
    </div>

    componentError = () => (
        <div style={{ height: 'calc(100vh - 500px)' }}>
            <div style={{ overflowY: 'scroll', overflowX: 'hidden', height: '100%' }}>
                {this.state.failed?.map((item, index) => (
                    <div key={index} className='row'>
                        <p className={`col-md-3 text-${item.color}`}>{`Hàng ${item.rowNumber}`}:</p>
                        <p className={`col-md-9 text-${item.color}`}>{item.message}</p>
                    </div>
                ))}
            </div>

        </div>
    )

    render = () => {
        return this.renderModal({
            title: 'Liên kết quyết định miễn giảm',
            size: 'large',
            body: (
                <>
                    <div className='row'>
                        <FormSelect ref={e => this.namHoc = e} className="col-md-6" label='Chọn năm học' data={SelectAdapter_SchoolYear} onChange={value => this.setState({ namHoc: value.id }, this.searchDsmg)} />
                        <FormSelect ref={e => this.hocKy = e} label='Chọn học kỳ' className='col-md-6   ' data={[{ id: '1', text: 'HK1' }, { id: '2', text: 'HK2' }, { id: '3', text: 'HK3' }]} onChange={value => this.setState({ hocKy: value.id }, this.searchDsmg)} />
                    </div>
                    {this.state.items != null && <FormTabs ref={e => this.tabs = e}
                        tabs={[
                            { title: 'Kết quả', component: this.componentPreview(), disabled: !this.state.items },
                            { title: <>Thông báo {this.state.failed && <span className="badge badge-danger">{this.state.failed.length}</span>}</>, component: this.componentError(), disabled: !this.state.failed },
                        ]}
                    />}
                </>),
            isShowSubmit: this.state.items && this.state.items.length,
            submitText: 'Áp dụng',
            postButtons: this.state.items && this.state.items.length ? <button className='btn btn-warning' onClick={(e) => this.onSubmit(e, 1)}><i className='fa fa-pencil'></i>Ghi đè</button> : null
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { getDssvMienGiam, multiCreateDssvTcMienGiam, getScheduleSettings };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TranserMienGiamModal);