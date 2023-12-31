import pandas as pd
from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

summarizer = pipeline('summarization', model='facebook/bart-large-cnn')

@app.route('/extract-doc-names', methods=['POST'])
def extract_document_names():
    try:
        uploaded_file = request.files['file']
        df = pd.read_csv(uploaded_file)

        document_names = df['doc_name'].unique().tolist()

        return jsonify({'documentNames': document_names})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/summarize', methods=['POST'])
def summarize_text():
    try:
        data = request.get_json()
        document_segments = data['documentSegments']
        selected_doc_name = data.get('selectedDocName')

        summaries = []

        for segment in document_segments:
            if selected_doc_name is None or segment['doc_name'] == selected_doc_name:
                summary = summarizer(segment['text'], max_length=150, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)
                summaries.append({'doc_name': segment['doc_name'], 'segment': segment['text'], 'summary': summary[0]['summary_text']})

        return jsonify({'summaries': summaries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
