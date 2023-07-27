import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { Watch } from 'react-loader-spinner'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PresignedUrlType } from '../types/Api';
import { ErrorType } from '../types/Errors';

function UploadPicture() {
    const [image, setImage] = useState<File>();
    const [description, setDescription] = useState('');
    const [imageSent, setImageSent] = useState(false);
    const [descriptionError, setDescriptionError] = useState('');
    const [fileError, setFileError] = useState('');
    const [presignedUrl, setPresignedUrl] = useState<PresignedUrlType>();
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const imgTag = useMemo(() => {
        if (!image) return null;
        return (
            <img src={URL.createObjectURL(image)} alt='uploaded_image' />
        );
    }, [image]);

    useEffect(() => {
        if (!presignedUrl) {
            axios.get(`https://description.pics/api/get-upload-url`)
                .then(res => {
                    setPresignedUrl(res.data);
                }).catch(error =>
                    toast.error("There was an error. Please try again.")
                );
        }
    }, [presignedUrl]);

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
                setBtnDisabled(true);
            }
        }
    };

    const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event && event.target) {
            setDescription(event.target.value);
            setDescriptionError('');
            setBtnDisabled(false);
        }
    }

    const api_addImageInfo = async () => {
        try {
            if (!presignedUrl) {
                toast.error("No presignedUrl. Can not upload image on s3.")
                return;
            }

            if (!image) {
                toast.error("There is no image. Please choose an image from your computer.")
                return;
            }

            if (!description) {
                toast.error("There is no image description. Please add a description.")
                return;
            }

            await axios.post('https://description.pics/api/add-image-info', {
                id: presignedUrl.fields.key,
                description,
                name: image.name
            }, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
                }
            });

        } catch (error) {
            toast.error("There was an error on saving the image description into lambda.")
        }
    }

    const onSubmitForm = async (event: React.MouseEvent<HTMLButtonElement>) => {
        let hasErrors = false;

        if (!description) {
            setDescriptionError('! Please set a description')
            hasErrors = true;
        }

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

            await api_addImageInfo();

            setImageSent(true);
            setImage(undefined);
            setDescription('');
        } catch (error) {
            const typedError = error as ErrorType;

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(typedError?.response?.data as string, "text/xml");

            setBtnDisabled(true);
            if (xmlDoc)
                toast.error(xmlDoc.getElementsByTagName("Message")[0].childNodes[0].nodeValue);
            else
                toast.error("There was an error. Please try again.")
        } finally {
            setShowSpinner(false);
            setPresignedUrl(undefined);
        }
    }

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setImageSent(false);
    }

    const renderForm = () => {
        if (imageSent) return null;

        return (
            <>
                <input id="file" type="file" onChange={onFileChange} accept="image/png, image/jpeg" />
                {fileError && (
                    <p className="text-danger">{fileError}</p>
                )}
                {imgTag}
                <Form className="mt-3" >
                    <Form.Group className="mb-3">
                        <Form.Label>Picture description</Form.Label>
                        <Form.Control placeholder="This is an apple..." onChange={onChangeInput} />
                        {descriptionError && (
                            <p className="text-danger">{descriptionError}</p>
                        )}
                    </Form.Group>
                    <div className='inline-block'>
                        <Button type="button" onClick={onSubmitForm} disabled={btnDisabled}>Submit</Button>
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
                </Form>
                <ToastContainer />
            </>
        )
    }

    const renderThankYou = () => {
        if (!imageSent) return null;

        return (
            <>
                <p><b>Thank you for your upload!</b></p>
                <Button type="button" onClick={onClick}>Upload another picture</Button>
            </>
        )
    }

    return (
        <div className='App'>
            <Header />
            <div className='Upload-container'>
                <h3>Upload picture and describe it</h3>
                {renderForm()}
                {renderThankYou()}
            </div>
        </div>
    )
}

export default UploadPicture;