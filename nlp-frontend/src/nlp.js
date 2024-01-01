import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './nlp.css';

const NlpPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentNames, setDocumentNames] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [summaries, setSummaries] = useState([]);

  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);

    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:5000/extract-doc-names', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      .then(response => setDocumentNames(response.data.documentNames))
      .catch(error => console.error('Error extracting document names:', error));
  };

  const handleDocumentSelection = () => {
    axios.post('http://localhost:5000/summarize', {
      documentSegments: [],
      selectedDocName: selectedDocument === 'all' ? null : selectedDocument,
    })
      .then(response => setSummaries(response.data.summaries))
      .catch(error => console.error('Error getting summarization:', error));
  };

  return (
    <div>
      <h1>NLP Document Summarization</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <br />
      <label>Select Document:</label>
      <select onChange={(e) => setSelectedDocument(e.target.value)}>
        <option value="">Select...</option>
        <option value="all">All Documents</option>
        {documentNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button onClick={handleDocumentSelection}>Summarize</button>
      <br />
      {summaries.length > 0 && (
        <div>
          <h2>Summarization Result:</h2>
          <ul>
            {summaries.map((summary) => (
              <li key={summary.doc_name}>
                <strong>{summary.doc_name}</strong>: {summary.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NlpPage;
