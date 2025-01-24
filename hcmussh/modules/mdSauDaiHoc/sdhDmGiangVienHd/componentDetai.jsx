import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { getDeTaiGiangVienHd } from './redux';
class ComponentDetail extends AdminPage {
    state = { data: [] }
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/giang-vien-huong-dan/:shcc'),
                shcc = route.parse(window.location.pathname).shcc;
            this.props.getDeTaiGiangVienHd(shcc, data => {
                this.setState({ data });
            });
        });
    }

    render = () => {
        const list = this.state.data.rows;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên đề tài</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Sinh viên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' url={`/user/sau-dai-hoc/quan-ly-de-tai/item/${item.ma}`} content={item.tenDeTai} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='link' url={`/user/sau-dai-hoc/sinh-vien/item/${item.mssv}`} content={item.mssv} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.nam} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.tenTinhTrang} style={{ whiteSpace: 'nowrap', color: 'red' }} />
                </tr>)
        });
        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin về đề tài</h3>
                {table}
            </div>
        );
    }

}

const mapStateToProps = state => ({ detai: state.sdh.sdhDmGiangVienHd, system: state.system });
const mapActionsToProps = {
    getDeTaiGiangVienHd
};

export default connect(mapStateToProps, mapActionsToProps)(ComponentDetail);
