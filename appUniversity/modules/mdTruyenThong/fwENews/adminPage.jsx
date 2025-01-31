import React from 'react';
import { connect } from 'react-redux';
import { getENewsPage, createENews, deleteENews } from './redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';

class AdminENews extends AdminPage {
	componentDidMount() {
		T.ready('/user/truyen-thong', () => {
			this.props.getENewsPage(1, 50);
		});
	}

	create = (e) => {
		e.preventDefault();
		this.props.createENews({ title: 'eNews mới' }, data => this.props.history.push('/user/truyen-thong/e-news/edit/' + data.item.id));
	}

	delete = (e, item) => {
		e.preventDefault();
		T.confirm('eNews', 'Bạn có chắc bạn muốn xóa eNews này?', 'warning', true, isConfirm =>
			isConfirm && this.props.deleteENews(item.id));
	}

	render() {
		const permission = this.getUserPermission('fwENews');
		const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.fwENews && this.props.fwENews.page ? this.props.fwENews.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
		const table = renderTable({
			getDataSource: () => list,
			emptyTable: 'Không có eNews!',
			renderHead: () => (
				<tr>
					<th style={{ width: 'auto', textAlign: 'center' }}>#</th>
					<th style={{ width: '100%' }}>Tiêu đề</th>
					<th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
				</tr>
			),
			renderRow: (item, index) => (
				<tr key={index}>
					<TableCell content={(pageNumber - 1) * pageSize + index + 1} />
					<TableCell type='link' url={'/user/truyen-thong/e-news/edit/' + item.id} content={item.title} />
					<TableCell type='buttons' permission={permission} onEdit={'/user/truyen-thong/e-news/edit/' + item.id} content={item} onDelete={this.delete} />
				</tr>
			)
		});

		return this.renderPage({
			title: 'eNews: Danh sách',
			breadcrumb: [<Link key={0} to='/user/truyen-thong'>Truyền thông</Link>, 'Danh sách'],
			content: <>
				<div className='tile'>{table}</div>
				<Pagination pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ marginLeft: '65px' }} getPage={this.props.getENewsPage} />
			</>,
			onCreate: permission.write ? (e) => this.create(e) : null,
			backRoute: '/user/truyen-thong'
		});
	}
}

const mapStateToProps = state => ({ system: state.system, fwENews: state.truyenThong.fwENews });
const mapActionsToProps = { getENewsPage, createENews, deleteENews };
export default connect(mapStateToProps, mapActionsToProps)(AdminENews);