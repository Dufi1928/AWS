import { useEffect, useRef, useState } from 'react';
import { GetObjectCommand,CreateBucketCommand , S3Client, DeleteObjectCommand, ListObjectsV2Command,ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

import './App.scss'

function App() {
    const [objects, setObjects] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedBucket, setSelectedBucket] = useState('ezytech-mds');
    const dropAreaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [buckets, setBuckets] = useState([]);
    const [newBucketName, setNewBucketName] = useState('');

    const createBucket = async () => {
        const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

        const client = new S3Client({
            region: 'eu-west-3',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        });

        const command = new CreateBucketCommand({
            Bucket: newBucketName,
        });

        try {
            const response = await client.send(command);
            console.log(`Bucket ${newBucketName} created successfully.`);
            // Ajouter le nouveau bucket à la liste
            setBuckets((prevBuckets) => [...prevBuckets, newBucketName]);
            // Réinitialiser le nom du nouveau bucket
            setNewBucketName('');
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

        const fetchS3Objects = async () => {
            const client = new S3Client({
                region: 'eu-west-3',
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey
                }
            });

            const command = new ListObjectsV2Command({
                Bucket: selectedBucket,
            });

            try {
                const response = await client.send(command);
                const s3Objects = response.Contents ? response.Contents.map((object) => object.Key) : [];
                setObjects(s3Objects);
            } catch (err) {
                console.error(err);
            }
        };

        fetchS3Objects();
    }, [selectedBucket]);

    useEffect(() => {
        const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

        const fetchS3Objects = async () => {
            const client = new S3Client({
                region: 'eu-west-3',
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey
                }
            });

            const command = new ListObjectsV2Command({
                Bucket: 'ezytech-mds',
            });

            try {
                const response = await client.send(command);
                const s3Objects = response.Contents.map((object) => object.Key);
                console.log(response)
                setObjects(s3Objects);
            } catch (err) {
                console.error(err);
            }
        };

        fetchS3Objects();
        fetchBuckets();
    }, []);

    const fetchBuckets = async () => {
        const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

        const client = new S3Client({
            region: 'eu-west-3',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey:
                secretAccessKey
            }
        });

        const command = new ListBucketsCommand({});

        try {
            const response = await client.send(command);
            const bucketNames = response.Buckets.map((bucket) => bucket.Name);
            setBuckets(bucketNames);
        } catch (err) {
            console.error(err);
        }
    };
    const handleFileDownload = async (fileName) => {
        const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

        const client = new S3Client({
            region: 'eu-west-3',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        });

        const command = new GetObjectCommand({
            Bucket: selectedBucket,
            Key: fileName
        });

        try {
            const response = await client.send(command);
            const stream = response.Body;

            const reader = stream.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                chunks.push(value);
            }

            const blob = new Blob(chunks, { type: response.ContentType });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        setSelectedFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };
    const handleFileDelete = async (fileName) => {
        const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
        const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

        const client = new S3Client({
            region: 'eu-west-3',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        });

        const command = new DeleteObjectCommand({
            Bucket: selectedBucket,
            Key: fileName
        });


        try {
            await client.send(command);
            setObjects(objects.filter(object => object !== fileName));
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async () => {
        if (selectedFile) {
            const accessKeyId = import.meta.env.VITE_ACCES_KEY_ID;
            const secretAccessKey = import.meta.env.VITE_SECRET_ACCES_KEY;

            const client = new S3Client({
                region: 'eu-west-3',
                credentials: {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey
                }
            });

            const reader = new FileReader();
            reader.onload = async () => {
                const body = new Uint8Array(reader.result);
                const command = new PutObjectCommand({
                    Bucket: selectedBucket, // Remplacer 'ezytech-mds' par selectedBucket
                    Key: selectedFile.name,
                    Body: body,
                });


                try {
                    await client.send(command);
                    setObjects((prevObjects) => [...prevObjects, selectedFile.name]);
                    setSelectedFile(null);
                } catch (err) {
                    console.error(err);
                }
            };

            reader.readAsArrayBuffer(selectedFile);
        }
    };


    return (
        <div className="container-wrapper">
            <div
                ref={dropAreaRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={(e) => e.preventDefault()}
                className="left-grid"
            >
                <span>Glissez-déposez un fichier ici</span>
                {selectedFile && (
                    <div>
                        <p>Fichier sélectionné : {selectedFile.name}</p>
                        <button onClick={handleFileUpload}>Envoyer</button>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="button-drag-drop"
                />
            </div>
            <div className="bukets">
                <div className="select">
                    <label>Select Bucket: </label>
                    <select value={selectedBucket} onChange={(e) => setSelectedBucket(e.target.value)}>
                        {buckets.map((bucket) => (
                            <option key={bucket} value={bucket}>{bucket}</option>
                        ))}
                    </select>
                </div>
                <div className="add">
                    <input
                        value={newBucketName}
                        onChange={(e) => setNewBucketName(e.target.value)}
                        placeholder="Enter new bucket name"
                    />
                    <button onClick={createBucket}>Create</button>
                </div>
            </div>

            <div className="right-grid">
                <ul>
                    {objects.map((object) => (
                        <li key={object} className="download">
                            <button className="mybt-download" onClick={() => handleFileDownload(object)}>
                                {object}
                            </button>
                            <button className="mybt-delete" onClick={() => handleFileDelete(object)}>
                                Supprimer
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
