import { useEffect, useRef, useState } from 'react';
import { PutObjectCommand, S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
        <div style={{ display: 'flex', width: '100%',  justifyContent: 'space-between' }}> {/* Ajout d'un conteneur avec display: flex */}
            <div
                ref={dropAreaRef}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={(e) => e.preventDefault()}
                style={{ width: '50%' }} // Largeur fixée à 50%
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
                />
            </div>
            <ul style={{ width: '50%' }}> {/* Largeur fixée à 50% */}
                {objects.map((object) => (
                    <li key={object}>{object}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
