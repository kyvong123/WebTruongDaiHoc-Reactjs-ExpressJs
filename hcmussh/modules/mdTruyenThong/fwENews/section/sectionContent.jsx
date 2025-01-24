import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormSelect, FormEditor, FormImageBox, FormColorPicker, getValue, FormTextBox } from 'view/component/AdminPage';
import { swapENewsStructure, deleteENewsStructure, updateENewsItem, updateENewsStructure, changeENewsItem, eNewsSearchNewsAdapter } from 'modules/mdTruyenThong/fwENews/redux';

class EditModal extends AdminModal {
    // type: content | image | newsItem
    state = { type: 'content', structureId: null, indexNumber: -1 };

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        const { type = 'content', structureId = null, indexNumber = 0, content = '', image = '', imageLink = '', imageCaption = '', newsId = null } = item || {};
        this.setState({ type, structureId, indexNumber }, () => {
            this.type.value(type || 'content');
            if (type == 'content') {
                this.editor.value(content || '');
            }
            if (type == 'image') {
                this.imageLink.value(imageLink || '');
                this.imageCaption.value(imageCaption || '');
                this.imageBox.setData(`fwENews:${this.props.eNewsId}_${structureId}_${indexNumber}`, image);
            }

            if (type == 'newsItem') {
                this.newsItem.value(newsId);
            }
        });
    }

    onTypeChange = value => {
        this.setState({ type: value.id }, () => {
            const { type, structureId, indexNumber  } = this.state;

            if (type == 'content') {
                this.editor.focus();
            }
            if (type == 'image') {
                this.imageBox.setData(`fwENews:${this.props.eNewsId}_${structureId}_${indexNumber}`);
            }
        });
    }

    onUploadSuccess = data => {
        T.notify('Tải hình thành công!', 'success');
        this.props.change(data.item);
    }

    onSubmit = () => {
        const { type, structureId, indexNumber } = this.state;
        const { eNewsId, update } = this.props;

        const condition = { eNewsId, structureId, indexNumber };
        const changes = { type };

        if (type == 'content') {
            changes.content = getValue(this.editor);
        }

        if (type == 'image') {
            changes.imageLink = getValue(this.imageLink);
            changes.imageCaption = getValue(this.imageCaption);
        }

        if (type == 'newsItem') {
            changes.newsId  = getValue(this.newsItem);
        }

        update(condition, changes, () => this.hide());
    }

    render = () => {
        const type = this.state.type;
        const types = [{ id: 'content', text: 'Nội dung' }, { id: 'image', text: 'Hình ảnh' }, { id: 'newsItem', text: 'Bài viết' }];

        return this.renderModal({
           title: 'Chỉnh sửa nội dung',
           size: 'elarge',
           body: <div className='row'>
               <FormSelect ref={e => this.type = e} className='col-md-4' label='Chọn loại dữ liệu' data={types} onChange={this.onTypeChange} minimumResultsForSearch={-1} />
               <div className='row' />
               {type == 'content' && <FormEditor ref={e => this.editor = e} label='Nhập nội dung' uploadUrl='/user/upload?category=fwENews' className='col-md-12' required />}

               {type == 'image' && <FormImageBox ref={e => this.imageBox = e} label='Chọn hình ảnh' className='col-md-12' uploadType='ENewsImage' onSuccess={this.onUploadSuccess} required />}
               {type == 'image' && <FormTextBox ref={e => this.imageLink = e} label='Đường dẫn' className='col-md-12' />}
               {type == 'image' && <FormTextBox ref={e => this.imageCaption = e} label='Phụ đề ảnh' className='col-md-12' />}

               {type == 'newsItem' && <FormSelect ref={e => this.newsItem = e} label='Chọn bài viết' data={eNewsSearchNewsAdapter} className='col-md-12' required />}
           </div>
        });
    }
}

class EditUIModal extends AdminModal {
    state = { structureId: null };

    onShow = (item) => {
        const { id = null, backgroundColor = '' } = item || {};
        this.setState({ structureId: id }, () => {
            this.backgroundColor.value(backgroundColor || '');
        });
    }

    onSubmit = () => {
        const { structureId } = this.state;
        const changes = { backgroundColor: this.backgroundColor.value() };

        this.props.update(structureId, changes, () => this.hide());
    }

    render = () => {
        return this.renderModal({
            title: 'Chỉnh sửa giao diện cấu trúc',
            body: <div>
                <FormColorPicker ref={e => this.backgroundColor = e} label='Màu nền' readOnly={this.props.readOnly} />
            </div>
        });
    }
}

class SectionContent extends AdminPage {
    state = {};

    changeStructurePosition = (e, id, isMoveUp) => {
        e.preventDefault();

        const item = this.props.fwENews && this.props.fwENews.item || {};
        const structures = item.structures || [];
        const index = structures.findIndex(i => i.id == id);

        if (index != -1) {
            // Bỏ qua hàng đầu di chuyển lên, hàng cuối di chuyển xuống
            if (!((isMoveUp && index == 0) || (!isMoveUp && index == structures.length - 1))) {
                this.props.swapENewsStructure(id, isMoveUp);
            }
        }
    }

    deleteStructure = (e, id) => {
        e.preventDefault();
        T.confirm('Xóa thẻ', 'Bạn có chắc muốn xóa thẻ này?', 'info', isConfirm => isConfirm && this.props.deleteENewsStructure(id));
    }

    tagStyle = (indexNumber, elementLength) => {
        const borderText = '1px dashed #6c757d';

        if (indexNumber == elementLength - 1) {
            return { border: borderText, cursor: 'pointer' };
        } else {
            return { borderTop: borderText, borderLeft: borderText, borderBottom: borderText, cursor: 'pointer' };
        }
    }

    render() {
        const permission = this.getUserPermission('fwENews');
        const item = this.props.fwENews && this.props.fwENews.item || {};
        const items = this.props.fwENews && this.props.fwENews.items || {};
        const structures = item.structures || [];

        return (
            <>
                <div className='section-content' style={{ backgroundColor: item.backgroundColor }}>
                    {structures.map(structure => {
                        const splitTags = (structure.tag || '').split('-');
                        const tags = splitTags.map((tag, indexNumber) => {
                            const tagItem = items[`${structure.id}_${indexNumber}`] || {};

                            return (
                                <div key={tag + '_' + indexNumber} className={`col-${tag}`} style={this.tagStyle(indexNumber, splitTags.length)}
                                    onClick={() => permission.write ? this.modal.show({ structureId: structure.id, indexNumber, ...tagItem }) : null}>
                                    <div className='content-structure'>
                                        {tagItem && tagItem.type == 'content' && <div dangerouslySetInnerHTML={{ __html: tagItem.content || ''}} />}
                                        {tagItem && tagItem.type == 'image' && tagItem.imageLink && (
                                            <a href='#' className='text-primary' onClick={e => e.preventDefault() || e.stopPropagation() || window.open(tagItem.imageLink, '_blank')}
                                                style={{ position: 'absolute', top: 0, right: '-5px', background: '#ffffff', fontSize: '15px' }}>
                                                <i className='fa fa-external-link' />
                                            </a>
                                        )}
                                        {tagItem && tagItem.type == 'image' && <img src={tagItem.image} alt={'image'} style={{ width: '100%' }} />}
                                        {tagItem && tagItem.type == 'image' && tagItem.imageCaption && <div className='text-center'>{tagItem.imageCaption}</div>}

                                        {tagItem && tagItem.type == 'newsItem' && (
                                            <div>
                                                <img src={tagItem.imageTinTuc} alt={'image'} />
                                                <div style={{ color: '#16378C', fontSize: '16px', fontWeight: 'bold', textAlign: 'justify' }}>{(tagItem.tieuDe || '').viText()}</div>
                                                <div style={{ color: '#555555', textAlign: 'justify' }}>{(tagItem.tomTat || '').viText()}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        });

                        return (
                            <div key={structure.id} className='structure-row row' style={{ backgroundColor: structure.backgroundColor }}>
                                <div className='structure-action'>
                                    {permission.write && <a href='#' className='text-warning mr-2' onClick={e => this.changeStructurePosition(e, structure.id, true)}><i className='fa fa-arrow-up' /></a>}
                                    {permission.write && <a href='#' className='text-warning mr-2' onClick={e => this.changeStructurePosition(e, structure.id, false)}><i className='fa fa-arrow-down' /></a>}
                                    {permission.write && <a href='#' className='text-primary mr-2' onClick={() => this.editUiModal.show(structure)}><i className='fa fa-pencil-square' /></a>}
                                    {permission.write && <a href='#' className='text-danger' onClick={e => this.deleteStructure(e, structure.id)}><i className='fa fa-trash' /></a>}
                                </div>
                                {tags}
                            </div>
                        );
                    })}
                </div>
                <EditModal ref={e => this.modal = e} update={this.props.updateENewsItem} change={this.props.changeENewsItem} eNewsId={item.id} />
                <EditUIModal ref={e => this.editUiModal = e} update={this.props.updateENewsStructure} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, fwENews: state.truyenThong.fwENews });
const mapActionsToProps = { swapENewsStructure, deleteENewsStructure, updateENewsItem, updateENewsStructure, changeENewsItem };
export default connect(mapStateToProps, mapActionsToProps)(SectionContent);