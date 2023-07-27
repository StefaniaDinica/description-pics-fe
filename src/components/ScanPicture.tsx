import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import { Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PresignedUrlType } from '../types/Api';
import axios from 'axios';
import { Watch } from 'react-loader-spinner'

function ScanPicture() {
    const [image, setImage] = useState<File>();
    const [imageDescription, setImageDescription] = useState('');
    const [presignedUrl, setPresignedUrl] = useState<PresignedUrlType>();
    const [fileError, setFileError] = useState('');
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [retryEnabled, setRetryEnabled] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const imgTag = useMemo(() => {
        if (!image) return null;
        return (
            <img id='preview-file' src={URL.createObjectURL(image)} alt='uploaded_image' />
        );
    }, [image]);

    useEffect(() => {
        if (!presignedUrl) {
            axios.get(`https://description.pics/api/get-upload-url-no-descr`)
                .then(res => {
                    setPresignedUrl(res.data);
                }).catch(error =>
                    toast.error("There was an error. Please try again.")
                );
        }
    }, [presignedUrl]);

    const generateResult = (labels: string[], values: number[]) => {
        let list = '<ul>';
        for (let i = 0; i < labels.length; i++) {
            list = `${list} <li>${labels[i]} (${values[i]})</li>`
        }
        list = `${list}</ul>`;
        return list;
    }

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event && event.target && event.target.files) {
            const reader = new FileReader();
            const file = event.target.files[0];

            if (!file) {
                setImage(undefined);
                toast.error("There was an error on choosing a file from your computer.")
                return;
            }

            if (file.type.indexOf('jpeg') === -1 && file.type.indexOf('jpg') === -1 && file.type.indexOf('png') === -1) {
                event.target.value = '';
                setImage(undefined);
                toast.error("File must be of type jpg, jpeg or png.")
                return;
            }

            if (file.size >= 15000000) {
                event.target.value = '';
                setImage(undefined);
                toast.error("File size must be maximum 15MB.")
                return;
            }

            reader.readAsDataURL(file);

            reader.onload = () => {
                setImage(file);
                setFileError('');
                setBtnDisabled(false);
            }

            reader.onerror = (error) => {
                console.log(reader.error);
                setBtnDisabled(true);
            }
        }
    };

    const onSubmit = async () => {
        let hasErrors = false;

        if (!image) {
            setFileError('! Please upload a file')
            hasErrors = true;
        }

        if (hasErrors) {
            setBtnDisabled(true);
            toast.error("Invalid form. Please fill all data.")
            return;
        }

        if (!presignedUrl) {
            toast.error("No presignedUrl. Can not upload image on s3.")
            return;
        }

        setShowSpinner(true);
        setBtnDisabled(true);

        const formData = new FormData();
        formData.append('AWSAccessKeyId', presignedUrl.fields.AWSAccessKeyId);
        formData.append('key', presignedUrl.fields.key);
        formData.append('policy', presignedUrl.fields.policy);
        formData.append('signature', presignedUrl.fields.signature);
        formData.append('x-amz-security-token', presignedUrl.fields['x-amz-security-token']);
        formData.append("file", image!);

        try {
            await axios.post(presignedUrl.url, formData)
            const response = await axios.get(`https://description.pics/api/generate-description?id=${presignedUrl.fields.key}`);

            setImageDescription(generateResult(response.data.labels, response.data.values));
            setRetryEnabled(true);
        } catch (error) {
            toast.error("There was an error. Please try again.")
        } finally {
            setShowSpinner(false);
            setPresignedUrl(undefined);
        }
    }

    const onClickRetry = () => {
        setRetryEnabled(false);
        setImage(undefined);
        setImageDescription('');

        if (document && document.getElementById('file')) {
            (document.getElementById('file') as HTMLInputElement).value = '';
        }
    }

    return (
        <div className='App'>
            <Header />
            <div className='Upload-container'>
                <h3>Get a description for your picture</h3>
                <input id="file" type="file" onChange={onFileChange} accept="image/png, image/jpeg" />
                {fileError && (
                    <p className="text-danger">{fileError}</p>
                )}
                {imgTag}
                {imageDescription &&
                    <>
                        <h4 className='mt-4'>Result: </h4>
                        <div dangerouslySetInnerHTML={{ __html: imageDescription }}></div>
                    </>
                }
                {!retryEnabled &&
                    <div>
                        <div className='inline-block'>
                            <Button type="button" onClick={onSubmit} disabled={btnDisabled}>Submit</Button>
                        </div>
                        {showSpinner &&
                            <div className='inline-block spinner'>
                                <Watch
                                    height="30"
                                    width="30"
                                    radius="48"
                                    color="#743843"
                                    ariaLabel="watch-loading"
                                    visible={true}
                                />
                            </div>}
                    </div>
                }
                {retryEnabled &&
                    <Button type="button" onClick={onClickRetry}>Retry</Button>
                }
                <ToastContainer />
            </div>
        </div>
    )
}

export default ScanPicture;