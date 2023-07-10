import React, { useState } from 'react';
import Header from './Header';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function UploadPicture() {

    const [image, setImage] = useState<File>();
    const [description, setDescription] = useState('');
    const [imageSent, setImageSent] = useState(false);
    const [descriptionError, setDescriptionError] = useState('');
    const [fileError, setFileError] = useState('');

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        if (event && event.target && event.target.files) {
            // Update the state
            console.log(event.target.files);
            // this.setState({ selectedFile: event.target.files[0] });
            const reader = new FileReader();
            const file = event.target.files[0];

            reader.readAsDataURL(file);

            reader.onload = () => {
                setImage(file);
                setFileError('');
            }
            reader.onerror = (error) => {
                console.log(reader.error);
            }
        }
    };

    const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event && event.target) {
            setDescription(event.target.value);
            setDescriptionError('');
        }
    }

    const onSubmitForm = (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log(description);
        console.log(image);

        let hasErrors = false;

        if (!description) {
            setDescriptionError('! Please set a description')
            hasErrors = true;
        }

        if (!image) {
            setFileError('! Please upload a file')
            hasErrors = true;
        }

        if (hasErrors) return;

        setImageSent(true);
        setImage(undefined);
        setDescription('');
    }

    const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setImageSent(false);
    }

    const renderForm = () => {
        if (imageSent) return null;

        return (
            <>
                <input type="file" onChange={onFileChange} accept="image/png, image/jpeg" />
                {fileError && (
                    <p className="text-danger">{fileError}</p>
                )}
                {image && <img src={URL.createObjectURL(image)} alt='uploaded_image' />}
                <Form className="mt-3">
                    <Form.Group className="mb-3">
                        <Form.Label>Picture description</Form.Label>
                        <Form.Control type="email" placeholder="This is an apple..." onChange={onChangeInput} />
                        {descriptionError && (
                            <p className="text-danger">{descriptionError}</p>
                        )}
                    </Form.Group>
                    <Button type="button" onClick={onSubmitForm}>Submit</Button>
                </Form>
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
            <h3>Upload picture and describe it</h3>
            <div className='Upload-container'>
                {renderForm()}
                {renderThankYou()}
            </div>
        </div>
    )
}

export default UploadPicture;