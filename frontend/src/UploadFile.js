import React, { useState } from 'react';
import axios from 'axios';

const UploadFile = () => {
    const [file, setFile] = useState(null);
    const [roster, setRoster] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            alert('Please upload a file');
            return;
        }

        console.log("Uploading file name: ", file.name);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:4000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Server Response: ', response.data);
            setRoster(response.data.roster);
        } catch (error) {
            console.error('Error uploading file:', error.response ? error.response.data : error);
            console.error('Error uploading file', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Shift Roster Generator</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmit} style={{ marginLeft: '10px' }}>
                Upload & Generate
            </button>
            {roster.length > 0 && (
                <table border="1" style={{ marginTop: '20px', width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Assigned Employee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roster.map((item, index) => (
                            <tr key={index}>
                                <td>{item.Date}</td>
                                <td>{item['Assigned Employee']}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UploadFile;