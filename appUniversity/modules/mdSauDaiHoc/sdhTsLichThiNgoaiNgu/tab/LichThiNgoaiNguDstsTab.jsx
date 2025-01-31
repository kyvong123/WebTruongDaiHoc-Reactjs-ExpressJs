import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableHead, renderDataTable, TableCell } from 'view/component/AdminPage';
import { getSdhTsDsdkNgoaiNguPage, getSdhTsLichThiNgoaiNguDstsPage, updateSdhTsLichThiNgoaiNguDsts, deleteSdhTsDangKyNN, deleteSdhTsLichThiNgoaiNguDsts, getSdhTsLichThiNgoaiNguDstsAddPage } from '../redux';
import Pagination from 'view/component/Pagination';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';


class LichThiNgoaiNguDstsTab extends AdminPage {

    defaultSortTerm = 'ten_ASC'
    defaultSkill = [{ id: 'Listening', text: 'Listening' }, { id: 'Speaking', text: 'Speaking' }, { id: 'Reading', text: 'Reading' }, { id: 'Writing', text: 'Writing' }]

    state = { isKeySearch: true, isSort: true, isCoDinh: true, filter: {}, sortTerm: '' }

    componentDidUpdate(prevProps) {
        if (prevProps.maMonThi != this.props.maMonThi || prevProps.updatedTab != this.props.updatedTab) {
            this.setState({ idLichThi: '' }, () => this.idLichThi?.value(''));
        }
    }

    getPageDsts = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, maMonThi: this.props.maMonThi, idLichThi: this.state.idLichThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsLichThiNgoaiNguDstsPage(pageN, pageS, pageC, filter, done);
    }


    getPageDsdk = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, maMonThi: this.props.maMonThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsDsdkNgoaiNguPage(pageN, pageS, pageC, filter, done);
    }

    onSortDsts = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPageDsts(pageNumber, pageSize, pageCondition));


    onSortDsdk = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPageDsdk(pageNumber, pageSize, pageCondition));

    handleKeySearchDsdk = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageDsdk(pageNumber, pageSize, pageCondition);
        });

    }

    handleKeySearchDsts = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageDsts(pageNumber, pageSize, pageCondition);
        });


    }

    printDanPhong = () => {
        //TODO: in dán phòng;
    }

    onUpdatedThiSinh = () => {
        this.props.onUpdated(this.props.updatedTab);
        this.getPageDsts();
    }


    tableDangKy = () => {
        const { list = [], pageNumber, pageSize } = this.props.sdhTsLichThiNgoaiNgu && this.props.sdhTsLichThiNgoaiNgu.dsdkPage ? this.props.sdhTsLichThiNgoaiNgu.dsdkPage : {};
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearchDsdk : null,
            onSort = this.state.isSort ? this.onSortDsdk : null;
        return <>
            {renderDataTable({
                data: list,
                stickyHead: true,
                header: 'thead-light',
                renderHead: () => (<>
                    <tr>
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='#' />
                        <TableHead keyCol='sbd' style={{ width: '50%', whiteSpace: 'nowrap' }} content='SBD' onKeySearch={onKeySearch} onSort={onSort} />
                        <TableHead keyCol='ten' style={{ width: '50%', whiteSpace: 'nowrap' }} content='Họ tên' onKeySearch={onKeySearch} onSort={onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Môn thi' onSort={onSort} />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Tên phòng' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Kỹ năng' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Phòng' />
                        <TableHead style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }} content='Ngày thi' />
                    </tr>
                </>

                ),
                renderRow: (item, index) => {
                    const rows = [];
                    let rowSpan = T.parse(item.arrLichThi)?.length;
                    if (rowSpan) {
                        for (let i = 0; i < rowSpan; i++) {
                            const lichThi = T.parse(item.arrLichThi)[i];
                            const { tenPhong, kyNang, coSo, phong, gioThi } = lichThi;
                            if (i == 0) {
                                rows.push(
                                    <tr key={rows.length} >
                                        <TableCell className='sticky-col pin-1-col' style={{ textAlign: 'right' }} content={(index + 1)} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sbd} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenMon} rowSpan={rowSpan} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={tenPhong} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={kyNang} />
                                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(coSo)?.vi && phong ? `${T.parse(coSo)?.vi} - Phòng ${phong}` : ''} />
                                        <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={Number(gioThi)} />

                                    </tr>);

                            } else {
                                rows.push(<tr key={rows.length} >
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={tenPhong} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={kyNang} />
                                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.parse(coSo)?.vi && phong ? `${T.parse(coSo)?.vi} - Phòng ${phong}` : ''} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={Number(gioThi)} />

                                </tr>);
                            }
                        }
                    } else {
                        rows.push(
                            <tr key={rows.length} >
                                <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.sbd} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.ho} ${item.ten}`} rowSpan={rowSpan} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tenMon} rowSpan={rowSpan} />

                                <TableCell content={''} />
                                <TableCell content={''} />
                                <TableCell content={''} />
                                <TableCell content={''} />


                            </tr>);
                    }
                    return rows;
                }
            })}
        </>;
    }




    componentDangKy = () => {
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.sdhTsLichThiNgoaiNgu && this.props.sdhTsLichThiNgoaiNgu.dsdkPage ?
            this.props.sdhTsLichThiNgoaiNgu.dsdkPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, };
        return (<>
            <div className='tile'>
                <div className='tile-body'>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div >
                            Kết quả: {<b>{totalItem} đăng ký</b>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                                getPage={this.getPageDsdk} />
                        </div></div>
                    {this.tableDangKy()}
                </div>

            </div>
        </>);

    }


    render() {
        return (<>
            {this.componentDangKy()}

        </>);

    }
}



const mapStateToProps = state => ({ system: state.system, sdhTsLichThiNgoaiNgu: state.sdh.sdhTsLichThiNgoaiNgu });
const mapActionsToProps = {
    getSdhTsDsdkNgoaiNguPage, getSdhTsLichThiNgoaiNguDstsPage, getSdhTsLichThiNgoaiNguDstsAddPage, getSdhTsProcessingDot, updateSdhTsLichThiNgoaiNguDsts, deleteSdhTsLichThiNgoaiNguDsts, deleteSdhTsDangKyNN
};
export default connect(mapStateToProps, mapActionsToProps)(LichThiNgoaiNguDstsTab);
