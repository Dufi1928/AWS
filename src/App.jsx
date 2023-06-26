import { useEffect, useRef, useState } from 'react';
import { GetObjectCommand, S3Client,DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import '../src/App.css'

function App() {
    const [objects, setObjects] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const dropAreaRef = useRef(null);
    const fileInputRef = useRef(null);

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
                setObjects(s3Objects);
            } catch (err) {
                console.error(err);
            }
        };

        fetchS3Objects();
    }, []);

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
            Bucket: 'ezytech-mds',
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
            Bucket: 'ezytech-mds',
            Key: fileName
        });

        try {
            await client.send(command);
            // Après avoir supprimé le fichier avec succès, mettez à jour la liste des objets
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
                    Bucket: 'ezytech-mds',
                    Key: selectedFile.name,
                    Body: body,
                });

                try {
                    const response = await client.send(command);
                    console.log(response);
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
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    className="button-drag-drop"
                />
            </div>
            <ul className="right-grid">
                {objects.map((object) => (
                    <li key={object} className="download">
                        <button className="mybt" onClick={() => handleFileDownload(object)}>
                            {object}
                        </button>
                        <button className="mybt" onClick={() => handleFileDelete(object)}>
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
