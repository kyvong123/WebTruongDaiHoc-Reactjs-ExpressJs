import React, { Component } from 'react';
import { connect } from 'react-redux';
import { renderTable, TableCell, TooltipButton } from 'view/component/AdminPage';
import { getStudentKyLuat } from '../redux/kyLuatRedux';
import { downloadWord } from 'modules/mdCongTacSinhVien/svQtKyLuat/redux';

export class LichSuKyLuatComponent extends Component {
    state = { items: [] };
    componentDidUpdate(prevProps) {
        if (prevProps.mssv != this.props.mssv) {
            this.fetchData();
        }
    }

    fetchData = () => {
        let mssv = this.props.mssv;
        this.setState({ items: null }, () => this.props.getStudentKyLuat(mssv, items => this.setState({ items })));
    }

    render() {
        return (
            <div className='tile'>
                <h6 className='tile-title'>Lịch sử kỷ luật</h6>
                <div className='tile-body'>
                    {renderTable({
                        getDataSource: () => this.state.items,
                        renderHead: () => <tr>
                            <th>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Số quyết định</th>
                            <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Nội dung</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Hình thức kỷ luật</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Ngày ra</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Người xử lý</th>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>Thao tác</th>
                        </tr>,
                        renderRow: (item, index) => <tr key={index}>
                            <TableCell content={index + 1} />
                            <TableCell content={<b>{item.soQuyetDinh}</b>} style={{ whiteSpace: 'nowrap' }} />
                            <TableCell content={item.noiDung} />
                            <TableCell content={item.tenKyLuat} />
                            <TableCell type='date' content={item.ngayXuLy} />
                            <TableCell content={item.canBoXuLy} />
                            <TableCell type='buttons'>
                                {/* <TooltipButton tooltip='Xuất Excel' color='success' icon='fa-file-excel-o' onClick={() => T.download(`/api/ctsv/qua-trinh/ky-luat/download-excel/dssv/${item.id}`)} /> */}
                                <TooltipButton tooltip='Xuất Word' color='primary' icon='fa-file-word-o' onClick={() => this.props.downloadWord(item.id, data => {
                                    T.FileSaver(new Blob([new Uint8Array(data.data.data)]), item.soQuyetDinh + '_' + item.formType + '.docx');
                                    // data.hasManyStudent && this.downloadExcel(e, item);
                                })} />
                            </TableCell>
                        </tr>
                    })}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({ system: state.system });

const mapDispatchToProps = { getStudentKyLuat, downloadWord };

export default connect(mapStateToProps, mapDispatchToProps)(LichSuKyLuatComponent);
