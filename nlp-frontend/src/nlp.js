import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './nlp.css';

const NlpPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentNames, setDocumentNames] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
    setLoading(true);
    axios.post('http://localhost:5000/summarize', {
      selectedDocName: selectedDocument === 'all' ? null : selectedDocument,
    })
      .then(response => setSummaries(response.data.summaries))
      .catch(error => console.error('Error getting summarization:', error))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h1>NLP Document Summarization</h1>
      <p className='description'>This app allows you to upload a CSV file with document information, select a document, and generate a summary using natural language processing.</p>
      <p className='description'>Upload your file. Choose your document. Summarize!</p>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <br />
      <div className='items'>
      <label>Select Document:</label>
      <select onChange={(e) => setSelectedDocument(e.target.value)}>
        <option value="">Select...</option>
        {documentNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button onClick={handleDocumentSelection}>
        {loading ? 'Summarizing...' : 'Summarize'}
      </button>
      </div>
      <br />
      {summaries.length > 0 && (
        <div>
          <h2>Summarization Result</h2>
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
