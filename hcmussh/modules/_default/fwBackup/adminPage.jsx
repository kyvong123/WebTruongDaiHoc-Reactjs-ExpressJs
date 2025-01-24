import React from 'react';
import { connect } from 'react-redux';
import { getBackupAll, createBackup, deleteBackup, getBackupTables } from './redux';
import { AdminPage, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class BackupPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        this.props.getBackupAll();
        T.socket.on('backup-changed', () => this.props.getBackupAll());
    }

    componentWillUnmount() {
        T.socket.off('backup-changed');
    }

    createBackup = (e) => {
        e.preventDefault();
        const databaseName = this.database.value(),
            tableName = this.table ? this.table.value() : null;
        databaseName && T.confirm('Create backup', `Are you sure you want to create backup '${databaseName}${tableName ? '.' + tableName : ''}'?`, true,
            isConfirm => isConfirm && this.props.createBackup(databaseName, tableName, (data) => {
                if (tableName && data) {
                    this.downloadElement.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
                    this.downloadElement.setAttribute('download', `${tableName}.json`);
                    this.downloadElement.click();
                }
            }));
    };

    deleteBackup = (e, fileName) => e.preventDefault() || T.confirm('Delete backup', `Are you sure you want to delete backup file ${fileName}?`, true,
        isConfirm => isConfirm && this.props.deleteBackup(fileName));

    render() {
        const permission = this.getUserPermission('backup');
        const { databases, tables, files } = (this.props.backup || {});

        return this.renderPage({
            icon: 'fa fa-database',
            title: 'Backup',
            breadcrumb: ['Backup'],
            content: (<>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.database = e} data={databases} className='col-3' label='Database' onChange={e => this.props.getBackupTables(e.text)} />
                        {tables ? <FormSelect ref={e => this.table = e} data={tables} className='col-6' label='Table' allowClear={true} /> : null}
                        {tables ?
                            <div className='col-3'>
                                <button className='btn btn-success' type='button' onClick={this.createBackup}>
                                    <i className='fa fa-fw fa-lg fa-database' />Backup
                                </button>
                                <a ref={e => this.downloadElement = e} style={{ display: 'none' }} />
                            </div> : null}
                    </div>
                </div>
                <div className='tile'>
                    <div className='tile-title'>Backup files</div>
                    <div className='tile-body'>
                        {renderTable({
                            getDataSource: () => (files || []).sort((a, b) => b > a ? 1 : -1),
                            emptyTable: 'No backup file!',
                            renderHead: () => (
                                <tr>
                                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>File</th>
                                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Created date</th>
                                    <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                                </tr>),
                            renderRow: (item, index) => (
                                <tr key={index}>
                                    <TableCell type='number' content={index + 1} />
                                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.name} />
                                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
                                    <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={e => this.deleteBackup(e, item.name)}>
                                        <a className='btn btn-success' href={`/api/backup/download/${item.name}`}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                    </TableCell>
                                </tr>),
                        })}
                    </div>
                </div>
            </>)
        });
    }
}

const mapStateToProps = state => ({ system: state.system, backup: state.framework.backup });
const mapActionsToProps = { getBackupAll, createBackup, deleteBackup, getBackupTables };
export default connect(mapStateToProps, mapActionsToProps)(BackupPage);