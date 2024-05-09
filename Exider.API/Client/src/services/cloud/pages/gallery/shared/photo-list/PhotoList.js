import React, { useContext, useEffect, useState } from 'react';
import styles from './main.module.css';
import Preview from '../../../../../preview/layout/Preview';
import { instance } from '../../../../../../state/Interceptors';
import { DownloadFromResponse } from '../../../../../../utils/DownloadFromResponse';
import SelectBox from '../../../../shared/interaction/select-box/SelectBox';
import galleryState from '../../../../../../states/gallery-state';
import AddToAlbum from '../../../../process/add-to-album/AddToAlbum';
import { Delete } from '../../../cloud/api/FolderRequests';
import Loader from '../../../../shared/loader/Loader';

const PhotoList = (props) => {
    const [gridTemplateColumns, setGridTemplateColumns] = useState('repeat(auto-fill, minmax(200px, 1fr))');
    const [columnCount, setColumnCount] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isPreview, setPreviewState] = useState(false);
    const [activeItems, setActiveItems] = useState([]);
    const [isAddToAlbumOpen, setAddToAlbumState] = useState(false);

    const single = [
        [null, "Open", () => {setPreviewState(true)}],
        [null, "Add to album", () => {setAddToAlbumState(true)}],
        [null, "Download", async () => {
            await instance
                .get(`/file/download?id=${activeItems[0].id}`, {
                    responseType: "blob"
                })
                .then((response) => {
                    DownloadFromResponse(response);
                })
                .catch((error) => {
                    console.error(error);
                    // ErrorMessage('Attention!', 'Something went wrong');
                });
        }],
        [null, "Delete", () => {
            Delete(activeItems);
        }]
    ]

    const multiple = [
        [null, "Add to album", () => {setAddToAlbumState(true)}],
        [null, "Delete", () => {
            Delete(activeItems);
        }]
    ]

    useEffect(() => {
        if (props.photoGrid === 'grid') {
            setGridTemplateColumns(`repeat(auto-fill, minmax(${100 + 25 * props.scale}px, 1fr))`);
            setColumnCount(null);
        } else if (props.photoGrid === 'waterfall') {
            setGridTemplateColumns(null);
            setColumnCount(8 - props.scale);
        }
    
    }, [props.scale, props.photoGrid]);

    useEffect(() => {
        const fetchDate = async () => {
            await galleryState.GetAlbums();
        }

        fetchDate();
    }, []);

    const AddPhotosInAlbum = async (selected) => {
        if (selected) {
            for (let i = 0; i < activeItems.length; i++) {
                await instance
                    .post(`/api/albums?fileId=${activeItems[i].id}&albumId=${selected.id}`)
                    .catch(response => {
                        console.error(response);
                    });
            }
        }
    }

    useEffect(() => {
        console.log(props.photos);
    }, [props.photos]);

    return (
        <div>
            {isPreview && 
                <Preview
                    close={() => setPreviewState(false)} 
                    file={activeItems[0]}
                    // ErrorMessage={ErrorMessage}
                />}
            <AddToAlbum
                open={isAddToAlbumOpen}
                close={() => setAddToAlbumState(false)}
                add={AddPhotosInAlbum}
                albums={galleryState.albums}
            />
            <div className={styles.photos} id={props.photoGrid} style={{ gridTemplateColumns, columnCount }} ref={props.forwardRef}>
                {props.photos && props.photos.map && props.photos.map((element, index) => {
                    if (element.isLoading === true) {
                        return (
                            <div 
                                key={index} 
                                className={styles.photoWrapper}
                                data={null}
                                id="loadingPhoto"
                            >
                                <Loader />
                            </div>  
                        );
                    } else {
                        return (
                            <div 
                                key={index} 
                                className={styles.photoWrapper} 
                                data={element.id}
                            >
                                <img 
                                    src={`data:image/png;base64,${element.fileAsBytes}`}
                                    draggable="false"
                                    // id={selectedItems.map(element => element.id !== null ? element.id : [])
                                    //     .includes(element.id ? element.id : null) === true ? 'active' : 'passive'}
                                />
                            </div>
                        )
                    }
                })}
            </div>
            <SelectBox 
                selectPlace={[props.forwardRef]}
                selectedItems={[selectedItems, setSelectedItems]}
                activeItems={[activeItems, setActiveItems]}
                itemsWrapper={props.forwardRef}
                items={galleryState.photos}
                single={single}
                multiple={multiple}
            />
        </div>
    );
 };

export default PhotoList;