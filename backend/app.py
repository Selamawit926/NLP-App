import pandas as pd
from flask import Flask, request, jsonify
from transformers import pipeline
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

summarizer = pipeline('summarization', model='facebook/bart-large-cnn')

document_segments = []

@app.route('/get-all-doc-data', methods=['GET'])
def get_all_document_data():
    try:
        return jsonify({'documentNames': get_document_names(), 'documentSegments': get_document_segments()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_document_names():
    return list(set(seg['doc_name'] for seg in document_segments))

def get_document_segments():
    return document_segments

@app.route('/extract-doc-names', methods=['POST'])
def extract_document_names():
    try:
        uploaded_file = request.files['file']
        df = pd.read_csv(uploaded_file)

        document_names = df['doc_name'].unique().tolist()

        global document_segments
        document_segments = df.to_dict(orient='records')

        return jsonify({'documentNames': document_names})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/summarize', methods=['POST'])
def summarize_text():
    try:
        data = request.get_json()
        selected_doc_name = data.get('selectedDocName')

        summaries = []

        for segment in document_segments:
            if selected_doc_name is None or segment['doc_name'] == selected_doc_name:
                summaries.append(segment['text'])

        summaries = [s for s in summaries if s and type(s) == str]

        chunk_size = 5 
        text_chunks = [summaries[i:i + chunk_size] for i in range(0, len(summaries), chunk_size)]

        result_summaries = []
        max_chunks_to_summarize = 1

        for i, chunk in enumerate(text_chunks):
            if i >= max_chunks_to_summarize:
                break
            
            summaries_combined = " ".join(chunk)
            summary = summarizer(summaries_combined, max_length=250, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)
            result_summaries.append({'doc_name': selected_doc_name, 'summary': summary[0]['summary_text']})

        return jsonify({'summaries': result_summaries})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
